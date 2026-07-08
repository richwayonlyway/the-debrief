# The Debrief Realtime Architecture

## Current state

`index.html` is a single-file static newsletter deployed to Vercel. That is good for:

- a daily 9am refresh
- stable share URLs
- fast deploys
- low operational overhead

It is not enough for true live social, live price refresh, or live story ingestion without a backend.

## Recommended live architecture

Use Convex as the realtime data layer and keep Vercel as the public app host.

1. Ingest sources on a schedule
   - Daily newsletter refresh job for the full edition
   - Intraday jobs for market snapshots
   - Friday CFTC refresh job when a newer report is posted
   - X account polling or stream ingestion for:
     - `@NoLimitGains`
     - `@unsusual_whales`
     - `@DeItaone`

2. Store normalized records in Convex
   - `stories`
   - `story_cards`
   - `market_snapshots`
   - `crypto_snapshots`
   - `cot_reports`
   - `x_posts`
   - `newsletter_highlights`

3. Subscribe on the frontend
   - Story Deck
   - market bar
   - X Tracker
   - Inbox Radar
   - Friday COT status

4. Keep a daily static fallback
   - If live fetch fails, the site still serves the latest published edition
   - This preserves a stable shareable page even during API failures

## Why Convex

Convex is the cleanest fit here because it supports:

- server functions for ingestion
- scheduled jobs
- a realtime subscription model for frontend updates

## X data path

Preferred:

- X API filtered stream or account timeline ingestion

Fallback:

- scheduled polling of account timelines every few minutes

Important:

- true live X updates are blocked until authenticated API access is available
- the current shipped UI is a watchlist scaffold, not a live social feed

## Shipping path right now

Today’s production-safe path is:

1. update `index.html`
2. verify locally
3. push to `main`
4. redeploy Vercel

That keeps the newsletter improving immediately while the live backend is connected later.
