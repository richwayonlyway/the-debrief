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

The X tracker scaffold now includes a real scheduled ingestion path:

- `internal.xTracker.refreshSelectedAccounts`
- official X API lookups for the three selected accounts
- storage in the `xPosts` table
- merge into `live:getMergedHomepagePayload`

## Expected frontend query

The static newsletter can subscribe to this public query directly from plain HTML:

- `live:getMergedHomepagePayload`

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

## Required env vars for live X tracker refreshes

- `X_BEARER_TOKEN`
- optional `X_TRACKER_USERNAME_MAP_JSON`

Recommended override map for the current selected handles:

```json
{
  "@unsusual_whales": "unusual_whales",
  "@DeItaone": "Deltaone"
}
```

The Vercel bridge can also merge an external editorial JSON source with:

- `DEBRIEF_EDITORIAL_URL`
- optional `DEBRIEF_EDITORIAL_BEARER_TOKEN`
- optional `DEBRIEF_EDITORIAL_HEADERS_JSON`

That path keeps live market snapshots request-time fresh while allowing editorial modules to update from a separate authenticated source.

## Important blocker in this workspace

The Convex app connector in Codex currently requires reauthentication, so this scaffold is ready but not yet attached to a live Convex deployment from inside this session.
