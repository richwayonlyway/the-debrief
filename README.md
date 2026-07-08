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

Convex backend status:
- Reader login auth is not required for the public newsletter
- Production Convex deployment:
  - `https://beaming-meerkat-772.convex.cloud`
- Production HTTP actions endpoint:
  - `https://beaming-meerkat-772.convex.site/debrief-live`
- Dev Convex deployment:
  - `https://resilient-llama-286.convex.cloud`
- The current production query is `live:getMergedHomepagePayload`
- The current public page is wired in hybrid mode:
  - Convex for stored editorial/X tracker updates
  - Vercel `/api/live` for request-time market snapshots
