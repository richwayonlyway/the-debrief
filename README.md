# The Debrief

Static daily newsletter for markets, tech, geopolitics, crypto, trading, and CFTC positioning.

Production site:
https://thedebrief.vercel.app

Primary file:
- `index.html`

Daily automation:
- Refreshes `/Users/gabrielrivera/Downloads/index.html`
- Syncs this workspace copy
- Redeploys production through Vercel

Realtime path in progress:
- `index.html` already supports Story Deck modals, live HTTP polling, and Convex subscriptions
- `convex/xTracker.ts` now includes scheduled official X API ingestion for:
  - `@NoLimitGains`
  - `@unsusual_whales`
  - `@DeItaone`
- `convex/live.ts` merges stored homepage content with the latest ingested tracker rows
