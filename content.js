window.DEBRIEF_CONTENT = {
  edition: {
    isoDate: "2026-07-26",
    dateLabel: "Sunday, July 26, 2026",
    shortDate: "Sun, Jul 26",
    generatedLabel: "Generated Sunday, July 26, 2026 at 9:25 AM ET",
    cotDate: "Tuesday, July 21, 2026",
    readTime: "12 min briefing",
  },

  leadId: "oil-yields-ai-risk-map",

  stories: [
    {
      id: "oil-yields-ai-risk-map",
      page: "markets",
      category: "Markets & Macro",
      source: "Reuters + The Debrief",
      sourceUrl: "https://www.investing.com/news/economy-news/us-stocks-face-tests-from-fed-decision-techled-earnings-deluge-4810946",
      updated: "9:25 AM ET",
      readTime: "6 min read",
      headline: "Fed week will test whether AI profits can outrun the discount rate",
      deck: "Wednesday combines the FOMC decision with Microsoft and Meta results; Thursday adds GDP, PCE inflation and Amazon. The market must clear policy, growth and AI-return hurdles in roughly 27 hours.",
      summary: "Reuters says one-third of the S&P 500 is due to report into 26.5% year-over-year earnings growth, while Friday pricing still assigned a 38% chance to a quarter-point Fed hike. After the Nasdaq lost 2.1% last week, strong revenue alone may not be enough without credible free-cash-flow returns.",
      tags: ["Fed week", "Hyperscalers", "Earnings"],
      numbers: [
        { label: "Fed hike odds", value: "38%", change: "Friday pricing", tone: "down" },
        { label: "Q2 earnings", value: "+26.5%", change: "year over year", tone: "up" },
        { label: "Nasdaq", value: "24,975.82", change: "-2.1% week", tone: "down" },
        { label: "U.S. 10Y", value: "4.679%", change: "Friday close", tone: "flat" },
      ],
      sections: [
        {
          id: "setup",
          title: "The Sunday setup",
          paragraphs: [
            "Cash markets enter the week with a split signal. Friday's S&P 500 close was nearly flat and the Dow gained 0.5%, but the Nasdaq lost 0.6%, SOXX fell 4.4% and every major U.S. index finished the week lower.",
            "Reuters reported that fed-funds futures ended Friday assigning a 38% probability to a quarter-point rate increase. A hold remains the base case, but elevated oil and inflation keep the surprise tail large enough to matter for long-duration assets.",
          ],
        },
        {
          id: "wednesday",
          title: "Wednesday is a double event",
          paragraphs: [
            "The Federal Reserve releases its decision at 2:00 p.m. ET Wednesday, followed by Chair Kevin Warsh at 2:30 p.m. Microsoft and Meta then report after the close. That sequence forces investors to price the discount rate before judging two of the largest AI infrastructure budgets.",
            "Alphabet's raised $195 billion to $205 billion capital-spending plan already showed the new burden of proof. Microsoft and Meta need to connect cloud and advertising demand to utilization, operating leverage and free cash flow, not merely announce more capacity.",
          ],
          pullQuote: "Wednesday asks the market to price the cost of capital and the return on AI capital almost at once.",
        },
        {
          id: "thursday",
          title: "Thursday supplies the macro cross-check",
          paragraphs: [
            "The Bureau of Economic Analysis releases the advance estimate of second-quarter GDP and June personal income and outlays at 8:30 a.m. ET Thursday. Amazon reports after the close. Together, those releases show whether nominal growth, inflation and cloud demand can support current earnings expectations.",
          ],
          bullets: [
            "Monday: whether semiconductor breadth stabilizes after SOXX's 4.4% Friday decline.",
            "Wednesday: the FOMC statement, Warsh press conference, Microsoft and Meta.",
            "Thursday: advance GDP, PCE inflation and Amazon.",
            "Positioning: the July 21 CFTC file carries a larger dealer S&P net short into the event cluster.",
          ],
        },
      ],
      sources: [
        {
          label: "Reuters: Fed decision and tech-led earnings week",
          url: "https://www.investing.com/news/economy-news/us-stocks-face-tests-from-fed-decision-techled-earnings-deluge-4810946",
        },
        {
          label: "Federal Reserve: July 28-29 meeting schedule",
          url: "https://www.federalreserve.gov/newsevents/2026-july.htm",
        },
        {
          label: "Microsoft: fiscal Q4 results on July 29",
          url: "https://news.microsoft.com/source/2026/07/08/microsoft-announces-quarterly-earnings-release-date-68/",
        },
        {
          label: "Meta: Q2 results on July 29",
          url: "https://investor.atmeta.com/investor-news/press-release-details/2026/Meta-to-Announce-Second-Quarter-2026-Results/default.aspx",
        },
        {
          label: "BEA: July 30 GDP and income/outlays releases",
          url: "https://www.bea.gov/news/schedule/",
        },
        {
          label: "Amazon: Q2 results call on July 30",
          url: "https://ir.aboutamazon.com/news-release/news-release-details/2026/Amazon-com-to-Webcast-Second-Quarter-2026-Financial-Results-Conference-Call/default.aspx",
        },
      ],
    },
    {
      id: "cash-close-breadth-baseline",
      page: "markets",
      category: "Market Structure",
      source: "AP",
      sourceUrl: "https://apnews.com/article/stocks-dow-nasdaq-iran-oil-02d01b8f38ccd51f605c4414cdd4fa9b",
      updated: "Friday close",
      readTime: "4 min read",
      headline: "The Dow's rebound hid a two-speed Friday tape",
      deck: "Breadth improved and oil fell, yet semiconductors kept the Nasdaq under pressure and every major index still finished the week lower.",
      summary: "The Dow gained 0.5% and more S&P 500 members advanced than declined, but the Nasdaq fell 0.6%, the Russell 2000 lost 0.3% and SOXX dropped 4.4%. Friday was a partial rotation rather than a broad reset.",
      tags: ["Breadth", "Semiconductors", "Weekly close"],
      numbers: [
        { label: "S&P 500", value: "7,411.98", change: "+0.05%", tone: "up" },
        { label: "Nasdaq", value: "24,975.82", change: "-0.64%", tone: "down" },
        { label: "Dow", value: "51,947.25", change: "+0.46%", tone: "up" },
        { label: "Russell 2000", value: "2,930.00", change: "-0.35%", tone: "down" },
      ],
      sections: [
        {
          id: "close",
          title: "What the close established",
          paragraphs: [
            "Lower oil and bond yields gave the Dow room to rebound, while more S&P 500 stocks rose than fell. That is a healthier internal picture than Thursday's broad selloff, but the cap-weighted S&P barely moved because technology leadership remained weak.",
            "Micron's 7% decline and Broadcom's 2.7% loss kept pressure on the Nasdaq. Intel also reversed a strong premarket reaction and finished down 7.9%, showing how quickly investors moved from rewarding demand to questioning spending and valuation.",
          ],
        },
        {
          id: "breadth",
          title: "Breadth improved, leadership did not",
          paragraphs: [
            "A durable rotation needs the equal-weight index, small caps and credit to hold up without relying on a one-day oil decline. Friday passed only part of that test: high yield was steady and breadth improved, but the Russell 2000 remained lower.",
          ],
        },
        {
          id: "positioning",
          title: "The weekly scorecard still matters",
          paragraphs: [
            "The S&P 500 lost 0.6% for the week, the Dow 0.4%, the Nasdaq 2.1% and the Russell 2000 1.1%. That distribution keeps the burden of proof on technology and makes Monday's semiconductor breadth more informative than Friday's headline S&P move.",
          ],
        },
      ],
      sources: [
        {
          label: "AP: Friday index and weekly scorecard",
          url: "https://apnews.com/article/stocks-dow-nasdaq-iran-oil-02d01b8f38ccd51f605c4414cdd4fa9b",
        },
      ],
    },
    {
      id: "alphabet-capex-reset",
      page: "technology",
      category: "Technology",
      source: "AP + Reuters",
      sourceUrl: "https://apnews.com/article/f914606d842d4c6848019083d667fc3a",
      updated: "Post-earnings",
      readTime: "5 min read",
      headline: "Alphabet's AI demand is real; so is the capex test",
      deck: "Cloud growth and advertising strength beat expectations, but a larger spending plan moved the debate from demand to returns.",
      summary: "Alphabet posted strong second-quarter results, while management raised 2026 capital expenditure expectations to $195 billion–$205 billion. Investors are now measuring AI revenue acceleration against free cash flow and depreciation.",
      tags: ["Alphabet", "Cloud", "Capex"],
      numbers: [
        { label: "Q2 revenue", value: "$112.11B", change: "above estimates", tone: "up" },
        { label: "2026 capex", value: "$195–205B", change: "raised", tone: "down" },
        { label: "Cloud", value: "accelerating", change: "AI demand", tone: "up" },
      ],
      sections: [
        {
          id: "result",
          title: "The result",
          paragraphs: [
            "Alphabet's quarter showed that AI demand is supporting both cloud usage and the core advertising engine. AP reported revenue of $112.11 billion, reinforcing the idea that the company is monetizing the platform shift rather than merely defending against it.",
            "The market's hesitation came from the other side of the ledger. Reuters reported a 2026 capital-spending outlook of $195 billion to $205 billion, another increase that raises the burden on utilization, pricing and free cash flow.",
          ],
        },
        {
          id: "economics",
          title: "The economics investors are testing",
          paragraphs: [
            "AI infrastructure is front-loaded. Cash leaves before data centers fill, depreciation persists after the initial build, and returns depend on sustained demand plus pricing discipline. Strong cloud growth helps, but the bar rises every time the spending plan rises.",
            "The key question is no longer whether Alphabet can fund the build. It can. The question is whether incremental AI revenue can grow fast enough to keep returns on invested capital from compressing.",
          ],
        },
        {
          id: "readthrough",
          title: "The read-through for the stack",
          paragraphs: [
            "Higher hyperscaler capex supports accelerators, networking, memory, power and cooling suppliers. It is less automatically positive for software and platform multiples if the same investment wave lifts depreciation and operating costs.",
          ],
          bullets: [
            "Positive: demand visibility for chips, networking and data-center infrastructure.",
            "Open question: utilization and pricing as capacity comes online.",
            "Risk: free cash flow becomes more sensitive to any slowdown in cloud growth.",
          ],
        },
      ],
      sources: [
        {
          label: "AP: Alphabet Q2 earnings and AI demand",
          url: "https://apnews.com/article/f914606d842d4c6848019083d667fc3a",
        },
        {
          label: "Reuters via Euronext: Alphabet raises capex outlook",
          url: "https://live.euronext.com/en/financial-news/google-increases-capex-forecast-again-after-cloud-driven-earnings-beat",
        },
      ],
    },
    {
      id: "tesla-ai-robotics-cost",
      page: "technology",
      category: "Technology",
      source: "Tesla IR + AP",
      sourceUrl: "https://ir.tesla.com/press-release/tesla-releases-second-quarter-2026-financial-results",
      updated: "Post-earnings",
      readTime: "5 min read",
      headline: "Tesla's AI and robotics pivot is raising the cost of the story",
      deck: "Record deliveries helped revenue, but heavier research and infrastructure spending pushed the market back toward execution and cash flow.",
      summary: "Tesla's second-quarter revenue rose, while profit came in below expectations as R&D and capital spending increased around robotaxis, AI compute and Optimus. Energy storage remained a brighter operating line.",
      tags: ["Tesla", "Robotics", "R&D"],
      numbers: [
        { label: "Q2 revenue", value: "$28B", change: "+23% YoY", tone: "up" },
        { label: "Adjusted EPS", value: "$0.33", change: "below consensus", tone: "down" },
        { label: "Energy revenue", value: "$3.14B", change: "+13% YoY", tone: "up" },
      ],
      sections: [
        {
          id: "quarter",
          title: "What changed this quarter",
          paragraphs: [
            "Tesla's quarter reinforced the split between automotive scale and future-platform spending. Revenue benefited from stronger deliveries, but AP reported adjusted earnings below Wall Street expectations as research costs rose.",
            "Management framed the spending as preparation for robotaxis, AI compute, Optimus and additional production capacity. That makes the equity story more dependent on products whose commercial timing and margins are still developing.",
          ],
        },
        {
          id: "cash",
          title: "Why cash conversion matters",
          paragraphs: [
            "A company can grow revenue while lowering the quality of near-term cash generation. The market is testing whether today's spending creates a defensible robotics and autonomy platform or simply extends the payback period of the existing vehicle business.",
            "The energy-generation and storage segment offered a useful counterweight. Its growth shows Tesla has another scaled business, but it is not yet large enough to remove the execution burden from autonomy and robotics.",
          ],
        },
        {
          id: "watch",
          title: "What investors need next",
          bullets: [
            "Evidence that robotaxi utilization can scale without a matching surge in operating cost.",
            "A clearer bridge from AI infrastructure spending to automotive or services gross profit.",
            "Continued energy-storage growth without sacrificing consolidated cash flow.",
          ],
        },
      ],
      sources: [
        {
          label: "Tesla Investor Relations: Q2 2026 results",
          url: "https://ir.tesla.com/press-release/tesla-releases-second-quarter-2026-financial-results",
        },
        {
          label: "AP: Tesla research spending weighs on earnings",
          url: "https://apnews.com/article/976cc9e895bbdcbd3728e7ba178ffe40",
        },
      ],
    },
    {
      id: "amd-open-ai-stack",
      page: "technology",
      category: "Semiconductors",
      source: "AMD + Investing.com",
      sourceUrl: "https://www.amd.com/en/corporate/events/advancing-ai/keynote.html",
      updated: "Post-keynote",
      readTime: "4 min read",
      headline: "AMD made the rack, software and customer proof one AI product",
      deck: "Helios, ROCm AI and named deployments move AMD's pitch from alternative accelerators toward an integrated operating system for AI infrastructure.",
      summary: "AMD used Advancing AI 2026 to frame Helios as a rack-scale system and introduced ROCm AI for AI-assisted GPU programming. The next test is commercial: repeatable deployments, software reliability and profitable capacity growth.",
      tags: ["AMD", "ROCm", "AI systems"],
      numbers: [
        { label: "Helios", value: "rack scale", change: "integrated", tone: "up" },
        { label: "ROCm AI", value: "agentic", change: "developer tools", tone: "up" },
        { label: "MI455X", value: "deployed", change: "OpenAI cited", tone: "up" },
      ],
      sections: [
        {
          id: "event",
          title: "What AMD presented",
          paragraphs: [
            "AMD put Helios at the center of a broader system story spanning accelerators, EPYC CPUs, Pensando networking and ROCm. The keynote also introduced ROCm AI, described as an agentic platform for AI-assisted GPU programming.",
            "Named deployment evidence matters more than another peak-performance claim. OpenAI said it had deployed MI455X racks before the event, while AMD's expanding customer roster gives investors a clearer way to test whether the stack is moving from evaluation into production.",
          ],
        },
        {
          id: "competition",
          title: "Where competition has moved",
          paragraphs: [
            "The competitive unit is increasingly the rack, not the chip. Power delivery, memory, interconnect, networking and software libraries decide how much useful compute a customer gets from a capital budget.",
            "AMD can win without matching every part of a rival ecosystem, but it must show that Helios is easy to deploy at scale and that ROCm reduces, rather than relocates, engineering cost. Customer concentration and supply execution remain the next financial tests.",
          ],
        },
        {
          id: "signals",
          title: "Signals worth carrying forward",
          bullets: [
            "Named customers moving from initial racks to repeat orders.",
            "ROCm AI adoption and measurable developer productivity.",
            "Rack-level availability, power efficiency and service quality.",
            "Gross-margin evidence that supply can support a broader commercial ramp.",
          ],
        },
      ],
      sources: [
        {
          label: "AMD: Advancing AI 2026 keynote",
          url: "https://www.amd.com/en/corporate/events/advancing-ai/keynote.html",
        },
        {
          label: "Investing.com: AMD keynote transcript and takeaways",
          url: "https://uk.investing.com/news/transcripts/amd-at-advancing-ai-2026-keynote-a-bigger-bet-on-scale-93CH-4786143",
        },
      ],
    },
    {
      id: "intel-earnings-test",
      page: "technology",
      category: "Semiconductors",
      source: "Reuters + Intel",
      sourceUrl: "https://www.investing.com/news/earnings/intel-posts-strongest-revenue-growth-in-over-15-years-on-ai-demand-4809889",
      updated: "Friday close",
      readTime: "5 min read",
      headline: "Intel's earnings beat failed the Friday price test",
      deck: "The strongest revenue growth in more than 15 years confirmed AI-server demand, but a 7.9% share decline showed that higher spending and a crowded turnaround trade still carry a demanding proof burden.",
      summary: "Intel reported $16.13 billion of second-quarter revenue, with Data Center and AI revenue up 59% to $6.3 billion, and raised 2026 capital expenditure to more than $20 billion. The stock reversed its premarket gain and closed down 7.9%.",
      tags: ["Intel", "AI servers", "Capex"],
      numbers: [
        { label: "Friday stock", value: "-7.89%", change: "post-earnings", tone: "down" },
        { label: "Q2 revenue", value: "$16.13B", change: "+25.4% YoY", tone: "up" },
        { label: "2026 capex", value: ">$20B", change: "raised from $18B", tone: "down" },
      ],
      sections: [
        {
          id: "headline",
          title: "The result was stronger than the tape",
          paragraphs: [
            "Intel's second-quarter revenue rose 25.4% to $16.13 billion and adjusted EPS reached $0.42, both above estimates reported by Reuters. Data Center and AI revenue increased 59% to $6.3 billion as AI infrastructure demand lifted server CPU volumes.",
            "The company also guided third-quarter revenue to $15.8 billion-$16.8 billion and adjusted EPS to $0.38. Those numbers produced an early premarket gain, but the stock reversed and finished Friday down 7.9%.",
          ],
        },
        {
          id: "reversal",
          title: "Why the reversal matters",
          paragraphs: [
            "Intel raised expected 2026 capital expenditure to more than $20 billion from $18 billion and indicated that 2027 spending would rise again. The market is separating stronger demand from the cash required to meet it.",
            "The stock had more than doubled this year before the report. That makes the reaction partly a valuation and positioning event, but it also raises the operating hurdle: faster server growth must translate into better gross margin, foundry utilization and free cash flow.",
          ],
        },
        {
          id: "checklist",
          title: "The next proof points",
          bullets: [
            "Data Center and AI revenue growth after the current supply-constrained quarter.",
            "Gross-margin progression against higher capital and advanced-node costs.",
            "External foundry commitments for packaging and 14A wafers.",
            "Free cash flow after the 2026 and 2027 spending step-up.",
          ],
        },
      ],
      sources: [
        {
          label: "Reuters: Intel result, guidance and spending plan",
          url: "https://www.investing.com/news/stock-market-news/intel-sales-profit-forecast-beat-estimates-boosts-spending-plans-on-ai-boom-4809863",
        },
        {
          label: "Investing.com: Intel reverses its post-earnings gain",
          url: "https://www.investing.com/news/earnings/intel-posts-strongest-revenue-growth-in-over-15-years-on-ai-demand-4809889",
        },
      ],
    },
    {
      id: "korea-ai-memory-supply-pacts",
      page: "technology",
      category: "AI Supply Chain",
      source: "Reuters",
      sourceUrl: "https://www.investing.com/news/stock-market-news/samsung-elec-sk-group-seal-950-billion-deals-as-south-korea-hosts-ai-powers-4812752",
      updated: "Saturday",
      readTime: "5 min read",
      headline: "Korea's $950B AI package moves the bottleneck to memory execution",
      deck: "Long-term agreements involving SK Hynix, Nvidia, Samsung and Broadcom give the AI buildout a larger supply commitment, but the headline value is not the same thing as near-term revenue or cash.",
      summary: "South Korea announced $950 billion of AI initiatives: $750 billion tied to SK Group, including an SK Hynix-Nvidia partnership valued above $500 billion, and a Samsung-Broadcom memorandum covering up to $200 billion across memory, foundry and advanced packaging.",
      tags: ["HBM", "Samsung", "SK Hynix"],
      numbers: [
        { label: "Total package", value: "$950B", change: "announced", tone: "up" },
        { label: "SK Hynix / Nvidia", value: ">$500B", change: "partnership", tone: "up" },
        { label: "Samsung / Broadcom", value: "Up to $200B", change: "MOU", tone: "flat" },
      ],
      sections: [
        {
          id: "commitment",
          title: "What was announced",
          paragraphs: [
            "Reuters reported $750 billion of SK Group agreements, including an SK Hynix partnership with Nvidia valued at more than $500 billion. Samsung and Broadcom separately signed a memorandum covering up to $200 billion in memory, foundry services and advanced packaging.",
            "The package addresses a real AI-system constraint: accelerators cannot ship or run at target throughput without high-bandwidth memory, advanced packaging and networking silicon arriving together.",
          ],
        },
        {
          id: "economics",
          title: "The financial read-through",
          paragraphs: [
            "The headline value should not be modeled as immediate revenue. These are long-duration initiatives and memoranda whose shipment schedules, pricing, product mix and capital requirements will determine how much ultimately reaches income statements.",
            "For memory suppliers, longer visibility can support capacity investment and pricing discipline. For Nvidia and Broadcom, reserved supply can protect system deliveries. The trade-off is concentration: large commitments make utilization, yields and end-customer demand more consequential if the AI cycle slows.",
          ],
        },
        {
          id: "watch",
          title: "What would confirm the thesis",
          bullets: [
            "Binding purchase schedules and disclosed duration, not only headline agreement value.",
            "HBM and advanced-packaging capacity additions with improving yields.",
            "Customer diversification beyond the largest accelerator and custom-silicon buyers.",
            "Supplier free cash flow after the next capacity-investment cycle.",
          ],
        },
      ],
      sources: [
        {
          label: "Reuters: Samsung and SK Group announce $950B AI initiatives",
          url: "https://www.investing.com/news/stock-market-news/samsung-elec-sk-group-seal-950-billion-deals-as-south-korea-hosts-ai-powers-4812752",
        },
      ],
    },
    {
      id: "bitcoin-yields-liquidity",
      page: "crypto",
      category: "Crypto",
      source: "Investing.com + CoinGecko",
      sourceUrl: "https://www.investing.com/news/cryptocurrency-news/bitcoin-price-holds-above-64000-as-traders-brace-for-upcoming-fed-decision-4812846",
      updated: "9:25 AM ET",
      readTime: "4 min read",
      headline: "Bitcoin holds $64K while options aim at a post-Fed breakout",
      deck: "Bitcoin is steady ahead of Wednesday's policy decision, but a large July 31 call-spread position and a fear reading of 27 show conviction and caution occupying the same tape.",
      summary: "CoinGecko showed bitcoin at $64,404, ether at $1,883.71 and solana at $74.75 at 9:20 a.m. ET. Investing.com reported roughly $2.5 billion of bitcoin call spreads targeting a move toward $72,000 after the Fed, while the Fear and Greed Index remained at 27.",
      tags: ["Bitcoin", "Options", "Fed"],
      numbers: [
        { label: "Bitcoin", value: "$64,404", change: "+0.54%", tone: "up" },
        { label: "Ethereum", value: "$1,883.71", change: "+1.22%", tone: "up" },
        { label: "Solana", value: "$74.75", change: "+1.14%", tone: "up" },
      ],
      sections: [
        {
          id: "spot",
          title: "The weekend tape",
          paragraphs: [
            "Bitcoin held above $64,000 Sunday morning after retreating from Tuesday's one-month high above $66,400. Ether and solana were both positive over 24 hours, giving the weekend move broader participation than Saturday's softer tape.",
            "The advance remains measured rather than euphoric. The Crypto Fear and Greed Index stood at 27, and bitcoin stayed inside a relatively narrow range ahead of the Fed decision.",
          ],
        },
        {
          id: "options",
          title: "The options market is paying for a catalyst",
          paragraphs: [
            "Investing.com, citing CoinDesk, reported roughly $2.5 billion of bitcoin call spreads expiring July 31 that would benefit from a move toward $72,000. The structure defines a specific post-Fed upside thesis rather than an open-ended momentum bet.",
            "The risk is path dependency. A hawkish surprise can lift real yields and the dollar before the options expire, while a benign decision still needs follow-through above the recent $66,400 high.",
          ],
        },
        {
          id: "watch",
          title: "Confirmation checklist",
          bullets: [
            "Bitcoin acceptance above the recent $66,400 high.",
            "Whether ether and solana keep pace rather than bitcoin carrying the move alone.",
            "The dollar and real yields after Wednesday's FOMC decision.",
            "Whether the July 31 call spreads are rolled, monetized or left to expire.",
          ],
        },
      ],
      sources: [
        {
          label: "Investing.com: bitcoin holds $64K before the Fed",
          url: "https://www.investing.com/news/cryptocurrency-news/bitcoin-price-holds-above-64000-as-traders-brace-for-upcoming-fed-decision-4812846",
        },
        {
          label: "CoinGecko: live bitcoin market data",
          url: "https://www.coingecko.com/en/coins/bitcoin",
        },
      ],
    },
    {
      id: "cot-dealer-positioning-july-21",
      page: "markets",
      category: "Positioning",
      source: "CFTC",
      sourceUrl: "https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm",
      updated: "Friday's official file",
      readTime: "3 min read",
      headline: "Dealer S&P shorts increased in the new weekly COT file",
      deck: "The July 21 report shows dealer/intermediary S&P net shorts growing while ICE WTI producer net length eased but remained positive.",
      summary: "Dealers are net short 724,971 consolidated S&P contracts, 7,392 more than the prior week. ICE WTI producers hold net length of 58,888 contracts, down 6,182. The report is weekly market structure, not an intraday signal.",
      tags: ["CFTC", "COT", "Positioning"],
      numbers: [
        { label: "Dealer S&P net", value: "-724,971", change: "-7,392 WoW", tone: "down" },
        { label: "WTI producer net", value: "+58,888", change: "-6,182 WoW", tone: "up" },
        { label: "Report date", value: "Jul 21", change: "released Friday", tone: "flat" },
      ],
      sections: [
        {
          id: "read",
          title: "What the report says",
          paragraphs: [
            "In the Traders in Financial Futures file, S&P 500 consolidated dealer/intermediary longs were 149,182 contracts and shorts were 874,153, producing a net position of -724,971. The weekly net moved 7,392 contracts further short.",
            "In the disaggregated ICE light-sweet WTI row, producer/merchant longs were 403,188 contracts and shorts were 344,300, producing net length of +58,888. That net declined by 6,182 contracts week over week.",
          ],
        },
        {
          id: "use",
          title: "How to use weekly positioning",
          paragraphs: [
            "COT data is most useful when combined with price, volatility and liquidity. A crowded short can dampen or amplify movement depending on who must rebalance. It should never be read as a standalone entry signal.",
            "Dealer categories often include client hedges, and producer positions reflect commercial risk management. The direction and weekly change matter more than treating either category as a direct forecast of Monday's price.",
          ],
        },
      ],
      sources: [
        {
          label: "CFTC: July 21 Traders in Financial Futures file",
          url: "https://www.cftc.gov/dea/newcot/FinFutWk.txt",
        },
        {
          label: "CFTC: July 21 disaggregated futures file",
          url: "https://www.cftc.gov/dea/newcot/f_disagg.txt",
        },
      ],
    },
    {
      id: "brent-100-sector-transmission",
      page: "markets",
      category: "Energy & Macro",
      source: "AP + The Debrief",
      sourceUrl: "https://apnews.com/article/45b9165d6c518f5bea668b6ba7a89838",
      updated: "Friday close",
      readTime: "5 min read",
      headline: "Brent's 3.9% retreat bought time, not energy resilience",
      deck: "Friday removed the $100 close, but an energy market with thinner buffers still leaves transport margins, household budgets and Fed policy exposed to weekend headlines.",
      summary: "Brent fell to $96.78 Friday after moving above $100 Thursday, while the 10-year yield eased to 4.68%. The reversal relieves immediate pressure, but companies still have to explain pricing power, hedge coverage and second-half margin sensitivity.",
      tags: ["Brent", "Margins", "Inflation"],
      numbers: [
        { label: "Brent", value: "$96.78", change: "-3.82%", tone: "up" },
        { label: "U.S. 10Y", value: "4.679%", change: "-0.51%", tone: "up" },
        { label: "VIX", value: "18.58", change: "-0.64%", tone: "up" },
      ],
      sections: [
        {
          id: "transmission",
          title: "The sector transmission map",
          paragraphs: [
            "Airlines, parcel carriers and chemicals feel the shock first because fuel and feedstock costs move quickly. Consumer companies feel it later through freight, packaging and household purchasing power. Energy producers benefit, but refiners and service companies depend on the shape and persistence of the curve.",
            "The key distinction is between companies that can pass costs through immediately and those with fixed customer contracts. A higher oil price can lift nominal revenue while compressing real margins.",
          ],
        },
        {
          id: "rates-link",
          title: "Why rates make the move more important",
          paragraphs: [
            "Oil matters more when long-term yields are already elevated. Friday's fall in crude and the 10-year yield gave equities some relief, but Thursday's spike showed how quickly an energy shock can alter Fed expectations and extend pressure from cyclical companies to long-duration technology.",
            "Credit is the confirmation signal. If high-yield spreads remain orderly, the move is still an earnings-rotation problem. If spreads widen with oil and yields, the market is beginning to price a broader growth shock.",
          ],
        },
        {
          id: "watchlist",
          title: "What to monitor",
          bullets: [
            "Airline, trucking and chemical guidance on fuel and feedstock pass-through.",
            "Energy-sector free cash flow revisions versus broader index earnings cuts.",
            "Breakeven inflation, the 10-year yield and high-yield spreads.",
            "Whether crude volatility remains elevated after spot prices stabilize.",
          ],
        },
      ],
      sources: [
        {
          label: "AP: Friday close, oil retreat and rates",
          url: "https://apnews.com/article/stocks-markets-tariffs-oil-trump-ai-0b9c3b2aa5ca83eb391c1388efe03c97",
        },
      ],
    },
    {
      id: "oil-volatility-vix-gap",
      page: "markets",
      category: "Options & Volatility",
      source: "Saxo + Yahoo Finance",
      sourceUrl: "https://www.home.saxo/en-gb/content/articles/options/options-brief---chips-cool-vol-oil-lifts-yields---22-july-2026-22072026",
      updated: "Friday close",
      readTime: "5 min read",
      headline: "Friday's options close stayed defensive beneath a lower VIX",
      deck: "The VIX eased with oil, but the delayed Monday-expiry map remained short gamma with put volume ahead of calls.",
      summary: "The Friday-close analytical snapshot estimates -$3.96 billion of SPX gamma exposure, a 1.17 put/call ratio and zero gamma near 7,454. The model is directional context, not exchange-reported dealer positioning.",
      tags: ["OVX", "VIX", "Options"],
      numbers: [
        { label: "VIX", value: "18.58", change: "-0.64%", tone: "up" },
        { label: "Put / call", value: "1.17", change: "defensive", tone: "down" },
        { label: "SPX gamma", value: "-$3.96B", change: "estimated short", tone: "down" },
      ],
      sections: [
        {
          id: "divergence",
          title: "What the volatility gap says",
          paragraphs: [
            "Equity volatility measures the price of index protection. Crude volatility measures uncertainty around the commodity transmitting the geopolitical shock. When the second rises much faster than the first, markets may be underpricing the second-order effect on inflation, rates and corporate margins.",
            "The divergence does not guarantee an equity selloff. It identifies where hedging demand is concentrated and where a change in correlation could force repricing.",
          ],
        },
        {
          id: "gamma",
          title: "How dealer gamma changes the path",
          paragraphs: [
            "The Friday-close analytical snapshot is short gamma below the estimated 7,454 zero-gamma level. The highest open-interest walls within 5% of spot sit near 7,630 for calls and 7,200 for puts, with a model-implied Monday move of roughly 0.7%.",
            "Gamma estimates are model-based and depend on delayed open interest and implied volatility. They are best used as a map of potential sensitivity, not as a claim about any dealer's exact book.",
          ],
        },
        {
          id: "signals",
          title: "Confirmation signals",
          bullets: [
            "VIX term structure and skew, not only the front-month index.",
            "Treasury volatility and breakeven inflation alongside crude volatility.",
            "SPX movement around zero gamma, the call wall and put wall.",
            "Whether realized volatility begins to catch implied volatility.",
          ],
        },
      ],
      sources: [
        {
          label: "Saxo: chips cool volatility while oil lifts yields",
          url: "https://www.home.saxo/en-gb/content/articles/options/options-brief---chips-cool-vol-oil-lifts-yields---22-july-2026-22072026",
        },
        {
          label: "Yahoo Finance: SPX market and options data",
          url: "https://finance.yahoo.com/quote/%5ESPX/",
        },
      ],
    },
    {
      id: "earnings-breadth-beyond-megacaps",
      page: "markets",
      category: "Earnings Breadth",
      source: "Reuters + The Debrief",
      sourceUrl: "https://www.investing.com/news/economy-news/us-stocks-face-tests-from-fed-decision-techled-earnings-deluge-4810946",
      updated: "Week ahead",
      readTime: "4 min read",
      headline: "One-third of the S&P reports into a 26.5% earnings bar",
      deck: "The busiest week of the quarter can validate broad profit growth, but Microsoft, Meta and Amazon still have enough index weight to dominate the tape.",
      summary: "Reuters reported that more than 80 companies had already put S&P 500 second-quarter earnings on track for 26.5% year-over-year growth. Roughly one-third of the index reports this week, making cash conversion and guidance breadth as important as the headline growth rate.",
      tags: ["Earnings", "Breadth", "Guidance"],
      numbers: [
        { label: "Q2 earnings", value: "+26.5%", change: "year over year", tone: "up" },
        { label: "Companies due", value: "~1/3", change: "of S&P 500", tone: "flat" },
        { label: "AI platforms", value: "3", change: "MSFT, META, AMZN", tone: "flat" },
      ],
      sections: [
        {
          id: "profit-pool",
          title: "The aggregate bar is already high",
          paragraphs: [
            "A 26.5% year-over-year earnings pace is powerful, but it also means valuations have less room for merely adequate guidance. Companies must show that revenue growth is reaching operating income and cash rather than being absorbed by capital spending or working capital.",
            "The broad reporting slate includes technology, payments, energy and consumer franchises. That mix can reveal whether profit strength is extending beyond AI infrastructure and whether higher oil and financing costs are beginning to compress margins elsewhere.",
          ],
        },
        {
          id: "index-risk",
          title: "Breadth can improve while the index falls",
          paragraphs: [
            "Microsoft and Meta report Wednesday and Amazon Thursday. Their combined index weight means a few post-earnings moves can overwhelm solid reports elsewhere, just as Friday's improving breadth could not offset semiconductor weakness.",
            "Equal-weight performance, the advance-decline line and guidance revisions provide a cleaner test of whether the 26.5% aggregate pace is becoming investable breadth.",
          ],
        },
        {
          id: "scorecard",
          title: "The week-ahead scorecard",
          bullets: [
            "Revenue growth and operating leverage, not only EPS beats.",
            "Free cash flow after capital expenditure.",
            "Guidance revisions and backlog quality.",
            "Equal-weight performance relative to cap-weighted indexes after the hyperscaler reports.",
          ],
        },
      ],
      sources: [
        {
          label: "Reuters: Fed decision and tech-led earnings week",
          url: "https://www.investing.com/news/economy-news/us-stocks-face-tests-from-fed-decision-techled-earnings-deluge-4810946",
        },
        {
          label: "Microsoft: fiscal Q4 results on July 29",
          url: "https://news.microsoft.com/source/2026/07/08/microsoft-announces-quarterly-earnings-release-date-68/",
        },
        {
          label: "Meta: Q2 results on July 29",
          url: "https://investor.atmeta.com/investor-news/press-release-details/2026/Meta-to-Announce-Second-Quarter-2026-Results/default.aspx",
        },
        {
          label: "Amazon: Q2 results call on July 30",
          url: "https://ir.aboutamazon.com/news-release/news-release-details/2026/Amazon-com-to-Webcast-Second-Quarter-2026-Financial-Results-Conference-Call/default.aspx",
        },
      ],
    },
    {
      id: "ai-chip-trade-reset",
      page: "technology",
      category: "AI Earnings",
      source: "Company IR + The Debrief",
      sourceUrl: "https://news.microsoft.com/source/2026/07/08/microsoft-announces-quarterly-earnings-release-date-68/",
      updated: "Week ahead",
      readTime: "5 min read",
      headline: "Wednesday becomes the AI capex referendum",
      deck: "Microsoft and Meta report after the Fed decision, followed by Amazon on Thursday. Each company must connect infrastructure spending to monetization on a different part of the stack.",
      summary: "Microsoft reports fiscal Q4 and Meta reports Q2 after Wednesday's close; Amazon follows Thursday. After Alphabet raised its 2026 capex plan and investors punished technology leadership, the shared question is whether AI revenue, utilization and free cash flow are scaling together.",
      tags: ["Microsoft", "Meta", "Amazon"],
      numbers: [
        { label: "Microsoft", value: "Wed", change: "after close", tone: "flat" },
        { label: "Meta", value: "Wed", change: "4:30 PM ET call", tone: "flat" },
        { label: "Amazon", value: "Thu", change: "5:00 PM ET call", tone: "flat" },
      ],
      sections: [
        {
          id: "sequence",
          title: "The sequence matters",
          paragraphs: [
            "The Fed speaks before Microsoft and Meta report. A higher discount-rate signal can lower the valuation investors are willing to pay even if cloud and advertising results beat expectations.",
            "Amazon reports a day later, after advance GDP and PCE inflation. Its AWS result will provide a second cloud read while retail margins show how the same macro environment is affecting the consumer side of the company.",
          ],
        },
        {
          id: "scorecard",
          title: "Three businesses, one return test",
          paragraphs: [
            "Microsoft must show Azure and Copilot growth against data-center depreciation. Meta must show that ad monetization and engagement can fund infrastructure plus its superintelligence program. Amazon must pair AWS acceleration with disciplined capital intensity.",
            "Strong demand is necessary, but the market is now measuring incremental revenue, gross margin, depreciation, free cash flow and guidance together.",
          ],
        },
        {
          id: "evidence",
          title: "Evidence that clears the bar",
          bullets: [
            "Cloud growth that accelerates without another disproportionate capex step-up.",
            "AI product revenue or engagement metrics with clear customer adoption.",
            "Free cash flow after data-center investment and finance leases.",
            "Guidance that keeps utilization and depreciation moving in the same direction.",
          ],
        },
      ],
      sources: [
        {
          label: "Microsoft: fiscal Q4 results on July 29",
          url: "https://news.microsoft.com/source/2026/07/08/microsoft-announces-quarterly-earnings-release-date-68/",
        },
        {
          label: "Meta: Q2 results on July 29",
          url: "https://investor.atmeta.com/investor-news/press-release-details/2026/Meta-to-Announce-Second-Quarter-2026-Results/default.aspx",
        },
        {
          label: "Amazon: Q2 results call on July 30",
          url: "https://ir.aboutamazon.com/news-release/news-release-details/2026/Amazon-com-to-Webcast-Second-Quarter-2026-Financial-Results-Conference-Call/default.aspx",
        },
        {
          label: "Reuters: investors test AI spending returns",
          url: "https://www.investing.com/news/economy-news/us-stocks-face-tests-from-fed-decision-techled-earnings-deluge-4810946",
        },
      ],
    },
    {
      id: "flashattention-blackwell-efficiency",
      page: "technology",
      category: "AI Systems Research",
      source: "arXiv",
      sourceUrl: "https://arxiv.org/abs/2603.05451",
      updated: "Research desk",
      readTime: "5 min read",
      headline: "FlashAttention-4 shows why AI performance is becoming a systems problem",
      deck: "Algorithm and kernel co-design is extracting more useful output from Blackwell-class hardware.",
      summary: "FlashAttention-4 reports up to 1.3x performance over cuDNN 9.13 and 2.7x over Triton on B200 hardware for tested workloads. The investment read-through is that software efficiency can alter effective compute supply.",
      tags: ["FlashAttention", "Blackwell", "Efficiency"],
      numbers: [
        { label: "Peak result", value: "1,613 TFLOPs/s", change: "reported", tone: "up" },
        { label: "Utilization", value: "71%", change: "reported", tone: "up" },
        { label: "vs. Triton", value: "2.7x", change: "tested", tone: "up" },
      ],
      sections: [
        {
          id: "bottleneck",
          title: "The bottleneck moved",
          paragraphs: [
            "Blackwell increases tensor throughput faster than several surrounding resources. That asymmetry means kernels designed for an earlier hardware balance leave performance unused.",
            "The paper redesigns pipelines, softmax rescaling and memory movement around the new bottlenecks. The result is a reminder that headline chip specifications do not equal delivered application performance.",
          ],
        },
        {
          id: "economics",
          title: "The economic read-through",
          paragraphs: [
            "Higher utilization lowers cost per useful token and can partially offset the capital burden of AI infrastructure. It may also increase demand by making previously uneconomic workloads viable.",
            "For hardware companies, better software can expand the addressable market while reducing the number of chips required for a fixed workload. Both effects matter when translating benchmark gains into revenue.",
          ],
        },
        {
          id: "questions",
          title: "Questions for investors",
          bullets: [
            "How quickly do framework and cloud providers integrate the kernels?",
            "Do benchmark gains persist across model sizes and production constraints?",
            "Who captures the savings: vendors, cloud platforms or end customers?",
            "Does efficiency expand demand faster than it reduces hardware per workload?",
          ],
        },
      ],
      sources: [
        {
          label: "arXiv: FlashAttention-4",
          url: "https://arxiv.org/abs/2603.05451",
        },
      ],
    },
    {
      id: "bitcoin-etf-carry-arbitrage",
      page: "crypto",
      category: "Crypto Market Structure",
      source: "arXiv + CoinDesk",
      sourceUrl: "https://arxiv.org/abs/2605.29309",
      updated: "Research desk",
      readTime: "5 min read",
      headline: "ETF inflows do not remove the limits to bitcoin arbitrage",
      deck: "A recent paper uses ETF holdings, options and CME futures to measure carry across segmented bitcoin markets.",
      summary: "The ETF wrapper has deepened institutional access, but options, futures and spot markets still clear through different balance sheets. Implied carry can reveal when funding and arbitrage capacity are under strain.",
      tags: ["Bitcoin ETF", "Carry", "Arbitrage"],
      numbers: [
        { label: "ETF streak", value: "7 sessions", change: "inflows", tone: "up" },
        { label: "Flow", value: "Nearly $1B", change: "reported", tone: "up" },
        { label: "Bitcoin", value: "$64,058", change: "-0.94%", tone: "down" },
      ],
      sections: [
        {
          id: "measurement",
          title: "What the paper measures",
          paragraphs: [
            "Put-call parity can recover an options-implied forward price. ETF holdings translate each share into bitcoin exposure, while CME futures provide a regulated term structure. Comparing the three creates a common carry framework.",
            "Persistent gaps point to capital, funding, settlement or mandate constraints rather than a free arbitrage that can be closed instantly.",
          ],
        },
        {
          id: "flows",
          title: "Why the inflow streak still matters",
          paragraphs: [
            "ETF demand creates a recurring source of spot-linked buying and can stabilize the investor base. It does not make bitcoin independent of dollar liquidity, Treasury yields or derivatives positioning.",
            "A strong flow tape with weak price response can indicate offsetting supply or expensive carry. Strong price response with widening carry can indicate leverage entering faster than arbitrage balance sheet.",
          ],
        },
        {
          id: "monitor",
          title: "A practical monitor",
          bullets: [
            "ETF creations and redemptions alongside spot price response.",
            "CME basis and options-implied forwards.",
            "Funding rates and open interest on crypto-native venues.",
            "Cross-asset liquidity through the dollar and Treasury yields.",
          ],
        },
      ],
      sources: [
        {
          label: "arXiv: Implied ETF carry rates and limits of arbitrage",
          url: "https://arxiv.org/abs/2605.29309",
        },
        {
          label: "CoinDesk: seven-session bitcoin ETF inflow streak",
          url: "https://www.coindesk.com/daybook-us/2026/07/23/bulls-face-a-test-unlike-anything-in-bitcoin-s-17-year-history",
        },
      ],
    },
  ],

  timeline: [
    {
      time: "Monday",
      title: "Semiconductor breadth gets the first vote",
      detail: "SOXX fell 4.4% Friday while the Dow rose. Monday shows whether the AI drawdown can stabilize before the policy and earnings cluster.",
      url: "https://www.investing.com/news/economy-news/us-stocks-face-tests-from-fed-decision-techled-earnings-deluge-4810946",
    },
    {
      time: "Wed · 2:00 ET",
      title: "FOMC decision and Warsh press conference",
      detail: "Friday pricing assigned a 38% chance to a quarter-point hike. The statement lands at 2:00 p.m. ET and the press conference at 2:30.",
      url: "https://www.federalreserve.gov/newsevents/2026-july.htm",
    },
    {
      time: "Wed · Close",
      title: "Microsoft and Meta report",
      detail: "The first post-Fed corporate test measures cloud, advertising, AI utilization and free cash flow against two large infrastructure budgets.",
      url: "https://news.microsoft.com/source/2026/07/08/microsoft-announces-quarterly-earnings-release-date-68/",
    },
    {
      time: "Thu",
      title: "GDP, PCE inflation and Amazon",
      detail: "BEA releases advance Q2 GDP and June income/outlays at 8:30 a.m. ET; Amazon discusses Q2 results at 5:00 p.m. ET.",
      url: "https://www.bea.gov/news/schedule/",
    },
  ],

  marketDrivers: [
    {
      title: "Policy risk",
      state: "38% hike odds",
      detail: "Friday futures pricing left a meaningful quarter-point hike tail ahead of Wednesday's decision.",
      tone: "down",
    },
    {
      title: "Earnings bar",
      state: "+26.5% YoY",
      detail: "One-third of the S&P reports into an aggregate profit pace that already embeds strong execution.",
      tone: "up",
    },
    {
      title: "AI capex",
      state: "Three verdicts",
      detail: "Microsoft, Meta and Amazon must connect infrastructure spending to utilization and free cash flow.",
      tone: "flat",
    },
    {
      title: "Macro cross-check",
      state: "GDP + PCE",
      detail: "Thursday's paired releases test whether growth can absorb still-elevated underlying inflation.",
      tone: "down",
    },
  ],

  techMatrix: [
    {
      company: "Microsoft",
      focus: "Azure, Copilot and data-center depreciation",
      signal: "Reports Wednesday after the Fed",
      tone: "flat",
    },
    {
      company: "Meta",
      focus: "Ad monetization vs. AI infrastructure",
      signal: "Engagement must fund the build",
      tone: "flat",
    },
    {
      company: "Amazon",
      focus: "AWS growth and capital intensity",
      signal: "Reports after GDP and PCE Thursday",
      tone: "flat",
    },
    {
      company: "Alphabet",
      focus: "Cloud growth vs. $195B–$205B capex",
      signal: "The benchmark the next reports must clear",
      tone: "down",
    },
    {
      company: "Intel",
      focus: "$20B capex after a revenue beat",
      signal: "Friday's 7.9% decline kept the return hurdle high",
      tone: "down",
    },
  ],

  podcasts: [
    {
      title: "All-In",
      focus: "Macro, policy, venture and technology",
      cadence: "Weekly",
      url: "https://podcasts.apple.com/us/search?term=All-In%20Podcast",
    },
    {
      title: "Acquired",
      focus: "Company strategy and business history",
      cadence: "Long-form",
      url: "https://podcasts.apple.com/us/search?term=Acquired",
    },
    {
      title: "Prof G Markets",
      focus: "Markets, business and capital allocation",
      cadence: "Weekly",
      url: "https://podcasts.apple.com/us/search?term=Prof%20G%20Markets",
    },
    {
      title: "Odd Lots",
      focus: "Market structure, liquidity and macro",
      cadence: "Twice weekly",
      url: "https://podcasts.apple.com/us/search?term=Odd%20Lots",
    },
    {
      title: "Masters in Business",
      focus: "Investors, operators and market history",
      cadence: "Weekly",
      url: "https://podcasts.apple.com/us/search?term=Masters%20in%20Business",
    },
    {
      title: "Macro Voices",
      focus: "Rates, commodities and global macro",
      cadence: "Weekly",
      url: "https://podcasts.apple.com/us/search?term=Macro%20Voices",
    },
    {
      title: "Invest Like the Best",
      focus: "Business quality and investing frameworks",
      cadence: "Weekly",
      url: "https://podcasts.apple.com/us/search?term=Invest%20Like%20the%20Best",
    },
    {
      title: "BG2Pod",
      focus: "AI infrastructure and technology strategy",
      cadence: "Periodic",
      url: "https://podcasts.apple.com/us/search?term=BG2Pod",
    },
  ],

  research: [
    {
      category: "Portfolio Risk",
      kind: "Paper",
      year: "2016",
      title: "Volatility Managed Portfolios",
      authors: "Alan Moreira and Tyler Muir",
      source: "NBER",
      url: "https://www.nber.org/papers/w22208",
      summary: "Tests portfolios that reduce exposure when volatility rises and documents improved risk-adjusted outcomes across several factors and asset classes.",
      relevance: "A foundation for volatility targeting, risk budgeting and the risk calculator in The Debrief.",
    },
    {
      category: "Options",
      kind: "Paper",
      year: "2024",
      title: "Construction and Hedging of Equity Index Options Portfolios",
      authors: "Maciej Wysocki and Robert Ślepaczuk",
      source: "arXiv",
      url: "https://arxiv.org/abs/2407.13908",
      summary: "Compares systematic S&P 500 option-writing and hedging strategies using Black-Scholes-Merton and Variance-Gamma models with transaction costs.",
      relevance: "Connects option Greeks, hedge frequency, volatility and sizing to actual portfolio construction.",
    },
    {
      category: "Market Structure",
      kind: "Working paper",
      year: "2026 revision",
      title: "Through Stormy Seas: How Fragile Is Liquidity Across Asset Classes and Time?",
      authors: "Nihad Aliyev, Matteo Aquilina, Khaladdin Rzayev and Sonya Zhu",
      source: "BIS",
      url: "https://www.bis.org/publ/work1229.htm",
      summary: "Studies the distribution and resilience of liquidity across equities, foreign exchange and government bonds over 25 years.",
      relevance: "Explains why average spreads can look healthy while tail liquidity and market fragility worsen.",
    },
    {
      category: "Banking",
      kind: "Working paper",
      year: "2026",
      title: "Liquidity Regulation and Bank Funding Costs",
      authors: "Iñaki Aldasoro, Sebastian Doerr and Haonan Zhou",
      source: "BIS",
      url: "https://www.bis.org/publ/work1352.htm",
      summary: "Provides causal evidence on how the Liquidity Coverage Ratio affected bank borrowing costs and maturity from money market funds.",
      relevance: "Useful for reading bank funding stress, balance-sheet resilience and credit transmission.",
    },
    {
      category: "Currencies",
      kind: "Policy report",
      year: "2026",
      title: "Foreign Currency Funding Risk and Cross-Border Liquidity",
      authors: "CGFS Working Group",
      source: "BIS",
      url: "https://www.bis.org/publ/cgfs71.htm",
      summary: "Maps foreign-currency funding mismatches, internal capital markets, derivatives hedges and central-bank liquidity facilities.",
      relevance: "A practical framework for dollar funding risk and cross-currency stress.",
    },
    {
      category: "Crypto",
      kind: "Paper",
      year: "2026",
      title: "Implied ETF Carry Rates and the Limits of Arbitrage in Segmented Bitcoin Markets",
      authors: "Mindy L. Mallory",
      source: "arXiv",
      url: "https://arxiv.org/abs/2605.29309",
      summary: "Combines ETF holdings, options-implied forwards and CME futures to compare carry across segmented bitcoin markets.",
      relevance: "Turns ETF flows into a market-structure and funding analysis rather than a single headline number.",
    },
    {
      category: "AI Economics",
      kind: "Paper",
      year: "2020",
      title: "Scaling Laws for Neural Language Models",
      authors: "Jared Kaplan and coauthors",
      source: "arXiv",
      url: "https://arxiv.org/abs/2001.08361",
      summary: "Documents power-law relationships between language-model loss, model size, data and compute.",
      relevance: "Provides the economic logic behind AI infrastructure demand and the importance of compute efficiency.",
    },
    {
      category: "AI Economics",
      kind: "Paper",
      year: "2026",
      title: "The Unreasonable Effectiveness of Scaling Laws in AI",
      authors: "Chien-Ping Lu",
      source: "arXiv",
      url: "https://arxiv.org/abs/2603.28507",
      summary: "Argues that scaling laws remain useful because logical compute abstracts away implementation details while efficiency keeps improving.",
      relevance: "Links declining model-loss returns with pressure for lower cost per token and systems innovation.",
    },
    {
      category: "AI Systems",
      kind: "Technical paper",
      year: "2026",
      title: "FlashAttention-4: Algorithm and Kernel Pipelining Co-Design for Asymmetric Hardware Scaling",
      authors: "Ted Zadouri, Markus Hoehnerbach, Jay Shah, Timmy Liu, Vijay Thakkar and Tri Dao",
      source: "arXiv",
      url: "https://arxiv.org/abs/2603.05451",
      summary: "Redesigns attention kernels for Blackwell bottlenecks and reports higher utilization and throughput.",
      relevance: "Shows how software can change effective accelerator supply, cost and competitive positioning.",
    },
    {
      category: "AI Systems",
      kind: "Foundational paper",
      year: "2017",
      title: "Attention Is All You Need",
      authors: "Ashish Vaswani and coauthors",
      source: "arXiv",
      url: "https://arxiv.org/abs/1706.03762",
      summary: "Introduces the Transformer architecture based on attention rather than recurrence or convolution.",
      relevance: "The architectural starting point for the modern accelerator, memory and networking demand stack.",
    },
    {
      category: "Asset Pricing",
      kind: "Paper",
      year: "2020",
      title: "Deep Learning in Asset Pricing",
      authors: "Luyang Chen, Markus Pelger and Jason Zhu",
      source: "Review of Financial Studies",
      url: "https://doi.org/10.1093/rfs/hhaa009",
      summary: "Uses deep neural networks to estimate asset-pricing models and the economic structure of the stochastic discount factor.",
      relevance: "A rigorous reference for machine learning in return prediction and factor construction.",
    },
    {
      category: "Options",
      kind: "Foundational paper",
      year: "1973",
      title: "The Pricing of Options and Corporate Liabilities",
      authors: "Fischer Black and Myron Scholes",
      source: "Journal of Political Economy",
      url: "https://doi.org/10.1086/260062",
      summary: "Derives the option-pricing framework that remains the baseline for pricing and Greek-based risk analysis.",
      relevance: "The mathematical foundation behind The Debrief options calculator, with real-world limitations stated clearly.",
    },
  ],

  sectorMap: [
    { sector: "Technology", signal: "Event-loaded", driver: "Microsoft and Meta Wednesday; Amazon Thursday", tone: "flat" },
    { sector: "Semiconductors", signal: "Repair test", driver: "SOXX enters Monday after a 4.4% Friday decline", tone: "down" },
    { sector: "Financials", signal: "Rate-sensitive", driver: "FOMC path, 4.679% 10-year yield and Thursday GDP", tone: "flat" },
    { sector: "Energy", signal: "Volatile", driver: "Oil remains an inflation input and geopolitical gap risk", tone: "flat" },
    { sector: "Consumer", signal: "Macro test", driver: "Amazon plus income, spending and PCE data Thursday", tone: "down" },
    { sector: "Healthcare", signal: "Relative defense", driver: "Lower duration and AI-capex sensitivity", tone: "up" },
  ],

  cot: {
    date: "Tuesday, July 21, 2026",
    note: "Latest official weekly report, released Friday, July 24 and rechecked against the CFTC's TFF and disaggregated futures files at 9:25 AM ET on Sunday.",
    rows: [
      {
        market: "S&P 500",
        group: "Dealer / intermediary",
        net: -724971,
        read: "Net shorts increased by 7,392 contracts week over week.",
      },
      {
        market: "WTI crude",
        group: "Producer / merchant",
        net: 58888,
        read: "ICE WTI producer net length fell by 6,182 contracts but remains positive.",
      },
    ],
  },

  fallbackMarket: {
    capturedAt: "2026-07-24T21:26:36.000Z",
    gainers: [
      { symbol: "RNG", name: "RingCentral, Inc.", price: 48.31, change: 25.09 },
      { symbol: "THC", name: "Tenet Healthcare Corporation", price: 233.2, change: 17.17 },
      { symbol: "FRMI", name: "Fermi Inc.", price: 7.4, change: 17.09 },
      { symbol: "IP", name: "International Paper Company", price: 42.16, change: 11.21 },
      { symbol: "SW", name: "Smurfit WestRock plc", price: 48.56, change: 11.1 },
      { symbol: "SLB", name: "SLB Limited", price: 52.42, change: 11.01 },
      { symbol: "DLR", name: "Digital Realty Trust, Inc.", price: 199.08, change: 11.01 },
      { symbol: "SSNC", name: "SS&C Technologies Holdings, Inc.", price: 73.88, change: 10.35 },
    ],
    losers: [
      { symbol: "MXL", name: "MaxLinear, Inc.", price: 71.59, change: -21.54 },
      { symbol: "NBIS", name: "Nebius Group N.V.", price: 187.77, change: -15.02 },
      { symbol: "BE", name: "Bloom Energy Corporation", price: 184.89, change: -14.91 },
      { symbol: "HIMS", name: "Hims & Hers Health, Inc.", price: 28.09, change: -14.2 },
      { symbol: "AEHR", name: "Aehr Test Systems", price: 76.32, change: -13.77 },
      { symbol: "NVCR", name: "NovoCure Limited", price: 17.65, change: -11.71 },
      { symbol: "LBRT", name: "Liberty Energy Inc.", price: 17.36, change: -11.52 },
      { symbol: "CRWV", name: "CoreWeave, Inc.", price: 71.88, change: -11.37 },
    ],
    optionsDesk: {
      underlying: "^SPX",
      spot: 7411.98,
      expiration: "2026-07-27",
      asOf: "2026-07-24T21:26:36.000Z",
      netGammaBillions: -3.96,
      zeroGamma: 7454,
      callWall: 7630,
      putWall: 7200,
      expectedMovePercent: 0.7,
      putCallRatio: 1.17,
      totalWatchlistVolume: 3144763,
      sentiment: "Defensive",
      gammaByStrike: [
        { strike: 7455, exposure: 0.005 },
        { strike: 7450, exposure: -0.63 },
        { strike: 7445, exposure: -0.099 },
        { strike: 7440, exposure: 0.024 },
        { strike: 7435, exposure: -0.017 },
        { strike: 7430, exposure: -0.04 },
        { strike: 7425, exposure: -0.215 },
        { strike: 7420, exposure: 0.013 },
        { strike: 7415, exposure: -0.025 },
        { strike: 7410, exposure: -0.218 },
        { strike: 7405, exposure: -0.004 },
        { strike: 7400, exposure: -0.314 },
        { strike: 7395, exposure: -0.054 },
        { strike: 7390, exposure: 0.015 },
        { strike: 7385, exposure: -0.03 },
        { strike: 7380, exposure: -0.055 },
        { strike: 7375, exposure: -0.119 },
        { strike: 7370, exposure: -0.072 },
        { strike: 7365, exposure: -0.024 },
      ],
      activity: [
        { symbol: "^SPX", contract: "SPXW260727P07400000", side: "Put", strike: 7400, expiration: "2026-07-27", volume: 12591, openInterest: 1191, volumeOpenInterest: 10.57, premium: 27826110, impliedVolatility: 10.4 },
        { symbol: "SPY", contract: "SPY260727P00739000", side: "Put", strike: 739, expiration: "2026-07-27", volume: 86279, openInterest: 2367, volumeOpenInterest: 36.45, premium: 24071841, impliedVolatility: 10.3 },
        { symbol: "SPY", contract: "SPY260727P00740000", side: "Put", strike: 740, expiration: "2026-07-27", volume: 71031, openInterest: 4447, volumeOpenInterest: 15.97, premium: 23227137, impliedVolatility: 10.3 },
        { symbol: "QQQ", contract: "QQQ260727P00690000", side: "Put", strike: 690, expiration: "2026-07-27", volume: 29770, openInterest: 6010, volumeOpenInterest: 4.95, premium: 21538595, impliedVolatility: 15.5 },
        { symbol: "QQQ", contract: "QQQ260727P00685000", side: "Put", strike: 685, expiration: "2026-07-27", volume: 44059, openInterest: 5651, volumeOpenInterest: 7.8, premium: 20156993, impliedVolatility: 17 },
        { symbol: "SPY", contract: "SPY260727P00738000", side: "Put", strike: 738, expiration: "2026-07-27", volume: 82113, openInterest: 2452, volumeOpenInterest: 33.49, premium: 19460781, impliedVolatility: 10.6 },
        { symbol: "^SPX", contract: "SPXW260727P07450000", side: "Put", strike: 7450, expiration: "2026-07-27", volume: 3911, openInterest: 2849, volumeOpenInterest: 1.37, premium: 18831465, impliedVolatility: 9.5 },
        { symbol: "SPY", contract: "SPY260727P00742000", side: "Put", strike: 742, expiration: "2026-07-27", volume: 41380, openInterest: 1340, volumeOpenInterest: 30.88, premium: 18331340, impliedVolatility: 9.9 },
        { symbol: "SPY", contract: "SPY260727C00739000", side: "Call", strike: 739, expiration: "2026-07-27", volume: 63309, openInterest: 4331, volumeOpenInterest: 14.62, premium: 15542360, impliedVolatility: 9.3 },
        { symbol: "SPY", contract: "SPY260727C00740000", side: "Call", strike: 740, expiration: "2026-07-27", volume: 80349, openInterest: 5575, volumeOpenInterest: 14.41, premium: 15507357, impliedVolatility: 9.1 },
        { symbol: "SPY", contract: "SPY260727P00741000", side: "Put", strike: 741, expiration: "2026-07-27", volume: 36797, openInterest: 3610, volumeOpenInterest: 10.19, premium: 14019657, impliedVolatility: 10 },
        { symbol: "QQQ", contract: "QQQ260727P00680000", side: "Put", strike: 680, expiration: "2026-07-27", volume: 50750, openInterest: 6791, volumeOpenInterest: 7.47, premium: 13854750, impliedVolatility: 18.5 },
      ],
      methodology: "Fallback snapshot captured from delayed Yahoo Finance SPX, SPY and QQQ option chains at Friday close on July 24, 2026 and retained for the Sunday edition because no newer U.S. options session exists. The serverless screener and option-chain provider returned no current rows when rechecked at 9:28 AM ET Sunday. Gamma uses Black-Scholes gamma, reported implied volatility and open interest. Calls are treated as positive dealer gamma and puts as negative; exposure is estimated for a 1% underlying move. Walls are the highest-open-interest strikes within 5% of spot. This is an analytical estimate, not exchange-reported positioning or executable market data.",
    },
  },
};
