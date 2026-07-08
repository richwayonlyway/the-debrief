const SPARK_SYMBOLS = ["^GSPC", "^IXIC", "^DJI", "^TNX", "BZ=F", "GC=F"];

const STATIC_COT_CARDS = [
  {
    label: "Dealer S&P net",
    value: "-746,475",
    tone: "down",
    meta: "The current official COT file still leans defensive beneath the tape.",
    sub: "Jun 30 CFTC",
  },
  {
    label: "WTI swap-dealer net",
    value: "+371,227",
    tone: "up",
    meta: "Commodity positioning still says energy hedging flows remain important.",
    sub: "Jun 30 CFTC",
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

async function fetchSparkQuotes() {
  const url = new URL("https://query1.finance.yahoo.com/v7/finance/spark");
  url.searchParams.set("symbols", SPARK_SYMBOLS.join(","));
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
  const bySymbol = {};

  results.forEach((entry) => {
    const meta = entry && entry.response && entry.response[0] && entry.response[0].meta;
    if (entry && entry.symbol && meta) bySymbol[entry.symbol] = meta;
  });

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

  const btc = crypto.bitcoin || {};
  const eth = crypto.ethereum || {};
  const sol = crypto.solana || {};

  const spxChg = pctChange(spx.regularMarketPrice, spx.chartPreviousClose);
  const ndxChg = pctChange(ndx.regularMarketPrice, ndx.chartPreviousClose);
  const djiChg = pctChange(dji.regularMarketPrice, dji.chartPreviousClose);
  const tnxChg = pctChange(tnx.regularMarketPrice, tnx.chartPreviousClose);
  const brentChg = pctChange(brent.regularMarketPrice, brent.chartPreviousClose);
  const goldChg = pctChange(gold.regularMarketPrice, gold.chartPreviousClose);
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
    ticker,
    macroBoard,
    flowWatch,
    moverBoard,
    signal,
    liveStatus: {
      mode: "Live Vercel snapshot connected.",
      meta: "The page is polling /api/live for market refreshes. Traditional assets come from Yahoo Finance spark; crypto comes from CoinGecko. X and Convex realtime are still separate follow-on work.",
      updated: `Updated ${new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })}`,
    },
  };
}

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=60");
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const [spark, crypto] = await Promise.all([fetchSparkQuotes(), fetchCryptoQuotes()]);
    res.status(200).send(JSON.stringify(buildPayload(spark, crypto)));
  } catch (error) {
    res.status(500).send(
      JSON.stringify({
        error: "live_snapshot_unavailable",
        message: error.message,
      })
    );
  }
};
