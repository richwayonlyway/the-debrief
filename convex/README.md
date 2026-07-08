# Convex scaffold for The Debrief

This folder is a backend scaffold for the live version of The Debrief.

It is intentionally separated from the current static Vercel newsletter so the public site can keep shipping while the realtime backend is connected.

## What this backend is for

- realtime story deck updates
- market bar refreshes
- X tracker ingestion for:
  - `@NoLimitGains`
  - `@unsusual_whales`
  - `@DeItaone`
- Friday CFTC COT refreshes
- an optional HTTP snapshot endpoint for the static page

## Expected frontend query

The static newsletter can subscribe to this public query directly from plain HTML:

- `live:getHomepagePayload`

It can also use the HTTP action:

- `/debrief-live`

For the X tracker specifically, the scaffold now also exposes a UI-shaped query:

- `xTracker:getTrackerRows`

That query returns the same `handle`, `focus`, `state`, `latestText`, `meta`, and `url` fields the static page expects from `/api/live`.

## Setup path

1. Install Convex in a JS/TS environment:

```bash
npm install convex
```

2. Authenticate and create or attach a deployment:

```bash
npx convex dev
```

3. Point the static newsletter at the deployment:

- set `window.__DEBRIEF_CONVEX_URL` in the page, or
- open the page with `?convexUrl=https://<deployment>.convex.cloud`

4. Optional HTTP fallback:

- use `?liveEndpoint=https://<deployment>.convex.site/debrief-live`
- or keep the current Vercel bridge active at `/api/live` until Convex auth is restored

## Important blocker in this workspace

The Convex app connector in Codex currently requires reauthentication, so this scaffold is ready but not yet attached to a live Convex deployment from inside this session.
