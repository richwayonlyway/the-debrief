const SPARK_SYMBOLS = ["^GSPC", "^IXIC", "^DJI", "^TNX", "BZ=F", "GC=F"];
const X_TRACKER_ACCOUNTS = [
  { handle: "@NoLimitGains", focus: "Momentum + premarket setups" },
  { handle: "@unsusual_whales", focus: "Flow + options sentiment" },
  { handle: "@DeItaone", focus: "Macro headline tape" },
];

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

function normalizeHandle(handle) {
  return String(handle || "").trim().replace(/^@+/, "");
}

function shortText(value, maxLength = 180) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

function relativeTime(value) {
  if (!value) return "time n/a";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "time n/a";
  const diffMs = date.getTime() - Date.now();
  const minutes = Math.round(diffMs / 60000);
  const absMinutes = Math.abs(minutes);
  if (absMinutes < 60) return `${absMinutes}m ago`;
  const hours = Math.round(absMinutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
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

function defaultXTracker(metaSuffix) {
  return X_TRACKER_ACCOUNTS.map((account) => ({
    handle: account.handle,
    focus: account.focus,
    state: "Backend pending",
    meta: metaSuffix,
  }));
}

async function fetchXJson(url, token) {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0",
    },
  });

  if (!response.ok) {
    throw new Error(`x API HTTP ${response.status}`);
  }

  return response.json();
}

async function fetchXUserByUsername(username, token) {
  const url = new URL(`https://api.x.com/2/users/by/username/${encodeURIComponent(username)}`);
  url.searchParams.set("user.fields", "id,name,username,profile_image_url");
  const payload = await fetchXJson(url, token);
  if (!payload || !payload.data || !payload.data.id) {
    throw new Error(`x user lookup failed for ${username}`);
  }
  return payload.data;
}

async function fetchXPostsByUserId(userId, token) {
  const url = new URL(`https://api.x.com/2/users/${encodeURIComponent(userId)}/tweets`);
  url.searchParams.set("exclude", "replies,retweets");
  url.searchParams.set("max_results", "5");
  url.searchParams.set("tweet.fields", "created_at,public_metrics,attachments");
  url.searchParams.set("expansions", "attachments.media_keys");
  url.searchParams.set("media.fields", "preview_image_url,url,type");
  return fetchXJson(url, token);
}

async function fetchLiveXTracker() {
  const token = process.env.X_BEARER_TOKEN;
  if (!token) {
    return defaultXTracker(
      "Set X_BEARER_TOKEN to turn on official X timeline pulls for these accounts.",
    );
  }

  const usernameOverrides = parseJsonEnv("X_TRACKER_USERNAME_MAP_JSON");

  const rows = await Promise.all(
    X_TRACKER_ACCOUNTS.map(async (account) => {
      const normalized = normalizeHandle(account.handle);
      const lookupUsername =
        usernameOverrides[account.handle] ||
        usernameOverrides[normalized] ||
        normalized;

      try {
        const user = await fetchXUserByUsername(lookupUsername, token);
        const timeline = await fetchXPostsByUserId(user.id, token);
        const posts = Array.isArray(timeline.data) ? timeline.data : [];
        const latest = posts[0];

        if (!latest) {
          return {
            handle: account.handle,
            focus: account.focus,
            state: "Live",
            meta: "Authenticated X lookup succeeded, but no recent non-reply posts were returned.",
            url: `https://x.com/${user.username}`,
          };
        }

        const metrics = latest.public_metrics || {};
        const metricParts = [];
        if (Number.isFinite(metrics.like_count)) metricParts.push(`Likes ${metrics.like_count}`);
        if (Number.isFinite(metrics.retweet_count)) metricParts.push(`Reposts ${metrics.retweet_count}`);
        if (Number.isFinite(metrics.reply_count)) metricParts.push(`Replies ${metrics.reply_count}`);

        return {
          handle: account.handle,
          focus: account.focus,
          state: "Live",
          latestText: shortText(latest.text, 160),
          meta: `${user.name} · ${relativeTime(latest.created_at)}${metricParts.length ? ` · ${metricParts.join(" · ")}` : ""}`,
          url: `https://x.com/${user.username}/status/${latest.id}`,
        };
      } catch (error) {
        return {
          handle: account.handle,
          focus: account.focus,
          state: "Lookup failed",
          meta: `Official X lookup failed for ${lookupUsername}. ${error.message}`,
        };
      }
    }),
  );

  return rows;
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

function buildPayload(spark, crypto, xTracker) {
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
    xTracker,
    liveStatus: {
      mode: "Live Vercel snapshot connected.",
      meta: xTracker.some((row) => row.state === "Live")
        ? "The page is polling /api/live for market refreshes and authenticated X timeline pulls. Traditional assets come from Yahoo Finance spark; crypto comes from CoinGecko."
        : "The page is polling /api/live for market refreshes. Traditional assets come from Yahoo Finance spark; crypto comes from CoinGecko. X still needs credentials or username overrides to go fully live.",
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
    const [spark, crypto, xTracker] = await Promise.all([
      fetchSparkQuotes(),
      fetchCryptoQuotes(),
      fetchLiveXTracker(),
    ]);
    res.status(200).send(JSON.stringify(buildPayload(spark, crypto, xTracker)));
  } catch (error) {
    res.status(500).send(
      JSON.stringify({
        error: "live_snapshot_unavailable",
        message: error.message,
      })
    );
  }
};
