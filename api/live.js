const SPARK_SYMBOLS = [
  "^GSPC",
  "^IXIC",
  "^DJI",
  "^TNX",
  "BZ=F",
  "GC=F",
  "^VIX",
  "^RUT",
  "SOXX",
  "XLK",
  "XLE",
  "UUP",
  "TLT",
  "HYG",
  "KRE",
  "FEZ",
  "EFA",
  "EEM",
  "FXI",
  "DX-Y.NYB",
  "EURUSD=X",
  "GBPUSD=X",
  "JPY=X",
  "AUDUSD=X",
  "CL=F",
  "NG=F",
  "ZC=F",
  "ZW=F",
  "SI=F",
  "HG=F",
  "PL=F",
  "PA=F",
];
const QUOTE_GROUPS = {
  indices: [
    ["^GSPC", "S&P 500"],
    ["^IXIC", "Nasdaq"],
    ["^DJI", "Dow"],
    ["^RUT", "Russell 2000"],
    ["^VIX", "VIX"],
  ],
  currencies: [
    ["DX-Y.NYB", "U.S. Dollar"],
    ["EURUSD=X", "EUR / USD"],
    ["GBPUSD=X", "GBP / USD"],
    ["JPY=X", "USD / JPY"],
    ["AUDUSD=X", "AUD / USD"],
  ],
  commodities: [
    ["CL=F", "WTI Crude"],
    ["BZ=F", "Brent Crude"],
    ["NG=F", "Natural Gas"],
    ["ZC=F", "Corn"],
    ["ZW=F", "Wheat"],
  ],
  metals: [
    ["GC=F", "Gold"],
    ["SI=F", "Silver"],
    ["HG=F", "Copper"],
    ["PL=F", "Platinum"],
    ["PA=F", "Palladium"],
  ],
  other: [
    ["^TNX", "U.S. 10Y"],
    ["TLT", "Long Treasuries"],
    ["HYG", "High Yield"],
    ["SOXX", "Semiconductors"],
    ["KRE", "Regional Banks"],
  ],
};
const EDITORIAL_KEYS = [
  "storyDeck",
  "inboxHighlights",
  "optionsPulse",
  "ratesCreditPulse",
  "globalRiskMap",
  "macroBoard",
  "leadershipBoard",
  "deskNotes",
  "setupBoard",
  "crowdPulse",
  "catalystCalendar",
  "credibleSourceWire",
  "flowWatch",
  "moverBoard",
  "rotationRadar",
  "signal",
  "liveStatus",
  "cot",
];

const STATIC_COT_CARDS = [
  {
    label: "Dealer S&P net",
    value: "-699,781",
    tone: "down",
    meta: "The newly posted official COT file still leans defensive beneath the tape.",
    sub: "Jul 14 CFTC",
  },
  {
    label: "WTI producer net",
    value: "+60,007",
    tone: "up",
    meta: "Producer hedger length fell sharply week over week even though crude stayed central to the macro tape.",
    sub: "Jul 14 CFTC",
  },
];

function pctChange(current, previous) {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

function toneFrom(change) {
  if (change > 0) return "up";
  if (change < 0) return "down";
  return "flat";
}

function signed(value, digits) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}%`;
}

function formatNumber(value, digits) {
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function formatMoney(value, digits) {
  return `$${formatNumber(value, digits)}`;
}

function sampleSeries(values, target = 26) {
  const clean = (values || []).map(Number).filter(Number.isFinite);
  if (clean.length <= target) return clean;
  const step = (clean.length - 1) / (target - 1);
  return Array.from(
    { length: target },
    (_, index) => clean[Math.round(index * step)],
  );
}

function buildQuoteGroups(spark, crypto) {
  const groups = {};
  for (const [group, rows] of Object.entries(QUOTE_GROUPS)) {
    groups[group] = rows
      .map(([symbol, name]) => {
        const meta = spark[symbol];
        if (!meta || !Number.isFinite(meta.regularMarketPrice)) return null;
        const previous = Number.isFinite(meta.chartPreviousClose)
          ? meta.chartPreviousClose
          : meta.regularMarketPrice;
        return {
          symbol,
          name,
          value: meta.regularMarketPrice,
          change: Number(
            pctChange(meta.regularMarketPrice, previous).toFixed(2),
          ),
          currency: meta.currency || "USD",
          spark: meta.spark || [],
          asOf: meta.regularMarketTime
            ? new Date(meta.regularMarketTime * 1000).toISOString()
            : null,
        };
      })
      .filter(Boolean);
  }

  groups.other.push(
    ...[
      ["bitcoin", "BTC", "Bitcoin"],
      ["ethereum", "ETH", "Ethereum"],
      ["solana", "SOL", "Solana"],
    ].map(([id, symbol, name]) => ({
      symbol,
      name,
      value: Number(crypto[id]?.usd || 0),
      change: Number(crypto[id]?.usd_24h_change || 0),
      currency: "USD",
      spark: [],
      asOf: new Date().toISOString(),
    })),
  );
  return groups;
}

function parseJsonEnv(name) {
  const raw = process.env[name];
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function withTimeout(ms) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeout),
  };
}

async function fetchOptionalEditorialPayload() {
  const url = process.env.DEBRIEF_EDITORIAL_URL;
  if (!url) {
    return { payload: null, source: null };
  }

  const extraHeaders = parseJsonEnv("DEBRIEF_EDITORIAL_HEADERS_JSON");
  const headers = {
    Accept: "application/json",
    "User-Agent": "Mozilla/5.0",
    ...extraHeaders,
  };

  if (process.env.DEBRIEF_EDITORIAL_BEARER_TOKEN) {
    headers.Authorization = `Bearer ${process.env.DEBRIEF_EDITORIAL_BEARER_TOKEN}`;
  }

  const timer = withTimeout(8000);
  try {
    const response = await fetch(url, {
      headers,
      signal: timer.signal,
    });

    if (!response.ok) {
      throw new Error(`editorial HTTP ${response.status}`);
    }

    const payload = await response.json();
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw new Error("editorial payload must be an object");
    }

    return { payload, source: url };
  } finally {
    timer.clear();
  }
}

function mergeEditorialPayload(basePayload, editorialPayload, editorialSource) {
  if (!editorialPayload) return basePayload;

  const merged = { ...basePayload };

  for (const key of EDITORIAL_KEYS) {
    if (Object.prototype.hasOwnProperty.call(editorialPayload, key)) {
      merged[key] = editorialPayload[key];
    }
  }

  const defaultStatus = basePayload.liveStatus || {};
  const incomingStatus =
    editorialPayload.liveStatus && typeof editorialPayload.liveStatus === "object"
      ? editorialPayload.liveStatus
      : {};

  merged.liveStatus = {
    ...defaultStatus,
    ...incomingStatus,
  };

  if (editorialSource && (!incomingStatus.meta || incomingStatus.meta === defaultStatus.meta)) {
    const baseMeta = merged.liveStatus.meta || defaultStatus.meta || "";
    merged.liveStatus.meta = baseMeta
      ? `${baseMeta} Editorial payload merged from ${editorialSource}.`
      : `Editorial payload merged from ${editorialSource}.`;
  }

  return merged;
}

async function fetchSparkQuotes() {
  const bySymbol = {};
  const batches = [];
  for (let index = 0; index < SPARK_SYMBOLS.length; index += 18) {
    batches.push(SPARK_SYMBOLS.slice(index, index + 18));
  }

  for (const symbols of batches) {
    const url = new URL("https://query1.finance.yahoo.com/v7/finance/spark");
    url.searchParams.set("symbols", symbols.join(","));
    url.searchParams.set("range", "1d");
    url.searchParams.set("interval", "5m");
    url.searchParams.set("indicators", "close");

    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!response.ok) {
      throw new Error(`spark HTTP ${response.status}`);
    }

    const payload = await response.json();
    const results = (((payload || {}).spark || {}).result) || [];
    results.forEach((entry) => {
      const chart = entry && entry.response && entry.response[0];
      const meta = chart && chart.meta;
      if (entry && entry.symbol && meta) {
        bySymbol[entry.symbol] = {
          ...meta,
          spark: sampleSeries(chart?.indicators?.quote?.[0]?.close || []),
        };
      }
    });
  }

  return bySymbol;
}

async function fetchCryptoQuotes() {
  const url =
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true";
  const response = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
  });

  if (!response.ok) {
    throw new Error(`coingecko HTTP ${response.status}`);
  }

  return response.json();
}

function buildPayload(spark, crypto) {
  const spx = spark["^GSPC"];
  const ndx = spark["^IXIC"];
  const dji = spark["^DJI"];
  const tnx = spark["^TNX"];
  const brent = spark["BZ=F"];
  const gold = spark["GC=F"];
  const vix = spark["^VIX"];
  const rut = spark["^RUT"];
  const soxx = spark["SOXX"];
  const xlk = spark["XLK"];
  const xle = spark["XLE"];
  const uup = spark["UUP"];
  const tlt = spark["TLT"];
  const hyg = spark["HYG"];
  const kre = spark["KRE"];
  const fez = spark["FEZ"];
  const efa = spark["EFA"];
  const eem = spark["EEM"];
  const fxi = spark["FXI"];

  const btc = crypto.bitcoin || {};
  const eth = crypto.ethereum || {};
  const sol = crypto.solana || {};

  const spxChg = pctChange(spx.regularMarketPrice, spx.chartPreviousClose);
  const ndxChg = pctChange(ndx.regularMarketPrice, ndx.chartPreviousClose);
  const djiChg = pctChange(dji.regularMarketPrice, dji.chartPreviousClose);
  const tnxChg = pctChange(tnx.regularMarketPrice, tnx.chartPreviousClose);
  const brentChg = pctChange(brent.regularMarketPrice, brent.chartPreviousClose);
  const goldChg = pctChange(gold.regularMarketPrice, gold.chartPreviousClose);
  const vixChg = pctChange(vix.regularMarketPrice, vix.chartPreviousClose);
  const rutChg = pctChange(rut.regularMarketPrice, rut.chartPreviousClose);
  const soxxChg = pctChange(soxx.regularMarketPrice, soxx.chartPreviousClose);
  const xlkChg = pctChange(xlk.regularMarketPrice, xlk.chartPreviousClose);
  const xleChg = pctChange(xle.regularMarketPrice, xle.chartPreviousClose);
  const uupChg = pctChange(uup.regularMarketPrice, uup.chartPreviousClose);
  const tltChg = pctChange(tlt.regularMarketPrice, tlt.chartPreviousClose);
  const hygChg = pctChange(hyg.regularMarketPrice, hyg.chartPreviousClose);
  const kreChg = pctChange(kre.regularMarketPrice, kre.chartPreviousClose);
  const fezChg = pctChange(fez.regularMarketPrice, fez.chartPreviousClose);
  const efaChg = pctChange(efa.regularMarketPrice, efa.chartPreviousClose);
  const eemChg = pctChange(eem.regularMarketPrice, eem.chartPreviousClose);
  const fxiChg = pctChange(fxi.regularMarketPrice, fxi.chartPreviousClose);
  const btcChg = Number.isFinite(btc.usd_24h_change) ? btc.usd_24h_change : 0;
  const solChg = Number.isFinite(sol.usd_24h_change) ? sol.usd_24h_change : 0;

  const ticker = [
    ["S&P 500", formatNumber(spx.regularMarketPrice, 2), Number(spxChg.toFixed(2))],
    ["NASDAQ", formatNumber(ndx.regularMarketPrice, 2), Number(ndxChg.toFixed(2))],
    ["DOW", formatNumber(dji.regularMarketPrice, 2), Number(djiChg.toFixed(2))],
    ["US 10Y", formatNumber(tnx.regularMarketPrice, 2), Number(tnxChg.toFixed(2))],
    ["BRENT", formatMoney(brent.regularMarketPrice, 2), Number(brentChg.toFixed(2))],
    ["GOLD", formatMoney(gold.regularMarketPrice, 2), Number(goldChg.toFixed(2))],
    ["BITCOIN", formatMoney(btc.usd || 0, 2), Number(btcChg.toFixed(2))],
  ];

  const macroBoard = [
    {
      label: "S&P 500 live",
      value: formatNumber(spx.regularMarketPrice, 2),
      tone: toneFrom(spxChg),
      meta: "Live snapshot from the Vercel market endpoint.",
      sub: signed(spxChg, 2),
    },
    {
      label: "Nasdaq live",
      value: formatNumber(ndx.regularMarketPrice, 2),
      tone: toneFrom(ndxChg),
      meta: "AI and semiconductor stress still shows up here first.",
      sub: signed(ndxChg, 2),
    },
    {
      label: "U.S. 10Y",
      value: `${formatNumber(tnx.regularMarketPrice, 2)}%`,
      tone: toneFrom(tnxChg),
      meta: "Rates remain a clean pressure gauge for duration and funding risk.",
      sub: signed(tnxChg, 2),
    },
    {
      label: "Brent",
      value: formatMoney(brent.regularMarketPrice, 2),
      tone: toneFrom(brentChg),
      meta: "Energy remains the fastest transmission line from geopolitics into inflation.",
      sub: signed(brentChg, 2),
    },
    {
      label: "Gold",
      value: formatMoney(gold.regularMarketPrice, 2),
      tone: toneFrom(goldChg),
      meta: "Gold helps show whether the market is hiding or just de-risking.",
      sub: signed(goldChg, 2),
    },
    {
      label: "Bitcoin",
      value: `$${formatNumber(btc.usd || 0, 0)}`,
      tone: toneFrom(btcChg),
      meta: "Crypto still acts like a fast macro-risk thermometer.",
      sub: signed(btcChg, 2),
    },
    ...STATIC_COT_CARDS,
  ];

  const ratesCreditPulse = [
    {
      title: "U.S. 10Y yield",
      value: `${formatNumber(tnx.regularMarketPrice, 2)}%`,
      meta: "Rates still set the tone for equity duration, funding costs, and risk appetite.",
      tone: toneFrom(tnxChg),
    },
    {
      title: "TLT",
      value: signed(tltChg, 2),
      meta: "Long-duration Treasuries show whether the tape is embracing safety or rejecting duration.",
      tone: toneFrom(tltChg),
    },
    {
      title: "HYG",
      value: signed(hygChg, 2),
      meta: "High-yield credit is a cleaner funding-stress read than equities alone once macro fear rises.",
      tone: toneFrom(hygChg),
    },
    {
      title: "KRE",
      value: signed(kreChg, 2),
      meta: "Regional banks help show whether higher yields are becoming a banking and credit problem.",
      tone: toneFrom(kreChg),
    },
  ];

  const globalRiskMap = [
    {
      title: "Europe (FEZ)",
      value: signed(fezChg, 2),
      meta: "Europe helps show whether the stress is global and cyclical rather than purely U.S. tech-specific.",
      tone: toneFrom(fezChg),
    },
    {
      title: "Developed ex-US (EFA)",
      value: signed(efaChg, 2),
      meta: "Broad developed markets show whether the dollar-and-rates regime is spilling beyond the U.S.",
      tone: toneFrom(efaChg),
    },
    {
      title: "Emerging Markets (EEM)",
      value: signed(eemChg, 2),
      meta: "Emerging markets are a useful risk appetite and dollar-sensitivity read when macro pressure rises.",
      tone: toneFrom(eemChg),
    },
    {
      title: "China Large Caps (FXI)",
      value: signed(fxiChg, 2),
      meta: "China exposure remains a clean stress read when global growth and tech sentiment both wobble.",
      tone: toneFrom(fxiChg),
    },
  ];

  const leadershipBoard = [
    {
      label: "VIX",
      value: formatNumber(vix.regularMarketPrice, 2),
      tone: toneFrom(vixChg),
      meta: "Volatility is the cleanest live stress gauge once positioning starts to matter again.",
      sub: signed(vixChg, 2),
    },
    {
      label: "Russell 2000",
      value: formatNumber(rut.regularMarketPrice, 2),
      tone: toneFrom(rutChg),
      meta: "Small caps help show whether risk appetite is broadening or staying narrow.",
      sub: signed(rutChg, 2),
    },
    {
      label: "SOXX",
      value: formatNumber(soxx.regularMarketPrice, 2),
      tone: toneFrom(soxxChg),
      meta: "Semis remain one of the fastest leadership stress reads in this market.",
      sub: signed(soxxChg, 2),
    },
    {
      label: "XLK",
      value: formatNumber(xlk.regularMarketPrice, 2),
      tone: toneFrom(xlkChg),
      meta: "Broad tech helps separate mega-cap resilience from chip-specific fragility.",
      sub: signed(xlkChg, 2),
    },
    {
      label: "XLE",
      value: formatNumber(xle.regularMarketPrice, 2),
      tone: toneFrom(xleChg),
      meta: "Energy shows how directly the tape is still responding to oil and geopolitics.",
      sub: signed(xleChg, 2),
    },
    {
      label: "UUP",
      value: formatNumber(uup.regularMarketPrice, 2),
      tone: toneFrom(uupChg),
      meta: "Dollar firmness helps confirm whether traders are seeking safety or still leaning into beta.",
      sub: signed(uupChg, 2),
    },
  ];

  const flowWatch = [
    {
      title: "US 10Y Cash",
      value: formatNumber(tnx.regularMarketPrice, 2),
      meta: "live yield snapshot from the Vercel endpoint",
      tone: toneFrom(tnxChg),
    },
    {
      title: "Brent Spot",
      value: formatMoney(brent.regularMarketPrice, 2),
      meta: "oil remains one of the cleanest live macro stress signals",
      tone: toneFrom(brentChg),
    },
    {
      title: "Gold Spot",
      value: formatMoney(gold.regularMarketPrice, 2),
      meta: "live gold helps show whether the market is seeking safety or cash",
      tone: toneFrom(goldChg),
    },
    {
      title: "BTC/USD",
      value: `$${formatNumber(btc.usd || 0, 0)}`,
      meta: "crypto snapshot refreshes automatically without a newsletter rebuild",
      tone: toneFrom(btcChg),
    },
  ];

  const moverBoard = [
    {
      title: "NASDAQ",
      value: signed(ndxChg, 2),
      meta: "live composite move",
      tone: toneFrom(ndxChg),
    },
    {
      title: "S&P 500",
      value: signed(spxChg, 2),
      meta: "live broad-market move",
      tone: toneFrom(spxChg),
    },
    {
      title: "BRENT",
      value: signed(brentChg, 2),
      meta: "live commodity move",
      tone: toneFrom(brentChg),
    },
    {
      title: "SOL",
      value: signed(solChg, 2),
      meta: "CoinGecko 24h move",
      tone: toneFrom(solChg),
    },
  ];

  const rotationRadar = [
    {
      title: "XLE vs XLK",
      value: `${signed(xleChg, 2)} / ${signed(xlkChg, 2)}`,
      meta: "Energy leadership over tech usually means inflation and geopolitics are overpowering clean growth optimism.",
      tone: xleChg >= xlkChg ? "up" : "down",
    },
    {
      title: "SOXX vs XLK",
      value: `${signed(soxxChg, 2)} / ${signed(xlkChg, 2)}`,
      meta: "Semis versus broad tech helps separate chip-specific stress from wider software and platform resilience.",
      tone: soxxChg >= xlkChg ? "up" : "down",
    },
    {
      title: "Russell vs S&P",
      value: `${signed(rutChg, 2)} / ${signed(spxChg, 2)}`,
      meta: "Small-cap lag still points to narrow risk appetite rather than a broadening bull tape.",
      tone: rutChg >= spxChg ? "up" : "down",
    },
    {
      title: "UUP vs Gold",
      value: `${signed(uupChg, 2)} / ${signed(goldChg, 2)}`,
      meta: "Dollar strength with softer gold often signals liquidity stress more than a textbook haven rotation.",
      tone: uupChg >= goldChg ? "up" : "down",
    },
  ];

  const riskOff =
    spxChg < 0 && ndxChg < 0 && brentChg > 0
      ? "Risk-Off"
      : spxChg > 0 && ndxChg > 0
        ? "Risk-On"
        : "Mixed";

  const signal = {
    summary: `Live snapshot: S&P ${signed(spxChg, 2)}, Nasdaq ${signed(ndxChg, 2)}, Brent ${signed(brentChg, 2)}, U.S. 10Y ${formatNumber(tnx.regularMarketPrice, 2)}% and BTC ${signed(btcChg, 2)} over the last 24h.`,
    bias: riskOff === "Risk-On" ? "Bullish" : "Mixed",
    items: [
      {
        label: "Macro",
        state: riskOff,
        meta: "Derived from the current live cross-asset snapshot rather than the static build.",
      },
      {
        label: "Rates",
        state: tnxChg >= 0 ? "Higher" : "Lower",
        meta: `U.S. 10Y is ${formatNumber(tnx.regularMarketPrice, 2)}% right now.`,
      },
      {
        label: "Energy",
        state: brentChg >= 0 ? "Firm" : "Soft",
        meta: `Brent is ${signed(brentChg, 2)} versus the previous close.`,
      },
      {
        label: "Crypto",
        state: btcChg >= 0 ? "Holding" : "Breaking",
        meta: `BTC ${signed(btcChg, 2)}, ETH ${signed(Number(eth.usd_24h_change || 0), 2)}, SOL ${signed(solChg, 2)} over 24h.`,
      },
    ],
  };

  return {
    quoteGroups: buildQuoteGroups(spark, crypto),
    ticker,
    ratesCreditPulse,
    globalRiskMap,
    macroBoard,
    leadershipBoard,
    flowWatch,
    moverBoard,
    rotationRadar,
    signal,
    liveStatus: {
      mode: "Live Vercel snapshot connected.",
      meta: "The page is polling /api/live for delayed cross-asset market refreshes. Traditional assets come from Yahoo Finance spark; crypto comes from CoinGecko.",
      updated: `Updated ${new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: "America/New_York",
        timeZoneName: "short",
      })}`,
    },
  };
}

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=60");
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const [spark, crypto, editorial] = await Promise.all([
      fetchSparkQuotes(),
      fetchCryptoQuotes(),
      fetchOptionalEditorialPayload(),
    ]);
    const payload = buildPayload(spark, crypto);
    res.status(200).send(
      JSON.stringify(mergeEditorialPayload(payload, editorial.payload, editorial.source)),
    );
  } catch (error) {
    res.status(500).send(
      JSON.stringify({
        error: "live_snapshot_unavailable",
        message: error.message,
      })
    );
  }
};
