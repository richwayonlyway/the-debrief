(function () {
  "use strict";

  const content = window.DEBRIEF_CONTENT;
  const validViews = new Set([
    "today",
    "markets",
    "technology",
    "derivatives",
    "crypto",
    "research",
    "companies",
    "tools",
  ]);
  const params = new URLSearchParams(window.location.search);
  const storyId = params.get("story");
  const requestedView = params.get("view") || "today";

  const state = {
    view: validViews.has(requestedView) ? requestedView : "today",
    storyId,
    quoteGroup: "indices",
    optionFilter: "all",
    live: null,
    market: null,
    weather: null,
    weatherLoading: false,
    researchFilter: "All",
    company: null,
    companyMatches: [],
    companyQuery: "AAPL",
    companyLoading: false,
    companyError: null,
    companyRequested: false,
    tool: "compound",
    loading: true,
    refreshTimer: null,
  };

  const fallbackQuotes = {
    indices: [
      { symbol: "^GSPC", name: "S&P 500", value: 7411.98, change: 0.05, spark: [] },
      { symbol: "^IXIC", name: "Nasdaq", value: 24975.824, change: -0.64, spark: [] },
      { symbol: "^DJI", name: "Dow", value: 51947.25, change: 0.46, spark: [] },
      { symbol: "^RUT", name: "Russell 2000", value: 2929.999, change: -0.35, spark: [] },
      { symbol: "^VIX", name: "VIX", value: 18.58, change: -0.64, spark: [] },
    ],
    currencies: [
      { symbol: "DX-Y.NYB", name: "U.S. Dollar", value: 101.465, change: 0, spark: [] },
      { symbol: "EURUSD=X", name: "EUR / USD", value: 1.1375, change: -0.06, spark: [] },
      { symbol: "GBPUSD=X", name: "GBP / USD", value: 1.3319, change: 0.02, spark: [] },
      { symbol: "JPY=X", name: "USD / JPY", value: 163.791, change: 0.02, spark: [] },
      { symbol: "AUDUSD=X", name: "AUD / USD", value: 0.6983, change: 0.22, spark: [] },
    ],
    commodities: [
      { symbol: "CL=F", name: "WTI Crude", value: 89.31, change: -3.12, spark: [] },
      { symbol: "BZ=F", name: "Brent Crude", value: 96.78, change: -3.82, spark: [] },
      { symbol: "NG=F", name: "Natural Gas", value: 2.888, change: -1.1, spark: [] },
      { symbol: "ZC=F", name: "Corn", value: 487.25, change: -0.05, spark: [] },
      { symbol: "ZW=F", name: "Wheat", value: 678, change: -2.62, spark: [] },
    ],
    metals: [
      { symbol: "GC=F", name: "Gold", value: 4070.8, change: 0.51, spark: [] },
      { symbol: "SI=F", name: "Silver", value: 58.906, change: 1.47, spark: [] },
      { symbol: "HG=F", name: "Copper", value: 6.3575, change: 0.22, spark: [] },
      { symbol: "PL=F", name: "Platinum", value: 1604.1, change: -0.29, spark: [] },
      { symbol: "PA=F", name: "Palladium", value: 1253.6, change: -0.69, spark: [] },
    ],
    other: [
      { symbol: "^TNX", name: "U.S. 10Y", value: 4.679, change: -0.51, spark: [] },
      { symbol: "TLT", name: "Long Treasuries", value: 83.25, change: 0.1, spark: [] },
      { symbol: "HYG", name: "High Yield", value: 79.23, change: 0, spark: [] },
      { symbol: "SOXX", name: "Semiconductors", value: 527.01, change: -4.4, spark: [] },
      { symbol: "KRE", name: "Regional Banks", value: 75.73, change: 0.77, spark: [] },
      { symbol: "BTC", name: "Bitcoin", value: 64058, change: -0.94, spark: [] },
      { symbol: "ETH", name: "Ethereum", value: 1858.92, change: -0.66, spark: [] },
      { symbol: "SOL", name: "Solana", value: 73.89, change: -1.18, spark: [] },
    ],
  };

  const worldCities = [
    { city: "New York", timeZone: "America/New_York", latitude: 40.71, longitude: -74.01 },
    { city: "London", timeZone: "Europe/London", latitude: 51.51, longitude: -0.13 },
    { city: "Tokyo", timeZone: "Asia/Tokyo", latitude: 35.68, longitude: 139.65 },
    { city: "Madrid", timeZone: "Europe/Madrid", latitude: 40.42, longitude: -3.7 },
    { city: "San Juan", timeZone: "America/Puerto_Rico", latitude: 18.47, longitude: -66.11 },
  ];

  const main = document.getElementById("main");
  const liveState = document.getElementById("liveState");
  const editionDate = document.getElementById("editionDate");
  const generatedAt = document.getElementById("generatedAt");
  const themeButton = document.getElementById("themeButton");
  const menuButton = document.getElementById("menuButton");
  const mobileNav = document.getElementById("mobileNav");
  const searchButton = document.getElementById("searchButton");
  const searchDialog = document.getElementById("searchDialog");
  const closeSearchButton = document.getElementById("closeSearchButton");
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");
  const toast = document.getElementById("toast");

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function icon(name) {
    return `<i data-lucide="${escapeHtml(name)}" aria-hidden="true"></i>`;
  }

  function activateIcons() {
    if (window.lucide) {
      window.lucide.createIcons({
        attrs: {
          "aria-hidden": "true",
        },
      });
    }
  }

  function formatNumber(value, digits = 2) {
    if (!Number.isFinite(Number(value))) return "--";
    return Number(value).toLocaleString("en-US", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  }

  function formatCompact(value) {
    if (!Number.isFinite(Number(value))) return "--";
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(Number(value));
  }

  function formatMoney(value, digits = 2) {
    if (!Number.isFinite(Number(value))) return "--";
    return `$${formatNumber(value, digits)}`;
  }

  function formatChange(value) {
    if (!Number.isFinite(Number(value))) return "--";
    const number = Number(value);
    return `${number >= 0 ? "+" : ""}${number.toFixed(2)}%`;
  }

  function tone(value) {
    if (!Number.isFinite(Number(value)) || Number(value) === 0) return "flat";
    return Number(value) > 0 ? "up" : "down";
  }

  function quoteGroups() {
    const incoming = state.live?.quoteGroups || state.market?.quoteGroups;
    if (!incoming) return fallbackQuotes;
    const merged = {};
    for (const [group, fallbackRows] of Object.entries(fallbackQuotes)) {
      const incomingRows = incoming[group] || [];
      const bySymbol = new Map(
        incomingRows.map((row) => [row.symbol, row]),
      );
      merged[group] = [
        ...fallbackRows.map((row) => bySymbol.get(row.symbol) || row),
        ...incomingRows.filter(
          (row) => !fallbackRows.some((fallback) => fallback.symbol === row.symbol),
        ),
      ];
    }
    return merged;
  }

  function findQuote(nameOrSymbol) {
    for (const rows of Object.values(quoteGroups())) {
      const match = rows.find(
        (row) => row.name === nameOrSymbol || row.symbol === nameOrSymbol,
      );
      if (match) return match;
    }
    return null;
  }

  function quoteValue(row, group) {
    if (!row || !Number.isFinite(Number(row.value))) return "--";
    const value = Number(row.value);
    if (row.symbol === "^TNX") return `${formatNumber(value, 2)}%`;
    if (group === "currencies") return formatNumber(value, 4);
    if (
      group === "commodities" ||
      group === "metals" ||
      ["BTC", "ETH", "SOL"].includes(row.symbol)
    ) {
      return formatMoney(value, value >= 1000 ? 0 : 2);
    }
    return formatNumber(value, value >= 1000 ? 2 : 2);
  }

  function sparkline(values, change) {
    const clean = (values || []).map(Number).filter(Number.isFinite);
    if (clean.length < 2) return "";
    const width = 160;
    const height = 30;
    const min = Math.min(...clean);
    const max = Math.max(...clean);
    const span = max - min || 1;
    const points = clean
      .map((value, index) => {
        const x = (index / (clean.length - 1)) * width;
        const y = height - 3 - ((value - min) / span) * (height - 6);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
    return `<svg class="sparkline ${tone(change)}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true"><polyline points="${points}"></polyline></svg>`;
  }

  function lineChart(values, options = {}) {
    const clean = (values || []).map(Number).filter(Number.isFinite);
    if (clean.length < 2) {
      return `<div class="chart-empty">${escapeHtml(options.empty || "Chart data unavailable")}</div>`;
    }
    const width = options.width || 720;
    const height = options.height || 220;
    const padding = 18;
    const min = Math.min(...clean);
    const max = Math.max(...clean);
    const span = max - min || 1;
    const points = clean
      .map((value, index) => {
        const x = padding + (index / (clean.length - 1)) * (width - padding * 2);
        const y = height - padding - ((value - min) / span) * (height - padding * 2);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
    const baseline = height - padding;
    const areaPoints = `${padding},${baseline} ${points} ${width - padding},${baseline}`;
    const label = options.label || "Line chart";
    return `
      <div class="line-chart-wrap">
        <svg class="line-chart" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img" aria-label="${escapeHtml(label)}">
          <line class="chart-gridline" x1="${padding}" y1="${height * 0.25}" x2="${width - padding}" y2="${height * 0.25}"></line>
          <line class="chart-gridline" x1="${padding}" y1="${height * 0.5}" x2="${width - padding}" y2="${height * 0.5}"></line>
          <line class="chart-gridline" x1="${padding}" y1="${height * 0.75}" x2="${width - padding}" y2="${height * 0.75}"></line>
          <polygon class="chart-area" points="${areaPoints}"></polygon>
          <polyline class="chart-line" points="${points}"></polyline>
        </svg>
        <div class="chart-scale">
          <span>${escapeHtml(options.startLabel || "")}</span>
          <span>${escapeHtml(options.endLabel || "")}</span>
        </div>
      </div>
    `;
  }

  function renderCrossAssetChart() {
    const assets = [
      ["S&P 500", findQuote("^GSPC")],
      ["Nasdaq", findQuote("^IXIC")],
      ["Russell 2000", findQuote("^RUT")],
      ["Brent", findQuote("BZ=F")],
      ["Gold", findQuote("GC=F")],
      ["Bitcoin", findQuote("BTC")],
      ["U.S. 10Y", findQuote("^TNX")],
    ].filter(([, row]) => Number.isFinite(Number(row?.change)));
    const max = Math.max(...assets.map(([, row]) => Math.abs(Number(row.change))), 1);
    return `
      <div class="performance-chart" role="img" aria-label="Cross-asset percentage performance">
        ${assets
          .map(([label, row]) => {
            const change = Number(row.change);
            const width = Math.max(2, (Math.abs(change) / max) * 48);
            return `
              <div class="performance-row">
                <span>${escapeHtml(label)}</span>
                <div class="performance-track">
                  <span class="performance-zero" aria-hidden="true"></span>
                  <span class="performance-bar ${tone(change)} ${change >= 0 ? "positive" : "negative"}" style="width:${width}%"></span>
                </div>
                <strong class="${tone(change)}">${formatChange(change)}</strong>
              </div>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function renderQuoteBoard(activeGroup = state.quoteGroup, customRows = null) {
    const labels = {
      indices: "Indices",
      currencies: "Currencies",
      commodities: "Commodities",
      metals: "Metals",
      other: "Other",
    };
    const groups = quoteGroups();
    const rows = customRows || groups[activeGroup] || fallbackQuotes[activeGroup] || [];
    return `
      <section class="quote-board" aria-label="Delayed market quotes">
        <div class="asset-tabs" role="tablist" aria-label="Asset classes">
          ${Object.entries(labels)
            .map(
              ([key, label]) => `
                <button class="asset-tab ${key === activeGroup ? "active" : ""}" type="button" data-quote-group="${key}" role="tab" aria-selected="${key === activeGroup}">
                  ${label}
                </button>
              `,
            )
            .join("")}
        </div>
        <div class="quote-grid" id="quoteGrid">
          ${rows
            .slice(0, 5)
            .map(
              (row) => `
                <div class="quote-cell">
                  <div class="quote-name">${escapeHtml(row.name)}</div>
                  <div class="quote-value-row">
                    <span class="quote-value">${quoteValue(row, activeGroup)}</span>
                    <span class="change ${tone(row.change)}">${formatChange(row.change)}</span>
                  </div>
                  ${
                    sparkline(row.spark, row.change) ||
                    `<div class="quote-loading">${state.loading ? "Loading intraday path" : "Delayed snapshot"}</div>`
                  }
                </div>
              `,
            )
            .join("")}
        </div>
      </section>
    `;
  }

  function storyById(id) {
    return content.stories.find((story) => story.id === id);
  }

  function internalStoryUrl(story) {
    return `?story=${encodeURIComponent(story.id)}`;
  }

  function storyByline(story) {
    return `
      <div class="story-byline">
        <strong>${escapeHtml(story.source)}</strong>
        <span class="byline-divider" aria-hidden="true"></span>
        <span>${escapeHtml(story.readTime)}</span>
        <span class="byline-divider" aria-hidden="true"></span>
        <span>${escapeHtml(story.updated)}</span>
      </div>
    `;
  }

  function dynamicStoryNumbers(story) {
    const quoteMap = {
      "S&P 500": findQuote("^GSPC"),
      Nasdaq: findQuote("^IXIC"),
      Dow: findQuote("^DJI"),
      "Russell 2000": findQuote("^RUT"),
      "U.S. 10Y": findQuote("^TNX"),
      Brent: findQuote("BZ=F"),
      Bitcoin: findQuote("BTC"),
    };
    return story.numbers.map((number) => {
      const quote = quoteMap[number.label];
      if (!quote || !Number.isFinite(Number(quote.value))) return number;
      const group =
        number.label === "U.S. 10Y"
          ? "other"
          : number.label === "Brent"
            ? "commodities"
            : number.label === "Bitcoin"
              ? "other"
              : "indices";
      return {
        ...number,
        value: quoteValue(quote, group),
        change: formatChange(quote.change),
        tone: tone(quote.change),
      };
    });
  }

  function numberStrip(story, className = "lead-numbers") {
    return `
      <div class="${className}">
        ${dynamicStoryNumbers(story)
          .slice(0, 4)
          .map(
            (number) => `
              <div class="number-cell">
                <div class="number-label">${escapeHtml(number.label)}</div>
                <div class="number-value">${escapeHtml(number.value)}</div>
                <span class="change ${escapeHtml(number.tone || "flat")}">${escapeHtml(number.change)}</span>
              </div>
            `,
          )
          .join("")}
      </div>
    `;
  }

  function storyActions(story) {
    return `
      <div class="action-row">
        <a class="button primary" href="${internalStoryUrl(story)}">Read in The Debrief ${icon("arrow-right")}</a>
        <a class="button" href="${escapeHtml(story.sourceUrl)}" target="_blank" rel="noopener noreferrer">View source ${icon("external-link")}</a>
      </div>
    `;
  }

  function marketPulseRows() {
    const options = optionsDesk();
    const vix = findQuote("^VIX");
    const russell = findQuote("^RUT");
    const spx = findQuote("^GSPC");
    const brent = findQuote("BZ=F");
    const regime =
      options?.sentiment ||
      state.live?.signal?.bias ||
      (Number(vix?.change) > 5 ? "Caution" : "Mixed");
    return [
      {
        label: "VIX",
        value: quoteValue(vix, "indices"),
        change: formatChange(vix?.change),
        tone: tone(vix?.change),
      },
      {
        label: "Russell vs. S&P",
        value: `${formatChange(russell?.change)} / ${formatChange(spx?.change)}`,
        change: Number(russell?.change) < Number(spx?.change) ? "Narrow" : "Broad",
        tone: Number(russell?.change) < Number(spx?.change) ? "down" : "up",
      },
      {
        label: "Put / call",
        value: options ? formatNumber(options.putCallRatio, 2) : "--",
        change: options?.sentiment || "Loading",
        tone:
          options?.putCallRatio > 1.05
            ? "down"
            : options?.putCallRatio < 0.75
              ? "up"
              : "flat",
      },
      {
        label: "Brent",
        value: quoteValue(brent, "commodities"),
        change: formatChange(brent?.change),
        tone: tone(brent?.change),
      },
      {
        label: "Market regime",
        value: regime,
        change: Number(vix?.change) > 5 ? "Volatility rising" : "Cross-asset mixed",
        tone: Number(vix?.change) > 5 ? "down" : "flat",
      },
    ];
  }

  function renderMarketPulse() {
    return `
      <aside class="market-pulse">
        <div class="panel-title-row">
          <h2>Market Pulse</h2>
          <a href="?view=markets">Full dashboard ${icon("arrow-right")}</a>
        </div>
        <table class="pulse-table">
          <thead>
            <tr><th>Indicator</th><th>Value</th><th>Read</th></tr>
          </thead>
          <tbody>
            ${marketPulseRows()
              .map(
                (row) => `
                  <tr>
                    <td>${escapeHtml(row.label)}</td>
                    <td>${escapeHtml(row.value)}</td>
                    <td class="${escapeHtml(row.tone)}">${escapeHtml(row.change)}</td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </aside>
    `;
  }

  function storyRow(story) {
    return `
      <article class="story-row">
        <div>
          <span class="utility-label">${escapeHtml(story.category)} · ${escapeHtml(story.source)}</span>
          <h3 class="story-row-title"><a href="${internalStoryUrl(story)}">${escapeHtml(story.headline)}</a></h3>
          <p>${escapeHtml(story.summary)}</p>
          <div class="story-byline">
            <span>${escapeHtml(story.readTime)}</span>
            <span class="byline-divider" aria-hidden="true"></span>
            <span>${escapeHtml(story.updated)}</span>
          </div>
        </div>
        <div class="story-row-actions">
          <a href="${internalStoryUrl(story)}" aria-label="Read ${escapeHtml(story.headline)} in The Debrief" title="Read in The Debrief">${icon("arrow-right")}</a>
          <a class="external-action" href="${escapeHtml(story.sourceUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Open original source for ${escapeHtml(story.headline)}" title="View source">${icon("external-link")}</a>
        </div>
      </article>
    `;
  }

  function renderStoryList(stories) {
    return `<div class="story-list">${stories.map(storyRow).join("")}</div>`;
  }

  function renderTimeline() {
    return `
      <div class="timeline">
        ${content.timeline
          .map(
            (item) => `
              <div class="timeline-row">
                <span class="timeline-time">${escapeHtml(item.time)}</span>
                <span class="timeline-mark" aria-hidden="true"></span>
                <div class="timeline-copy">
                  <strong>${escapeHtml(item.title)}</strong>
                  <span>${escapeHtml(item.detail)}</span>
                </div>
                <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" aria-label="Open source for ${escapeHtml(item.title)}">${icon("external-link")}</a>
              </div>
            `,
          )
          .join("")}
      </div>
    `;
  }

  function renderWorldRail() {
    const podcasts = content.podcasts || [];
    const research = content.research || [];
    return `
      <aside class="utility-rail" aria-label="Global context and listening">
        <section class="rail-section world-desk" aria-labelledby="global-desk-title">
          <div class="section-title-row">
            <h2 id="global-desk-title">World Clocks &amp; Weather</h2>
          </div>
          <div class="world-list">
            ${worldCities
              .map(
                (city, index) => `
                  <div class="world-row" data-world-clock="${index}">
                    <div>
                      <strong>${escapeHtml(city.city)}</strong>
                      <span class="world-zone">${escapeHtml(city.timeZone.replaceAll("_", " "))}</span>
                    </div>
                    <div class="world-reading">
                      <strong class="world-time">--:--</strong>
                      <span class="world-weather">${escapeHtml(state.weather?.[index]?.label || "Weather loading")}</span>
                    </div>
                  </div>
                `,
              )
              .join("")}
          </div>
          <a class="rail-source" href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Weather by Open-Meteo ${icon("external-link")}</a>
        </section>
        <section class="rail-section listening-desk">
          <div class="section-title-row">
            <h2>Podcast Desk</h2>
            <span class="page-meta">8 shows</span>
          </div>
          <div class="listening-list">
            ${podcasts
              .slice(0, 5)
              .map(
                (show) => `
                  <a href="${escapeHtml(show.url)}" target="_blank" rel="noopener noreferrer">
                    <span>
                      <strong>${escapeHtml(show.title)}</strong>
                      <small>${escapeHtml(show.focus)}</small>
                    </span>
                    ${icon("external-link")}
                  </a>
                `,
              )
              .join("")}
          </div>
        </section>
        <section class="rail-section">
          <div class="section-title-row">
            <h2>Research Shelf</h2>
            <a href="?view=research">View all ${icon("arrow-right")}</a>
          </div>
          <div class="rail-research-list">
            ${research
              .slice(0, 3)
              .map(
                (item) => `
                  <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">
                    <span class="utility-label">${escapeHtml(item.category)} · ${escapeHtml(item.year)}</span>
                    <strong>${escapeHtml(item.title)}</strong>
                    <small>${escapeHtml(item.source)}</small>
                  </a>
                `,
              )
              .join("")}
          </div>
        </section>
      </aside>
    `;
  }

  function renderToday() {
    const lead = storyById(content.leadId);
    const technology = content.stories.filter((story) => story.page === "technology").slice(0, 4);
    const technologyIds = new Set(technology.map((story) => story.id));
    const latest = content.stories
      .filter((story) => story.id !== lead.id && !technologyIds.has(story.id))
      .slice(0, 6);
    const takeaways =
      lead.sections.find((section) => section.bullets)?.bullets.slice(0, 3) || [];
    return `
      <div class="page shell">
        ${renderQuoteBoard()}
        <section class="front-page-grid">
          ${renderWorldRail()}
          <div class="front-page-center">
            <article class="lead-story newsroom-lead">
              <span class="utility-label">Top story</span>
              <h1>${escapeHtml(lead.headline)}</h1>
              ${storyByline(lead)}
              <p class="lead-summary">${escapeHtml(lead.summary)}</p>
              <div class="key-takeaways compact-takeaways">
                <h2>Why it matters</h2>
                <ul>${takeaways.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
              </div>
              ${numberStrip(lead)}
              ${storyActions(lead)}
            </article>
            <section class="front-latest">
              <div class="section-title-row">
                <h2>Latest Analysis</h2>
                <span class="page-meta">${escapeHtml(content.edition.readTime)}</span>
              </div>
              ${renderStoryList(latest.slice(0, 4))}
            </section>
          </div>
          <aside class="front-page-right">
            ${renderMarketPulse()}
            <section class="rail-section">
              <div class="section-title-row">
                <h2>Options &amp; Positioning</h2>
                <a href="?view=derivatives">Open desk ${icon("arrow-right")}</a>
              </div>
              ${renderMacroMatrix()}
            </section>
            <section class="rail-section">
              <div class="section-title-row">
                <h2>Next Catalysts</h2>
              </div>
              ${renderTimeline()}
            </section>
          </aside>
        </section>

        <section class="section-band market-overview-band">
          <div class="section-title-row">
            <h2>Cross-Asset Performance</h2>
            <a href="?view=markets">Open market dashboard ${icon("arrow-right")}</a>
          </div>
          ${renderCrossAssetChart()}
        </section>

        <div class="split-band section-band">
          <section>
            <div class="section-title-row">
              <h2>Technology Briefing</h2>
              <a href="?view=technology">View all technology ${icon("arrow-right")}</a>
            </div>
            ${renderStoryList(technology)}
          </section>
          <section>
            <div class="section-title-row">
              <h2>More From Today's Debrief</h2>
              <span class="page-meta">Markets + crypto</span>
            </div>
            ${renderStoryList(latest.slice(4))}
          </section>
        </div>
      </div>
    `;
  }

  function renderPageHead(title, description, meta) {
    return `
      <header class="page-head">
        <div>
          <h1>${escapeHtml(title)}</h1>
          <p>${escapeHtml(description)}</p>
        </div>
        <div class="page-meta">${escapeHtml(meta)}</div>
      </header>
    `;
  }

  function renderDrivers() {
    return `
      <div class="driver-grid">
        ${content.marketDrivers
          .map(
            (driver) => `
              <div class="driver">
                <strong>${escapeHtml(driver.title)}</strong>
                <div class="driver-state ${escapeHtml(driver.tone)}">${escapeHtml(driver.state)}</div>
                <p>${escapeHtml(driver.detail)}</p>
              </div>
            `,
          )
          .join("")}
      </div>
    `;
  }

  function renderCot() {
    return `
      <div class="cot-box">
        <span class="utility-label">CFTC COT · ${escapeHtml(content.cot.date)}</span>
        <p>${escapeHtml(content.cot.note)}</p>
        <div class="cot-rows">
          ${content.cot.rows
            .map(
              (row) => `
                <div class="cot-row">
                  <strong>${escapeHtml(row.market)}</strong>
                  <span>${escapeHtml(row.group)}</span>
                  <strong class="${row.net >= 0 ? "up" : "down"}">${row.net >= 0 ? "+" : ""}${formatNumber(row.net, 0)}</strong>
                </div>
              `,
            )
            .join("")}
        </div>
        <a class="text-link" href="?story=cot-dealer-positioning-july-14">Read the positioning note ${icon("arrow-right")}</a>
      </div>
    `;
  }

  function renderMacroMatrix() {
    const rows = marketPulseRows();
    return `
      <div class="matrix-list">
        ${rows
          .map(
            (row) => `
              <div class="matrix-row">
                <strong>${escapeHtml(row.label)}</strong>
                <span>${escapeHtml(row.value)}</span>
                <span class="${escapeHtml(row.tone)}">${escapeHtml(row.change)}</span>
              </div>
            `,
          )
          .join("")}
      </div>
    `;
  }

  function renderSectorMap() {
    return `
      <div class="sector-grid">
        ${(content.sectorMap || [])
          .map(
            (row) => `
              <div class="sector-cell">
                <div class="sector-head">
                  <strong>${escapeHtml(row.sector)}</strong>
                  <span class="${escapeHtml(row.tone)}">${escapeHtml(row.signal)}</span>
                </div>
                <p>${escapeHtml(row.driver)}</p>
              </div>
            `,
          )
          .join("")}
      </div>
    `;
  }

  function renderMarkets() {
    const stories = content.stories.filter((story) => story.page === "markets");
    return `
      <div class="page shell">
        ${renderPageHead(
          "Markets",
          "Cross-asset prices, market structure, weekly positioning and the stories moving the risk map.",
          "Quotes delayed · COT weekly",
        )}
        ${renderQuoteBoard()}
        <section class="section-band market-overview-band">
          <div class="section-title-row">
            <h2>Cross-Asset Performance</h2>
            <span class="page-meta">Current delayed session</span>
          </div>
          ${renderCrossAssetChart()}
        </section>
        <section class="section-band">
          <div class="section-title-row">
            <h2>Risk Map</h2>
            <span class="page-meta">What is driving the tape</span>
          </div>
          ${renderDrivers()}
        </section>
        <section class="section-band">
          <div class="section-title-row">
            <h2>Sector Transmission Map</h2>
            <span class="page-meta">Price action to earnings impact</span>
          </div>
          ${renderSectorMap()}
        </section>
        <section class="section-band content-grid">
          <div>
            <div class="section-title-row">
              <h2>Detailed Market Stories</h2>
              <span class="page-meta">${stories.length} reports</span>
            </div>
            ${renderStoryList(stories)}
          </div>
          <aside>
            <div class="surface-panel">
              <div class="panel-title-row">
                <h2>Cross-Asset Read</h2>
              </div>
              ${renderMacroMatrix()}
            </div>
            <div class="section-band">
              ${renderCot()}
            </div>
          </aside>
        </section>
      </div>
    `;
  }

  function renderTechMatrix() {
    return `
      <div class="surface-panel">
        <div class="panel-title-row">
          <h2>AI Spending & Execution</h2>
          <span class="page-meta">Company read-through</span>
        </div>
        <div class="matrix-list">
          ${content.techMatrix
            .map(
              (row) => `
                <div class="matrix-row">
                  <strong>${escapeHtml(row.company)}</strong>
                  <span>${escapeHtml(row.focus)}</span>
                  <span class="${escapeHtml(row.tone)}">${escapeHtml(row.signal)}</span>
                </div>
              `,
            )
            .join("")}
        </div>
      </div>
    `;
  }

  function renderTechnology() {
    const stories = content.stories.filter((story) => story.page === "technology");
    const lead = storyById("alphabet-capex-reset");
    const research = (content.research || [])
      .filter((item) => item.category.startsWith("AI"))
      .slice(0, 4);
    return `
      <div class="page shell">
        ${renderPageHead(
          "Technology",
          "AI infrastructure, cloud economics, semiconductors and the operating evidence behind the biggest technology narratives.",
          "Earnings + primary sources",
        )}
        <section class="lead-layout">
          <article class="lead-story">
            <span class="utility-label">Technology lead</span>
            <h1>${escapeHtml(lead.headline)}</h1>
            ${storyByline(lead)}
            <p class="lead-summary">${escapeHtml(lead.summary)}</p>
            ${storyActions(lead)}
            ${numberStrip(lead)}
          </article>
          <aside class="market-pulse">
            <div class="panel-title-row">
              <h2>Today's Catalysts</h2>
            </div>
            ${renderTimeline()}
          </aside>
        </section>
        <section class="section-band">
          ${renderTechMatrix()}
        </section>
        <section class="section-band content-grid">
          <div>
            <div class="section-title-row">
              <h2>Detailed Technology Stories</h2>
              <span class="page-meta">${stories.length} reports</span>
            </div>
            ${renderStoryList(stories)}
          </div>
          <aside class="surface-panel research-aside">
            <div class="panel-title-row">
              <h2>Technical Reading</h2>
              <a href="?view=research">Research library ${icon("arrow-right")}</a>
            </div>
            <div class="compact-research-list">
              ${research
                .map(
                  (item) => `
                    <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">
                      <span class="utility-label">${escapeHtml(item.category)} · ${escapeHtml(item.year)}</span>
                      <strong>${escapeHtml(item.title)}</strong>
                      <small>${escapeHtml(item.relevance)}</small>
                    </a>
                  `,
                )
                .join("")}
            </div>
          </aside>
        </section>
      </div>
    `;
  }

  function optionsDesk() {
    return state.market?.optionsDesk || content.fallbackMarket?.optionsDesk || null;
  }

  function renderMetricRail(options) {
    const rows = [
      {
        label: "SPX gamma exposure",
        value: options ? `${options.netGammaBillions >= 0 ? "+" : ""}$${formatNumber(options.netGammaBillions, 2)}B` : "--",
        meta: "Estimated for a 1% move",
        tone: options?.netGammaBillions >= 0 ? "up" : "down",
      },
      {
        label: "Zero gamma",
        value: options ? formatNumber(options.zeroGamma, 0) : "--",
        meta: options ? `Spot ${formatNumber(options.spot, 2)}` : "Loading delayed chain",
        tone: "flat",
      },
      {
        label: "Put / call",
        value: options ? formatNumber(options.putCallRatio, 2) : "--",
        meta: options?.sentiment || "Watchlist volume",
        tone:
          options?.putCallRatio > 1.05
            ? "down"
            : options?.putCallRatio < 0.75
              ? "up"
              : "flat",
      },
      {
        label: "Watchlist options volume",
        value: options ? formatCompact(options.totalWatchlistVolume) : "--",
        meta: "Nearest expirations · delayed",
        tone: "flat",
      },
    ];
    return `
      <div class="metric-rail">
        ${rows
          .map(
            (row) => `
              <div class="metric">
                <span class="metric-label">${escapeHtml(row.label)}</span>
                <div class="metric-value ${escapeHtml(row.tone)}">${escapeHtml(row.value)}</div>
                <p class="metric-meta">${escapeHtml(row.meta)}</p>
              </div>
            `,
          )
          .join("")}
      </div>
    `;
  }

  function renderGammaChart(options) {
    if (!options?.gammaByStrike?.length) {
      return `
        <div class="empty-state">
          <strong>Delayed gamma profile is loading</strong>
          <span>The page will populate when the public option-chain snapshot is available.</span>
        </div>
      `;
    }
    const max = Math.max(...options.gammaByStrike.map((row) => Math.abs(row.exposure)), 0.001);
    const closest = options.gammaByStrike.reduce((best, row) =>
      Math.abs(row.strike - options.spot) < Math.abs(best.strike - options.spot)
        ? row
        : best,
    );
    return `
      <div class="gamma-chart" role="img" aria-label="Estimated SPX gamma exposure by strike">
        ${options.gammaByStrike
          .map((row) => {
            const width = Math.max(1, (Math.abs(row.exposure) / max) * 48);
            return `
              <div class="gamma-row ${row.strike === closest.strike ? "spot" : ""}" title="${formatNumber(row.strike, 0)}: ${row.exposure >= 0 ? "+" : ""}${formatNumber(row.exposure, 3)} billion dollars">
                <span class="gamma-strike">${formatNumber(row.strike, 0)}</span>
                <div class="gamma-track">
                  <span class="gamma-bar ${row.exposure >= 0 ? "positive" : "negative"}" style="width:${width}%"></span>
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function renderDealerPanel(options) {
    if (!options) {
      return `
        <div class="empty-state">
          <strong>Dealer estimate unavailable</strong>
          <span>Quotes remain usable while the delayed option-chain provider reconnects.</span>
        </div>
      `;
    }
    const shortGamma = options.netGammaBillions < 0;
    const stateText = shortGamma
      ? `Short gamma below ${formatNumber(options.zeroGamma, 0)}`
      : `Long gamma above ${formatNumber(options.zeroGamma, 0)}`;
    return `
      <div class="dealer-list">
        <div class="dealer-row"><span>Current state</span><span class="${shortGamma ? "down" : "up"}">${escapeHtml(stateText)}</span></div>
        <div class="dealer-row"><span>Call wall</span><span class="up">${formatNumber(options.callWall, 0)}</span></div>
        <div class="dealer-row"><span>Put wall</span><span class="down">${formatNumber(options.putWall, 0)}</span></div>
        <div class="dealer-row"><span>Zero gamma</span><span>${formatNumber(options.zeroGamma, 0)}</span></div>
        <div class="dealer-row"><span>Spot price</span><span>${formatNumber(options.spot, 2)}</span></div>
        <div class="dealer-row"><span>Nearest-expiry move</span><span>±${formatNumber(options.expectedMovePercent, 2)}%</span></div>
      </div>
      <div class="interpretation">
        <h3>Interpretation</h3>
        <p>${
          shortGamma
            ? "The estimate places dealers in negative gamma near spot, a setup that can amplify directional moves as hedges chase price. The put and call walls are the clearest nearby open-interest levels."
            : "The estimate places dealers in positive gamma near spot, a setup that can dampen movement as hedging leans against price. A move through zero gamma would make the tape less stable."
        }</p>
      </div>
    `;
  }

  function activityRows(options) {
    const activity = options?.activity || [];
    if (state.optionFilter === "call") {
      return activity.filter((row) => row.side === "Call");
    }
    if (state.optionFilter === "put") {
      return activity.filter((row) => row.side === "Put");
    }
    return activity;
  }

  function renderActivityTable(options) {
    const rows = activityRows(options).slice(0, 12);
    if (!rows.length) {
      return `
        <div class="empty-state">
          <strong>Delayed activity is loading</strong>
          <span>Most-active contracts will appear here when the option-chain snapshot returns.</span>
        </div>
      `;
    }
    return `
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>Symbol</th><th>Contract</th><th>Expiry</th><th>Strike</th><th>Side</th>
              <th>Volume</th><th>Open int.</th><th>Vol / OI</th><th>Premium</th><th>IV</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (row) => `
                  <tr>
                    <td class="company-cell">${escapeHtml(row.symbol)}</td>
                    <td>${escapeHtml(row.contract)}</td>
                    <td>${escapeHtml(row.expiration)}</td>
                    <td>${formatNumber(row.strike, 2)}</td>
                    <td class="${row.side === "Call" ? "up" : "down"}">${escapeHtml(row.side)}</td>
                    <td>${formatNumber(row.volume, 0)}</td>
                    <td>${formatNumber(row.openInterest, 0)}</td>
                    <td>${row.volumeOpenInterest == null ? "--" : `${formatNumber(row.volumeOpenInterest, 2)}x`}</td>
                    <td>${formatMoney(row.premium, 0)}</td>
                    <td>${formatNumber(row.impliedVolatility, 1)}%</td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function moverColumn(title, rows, direction) {
    return `
      <div class="movers-column">
        <h3 class="${direction}">${escapeHtml(title)}</h3>
        ${(rows || [])
          .slice(0, 6)
          .map(
            (row, index) => `
              <div class="mover-row">
                <div class="mover-name">
                  <strong>${index + 1}. ${escapeHtml(row.symbol)}</strong>
                  <span>${escapeHtml(row.name)}</span>
                </div>
                <span class="mover-value ${tone(row.change)}">${formatChange(row.change)}</span>
              </div>
            `,
          )
          .join("") || `<div class="quote-loading">Loading screener</div>`}
      </div>
    `;
  }

  function renderDerivatives() {
    const options = optionsDesk();
    const gainers = state.market?.gainers?.length
      ? state.market.gainers
      : content.fallbackMarket?.gainers || [];
    const losers = state.market?.losers?.length
      ? state.market.losers
      : content.fallbackMarket?.losers || [];
    const asOf = options?.asOf
      ? new Date(options.asOf).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          timeZoneName: "short",
        })
      : "Delayed public data";
    return `
      <div class="page shell">
        ${renderPageHead(
          "Options Flow & Positioning",
          "Delayed options activity, estimated gamma exposure, sentiment, volume and the equity names moving fastest.",
          `As of ${asOf}`,
        )}
        <div class="filters">
          <label class="filter-field">Underlying
            <select aria-label="Underlying"><option>SPX</option></select>
          </label>
          <label class="filter-field">Expiration
            <select aria-label="Expiration"><option>${escapeHtml(options?.expiration || "Nearest")}</option></select>
          </label>
          <a class="text-link" href="#methodology">${icon("info")} Methodology</a>
        </div>
        ${renderMetricRail(options)}
        <div class="analytics-grid">
          <section class="surface-panel gamma-panel">
            <div class="panel-title-row">
              <h2>SPX Gamma Exposure by Strike</h2>
              <span class="page-meta">$B per 1% move</span>
            </div>
            ${renderGammaChart(options)}
          </section>
          <aside class="surface-panel dealer-panel">
            <div class="panel-title-row">
              <h2>Dealer Positioning</h2>
              <span class="page-meta">Estimated</span>
            </div>
            ${renderDealerPanel(options)}
          </aside>
        </div>

        <section class="table-panel">
          <div class="table-panel-head">
            <h2>Unusual Options Activity</h2>
            <div class="table-tabs" role="tablist" aria-label="Options activity filter">
              ${[
                ["all", "Most Active"],
                ["call", "Call Flow"],
                ["put", "Put Flow"],
              ]
                .map(
                  ([key, label]) => `
                    <button class="table-tab ${state.optionFilter === key ? "active" : ""}" type="button" data-option-filter="${key}" role="tab" aria-selected="${state.optionFilter === key}">${label}</button>
                  `,
                )
                .join("")}
            </div>
          </div>
          ${renderActivityTable(options)}
        </section>

        <div class="lower-analytics">
          <section class="surface-panel">
            <div class="panel-title-row">
              <h2>Top Gainers & Losers</h2>
              <span class="page-meta">Delayed equities</span>
            </div>
            <div class="movers-split">
              ${moverColumn("Top gainers", gainers, "up")}
              ${moverColumn("Top losers", losers, "down")}
            </div>
          </section>
          <section class="surface-panel">
            <div class="panel-title-row">
              <h2>Sentiment & Volume</h2>
              <span class="page-meta">Watchlist snapshot</span>
            </div>
            <div class="sentiment-grid">
              <div class="sentiment-cell">
                <span>Market sentiment</span>
                <strong class="${options?.sentiment === "Defensive" ? "down" : options?.sentiment === "Call-heavy" ? "up" : "flat"}">${escapeHtml(options?.sentiment || "--")}</strong>
                <span>Derived from put/call and gamma</span>
              </div>
              <div class="sentiment-cell">
                <span>Put / call volume</span>
                <strong>${options ? formatNumber(options.putCallRatio, 2) : "--"}</strong>
                <span>Nearest-expiry watchlist</span>
              </div>
              <div class="sentiment-cell">
                <span>Expected SPX move</span>
                <strong>${options ? `±${formatNumber(options.expectedMovePercent, 2)}%` : "--"}</strong>
                <span>ATM straddle estimate</span>
              </div>
            </div>
          </section>
        </div>

        <details class="methodology" id="methodology">
          <summary>Data sources and gamma methodology</summary>
          <p>${escapeHtml(options?.methodology || "The derivatives page uses delayed Yahoo Finance option chains when available. Gamma estimates are analytical and never presented as exchange-reported dealer positions.")}</p>
          <p>Top gainers and losers use Yahoo Finance delayed screeners. This page is for market context, not executable pricing or investment advice.</p>
        </details>
      </div>
    `;
  }

  function renderCryptoQuotes() {
    const crypto = (quoteGroups().other || []).filter((row) =>
      ["BTC", "ETH", "SOL"].includes(row.symbol),
    );
    const rows = crypto.length ? crypto : fallbackQuotes.other.filter((row) => row.symbol === "BTC");
    return renderQuoteBoard("other", rows);
  }

  function renderCrypto() {
    const stories = content.stories.filter((story) => story.page === "crypto");
    const lead = stories[0];
    const btc = findQuote("BTC");
    const eth = findQuote("ETH");
    const sol = findQuote("SOL");
    return `
      <div class="page shell">
        ${renderPageHead(
          "Crypto",
          "Digital-asset prices, liquidity, ETF demand and the macro regime that still shapes the tape.",
          "24-hour crypto pricing",
        )}
        ${renderCryptoQuotes()}
        <section class="lead-layout">
          <article class="lead-story">
            <span class="utility-label">Crypto lead</span>
            <h1>${escapeHtml(lead.headline)}</h1>
            ${storyByline(lead)}
            <p class="lead-summary">${escapeHtml(lead.summary)}</p>
            ${storyActions(lead)}
            ${numberStrip(lead)}
          </article>
          <aside class="market-pulse">
            <div class="panel-title-row"><h2>Digital Asset Pulse</h2></div>
            <table class="pulse-table">
              <thead><tr><th>Asset</th><th>Price</th><th>24h</th></tr></thead>
              <tbody>
                ${[
                  ["Bitcoin", btc],
                  ["Ethereum", eth],
                  ["Solana", sol],
                ]
                  .map(
                    ([label, row]) => `
                      <tr>
                        <td>${label}</td>
                        <td>${quoteValue(row, "other")}</td>
                        <td class="${tone(row?.change)}">${formatChange(row?.change)}</td>
                      </tr>
                    `,
                  )
                  .join("")}
                <tr><td>Macro link</td><td>U.S. 10Y</td><td class="down">${quoteValue(findQuote("^TNX"), "other")}</td></tr>
              </tbody>
            </table>
          </aside>
        </section>
        <section class="section-band content-grid">
          <div>
            <div class="section-title-row"><h2>Detailed Crypto Stories</h2></div>
            ${renderStoryList(stories)}
          </div>
          <aside class="surface-panel">
            <div class="panel-title-row"><h2>Risk Checklist</h2></div>
            <div class="matrix-list">
              <div class="matrix-row"><strong>ETF demand</strong><span>Nearly $1B over seven sessions</span><span class="up">Supportive</span></div>
              <div class="matrix-row"><strong>Rates</strong><span>High yields raise the hurdle</span><span class="down">Pressure</span></div>
              <div class="matrix-row"><strong>Breadth</strong><span>Watch ETH and SOL confirmation</span><span class="flat">Mixed</span></div>
              <div class="matrix-row"><strong>Correlation</strong><span>Still tied to Nasdaq liquidity</span><span class="flat">Macro beta</span></div>
            </div>
          </aside>
        </section>
      </div>
    `;
  }

  function renderResearch() {
    const research = content.research || [];
    const categories = ["All", ...new Set(research.map((item) => item.category))];
    const filtered =
      state.researchFilter === "All"
        ? research
        : research.filter((item) => item.category === state.researchFilter);
    return `
      <div class="page shell">
        ${renderPageHead(
          "Research Library",
          "Primary papers and institutional research that deepen the market, portfolio-risk, options, crypto and AI analysis in each edition.",
          `${research.length} curated references`,
        )}
        <div class="research-filter-bar" role="tablist" aria-label="Research category">
          ${categories
            .map(
              (category) => `
                <button class="research-filter ${state.researchFilter === category ? "active" : ""}" type="button" data-research-filter="${escapeHtml(category)}" role="tab" aria-selected="${state.researchFilter === category}">
                  ${escapeHtml(category)}
                </button>
              `,
            )
            .join("")}
        </div>
        <section class="research-layout">
          <div class="research-index">
            ${filtered
              .map(
                (item, index) => `
                  <article class="research-entry">
                    <div class="research-number">${String(index + 1).padStart(2, "0")}</div>
                    <div class="research-copy">
                      <span class="utility-label">${escapeHtml(item.category)} · ${escapeHtml(item.kind)} · ${escapeHtml(item.year)}</span>
                      <h2>${escapeHtml(item.title)}</h2>
                      <p class="research-authors">${escapeHtml(item.authors)} · ${escapeHtml(item.source)}</p>
                      <p>${escapeHtml(item.summary)}</p>
                      <div class="research-relevance">
                        <strong>Why it matters</strong>
                        <span>${escapeHtml(item.relevance)}</span>
                      </div>
                    </div>
                    <a class="research-open" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${escapeHtml(item.title)}">${icon("external-link")}</a>
                  </article>
                `,
              )
              .join("")}
          </div>
          <aside class="research-guide">
            <span class="utility-label">Reading guide</span>
            <h2>From headline to framework</h2>
            <p>Use the library to inspect the models and evidence behind the newsroom analysis. Each reference is linked to the publisher or paper page.</p>
            <div class="guide-step"><strong>1</strong><span>Start with the daily story and its key claim.</span></div>
            <div class="guide-step"><strong>2</strong><span>Use the category filter to find the underlying framework.</span></div>
            <div class="guide-step"><strong>3</strong><span>Test the implication in Companies or Tools.</span></div>
            <a class="button primary" href="?view=tools">Open analytical tools ${icon("arrow-right")}</a>
          </aside>
        </section>
      </div>
    `;
  }

  function formatFinancial(value) {
    if (!Number.isFinite(Number(value))) return "--";
    const number = Number(value);
    const absolute = Math.abs(number);
    if (absolute >= 1e12) return `${number < 0 ? "-" : ""}$${(absolute / 1e12).toFixed(2)}T`;
    if (absolute >= 1e9) return `${number < 0 ? "-" : ""}$${(absolute / 1e9).toFixed(2)}B`;
    if (absolute >= 1e6) return `${number < 0 ? "-" : ""}$${(absolute / 1e6).toFixed(1)}M`;
    return formatMoney(number, 0);
  }

  function companyMetric(label, value, meta, valueTone = "flat") {
    return `
      <div class="company-metric">
        <span>${escapeHtml(label)}</span>
        <strong class="${escapeHtml(valueTone)}">${escapeHtml(value)}</strong>
        <small>${escapeHtml(meta)}</small>
      </div>
    `;
  }

  function renderCompanyResults() {
    if (state.companyLoading) {
      return `
        <div class="company-loading">
          <span class="loading-bar" aria-hidden="true"></span>
          <strong>Reading SEC filings and delayed price history</strong>
          <span>This can take a few seconds on the first lookup.</span>
        </div>
      `;
    }
    if (state.companyError) {
      return `
        <div class="empty-state">
          <strong>Company data could not be loaded</strong>
          <span>${escapeHtml(state.companyError)}</span>
        </div>
      `;
    }
    if (state.companyMatches.length) {
      return `
        <div class="company-match-panel">
          <span class="utility-label">Search results</span>
          <h2>Choose a U.S.-listed company</h2>
          <div class="company-matches">
            ${state.companyMatches
              .map(
                (match) => `
                  <button type="button" data-company-symbol="${escapeHtml(match.ticker)}">
                    <strong>${escapeHtml(match.ticker)}</strong>
                    <span>${escapeHtml(match.name)}</span>
                    ${icon("arrow-right")}
                  </button>
                `,
              )
              .join("")}
          </div>
        </div>
      `;
    }
    const payload = state.company;
    if (!payload) return "";
    const company = payload.company || {};
    const price = payload.price || {};
    const metrics = payload.metrics || {};
    const annuals = payload.annuals || [];
    const prices = (price.points || []).map((point) => point.close);
    const firstDate = price.points?.[0]?.date || "";
    const lastDate = price.points?.[price.points.length - 1]?.date || "";
    const qualityRead =
      Number(metrics.freeCashFlowMargin) >= 15
        ? "Strong cash conversion"
        : Number(metrics.freeCashFlowMargin) > 0
          ? "Positive cash conversion"
          : "Cash conversion requires review";
    const growthRead =
      Number(metrics.revenueGrowth) >= 10
        ? "Double-digit growth"
        : Number(metrics.revenueGrowth) > 0
          ? "Positive growth"
          : "Revenue under pressure";
    return `
      <section class="company-result">
        <header class="company-identity">
          <div>
            <span class="ticker-badge">${escapeHtml(company.ticker)}</span>
            <h2>${escapeHtml(company.name)}</h2>
            <p>${escapeHtml(company.exchange || "U.S. listed")} · ${escapeHtml(company.currency || "USD")} · SEC CIK ${escapeHtml(company.cik)}</p>
          </div>
          <div class="company-price">
            <span>Delayed price</span>
            <strong>${formatMoney(price.price, 2)}</strong>
            <em class="${tone(price.oneYearChange)}">${formatChange(price.oneYearChange)} 1Y</em>
          </div>
        </header>
        <div class="company-metric-grid">
          ${companyMetric("Revenue", formatFinancial(metrics.revenue), `FY ${metrics.fiscalYear || "--"}`)}
          ${companyMetric("Revenue growth", formatChange(metrics.revenueGrowth), growthRead, tone(metrics.revenueGrowth))}
          ${companyMetric("Net income", formatFinancial(metrics.netIncome), `${Number.isFinite(Number(metrics.netMargin)) ? `${formatNumber(metrics.netMargin, 1)}% margin` : "Margin unavailable"}`)}
          ${companyMetric("Free cash flow", formatFinancial(metrics.freeCashFlow), `${Number.isFinite(Number(metrics.freeCashFlowMargin)) ? `${formatNumber(metrics.freeCashFlowMargin, 1)}% margin` : "Margin unavailable"}`, tone(metrics.freeCashFlow))}
          ${companyMetric("Return on equity", Number.isFinite(Number(metrics.returnOnEquity)) ? `${formatNumber(metrics.returnOnEquity, 1)}%` : "--", "Net income / year-end equity", tone(metrics.returnOnEquity))}
          ${companyMetric("Diluted EPS", Number.isFinite(Number(metrics.dilutedEps)) ? formatMoney(metrics.dilutedEps, 2) : "--", "Latest annual filing")}
        </div>
        <div class="company-analysis-grid">
          <section class="surface-panel company-chart-panel">
            <div class="panel-title-row">
              <div>
                <h2>One-Year Price Path</h2>
                <span class="page-meta">${escapeHtml(firstDate)} to ${escapeHtml(lastDate)}</span>
              </div>
              <div class="chart-range">
                <span>Low ${formatMoney(price.oneYearLow, 2)}</span>
                <span>High ${formatMoney(price.oneYearHigh, 2)}</span>
              </div>
            </div>
            ${lineChart(prices, {
              label: `${company.name} one-year delayed price chart`,
              startLabel: firstDate,
              endLabel: lastDate,
              empty: "Yahoo price history is temporarily unavailable",
            })}
          </section>
          <aside class="surface-panel company-read-panel">
            <div class="panel-title-row"><h2>Fundamental Read</h2></div>
            <div class="company-read">
              <div><span>Growth</span><strong class="${tone(metrics.revenueGrowth)}">${escapeHtml(growthRead)}</strong></div>
              <div><span>Cash conversion</span><strong class="${tone(metrics.freeCashFlowMargin)}">${escapeHtml(qualityRead)}</strong></div>
              <div><span>Balance sheet</span><strong>${formatFinancial(metrics.assets)} assets</strong></div>
              <div><span>Liabilities</span><strong>${formatFinancial(metrics.liabilities)}</strong></div>
            </div>
            <p>These are screening observations from annual filings, not a valuation conclusion. Read the latest 10-K and current filings before making an investment decision.</p>
          </aside>
        </div>
        <section class="table-panel company-financials">
          <div class="table-panel-head">
            <div>
              <h2>Five-Year Financial History</h2>
              <span class="page-meta">Annual SEC XBRL facts</span>
            </div>
            <a class="text-link" href="${escapeHtml(company.secFilingsUrl)}" target="_blank" rel="noopener noreferrer">Open SEC filings ${icon("external-link")}</a>
          </div>
          <div class="table-scroll">
            <table class="data-table">
              <thead><tr><th>FY</th><th>Revenue</th><th>Operating income</th><th>Net income</th><th>Operating cash</th><th>Capex</th><th>Free cash flow</th><th>Diluted EPS</th></tr></thead>
              <tbody>
                ${annuals
                  .map(
                    (row) => `
                      <tr>
                        <td class="company-cell">${escapeHtml(row.year)}</td>
                        <td>${formatFinancial(row.revenue)}</td>
                        <td>${formatFinancial(row.operatingIncome)}</td>
                        <td>${formatFinancial(row.netIncome)}</td>
                        <td>${formatFinancial(row.operatingCashFlow)}</td>
                        <td>${formatFinancial(row.capex)}</td>
                        <td>${formatFinancial(row.freeCashFlow)}</td>
                        <td>${Number.isFinite(Number(row.dilutedEps)) ? formatMoney(row.dilutedEps, 2) : "--"}</td>
                      </tr>
                    `,
                  )
                  .join("") || `<tr><td colspan="8">Annual filing data is temporarily unavailable.</td></tr>`}
              </tbody>
            </table>
          </div>
        </section>
        <div class="company-sources">
          ${(payload.sources || [])
            .map(
              (source) => `<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.label)} ${icon("external-link")}</a>`,
            )
            .join("")}
          ${(payload.warnings || []).map((warning) => `<span>${escapeHtml(warning)}</span>`).join("")}
        </div>
      </section>
    `;
  }

  function renderCompanies() {
    return `
      <div class="page shell company-page">
        ${renderPageHead(
          "Company Lab",
          "Look up a U.S.-listed public company to inspect annual SEC financials, cash generation, profitability and a delayed one-year price path.",
          "SEC filings + delayed prices",
        )}
        <form class="company-search" data-company-search>
          <label for="companyQuery">Company name or ticker</label>
          <div>
            <i data-lucide="search" aria-hidden="true"></i>
            <input id="companyQuery" name="company" type="search" autocomplete="off" value="${escapeHtml(state.companyQuery)}" placeholder="AAPL or Apple">
            <button class="button primary" type="submit">Analyze company ${icon("arrow-right")}</button>
          </div>
          <p>Try AAPL, MSFT, NVDA, JPM or search by company name. Coverage follows the SEC company directory.</p>
        </form>
        ${renderCompanyResults()}
      </div>
    `;
  }

  function field(id, label, value, suffix, min = "0", step = "0.1") {
    return `
      <label class="tool-field" for="${escapeHtml(id)}">
        <span>${escapeHtml(label)}</span>
        <div>
          <input id="${escapeHtml(id)}" name="${escapeHtml(id)}" type="number" value="${escapeHtml(value)}" min="${escapeHtml(min)}" step="${escapeHtml(step)}">
          ${suffix ? `<em>${escapeHtml(suffix)}</em>` : ""}
        </div>
      </label>
    `;
  }

  function renderCompoundTool() {
    return `
      <div class="tool-workspace" data-calculator="compound">
        <form class="tool-inputs" autocomplete="off">
          <span class="utility-label">Wealth path</span>
          <h2>Compound Growth</h2>
          <p>Model a starting balance, recurring contribution, return and time horizon.</p>
          ${field("compoundPrincipal", "Starting balance", "25000", "$", "0", "100")}
          ${field("compoundContribution", "Monthly contribution", "750", "$", "0", "25")}
          ${field("compoundRate", "Expected annual return", "7", "%", "-50", "0.1")}
          ${field("compoundYears", "Time horizon", "20", "years", "1", "1")}
        </form>
        <section class="tool-output" aria-live="polite">
          <div class="tool-output-head"><span>Projected ending value</span><strong data-output="compoundValue">--</strong></div>
          <div class="tool-stat-row">
            <div><span>Total contributed</span><strong data-output="compoundContributed">--</strong></div>
            <div><span>Estimated growth</span><strong data-output="compoundGrowth">--</strong></div>
          </div>
          <div data-output-chart="compound"></div>
          <p class="tool-note">Illustrative, before taxes, fees and inflation. Returns are assumed constant and are not guaranteed.</p>
        </section>
      </div>
    `;
  }

  function renderRiskTool() {
    return `
      <div class="tool-workspace" data-calculator="risk">
        <form class="tool-inputs" autocomplete="off">
          <span class="utility-label">Risk budget</span>
          <h2>Position Size &amp; Value at Risk</h2>
          <p>Estimate stop-based position size plus one-day parametric VaR and expected shortfall.</p>
          ${field("riskPortfolio", "Portfolio value", "100000", "$", "1", "100")}
          ${field("riskBudget", "Risk per trade", "1", "%", "0.1", "0.1")}
          ${field("riskStop", "Distance to stop", "5", "%", "0.1", "0.1")}
          ${field("riskVolatility", "Annualized volatility", "22", "%", "0.1", "0.1")}
          ${field("riskConfidence", "Confidence level", "95", "%", "90", "1")}
        </form>
        <section class="tool-output" aria-live="polite">
          <div class="tool-output-head"><span>Maximum position</span><strong data-output="riskPosition">--</strong></div>
          <div class="tool-stat-row">
            <div><span>One-day VaR</span><strong data-output="riskVar">--</strong></div>
            <div><span>Expected shortfall</span><strong data-output="riskEs">--</strong></div>
            <div><span>Risk dollars</span><strong data-output="riskDollars">--</strong></div>
          </div>
          <div class="risk-meter"><span data-output="riskMeter"></span></div>
          <p class="tool-note">Normal-distribution estimates can materially understate tail risk, jumps, liquidity gaps and correlation changes.</p>
        </section>
      </div>
    `;
  }

  function renderOptionsTool() {
    return `
      <div class="tool-workspace" data-calculator="options">
        <form class="tool-inputs" autocomplete="off">
          <span class="utility-label">Black-Scholes baseline</span>
          <h2>Option Price &amp; Greeks</h2>
          <p>Estimate a European call and put with standard Black-Scholes assumptions.</p>
          ${field("optionSpot", "Underlying price", "100", "$", "0.01", "0.5")}
          ${field("optionStrike", "Strike price", "105", "$", "0.01", "0.5")}
          ${field("optionDays", "Days to expiration", "45", "days", "1", "1")}
          ${field("optionVolatility", "Implied volatility", "28", "%", "0.1", "0.1")}
          ${field("optionRate", "Risk-free rate", "4.5", "%", "0", "0.1")}
          ${field("optionDividend", "Dividend yield", "0", "%", "0", "0.1")}
        </form>
        <section class="tool-output" aria-live="polite">
          <div class="option-price-pair">
            <div><span>Call value</span><strong data-output="optionCall">--</strong></div>
            <div><span>Put value</span><strong data-output="optionPut">--</strong></div>
          </div>
          <div class="greeks-grid">
            <div><span>Call delta</span><strong data-output="optionDelta">--</strong></div>
            <div><span>Gamma</span><strong data-output="optionGamma">--</strong></div>
            <div><span>Theta / day</span><strong data-output="optionTheta">--</strong></div>
            <div><span>Vega / 1 vol</span><strong data-output="optionVega">--</strong></div>
          </div>
          <div data-output-chart="options"></div>
          <p class="tool-note">European-model estimate only. American exercise, skew, term structure, dividends, rates, spreads and assignment can change real prices.</p>
        </section>
      </div>
    `;
  }

  function renderHedgeTool() {
    return `
      <div class="tool-workspace" data-calculator="hedge">
        <form class="tool-inputs" autocomplete="off">
          <span class="utility-label">Exposure control</span>
          <h2>Portfolio Hedge Planner</h2>
          <p>Estimate shares or contracts needed to move portfolio beta toward a target.</p>
          ${field("hedgePortfolio", "Portfolio value", "250000", "$", "1", "100")}
          ${field("hedgeBeta", "Current portfolio beta", "1.15", "β", "0", "0.05")}
          ${field("hedgeTarget", "Target beta", "0.35", "β", "0", "0.05")}
          ${field("hedgePrice", "Hedge ETF price", "750", "$", "0.01", "1")}
          ${field("hedgeMultiplier", "Option / futures multiplier", "100", "x", "1", "1")}
        </form>
        <section class="tool-output" aria-live="polite">
          <div class="tool-output-head"><span>Notional hedge</span><strong data-output="hedgeNotional">--</strong></div>
          <div class="tool-stat-row">
            <div><span>ETF shares to short</span><strong data-output="hedgeShares">--</strong></div>
            <div><span>Equivalent contracts</span><strong data-output="hedgeContracts">--</strong></div>
            <div><span>Beta reduction</span><strong data-output="hedgeReduction">--</strong></div>
          </div>
          <div class="hedge-diagram">
            <span>Current β <strong data-output="hedgeCurrentBeta">--</strong></span>
            <div><i data-output="hedgeBar"></i></div>
            <span>Target β <strong data-output="hedgeTargetBeta">--</strong></span>
          </div>
          <p class="tool-note">A beta hedge does not eliminate basis, gap, volatility, liquidity, tax or tracking risk. Option deltas also change over time.</p>
        </section>
      </div>
    `;
  }

  function renderBuilderTool() {
    const assets = [
      ["builderEquity", "U.S. equity", 45],
      ["builderInternational", "International equity", 15],
      ["builderBonds", "Bonds", 25],
      ["builderRealAssets", "Real assets", 10],
      ["builderCash", "Cash", 5],
    ];
    return `
      <div class="tool-workspace" data-calculator="builder">
        <form class="tool-inputs builder-inputs" autocomplete="off">
          <span class="utility-label">Allocation design</span>
          <h2>Portfolio Builder</h2>
          <p>Translate target weights into dollars and check whether the plan balances to 100%.</p>
          ${field("builderCapital", "Capital to allocate", "100000", "$", "1", "100")}
          ${assets.map(([id, label, value]) => field(id, label, value, "%", "0", "1")).join("")}
        </form>
        <section class="tool-output" aria-live="polite">
          <div class="tool-output-head"><span>Total allocation</span><strong data-output="builderTotal">--</strong></div>
          <div class="allocation-chart" data-output-chart="builder"></div>
          <div class="allocation-table" data-output="builderRows"></div>
          <p class="tool-note">Allocation is illustrative. Diversification does not guarantee a profit or protect against loss, and correlations can rise in stressed markets.</p>
        </section>
      </div>
    `;
  }

  function renderTools() {
    const tools = [
      ["compound", "Compound", "trending-up"],
      ["risk", "Risk", "shield-alert"],
      ["options", "Options", "activity"],
      ["hedge", "Hedge", "scale"],
      ["builder", "Builder", "pie-chart"],
    ];
    const renderers = {
      compound: renderCompoundTool,
      risk: renderRiskTool,
      options: renderOptionsTool,
      hedge: renderHedgeTool,
      builder: renderBuilderTool,
    };
    return `
      <div class="page shell tools-page">
        ${renderPageHead(
          "Portfolio Tools",
          "Practical calculators for compounding, position sizing, parametric risk, option Greeks, beta hedging and portfolio allocation.",
          "Educational estimates",
        )}
        <div class="tool-tabs" role="tablist" aria-label="Calculator">
          ${tools
            .map(
              ([key, label, iconName]) => `
                <button class="${state.tool === key ? "active" : ""}" type="button" data-tool="${key}" role="tab" aria-selected="${state.tool === key}">
                  ${icon(iconName)}<span>${label}</span>
                </button>
              `,
            )
            .join("")}
        </div>
        ${renderers[state.tool]()}
        <section class="tools-methodology">
          <span class="utility-label">Model discipline</span>
          <h2>Every output is an estimate, not a recommendation</h2>
          <p>The calculators expose their inputs and key limitations so readers can challenge the assumptions. They do not use personal account data and nothing is stored or transmitted.</p>
          <a href="?view=research" class="text-link">Read the supporting research ${icon("arrow-right")}</a>
        </section>
      </div>
    `;
  }

  function normalCdf(value) {
    const sign = value < 0 ? -1 : 1;
    const x = Math.abs(value) / Math.sqrt(2);
    const t = 1 / (1 + 0.3275911 * x);
    const erf =
      1 -
      (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t -
        0.284496736) *
        t +
        0.254829592) *
        t) *
        Math.exp(-x * x);
    return 0.5 * (1 + sign * erf);
  }

  function normalPdf(value) {
    return Math.exp(-0.5 * value * value) / Math.sqrt(2 * Math.PI);
  }

  function inverseNormal(probability) {
    if (probability >= 0.995) return 2.576;
    if (probability >= 0.99) return 2.326;
    if (probability >= 0.975) return 1.96;
    if (probability >= 0.95) return 1.645;
    if (probability >= 0.9) return 1.282;
    return 1.645;
  }

  function readNumber(id, fallback = 0) {
    const value = Number(document.getElementById(id)?.value);
    return Number.isFinite(value) ? value : fallback;
  }

  function setOutput(name, value) {
    const node = main.querySelector(`[data-output="${name}"]`);
    if (node) node.textContent = value;
  }

  function hydrateCompound() {
    const principal = Math.max(0, readNumber("compoundPrincipal"));
    const contribution = Math.max(0, readNumber("compoundContribution"));
    const annualRate = readNumber("compoundRate") / 100;
    const years = Math.max(1, Math.min(80, readNumber("compoundYears", 1)));
    const monthlyRate = annualRate / 12;
    const months = Math.round(years * 12);
    const series = [principal];
    let balance = principal;
    for (let month = 1; month <= months; month += 1) {
      balance = balance * (1 + monthlyRate) + contribution;
      if (month % 12 === 0 || month === months) series.push(balance);
    }
    const contributed = principal + contribution * months;
    setOutput("compoundValue", formatFinancial(balance));
    setOutput("compoundContributed", formatFinancial(contributed));
    setOutput("compoundGrowth", formatFinancial(balance - contributed));
    const chart = main.querySelector('[data-output-chart="compound"]');
    if (chart) {
      chart.innerHTML = lineChart(series, {
        label: "Projected compounded portfolio balance",
        startLabel: "Today",
        endLabel: `Year ${formatNumber(years, 0)}`,
      });
    }
  }

  function hydrateRisk() {
    const portfolio = Math.max(0, readNumber("riskPortfolio"));
    const riskBudget = Math.max(0, readNumber("riskBudget")) / 100;
    const stop = Math.max(0.0001, readNumber("riskStop")) / 100;
    const annualVol = Math.max(0, readNumber("riskVolatility")) / 100;
    const confidence = Math.min(99.9, Math.max(50, readNumber("riskConfidence"))) / 100;
    const z = inverseNormal(confidence);
    const dailyVol = annualVol / Math.sqrt(252);
    const riskDollars = portfolio * riskBudget;
    const position = Math.min(portfolio, riskDollars / stop);
    const valueAtRisk = portfolio * dailyVol * z;
    const expectedShortfall =
      portfolio * dailyVol * (normalPdf(z) / Math.max(1 - confidence, 0.001));
    setOutput("riskPosition", formatFinancial(position));
    setOutput("riskVar", formatFinancial(valueAtRisk));
    setOutput("riskEs", formatFinancial(expectedShortfall));
    setOutput("riskDollars", formatFinancial(riskDollars));
    const meter = main.querySelector('[data-output="riskMeter"]');
    if (meter) meter.style.width = `${Math.min(100, (position / Math.max(portfolio, 1)) * 100)}%`;
  }

  function hydrateOptions() {
    const spot = Math.max(0.01, readNumber("optionSpot", 100));
    const strike = Math.max(0.01, readNumber("optionStrike", 100));
    const time = Math.max(1, readNumber("optionDays", 30)) / 365;
    const vol = Math.max(0.001, readNumber("optionVolatility", 20) / 100);
    const rate = readNumber("optionRate") / 100;
    const dividend = readNumber("optionDividend") / 100;
    const rootTime = Math.sqrt(time);
    const d1 =
      (Math.log(spot / strike) + (rate - dividend + 0.5 * vol * vol) * time) /
      (vol * rootTime);
    const d2 = d1 - vol * rootTime;
    const call =
      spot * Math.exp(-dividend * time) * normalCdf(d1) -
      strike * Math.exp(-rate * time) * normalCdf(d2);
    const put =
      strike * Math.exp(-rate * time) * normalCdf(-d2) -
      spot * Math.exp(-dividend * time) * normalCdf(-d1);
    const delta = Math.exp(-dividend * time) * normalCdf(d1);
    const gamma =
      (Math.exp(-dividend * time) * normalPdf(d1)) /
      (spot * vol * rootTime);
    const theta =
      (-spot * Math.exp(-dividend * time) * normalPdf(d1) * vol /
        (2 * rootTime) -
        rate * strike * Math.exp(-rate * time) * normalCdf(d2) +
        dividend * spot * Math.exp(-dividend * time) * normalCdf(d1)) /
      365;
    const vega =
      (spot * Math.exp(-dividend * time) * normalPdf(d1) * rootTime) / 100;
    setOutput("optionCall", formatMoney(call, 2));
    setOutput("optionPut", formatMoney(put, 2));
    setOutput("optionDelta", formatNumber(delta, 3));
    setOutput("optionGamma", formatNumber(gamma, 4));
    setOutput("optionTheta", formatMoney(theta, 3));
    setOutput("optionVega", formatMoney(vega, 3));
    const chart = main.querySelector('[data-output-chart="options"]');
    if (chart) {
      const prices = Array.from({ length: 31 }, (_, index) => spot * (0.7 + index * 0.02));
      const payoffs = prices.map((price) => Math.max(0, price - strike) - call);
      chart.innerHTML = lineChart(payoffs, {
        label: "Call option profit and loss at expiration",
        startLabel: `${formatMoney(prices[0], 0)} underlying`,
        endLabel: `${formatMoney(prices[prices.length - 1], 0)} underlying`,
      });
    }
  }

  function hydrateHedge() {
    const portfolio = Math.max(0, readNumber("hedgePortfolio"));
    const beta = Math.max(0, readNumber("hedgeBeta"));
    const target = Math.max(0, readNumber("hedgeTarget"));
    const price = Math.max(0.01, readNumber("hedgePrice", 1));
    const multiplier = Math.max(1, readNumber("hedgeMultiplier", 100));
    const reduction = Math.max(0, beta - target);
    const notional = portfolio * reduction;
    const shares = notional / price;
    const contracts = notional / (price * multiplier);
    setOutput("hedgeNotional", formatFinancial(notional));
    setOutput("hedgeShares", formatNumber(Math.ceil(shares), 0));
    setOutput("hedgeContracts", formatNumber(Math.ceil(contracts), 0));
    setOutput("hedgeReduction", `${formatNumber(reduction, 2)}β`);
    setOutput("hedgeCurrentBeta", formatNumber(beta, 2));
    setOutput("hedgeTargetBeta", formatNumber(target, 2));
    const bar = main.querySelector('[data-output="hedgeBar"]');
    if (bar) bar.style.width = `${Math.min(100, beta ? (target / beta) * 100 : 0)}%`;
  }

  function hydrateBuilder() {
    const capital = Math.max(0, readNumber("builderCapital"));
    const assets = [
      ["U.S. equity", Math.max(0, readNumber("builderEquity")), "#0b47d6"],
      ["International equity", Math.max(0, readNumber("builderInternational")), "#16823c"],
      ["Bonds", Math.max(0, readNumber("builderBonds")), "#7a62c9"],
      ["Real assets", Math.max(0, readNumber("builderRealAssets")), "#d58c14"],
      ["Cash", Math.max(0, readNumber("builderCash")), "#66717f"],
    ];
    const total = assets.reduce((sum, [, weight]) => sum + weight, 0);
    setOutput("builderTotal", `${formatNumber(total, 1)}%${Math.abs(total - 100) < 0.01 ? " balanced" : " needs adjustment"}`);
    const rows = main.querySelector('[data-output="builderRows"]');
    if (rows) {
      rows.innerHTML = assets
        .map(
          ([label, weight, color]) => `
            <div>
              <i style="background:${color}"></i>
              <span>${escapeHtml(label)}</span>
              <strong>${formatNumber(weight, 1)}%</strong>
              <em>${formatFinancial(capital * (weight / 100))}</em>
            </div>
          `,
        )
        .join("");
    }
    const chart = main.querySelector('[data-output-chart="builder"]');
    if (chart) {
      let cursor = 0;
      const normalizedTotal = total || 1;
      const stops = assets.map(([, weight, color]) => {
        const start = cursor;
        cursor += (weight / normalizedTotal) * 100;
        return `${color} ${start.toFixed(1)}% ${cursor.toFixed(1)}%`;
      });
      chart.style.background = `conic-gradient(${stops.join(",")})`;
      chart.innerHTML = `<span>${formatFinancial(capital)}</span>`;
    }
  }

  function hydrateCalculators() {
    if (state.view !== "tools" || state.storyId) return;
    const hydrators = {
      compound: hydrateCompound,
      risk: hydrateRisk,
      options: hydrateOptions,
      hedge: hydrateHedge,
      builder: hydrateBuilder,
    };
    hydrators[state.tool]?.();
  }

  async function loadCompany(query) {
    const normalized = String(query || "").trim();
    if (!normalized) return;
    state.companyQuery = normalized;
    state.companyLoading = true;
    state.companyError = null;
    state.companyMatches = [];
    renderPage({ preserveScroll: true });
    try {
      const payload = await fetchJson(`/api/company?q=${encodeURIComponent(normalized)}`, 20000);
      if (payload.type === "search") {
        state.company = null;
        state.companyMatches = payload.matches || [];
        if (!state.companyMatches.length) {
          state.companyError = "No matching U.S.-listed company was found.";
        }
      } else {
        state.company = payload;
        state.companyMatches = [];
        state.companyQuery = payload.company?.ticker || normalized;
      }
    } catch (error) {
      state.companyError = "The SEC or delayed-price provider did not respond. Please try again.";
    } finally {
      state.companyLoading = false;
      renderPage({ preserveScroll: true });
    }
  }

  function renderSources(story) {
    return `
      <div class="source-box" id="sources">
        <h2>Source attribution</h2>
        <p>This is original Debrief analysis based on reporting and data from the following sources.</p>
        ${story.sources
          .map(
            (source) => `
              <a class="source-link" href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">
                <span>${escapeHtml(source.label)}</span>${icon("external-link")}
              </a>
            `,
          )
          .join("")}
      </div>
    `;
  }

  function renderStoryMap(story) {
    return `
      <nav class="story-map" aria-label="Story sections">
        <h2>Story map</h2>
        ${story.sections
          .map((section) => `<a href="#${escapeHtml(section.id)}">${escapeHtml(section.title)}</a>`)
          .join("")}
        <a href="#sources">Source attribution</a>
      </nav>
    `;
  }

  function relatedStories(story) {
    const samePage = content.stories.filter(
      (candidate) => candidate.id !== story.id && candidate.page === story.page,
    );
    const others = content.stories.filter(
      (candidate) => candidate.id !== story.id && candidate.page !== story.page,
    );
    return [...samePage, ...others].slice(0, 3);
  }

  function renderArticle() {
    const story = storyById(state.storyId);
    if (!story) {
      return `
        <div class="page shell">
          <div class="empty-state">
            <strong>Story not found</strong>
            <span>The edition may have changed. Return to today's briefing.</span>
            <div class="action-row"><a class="button primary" href="?view=today">Back to Today</a></div>
          </div>
        </div>
      `;
    }
    const index = content.stories.findIndex((candidate) => candidate.id === story.id);
    const previous = content.stories[(index - 1 + content.stories.length) % content.stories.length];
    const next = content.stories[(index + 1) % content.stories.length];
    const backView = validViews.has(story.page) ? story.page : "today";
    return `
      <div class="page article-page shell">
        <a class="back-link" href="?view=${escapeHtml(backView)}">${icon("arrow-left")} Back to ${escapeHtml(backView === "technology" ? "Technology" : backView[0].toUpperCase() + backView.slice(1))}</a>
        <div class="article-grid">
          <header class="article-header">
            ${storyByline(story)}
            <span class="utility-label">${escapeHtml(story.category)}</span>
            <h1>${escapeHtml(story.headline)}</h1>
            <p class="article-deck">${escapeHtml(story.deck)}</p>
            <div class="action-row">
              <a class="button primary" href="${escapeHtml(story.sourceUrl)}" target="_blank" rel="noopener noreferrer">View original article ${icon("external-link")}</a>
              <button class="button" type="button" data-share-story="${escapeHtml(story.id)}">${icon("share-2")} Share</button>
            </div>
          </header>

          <aside class="article-numbers">
            <h2>Key numbers</h2>
            ${dynamicStoryNumbers(story)
              .map(
                (number) => `
                  <div class="article-number">
                    <span>${escapeHtml(number.label)}</span>
                    <strong>${escapeHtml(number.value)}</strong>
                    <em class="${escapeHtml(number.tone || "flat")}">${escapeHtml(number.change)}</em>
                  </div>
                `,
              )
              .join("")}
          </aside>

          <article class="article-body">
            <p>${escapeHtml(story.summary)}</p>
            ${story.sections
              .map(
                (section) => `
                  <section class="article-section" id="${escapeHtml(section.id)}">
                    <h2>${escapeHtml(section.title)}</h2>
                    ${(section.paragraphs || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
                    ${section.pullQuote ? `<blockquote class="pull-quote">${escapeHtml(section.pullQuote)}</blockquote>` : ""}
                    ${
                      section.bullets
                        ? `<ul>${section.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>`
                        : ""
                    }
                  </section>
                `,
              )
              .join("")}
            ${renderSources(story)}
            <nav class="story-pagination" aria-label="Previous and next stories">
              <a href="${internalStoryUrl(previous)}"><span>${icon("arrow-left")} Previous story</span><strong>${escapeHtml(previous.headline)}</strong></a>
              <a href="${internalStoryUrl(next)}"><span>Next story ${icon("arrow-right")}</span><strong>${escapeHtml(next.headline)}</strong></a>
            </nav>
          </article>

          <aside class="article-rail">
            ${renderStoryMap(story)}
            <div class="related-stories">
              <h2>Related coverage</h2>
              ${relatedStories(story)
                .map(
                  (related) => `
                    <a class="related-story" href="${internalStoryUrl(related)}">
                      <strong>${escapeHtml(related.headline)}</strong>
                      <span>${escapeHtml(related.category)} · ${escapeHtml(related.readTime)}</span>
                    </a>
                  `,
                )
                .join("")}
            </div>
          </aside>
        </div>
      </div>
    `;
  }

  function setDocumentState() {
    editionDate.textContent = content.edition.dateLabel;
    generatedAt.textContent = content.edition.generatedLabel;
    const currentView = state.storyId ? null : state.view;
    document.querySelectorAll("[data-view-link]").forEach((link) => {
      const active = link.dataset.viewLink === currentView;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    const title = state.storyId
      ? storyById(state.storyId)?.headline || "Story"
      : state.view[0].toUpperCase() + state.view.slice(1);
    document.title = `${title} | The Debrief`;
  }

  function renderPage(options = {}) {
    const scrollY = options.preserveScroll ? window.scrollY : 0;
    if (state.storyId) {
      main.innerHTML = renderArticle();
    } else if (state.view === "markets") {
      main.innerHTML = renderMarkets();
    } else if (state.view === "technology") {
      main.innerHTML = renderTechnology();
    } else if (state.view === "derivatives") {
      main.innerHTML = renderDerivatives();
    } else if (state.view === "crypto") {
      main.innerHTML = renderCrypto();
    } else if (state.view === "research") {
      main.innerHTML = renderResearch();
    } else if (state.view === "companies") {
      main.innerHTML = renderCompanies();
    } else if (state.view === "tools") {
      main.innerHTML = renderTools();
    } else {
      main.innerHTML = renderToday();
    }
    setDocumentState();
    activateIcons();
    updateWorldDesk();
    hydrateCalculators();
    if (
      state.view === "companies" &&
      !state.storyId &&
      !state.companyRequested
    ) {
      state.companyRequested = true;
      window.setTimeout(() => loadCompany(state.companyQuery), 0);
    }
    if (options.preserveScroll) window.scrollTo({ top: scrollY, behavior: "instant" });
  }

  async function fetchJson(url, timeoutMs = 12000) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`${url} returned ${response.status}`);
      return await response.json();
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function weatherDescription(code, isDay) {
    if (code === 0) return isDay ? "Clear" : "Clear night";
    if ([1, 2].includes(code)) return "Partly cloudy";
    if (code === 3) return "Overcast";
    if ([45, 48].includes(code)) return "Fog";
    if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rain";
    if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
    if ([95, 96, 99].includes(code)) return "Thunderstorms";
    return "Conditions available";
  }

  function updateWorldDesk() {
    const now = new Date();
    document.querySelectorAll("[data-world-clock]").forEach((row) => {
      const index = Number(row.dataset.worldClock);
      const city = worldCities[index];
      if (!city) return;
      const time = new Intl.DateTimeFormat("en-US", {
        timeZone: city.timeZone,
        hour: "numeric",
        minute: "2-digit",
      }).format(now);
      const zoneParts = new Intl.DateTimeFormat("en-US", {
        timeZone: city.timeZone,
        timeZoneName: "short",
      }).formatToParts(now);
      const zone = zoneParts.find((part) => part.type === "timeZoneName")?.value;
      const weather = state.weather?.[index];
      const timeNode = row.querySelector(".world-time");
      const zoneNode = row.querySelector(".world-zone");
      const weatherNode = row.querySelector(".world-weather");
      if (timeNode) timeNode.textContent = time;
      if (zoneNode && zone) zoneNode.textContent = zone;
      if (weatherNode && weather) weatherNode.textContent = weather.label;
    });
  }

  async function refreshWeather() {
    if (state.weatherLoading) return;
    state.weatherLoading = true;
    const latitude = worldCities.map((city) => city.latitude).join(",");
    const longitude = worldCities.map((city) => city.longitude).join(",");
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}` +
      `&longitude=${longitude}&current=temperature_2m,weather_code,is_day&temperature_unit=fahrenheit`;
    try {
      const payload = await fetchJson(url, 10000);
      const locations = Array.isArray(payload) ? payload : [payload];
      state.weather = locations.map((location) => {
        const current = location?.current || {};
        const temperature = Number(current.temperature_2m);
        const conditions = weatherDescription(
          Number(current.weather_code),
          Number(current.is_day) === 1,
        );
        return {
          label: Number.isFinite(temperature)
            ? `${Math.round(temperature)}°F · ${conditions}`
            : conditions,
        };
      });
      updateWorldDesk();
    } catch {
      state.weather = worldCities.map(() => ({ label: "Weather unavailable" }));
      updateWorldDesk();
    } finally {
      state.weatherLoading = false;
    }
  }

  function setLiveState(mode, message) {
    liveState.classList.remove("live", "error");
    if (mode) liveState.classList.add(mode);
    liveState.innerHTML = `<span class="live-dot"></span><span>${escapeHtml(message)}</span>`;
  }

  async function refreshData(initial = false) {
    if (initial) {
      state.loading = true;
      setLiveState("", "Connecting");
    }
    const needsDerivatives =
      !state.storyId && ["today", "derivatives"].includes(state.view);
    const [liveResult, marketResult] = await Promise.allSettled([
      fetchJson("/api/live"),
      needsDerivatives
        ? fetchJson("/api/market", 18000)
        : Promise.resolve(null),
    ]);

    if (liveResult.status === "fulfilled") state.live = liveResult.value;
    if (marketResult.status === "fulfilled" && marketResult.value) {
      state.market = marketResult.value;
    }
    state.loading = false;

    if (marketResult.status === "fulfilled" && marketResult.value) {
      const warnings = marketResult.value.warnings || [];
      setLiveState(
        "live",
        state.live?.liveStatus?.label ||
          (warnings.length ? "Live · partial" : "Live · delayed"),
      );
    } else if (liveResult.status === "fulfilled") {
      setLiveState(
        "live",
        state.live?.liveStatus?.label || "Editorial live",
      );
    } else {
      setLiveState("error", "Offline snapshot");
    }

    renderPage({ preserveScroll: !initial });
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2200);
  }

  async function shareStory(id) {
    const story = storyById(id);
    if (!story) return;
    const url = new URL(internalStoryUrl(story), window.location.href).href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: story.headline,
          text: story.deck,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        showToast("Story link copied");
      }
    } catch (error) {
      if (error?.name !== "AbortError") showToast("Could not share this story");
    }
  }

  function renderSearchResults(query = "") {
    const normalized = query.trim().toLowerCase();
    const storyMatches = content.stories.filter((story) => {
      if (!normalized) return true;
      return [
        story.headline,
        story.deck,
        story.summary,
        story.category,
        story.source,
        ...(story.tags || []),
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
    const researchMatches = (content.research || []).filter((item) => {
      if (!normalized) return false;
      return [
        item.title,
        item.authors,
        item.category,
        item.source,
        item.summary,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
    searchResults.innerHTML =
      storyMatches
        .slice(0, normalized ? 12 : 8)
        .map(
          (story) => `
            <div class="search-result">
              <a href="${internalStoryUrl(story)}">
                <strong>${escapeHtml(story.headline)}</strong>
                <span>${escapeHtml(story.category)} · ${escapeHtml(story.source)} · ${escapeHtml(story.readTime)}</span>
              </a>
              <a class="icon-button" href="${escapeHtml(story.sourceUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Open original source">${icon("external-link")}</a>
            </div>
          `,
        )
        .join("") +
        researchMatches
          .slice(0, 6)
          .map(
            (item) => `
              <div class="search-result research-result">
                <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">
                  <strong>${escapeHtml(item.title)}</strong>
                  <span>Research · ${escapeHtml(item.category)} · ${escapeHtml(item.source)}</span>
                </a>
                <a class="icon-button" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" aria-label="Open research paper">${icon("external-link")}</a>
              </div>
            `,
          )
          .join("") ||
      `<div class="empty-state"><strong>No stories found</strong><span>Try a company, asset class or broader topic.</span></div>`;
    activateIcons();
  }

  function openSearch() {
    renderSearchResults();
    searchDialog.showModal();
    document.body.classList.add("dialog-open");
    window.setTimeout(() => searchInput.focus(), 0);
  }

  function closeSearch() {
    searchDialog.close();
    document.body.classList.remove("dialog-open");
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    const dark = theme === "dark";
    themeButton.setAttribute("aria-label", dark ? "Use light theme" : "Use dark theme");
    themeButton.innerHTML = icon(dark ? "moon" : "sun");
    activateIcons();
  }

  function loadTheme() {
    let saved = "light";
    try {
      saved = localStorage.getItem("debrief-theme") || "light";
    } catch {
      saved = "light";
    }
    applyTheme(saved === "dark" ? "dark" : "light");
  }

  main.addEventListener("click", (event) => {
    const quoteButton = event.target.closest("[data-quote-group]");
    if (quoteButton) {
      state.quoteGroup = quoteButton.dataset.quoteGroup;
      renderPage({ preserveScroll: true });
      return;
    }

    const optionButton = event.target.closest("[data-option-filter]");
    if (optionButton) {
      state.optionFilter = optionButton.dataset.optionFilter;
      renderPage({ preserveScroll: true });
      return;
    }

    const shareButton = event.target.closest("[data-share-story]");
    if (shareButton) {
      shareStory(shareButton.dataset.shareStory);
      return;
    }

    const researchButton = event.target.closest("[data-research-filter]");
    if (researchButton) {
      state.researchFilter = researchButton.dataset.researchFilter;
      renderPage({ preserveScroll: true });
      return;
    }

    const companyButton = event.target.closest("[data-company-symbol]");
    if (companyButton) {
      loadCompany(companyButton.dataset.companySymbol);
      return;
    }

    const toolButton = event.target.closest("[data-tool]");
    if (toolButton) {
      state.tool = toolButton.dataset.tool;
      renderPage({ preserveScroll: true });
    }
  });

  main.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-company-search]");
    if (!form) return;
    event.preventDefault();
    const query = new FormData(form).get("company");
    loadCompany(query);
  });

  main.addEventListener("input", (event) => {
    if (!event.target.closest("[data-calculator]")) return;
    hydrateCalculators();
  });

  searchButton.addEventListener("click", openSearch);
  closeSearchButton.addEventListener("click", closeSearch);
  searchDialog.addEventListener("click", (event) => {
    if (event.target === searchDialog) closeSearch();
  });
  searchDialog.addEventListener("close", () => {
    document.body.classList.remove("dialog-open");
  });
  searchInput.addEventListener("input", () => renderSearchResults(searchInput.value));

  themeButton.addEventListener("click", () => {
    const next =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem("debrief-theme", next);
    } catch {
      // The theme still applies for the current page when storage is unavailable.
    }
    applyTheme(next);
  });

  menuButton.addEventListener("click", () => {
    const open = mobileNav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    menuButton.innerHTML = icon(open ? "x" : "menu");
    activateIcons();
  });

  editionDate.textContent = content.edition.dateLabel;
  generatedAt.textContent = content.edition.generatedLabel;
  loadTheme();
  renderPage();
  refreshWeather();
  refreshData(true);
  window.setInterval(updateWorldDesk, 30000);
  state.refreshTimer = window.setInterval(() => refreshData(false), 120000);
})();
