(function () {
  "use strict";

  const content = window.DEBRIEF_CONTENT;
  const validViews = new Set([
    "today",
    "markets",
    "technology",
    "derivatives",
    "crypto",
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
    loading: true,
    refreshTimer: null,
  };

  const fallbackQuotes = {
    indices: [
      { symbol: "^GSPC", name: "S&P 500", value: 7498.96, change: -0.14, spark: [] },
      { symbol: "^IXIC", name: "Nasdaq", value: 25690.9, change: -0.57, spark: [] },
      { symbol: "^DJI", name: "Dow", value: 52218.58, change: -0.01, spark: [] },
      { symbol: "^RUT", name: "Russell 2000", value: 2959.94, change: -0.92, spark: [] },
      { symbol: "^VIX", name: "VIX", value: 18.85, change: 13.28, spark: [] },
    ],
    currencies: [
      { symbol: "DX-Y.NYB", name: "U.S. Dollar", value: null, change: null, spark: [] },
      { symbol: "EURUSD=X", name: "EUR / USD", value: null, change: null, spark: [] },
      { symbol: "GBPUSD=X", name: "GBP / USD", value: null, change: null, spark: [] },
      { symbol: "JPY=X", name: "USD / JPY", value: null, change: null, spark: [] },
      { symbol: "AUDUSD=X", name: "AUD / USD", value: null, change: null, spark: [] },
    ],
    commodities: [
      { symbol: "CL=F", name: "WTI Crude", value: null, change: null, spark: [] },
      { symbol: "BZ=F", name: "Brent Crude", value: 86.83, change: 2.32, spark: [] },
      { symbol: "NG=F", name: "Natural Gas", value: null, change: null, spark: [] },
      { symbol: "ZC=F", name: "Corn", value: null, change: null, spark: [] },
      { symbol: "ZW=F", name: "Wheat", value: null, change: null, spark: [] },
    ],
    metals: [
      { symbol: "GC=F", name: "Gold", value: 4070.6, change: -1.96, spark: [] },
      { symbol: "SI=F", name: "Silver", value: null, change: null, spark: [] },
      { symbol: "HG=F", name: "Copper", value: null, change: null, spark: [] },
      { symbol: "PL=F", name: "Platinum", value: null, change: null, spark: [] },
      { symbol: "PA=F", name: "Palladium", value: null, change: null, spark: [] },
    ],
    other: [
      { symbol: "^TNX", name: "U.S. 10Y", value: 4.71, change: 1.07, spark: [] },
      { symbol: "TLT", name: "Long Treasuries", value: null, change: -0.26, spark: [] },
      { symbol: "HYG", name: "High Yield", value: null, change: -0.16, spark: [] },
      { symbol: "SOXX", name: "Semiconductors", value: 555.52, change: 0.51, spark: [] },
      { symbol: "BTC", name: "Bitcoin", value: 65114, change: -0.72, spark: [] },
    ],
  };

  const worldCities = [
    { city: "New York", timeZone: "America/New_York", latitude: 40.71, longitude: -74.01 },
    { city: "London", timeZone: "Europe/London", latitude: 51.51, longitude: -0.13 },
    { city: "Tokyo", timeZone: "Asia/Tokyo", latitude: 35.68, longitude: 139.65 },
    { city: "Madrid", timeZone: "Europe/Madrid", latitude: 40.42, longitude: -3.7 },
    { city: "San Juan", timeZone: "America/Puerto_Rico", latitude: 18.47, longitude: -66.11 },
  ];

  const listeningQueue = [
    {
      title: "All-In",
      lens: "Macro, policy and technology",
      url: "https://podcasts.apple.com/us/search?term=All-In%20Podcast",
    },
    {
      title: "Acquired",
      lens: "Company strategy and market history",
      url: "https://podcasts.apple.com/us/search?term=Acquired",
    },
    {
      title: "Prof G Markets",
      lens: "Markets, business and capital allocation",
      url: "https://podcasts.apple.com/us/search?term=Prof%20G%20Markets",
    },
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

  function renderWorldDesk() {
    return `
      <section class="section-band utility-desk" aria-labelledby="global-desk-title">
        <div class="world-desk">
          <div class="section-title-row">
            <h2 id="global-desk-title">World Clocks &amp; Weather</h2>
            <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo ${icon("external-link")}</a>
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
        </div>
        <div class="listening-desk">
          <div class="section-title-row">
            <h2>Listening Queue</h2>
            <span class="page-meta">Three useful lenses</span>
          </div>
          <div class="listening-list">
            ${listeningQueue
              .map(
                (show) => `
                  <a href="${escapeHtml(show.url)}" target="_blank" rel="noopener noreferrer">
                    <span>
                      <strong>${escapeHtml(show.title)}</strong>
                      <small>${escapeHtml(show.lens)}</small>
                    </span>
                    ${icon("external-link")}
                  </a>
                `,
              )
              .join("")}
          </div>
        </div>
      </section>
    `;
  }

  function renderToday() {
    const lead = storyById(content.leadId);
    const technology = content.stories.filter((story) => story.page === "technology").slice(0, 3);
    const technologyIds = new Set(technology.map((story) => story.id));
    const latest = content.stories
      .filter((story) => story.id !== lead.id && !technologyIds.has(story.id))
      .slice(0, 4);
    const takeaways =
      lead.sections.find((section) => section.bullets)?.bullets.slice(0, 3) || [];
    return `
      <div class="page shell">
        ${renderQuoteBoard()}
        <section class="lead-layout">
          <article class="lead-story">
            <span class="utility-label">Top story</span>
            <h1>${escapeHtml(lead.headline)}</h1>
            ${storyByline(lead)}
            ${storyActions(lead)}
            <p class="lead-summary">${escapeHtml(lead.summary)}</p>
            <div class="key-takeaways">
              <h2>Key takeaways</h2>
              <ul>${takeaways.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
            </div>
            ${numberStrip(lead)}
          </article>
          ${renderMarketPulse()}
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
              <h2>What Matters Next</h2>
              <span class="page-meta">Verified catalysts</span>
            </div>
            ${renderTimeline()}
          </section>
        </div>

        ${renderWorldDesk()}

        <section class="section-band">
          <div class="section-title-row">
            <h2>More From Today's Debrief</h2>
            <span class="page-meta">${escapeHtml(content.edition.readTime)}</span>
          </div>
          ${renderStoryList(latest)}
        </section>
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
        <section class="section-band">
          <div class="section-title-row">
            <h2>Risk Map</h2>
            <span class="page-meta">What is driving the tape</span>
          </div>
          ${renderDrivers()}
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
        <section class="section-band">
          <div class="section-title-row">
            <h2>Detailed Technology Stories</h2>
            <span class="page-meta">${stories.length} reports</span>
          </div>
          ${renderStoryList(stories)}
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
    } else {
      main.innerHTML = renderToday();
    }
    setDocumentState();
    activateIcons();
    updateWorldDesk();
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
      setLiveState("live", warnings.length ? "Live · partial" : "Live · delayed");
    } else if (liveResult.status === "fulfilled") {
      setLiveState("live", "Editorial live");
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
    const matches = content.stories.filter((story) => {
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
    searchResults.innerHTML =
      matches
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
    }
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
