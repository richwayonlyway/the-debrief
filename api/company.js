const SEC_HEADERS = {
  Accept: "application/json",
  "User-Agent": "The Debrief admin@thedebrief.vercel.app",
};
const YAHOO_HEADERS = {
  Accept: "application/json",
  "User-Agent": "Mozilla/5.0",
};
const ANNUAL_FORMS = new Set(["10-K", "10-K/A", "20-F", "20-F/A", "40-F", "40-F/A"]);

let directoryCache = null;
let directoryCachedAt = 0;
const companyCache = new Map();

function withTimeout(ms) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeout),
  };
}

async function fetchJson(url, headers, timeoutMs = 10000) {
  const timer = withTimeout(timeoutMs);
  try {
    const response = await fetch(url, {
      headers,
      signal: timer.signal,
    });
    if (!response.ok) {
      throw new Error(`${new URL(url).hostname} HTTP ${response.status}`);
    }
    return response.json();
  } finally {
    timer.clear();
  }
}

function normalizeQuery(value) {
  return String(value || "")
    .trim()
    .slice(0, 80)
    .replace(/[^a-zA-Z0-9 .&'/-]/g, "");
}

async function loadTickerDirectory() {
  if (directoryCache && Date.now() - directoryCachedAt < 24 * 60 * 60 * 1000) {
    return directoryCache;
  }
  const payload = await fetchJson(
    "https://www.sec.gov/files/company_tickers.json",
    SEC_HEADERS,
  );
  directoryCache = Object.values(payload || {})
    .map((row) => ({
      cik: Number(row.cik_str),
      ticker: String(row.ticker || "").toUpperCase(),
      name: String(row.title || ""),
    }))
    .filter((row) => row.cik && row.ticker && row.name);
  directoryCachedAt = Date.now();
  return directoryCache;
}

function searchDirectory(directory, query) {
  const normalized = query.toLowerCase();
  return directory
    .map((company) => {
      const ticker = company.ticker.toLowerCase();
      const name = company.name.toLowerCase();
      let score = 0;
      if (ticker === normalized) score = 100;
      else if (name === normalized) score = 95;
      else if (ticker.startsWith(normalized)) score = 80;
      else if (name.startsWith(normalized)) score = 70;
      else if (name.includes(normalized)) score = 50;
      return { ...company, score };
    })
    .filter((company) => company.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, 10)
    .map(({ score, ...company }) => company);
}

function recordYear(record) {
  const endYear = Number(String(record.end || "").slice(0, 4));
  if (endYear) return endYear;
  const frame = String(record.frame || "");
  const frameMatch = frame.match(/^CY(\d{4})(?:Q4I|I)?$/);
  if (frameMatch) return Number(frameMatch[1]);
  return Number(record.fy) || null;
}

function annualSeries(companyFacts, tags, unit, options = {}) {
  const facts = companyFacts?.facts?.["us-gaap"] || {};
  for (const tag of tags) {
    const rows = facts[tag]?.units?.[unit];
    if (!Array.isArray(rows) || !rows.length) continue;
    const byYear = new Map();
    for (const row of rows) {
      if (!ANNUAL_FORMS.has(row.form) || row.fp !== "FY") continue;
      if (options.duration && row.start && row.end) {
        const durationDays =
          (new Date(row.end).getTime() - new Date(row.start).getTime()) /
          86400000;
        if (!Number.isFinite(durationDays) || durationDays < 250) continue;
      }
      const year = recordYear(row);
      const value = Number(row.val);
      if (!year || !Number.isFinite(value)) continue;
      const existing = byYear.get(year);
      if (!existing || String(row.filed || "") > String(existing.filed || "")) {
        byYear.set(year, {
          year,
          value,
          filed: row.filed || "",
          form: row.form,
          accession: row.accn || "",
        });
      }
    }
    if (byYear.size) {
      return [...byYear.values()].sort((a, b) => a.year - b.year);
    }
  }
  return [];
}

function seriesMap(series) {
  return new Map((series || []).map((row) => [row.year, row.value]));
}

function latestValue(series) {
  return series?.length ? series[series.length - 1].value : null;
}

function growthRate(current, previous) {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) {
    return null;
  }
  return ((current - previous) / Math.abs(previous)) * 100;
}

function buildFinancials(companyFacts) {
  const revenue = annualSeries(
    companyFacts,
    [
      "RevenueFromContractWithCustomerExcludingAssessedTax",
      "Revenues",
      "SalesRevenueNet",
    ],
    "USD",
    { duration: true },
  );
  const netIncome = annualSeries(
    companyFacts,
    ["NetIncomeLoss", "ProfitLoss"],
    "USD",
    { duration: true },
  );
  const operatingIncome = annualSeries(
    companyFacts,
    ["OperatingIncomeLoss"],
    "USD",
    { duration: true },
  );
  const operatingCashFlow = annualSeries(
    companyFacts,
    ["NetCashProvidedByUsedInOperatingActivities"],
    "USD",
    { duration: true },
  );
  const capex = annualSeries(
    companyFacts,
    [
      "PaymentsToAcquirePropertyPlantAndEquipment",
      "PaymentsForProceedsFromOtherPropertyPlantAndEquipment",
    ],
    "USD",
    { duration: true },
  );
  const assets = annualSeries(companyFacts, ["Assets"], "USD");
  const liabilities = annualSeries(companyFacts, ["Liabilities"], "USD");
  const equity = annualSeries(
    companyFacts,
    [
      "StockholdersEquity",
      "StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest",
    ],
    "USD",
  );
  const dilutedEps = annualSeries(
    companyFacts,
    ["EarningsPerShareDiluted", "EarningsPerShareBasicAndDiluted"],
    "USD/shares",
    { duration: true },
  );

  const maps = {
    revenue: seriesMap(revenue),
    netIncome: seriesMap(netIncome),
    operatingIncome: seriesMap(operatingIncome),
    operatingCashFlow: seriesMap(operatingCashFlow),
    capex: seriesMap(capex),
    assets: seriesMap(assets),
    liabilities: seriesMap(liabilities),
    equity: seriesMap(equity),
    dilutedEps: seriesMap(dilutedEps),
  };
  const years = [
    ...new Set(
      Object.values(maps)
        .flatMap((map) => [...map.keys()])
        .filter(Number.isFinite),
    ),
  ]
    .sort((a, b) => a - b)
    .slice(-5);

  const annuals = years.map((year) => {
    const operatingCash = maps.operatingCashFlow.get(year) ?? null;
    const capitalExpenditure = maps.capex.get(year) ?? null;
    const freeCashFlow =
      Number.isFinite(operatingCash) && Number.isFinite(capitalExpenditure)
        ? operatingCash - Math.abs(capitalExpenditure)
        : null;
    return {
      year,
      revenue: maps.revenue.get(year) ?? null,
      operatingIncome: maps.operatingIncome.get(year) ?? null,
      netIncome: maps.netIncome.get(year) ?? null,
      operatingCashFlow: operatingCash,
      capex: capitalExpenditure,
      freeCashFlow,
      assets: maps.assets.get(year) ?? null,
      liabilities: maps.liabilities.get(year) ?? null,
      equity: maps.equity.get(year) ?? null,
      dilutedEps: maps.dilutedEps.get(year) ?? null,
    };
  });

  const latest = annuals[annuals.length - 1] || {};
  const previous = annuals[annuals.length - 2] || {};
  const revenueLatest = latest.revenue;
  const netIncomeLatest = latest.netIncome;
  const equityLatest = latest.equity;

  return {
    annuals,
    metrics: {
      fiscalYear: latest.year || null,
      revenue: revenueLatest ?? latestValue(revenue),
      revenueGrowth: growthRate(revenueLatest, previous.revenue),
      netIncome: netIncomeLatest ?? latestValue(netIncome),
      netMargin:
        Number.isFinite(netIncomeLatest) &&
        Number.isFinite(revenueLatest) &&
        revenueLatest !== 0
          ? (netIncomeLatest / revenueLatest) * 100
          : null,
      freeCashFlow: latest.freeCashFlow ?? null,
      freeCashFlowMargin:
        Number.isFinite(latest.freeCashFlow) &&
        Number.isFinite(revenueLatest) &&
        revenueLatest !== 0
          ? (latest.freeCashFlow / revenueLatest) * 100
          : null,
      returnOnEquity:
        Number.isFinite(netIncomeLatest) &&
        Number.isFinite(equityLatest) &&
        equityLatest !== 0
          ? (netIncomeLatest / equityLatest) * 100
          : null,
      assets: latest.assets ?? latestValue(assets),
      liabilities: latest.liabilities ?? latestValue(liabilities),
      equity: equityLatest ?? latestValue(equity),
      dilutedEps: latest.dilutedEps ?? latestValue(dilutedEps),
    },
  };
}

function samplePoints(points, target = 90) {
  if (points.length <= target) return points;
  const step = (points.length - 1) / (target - 1);
  return Array.from(
    { length: target },
    (_, index) => points[Math.round(index * step)],
  );
}

async function fetchPriceHistory(symbol) {
  let lastError;
  for (const host of ["query1.finance.yahoo.com", "query2.finance.yahoo.com"]) {
    const url = new URL(`https://${host}/v7/finance/spark`);
    url.searchParams.set("symbols", symbol);
    url.searchParams.set("range", "1y");
    url.searchParams.set("interval", "1d");
    url.searchParams.set("indicators", "close");
    try {
      const payload = await fetchJson(url.toString(), YAHOO_HEADERS, 8000);
      const result = payload?.spark?.result?.[0]?.response?.[0];
      if (!result) throw new Error("Price history was empty");
      const timestamps = result.timestamp || [];
      const closes = result.indicators?.quote?.[0]?.close || [];
      const points = timestamps
        .map((timestamp, index) => ({
          date: new Date(timestamp * 1000).toISOString().slice(0, 10),
          close: Number(closes[index]),
        }))
        .filter((point) => Number.isFinite(point.close));
      const meta = result.meta || {};
      const first = points[0]?.close;
      const last = points[points.length - 1]?.close;
      return {
        symbol: meta.symbol || symbol,
        name: meta.longName || meta.shortName || symbol,
        exchange: meta.fullExchangeName || meta.exchangeName || null,
        currency: meta.currency || "USD",
        price: Number.isFinite(Number(meta.regularMarketPrice))
          ? Number(meta.regularMarketPrice)
          : last,
        previousClose: Number(meta.previousClose || meta.chartPreviousClose) || null,
        oneYearChange: growthRate(last, first),
        oneYearHigh: points.length
          ? Math.max(...points.map((point) => point.close))
          : null,
        oneYearLow: points.length
          ? Math.min(...points.map((point) => point.close))
          : null,
        points: samplePoints(points),
        asOf: meta.regularMarketTime
          ? new Date(meta.regularMarketTime * 1000).toISOString()
          : null,
      };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("Price history unavailable");
}

async function buildCompany(company) {
  const cacheKey = company.ticker;
  const cached = companyCache.get(cacheKey);
  if (cached && Date.now() - cached.cachedAt < 5 * 60 * 1000) {
    return cached.payload;
  }

  const paddedCik = String(company.cik).padStart(10, "0");
  const [factsResult, priceResult] = await Promise.allSettled([
    fetchJson(
      `https://data.sec.gov/api/xbrl/companyfacts/CIK${paddedCik}.json`,
      SEC_HEADERS,
      12000,
    ),
    fetchPriceHistory(company.ticker),
  ]);
  const warnings = [];
  let financials = { annuals: [], metrics: {} };
  if (factsResult.status === "fulfilled") {
    financials = buildFinancials(factsResult.value);
  } else {
    warnings.push("SEC financial statements unavailable");
  }
  const price =
    priceResult.status === "fulfilled"
      ? priceResult.value
      : { symbol: company.ticker, name: company.name, points: [] };
  if (priceResult.status === "rejected") warnings.push("Price history unavailable");

  const payload = {
    type: "company",
    company: {
      ticker: company.ticker,
      name: factsResult.value?.entityName || price.name || company.name,
      cik: paddedCik,
      exchange: price.exchange || null,
      currency: price.currency || "USD",
      secFilingsUrl: `https://www.sec.gov/edgar/browse/?CIK=${paddedCik}`,
    },
    price,
    metrics: financials.metrics,
    annuals: financials.annuals,
    warnings,
    sources: [
      {
        label: "SEC Company Facts",
        url: `https://data.sec.gov/api/xbrl/companyfacts/CIK${paddedCik}.json`,
      },
      {
        label: "SEC filings",
        url: `https://www.sec.gov/edgar/browse/?CIK=${paddedCik}`,
      },
      {
        label: "Yahoo Finance delayed chart",
        url: `https://finance.yahoo.com/quote/${encodeURIComponent(company.ticker)}/`,
      },
    ],
    updatedAt: new Date().toISOString(),
  };
  companyCache.set(cacheKey, { payload, cachedAt: Date.now() });
  return payload;
}

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=900");
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const query = normalizeQuery(req.query?.q || req.query?.symbol || "AAPL");
    if (!query) {
      res.status(400).send(
        JSON.stringify({ error: "Enter a U.S.-listed public company name or ticker." }),
      );
      return;
    }
    const directory = await loadTickerDirectory();
    const matches = searchDirectory(directory, query);
    const exact = matches.find(
      (company) =>
        company.ticker.toLowerCase() === query.toLowerCase() ||
        company.name.toLowerCase() === query.toLowerCase(),
    );
    if (!exact) {
      res.status(200).send(
        JSON.stringify({
          type: "search",
          query,
          matches,
          note:
            "Company financials use SEC filings and currently cover U.S.-listed public companies.",
        }),
      );
      return;
    }
    res.status(200).send(JSON.stringify(await buildCompany(exact)));
  } catch (error) {
    res.status(502).send(
      JSON.stringify({
        error: "Company data is temporarily unavailable.",
        detail: error.message,
      }),
    );
  }
};
