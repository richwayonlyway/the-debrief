const OPTION_WATCHLIST = ["^SPX", "SPY", "QQQ"];
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126 Safari/537.36";
let cachedPayload = null;
let cachedAt = 0;

function withTimeout(ms) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeout),
  };
}

async function fetchJson(url, headers = {}, timeoutMs = 7000) {
  const timer = withTimeout(timeoutMs);
  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": USER_AGENT,
        ...headers,
      },
      signal: timer.signal,
    });
    if (!response.ok) {
      throw new Error(`${new URL(url).hostname} HTTP ${response.status}`);
    }
    return await response.json();
  } finally {
    timer.clear();
  }
}

function finite(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

async function fetchScreen(name) {
  let payload;
  let lastError;
  for (const host of ["query1.finance.yahoo.com", "query2.finance.yahoo.com"]) {
    const url = new URL(
      `https://${host}/v1/finance/screener/predefined/saved`,
    );
    url.searchParams.set("count", "8");
    url.searchParams.set("scrIds", name);
    try {
      payload = await fetchJson(url.toString());
      break;
    } catch (error) {
      lastError = error;
    }
  }
  if (!payload) throw lastError || new Error("Screener unavailable");
  const quotes = payload?.finance?.result?.[0]?.quotes || [];
  return quotes.map((quote) => ({
    symbol: quote.symbol,
    name: quote.shortName || quote.longName || quote.symbol,
    price: finite(quote.regularMarketPrice),
    change: Number(finite(quote.regularMarketChangePercent).toFixed(2)),
    volume: finite(quote.regularMarketVolume),
    marketCap: finite(quote.marketCap),
  }));
}

async function getYahooSession() {
  const cookieTimer = withTimeout(5000);
  let cookie = "";
  try {
    const cookieResponse = await fetch("https://fc.yahoo.com", {
      headers: { "User-Agent": USER_AGENT },
      redirect: "manual",
      signal: cookieTimer.signal,
    });
    cookie = cookieResponse.headers.get("set-cookie") || "";
  } finally {
    cookieTimer.clear();
  }

  let lastError;
  for (const host of ["query1.finance.yahoo.com", "query2.finance.yahoo.com"]) {
    const crumbTimer = withTimeout(5000);
    try {
      const crumbResponse = await fetch(`https://${host}/v1/test/getcrumb`, {
        headers: {
          "User-Agent": USER_AGENT,
          Cookie: cookie,
        },
        signal: crumbTimer.signal,
      });
      if (!crumbResponse.ok) {
        throw new Error(`Yahoo crumb HTTP ${crumbResponse.status}`);
      }
      const crumb = (await crumbResponse.text()).trim();
      if (!crumb) throw new Error("Yahoo crumb response was empty");
      return { cookie, crumb };
    } catch (error) {
      lastError = error;
    } finally {
      crumbTimer.clear();
    }
  }
  throw lastError || new Error("Yahoo session unavailable");
}

async function fetchOptionChain(symbol, session) {
  let payload;
  let lastError;
  for (const host of ["query2.finance.yahoo.com", "query1.finance.yahoo.com"]) {
    const url = new URL(
      `https://${host}/v7/finance/options/${encodeURIComponent(symbol)}`,
    );
    url.searchParams.set("crumb", session.crumb);
    try {
      payload = await fetchJson(
        url.toString(),
        { Cookie: session.cookie },
        7000,
      );
      break;
    } catch (error) {
      lastError = error;
    }
  }
  if (!payload) throw lastError || new Error(`Option chain unavailable for ${symbol}`);
  const result = payload?.optionChain?.result?.[0];
  if (!result?.options?.[0]) {
    throw new Error(`No delayed option chain returned for ${symbol}`);
  }
  return result;
}

function normalDensity(value) {
  return Math.exp(-0.5 * value * value) / Math.sqrt(2 * Math.PI);
}

function timeToExpiry(expiration) {
  const expiryCloseUtc = expiration * 1000 + 20 * 60 * 60 * 1000;
  const remainingMs = Math.max(expiryCloseUtc - Date.now(), 60 * 60 * 1000);
  return remainingMs / (365 * 24 * 60 * 60 * 1000);
}

function blackScholesGamma(spot, strike, volatility, time, rate = 0.047) {
  if (
    spot <= 0 ||
    strike <= 0 ||
    volatility <= 0 ||
    time <= 0 ||
    !Number.isFinite(volatility)
  ) {
    return 0;
  }
  const rootTime = Math.sqrt(time);
  const d1 =
    (Math.log(spot / strike) + (rate + 0.5 * volatility * volatility) * time) /
    (volatility * rootTime);
  return normalDensity(d1) / (spot * volatility * rootTime);
}

function contractExposure(option, spot, sign) {
  const openInterest = finite(option.openInterest);
  const volatility = finite(option.impliedVolatility);
  const time = timeToExpiry(finite(option.expiration));
  const gamma = blackScholesGamma(
    spot,
    finite(option.strike),
    volatility,
    time,
  );
  return sign * gamma * openInterest * 100 * spot * spot * 0.01;
}

function aggregateGamma(optionSet, spot) {
  const byStrike = new Map();
  const contracts = [
    ...(optionSet.calls || []).map((option) => ({ option, sign: 1 })),
    ...(optionSet.puts || []).map((option) => ({ option, sign: -1 })),
  ];

  for (const { option, sign } of contracts) {
    const strike = finite(option.strike);
    if (!strike || Math.abs(strike - spot) / spot > 0.08) continue;
    const exposure = contractExposure(option, spot, sign);
    byStrike.set(strike, finite(byStrike.get(strike)) + exposure);
  }

  return [...byStrike.entries()]
    .map(([strike, exposure]) => ({
      strike,
      exposure: Number((exposure / 1e9).toFixed(3)),
    }))
    .sort((a, b) => b.strike - a.strike);
}

function estimateZeroGamma(optionSet, currentSpot) {
  const points = [];
  for (let index = 0; index <= 60; index += 1) {
    const spot = currentSpot * (0.96 + (index / 60) * 0.08);
    const exposure = aggregateGamma(optionSet, spot).reduce(
      (sum, row) => sum + row.exposure,
      0,
    );
    points.push({ spot, exposure });
  }

  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    if (Math.sign(previous.exposure) === Math.sign(current.exposure)) continue;
    const span = Math.abs(previous.exposure) + Math.abs(current.exposure);
    const weight = span ? Math.abs(previous.exposure) / span : 0.5;
    return previous.spot + (current.spot - previous.spot) * weight;
  }

  return points.reduce((best, point) =>
    Math.abs(point.exposure) < Math.abs(best.exposure) ? point : best,
  ).spot;
}

function closestContract(options, spot) {
  return (options || []).reduce((best, option) => {
    if (!best) return option;
    return Math.abs(option.strike - spot) < Math.abs(best.strike - spot)
      ? option
      : best;
  }, null);
}

function wallByOpenInterest(options) {
  return (options || []).reduce((best, option) => {
    if (!best) return option;
    return finite(option.openInterest) > finite(best.openInterest) ? option : best;
  }, null);
}

function optionPrice(option) {
  const bid = finite(option.bid);
  const ask = finite(option.ask);
  if (bid > 0 && ask > 0) return (bid + ask) / 2;
  return finite(option.lastPrice);
}

function buildActivity(chains) {
  const rows = [];
  for (const chain of chains) {
    const optionSet = chain.options?.[0];
    if (!optionSet) continue;
    const symbol = chain.quote?.symbol || chain.underlyingSymbol;
    for (const [side, options] of [
      ["Call", optionSet.calls || []],
      ["Put", optionSet.puts || []],
    ]) {
      for (const option of options) {
        const volume = finite(option.volume);
        if (!volume) continue;
        const openInterest = finite(option.openInterest);
        const price = optionPrice(option);
        rows.push({
          symbol,
          contract: option.contractSymbol,
          side,
          strike: finite(option.strike),
          expiration: new Date(finite(option.expiration) * 1000)
            .toISOString()
            .slice(0, 10),
          volume,
          openInterest,
          volumeOpenInterest: openInterest
            ? Number((volume / openInterest).toFixed(2))
            : null,
          premium: Math.round(volume * price * 100),
          impliedVolatility: Number(
            (finite(option.impliedVolatility) * 100).toFixed(1),
          ),
        });
      }
    }
  }

  return rows
    .sort((a, b) => b.premium - a.premium || b.volume - a.volume)
    .slice(0, 18);
}

function buildOptionsDesk(chains) {
  const spx = chains.find(
    (chain) => (chain.quote?.symbol || chain.underlyingSymbol) === "^SPX",
  );
  if (!spx?.options?.[0]) return null;

  const optionSet = spx.options[0];
  const spot = finite(spx.quote?.regularMarketPrice);
  const gammaByStrike = aggregateGamma(optionSet, spot);
  const netGamma = gammaByStrike.reduce((sum, row) => sum + row.exposure, 0);
  const zeroGamma = estimateZeroGamma(optionSet, spot);
  const callWall = wallByOpenInterest(optionSet.calls);
  const putWall = wallByOpenInterest(optionSet.puts);
  const atmCall = closestContract(optionSet.calls, spot);
  const atmPut = closestContract(optionSet.puts, spot);
  const expectedMove =
    spot > 0 ? ((optionPrice(atmCall || {}) + optionPrice(atmPut || {})) / spot) * 100 : 0;

  let callVolume = 0;
  let putVolume = 0;
  for (const chain of chains) {
    const set = chain.options?.[0];
    if (!set) continue;
    callVolume += (set.calls || []).reduce(
      (sum, option) => sum + finite(option.volume),
      0,
    );
    putVolume += (set.puts || []).reduce(
      (sum, option) => sum + finite(option.volume),
      0,
    );
  }

  const putCallRatio = callVolume ? putVolume / callVolume : 0;
  const sentiment =
    putCallRatio > 1.05
      ? "Defensive"
      : putCallRatio < 0.75
        ? "Call-heavy"
        : "Balanced";

  const nearestGamma = gammaByStrike
    .sort((a, b) => Math.abs(a.strike - spot) - Math.abs(b.strike - spot))
    .slice(0, 19)
    .sort((a, b) => b.strike - a.strike);

  return {
    underlying: "^SPX",
    spot: Number(spot.toFixed(2)),
    expiration: new Date(optionSet.expirationDate * 1000)
      .toISOString()
      .slice(0, 10),
    asOf: spx.quote?.regularMarketTime
      ? new Date(spx.quote.regularMarketTime * 1000).toISOString()
      : new Date().toISOString(),
    netGammaBillions: Number(netGamma.toFixed(2)),
    zeroGamma: Number(zeroGamma.toFixed(0)),
    callWall: finite(callWall?.strike),
    putWall: finite(putWall?.strike),
    expectedMovePercent: Number(expectedMove.toFixed(2)),
    putCallRatio: Number(putCallRatio.toFixed(2)),
    totalWatchlistVolume: callVolume + putVolume,
    sentiment,
    gammaByStrike: nearestGamma,
    activity: buildActivity(chains),
    methodology:
      "Delayed Yahoo Finance option chains. Gamma uses Black-Scholes gamma, reported implied volatility and open interest. Calls are treated as positive dealer gamma and puts as negative; exposure is estimated for a 1% underlying move. This is an analytical estimate, not exchange-reported positioning or executable market data.",
  };
}

async function fetchOptionsDesk() {
  const session = await getYahooSession();
  const settled = await Promise.allSettled(
    OPTION_WATCHLIST.map((symbol) => fetchOptionChain(symbol, session)),
  );
  const chains = settled
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value);
  if (!chains.length) throw new Error("No delayed option chains were available");
  return buildOptionsDesk(chains);
}

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=300");
  res.setHeader("Access-Control-Allow-Origin", "*");

  const cacheTtl = cachedPayload?.warnings?.length ? 30_000 : 90_000;
  if (cachedPayload && Date.now() - cachedAt < cacheTtl) {
    res.status(200).send(JSON.stringify(cachedPayload));
    return;
  }

  const [gainersResult, losersResult, optionsResult] = await Promise.allSettled([
    fetchScreen("day_gainers"),
    fetchScreen("day_losers"),
    fetchOptionsDesk(),
  ]);

  const warnings = [];
  if (gainersResult.status === "rejected") warnings.push("gainers");
  if (losersResult.status === "rejected") warnings.push("losers");
  if (optionsResult.status === "rejected") warnings.push("options");

  const payload = {
    gainers: gainersResult.status === "fulfilled" ? gainersResult.value : [],
    losers: losersResult.status === "fulfilled" ? losersResult.value : [],
    optionsDesk:
      optionsResult.status === "fulfilled" ? optionsResult.value : null,
    updatedAt: new Date().toISOString(),
    delayed: true,
    sources: [
      "Yahoo Finance delayed screener and option-chain endpoints",
    ],
    warnings,
  };

  cachedPayload = payload;
  cachedAt = Date.now();

  res.status(200).send(JSON.stringify(payload));
};
