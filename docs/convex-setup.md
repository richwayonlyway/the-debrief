# Convex setup for The Debrief

## Goal

Keep the current static Vercel newsletter, but let the page subscribe to live data from Convex when a deployment URL is available.

## Why this works with the current repo

The current site is plain HTML. Convex supports subscribing from plain browser JavaScript, so a framework migration is not required just to get realtime updates.

## Repo pieces already added

- `convex/schema.ts`
- `convex/live.ts`
- `convex/xTracker.ts`
- `convex/http.ts`
- `convex/crons.ts`
- static page live bridge in `index.html`

## What still needs to happen outside this session

1. Reauthenticate the Convex Codex app connection.
2. Install Convex locally in a JS/TS environment:

```bash
npm install convex
```

3. Initialize or attach the project:

```bash
npx convex dev
```

4. Deploy the Convex backend:

```bash
npx convex deploy
```

5. Set the live connection on the page.

Option A: direct Convex realtime

```html
<script>
window.__DEBRIEF_CONVEX_URL = "https://<deployment>.convex.cloud";
</script>
```

Option B: HTTP fallback

- use `https://<deployment>.convex.site/debrief-live`
- or pass `?liveEndpoint=https://<deployment>.convex.site/debrief-live`

## Expected live query name

The page subscribes to:

- `live:getHomepagePayload`

## Expected payload shape

The page can hydrate these keys when present:

- `ticker`
- `signal`
- `storyDeck`
- `macroBoard`
- `deskNotes`
- `inboxHighlights`
- `xTracker`
- `catalystCalendar`
- `flowWatch`
- `moverBoard`
- `liveStatus`
- `cot`

## X ingestion recommendation

Preferred:

- X Filtered Stream or account timeline ingestion into `xPosts`

Fallback:

- periodic polling every 5 minutes for the three selected accounts

## Operational model

- Convex becomes the live state layer
- Vercel continues serving the public page
- the daily automation can keep publishing a full edition
- live updates can land between daily publishes
