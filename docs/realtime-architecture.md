# The Debrief Realtime Architecture

## Current state

`index.html` is a single-file static newsletter deployed to Vercel. That is good for:

- a daily 9am refresh
- stable share URLs
- fast deploys
- low operational overhead

It is not enough for true live social, live price refresh, or live story ingestion without a backend.

Important nuance: the frontend does not need a framework rewrite to use Convex. Convex can subscribe from plain browser JavaScript, so the current static site can stay in place.

There is now also an intermediate step in place: a same-origin Vercel snapshot endpoint at `/api/live` can refresh the market bar, signal stack, cross-asset cards, Flow Watch, and Mover Board without waiting for Convex auth.

That same bridge now also refreshes the `Leadership Monitor` section with live volatility, small-cap, semiconductor, tech, energy, and dollar proxies.

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
- Leadership Monitor
- X Tracker
   - Inbox Radar
   - Friday COT status

The current page can do this either by:

- direct Convex browser subscriptions, or
- polling a Convex HTTP action as a fallback
- polling the shipped Vercel `/api/live` endpoint as the lightweight bridge that works today

When Convex is connected again, the preferred public query is `live:getMergedHomepagePayload`, which merges the stored homepage snapshot with the latest ingested `xPosts` rows for the selected tracker accounts.

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

What is live right now after deploy:

- `/api/live` polls Yahoo Finance spark for indices, yields, Brent, and gold
- `/api/live` polls CoinGecko for BTC, ETH, and SOL
- `/api/live` can also poll the official X API for the selected tracker accounts when `X_BEARER_TOKEN` is configured
- the static edition hydrates those values every minute by default

What still needs Convex or other authenticated backends:

- durable X account ingestion into a realtime store instead of request-time polling
- live newsletter/highlight ingestion from inbox sources
- intraday story card refreshes
- durable live state shared across editions and operators

That keeps the newsletter improving immediately while the live backend is connected later.
