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
- while Convex is still disconnected, the shipped Vercel site now polls its own `/api/live` snapshot by default for market refreshes

## Expected live query name

The page subscribes to:

- `live:getMergedHomepagePayload`

## Expected payload shape

The page can hydrate these keys when present:

- `ticker`
- `signal`
- `storyDeck`
- `macroBoard`
- `leadershipBoard`
- `deskNotes`
- `setupBoard`
- `inboxHighlights`
- `optionsPulse`
- `xTracker`
- `crowdPulse`
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

Current scaffold status:

- `convex/xTracker.ts` now includes `refreshSelectedAccounts`
- the action fetches the selected accounts through the official X API
- posts are persisted into `xPosts`
- `live:getMergedHomepagePayload` reads the latest stored row per handle for the homepage tracker
- `convex/crons.ts` already schedules the refresh every 5 minutes

## Vercel bridge env vars available now

The current Vercel `/api/live` bridge can turn on account-level X tracker pulls before Convex is connected:

- `X_BEARER_TOKEN`
- optional `X_TRACKER_USERNAME_MAP_JSON`
- optional `DEBRIEF_EDITORIAL_URL`
- optional `DEBRIEF_EDITORIAL_BEARER_TOKEN`
- optional `DEBRIEF_EDITORIAL_HEADERS_JSON`

Example:

```json
{
  "@unsusual_whales": "unusual_whales",
  "@DeItaone": "Deltaone"
}
```

Use the override map only when the display handle in the newsletter should differ from the exact X API username used for lookup.

When `DEBRIEF_EDITORIAL_URL` is set, `/api/live` will fetch a JSON object and merge supported editorial keys over the request-time market payload. That allows Story Deck, Inbox Radar, Desk Notes, Tape Setup, Flow Watch, Mover Board, Signal Stack, and COT updates to land between static HTML republishes.

## Operational model

- Convex becomes the live state layer
- Vercel continues serving the public page
- the daily automation can keep publishing a full edition
- live updates can land between daily publishes
