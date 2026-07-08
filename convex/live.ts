import { internal } from "./_generated/api";
import {
  internalAction,
  internalMutation,
  mutation,
  query,
} from "./_generated/server";
import { v } from "convex/values";

const HOMEPAGE_SLUG = "homepage";
const TRACKER_HANDLES = [
  "@NoLimitGains",
  "@unsusual_whales",
  "@DeItaone",
] as const;
const TRACKER_FOCUS: Record<(typeof TRACKER_HANDLES)[number], string> = {
  "@NoLimitGains": "Momentum + premarket setups",
  "@unsusual_whales": "Flow + options sentiment",
  "@DeItaone": "Macro headline tape",
};

function relativeTime(value: string) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(0, Math.round(diffMs / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function parseJsonEnv(name: string) {
  const raw = process.env[name];
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function withTimeout(ms: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeout),
  };
}

function isRecord(value: unknown): value is Record<string, any> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function normalizeEditorialEnvelope(raw: unknown) {
  if (!isRecord(raw)) {
    throw new Error("Editorial payload must be a JSON object.");
  }

  const payload = isRecord(raw.payload) ? raw.payload : raw;
  const editionDate =
    typeof raw.editionDate === "string" && raw.editionDate.trim()
      ? raw.editionDate
      : new Date().toISOString().slice(0, 10);
  const generatedAt =
    typeof raw.generatedAt === "string" && raw.generatedAt.trim()
      ? raw.generatedAt
      : new Date().toISOString();
  const sourceNotes = Array.isArray(raw.sourceNotes)
    ? raw.sourceNotes.filter((entry): entry is string => typeof entry === "string")
    : undefined;

  return {
    editionDate,
    generatedAt,
    payload,
    sourceNotes,
  };
}

export const getHomepagePayload = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("homepagePayloads")
      .withIndex("by_slug", (q) => q.eq("slug", HOMEPAGE_SLUG))
      .take(1);

    return rows[0]?.payload ?? null;
  },
});

export const getMergedHomepagePayload = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("homepagePayloads")
      .withIndex("by_slug", (q) => q.eq("slug", HOMEPAGE_SLUG))
      .take(1);

    const basePayload = (rows[0]?.payload ?? {}) as Record<string, any>;
    const xTracker = [];

    for (const handle of TRACKER_HANDLES) {
      const posts = await ctx.db
        .query("xPosts")
        .withIndex("by_handle_and_postedAt", (q) => q.eq("handle", handle))
        .order("desc")
        .take(1);

      const latest = posts[0];

      if (!latest) {
        xTracker.push({
          handle,
          focus: TRACKER_FOCUS[handle],
          state: "Awaiting posts",
          meta: "No X posts have been ingested into Convex for this handle yet.",
        });
        continue;
      }

      const metricParts = [];
      if (typeof latest.likeCount === "number") metricParts.push(`Likes ${latest.likeCount}`);
      if (typeof latest.repostCount === "number") metricParts.push(`Reposts ${latest.repostCount}`);
      if (typeof latest.replyCount === "number") metricParts.push(`Replies ${latest.replyCount}`);

      xTracker.push({
        handle,
        focus: TRACKER_FOCUS[handle],
        state: "Live",
        latestText: latest.text,
        meta: `${latest.authorDisplayName ?? handle} · ${relativeTime(latest.postedAt)}${metricParts.length ? ` · ${metricParts.join(" · ")}` : ""}`,
        url: latest.url,
        mediaUrl: latest.mediaUrl,
      });
    }

    return {
      ...basePayload,
      xTracker,
    };
  },
});

export const upsertHomepagePayload = mutation({
  args: {
    editionDate: v.string(),
    generatedAt: v.string(),
    payload: v.any(),
    sourceNotes: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("homepagePayloads")
      .withIndex("by_slug", (q) => q.eq("slug", HOMEPAGE_SLUG))
      .take(1);

    if (existing[0]) {
      await ctx.db.patch(existing[0]._id, {
        editionDate: args.editionDate,
        generatedAt: args.generatedAt,
        payload: args.payload,
        sourceNotes: args.sourceNotes,
      });
      return existing[0]._id;
    }

    return await ctx.db.insert("homepagePayloads", {
      slug: HOMEPAGE_SLUG,
      editionDate: args.editionDate,
      generatedAt: args.generatedAt,
      payload: args.payload,
      sourceNotes: args.sourceNotes,
    });
  },
});

export const recordFeedRun = internalMutation({
  args: {
    source: v.string(),
    status: v.union(v.literal("started"), v.literal("success"), v.literal("error")),
    startedAt: v.string(),
    finishedAt: v.optional(v.string()),
    detail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("feedRuns", args);
  },
});

export const refreshHomepageEditorialPayload = internalAction({
  args: {},
  handler: async (ctx) => {
    const startedAt = new Date().toISOString();
    await ctx.runMutation(internal.live.recordFeedRun, {
      source: "homepage-editorial-refresh",
      status: "started",
      startedAt,
      detail: "Refreshing homepage editorial payload from the configured JSON source.",
    });

    const url = process.env.DEBRIEF_EDITORIAL_URL;
    if (!url) {
      const detail =
        "Skipped homepage editorial refresh because DEBRIEF_EDITORIAL_URL is not configured.";
      await ctx.runMutation(internal.live.recordFeedRun, {
        source: "homepage-editorial-refresh",
        status: "success",
        startedAt,
        finishedAt: new Date().toISOString(),
        detail,
      });
      return { skipped: true, detail };
    }

    const extraHeaders = parseJsonEnv("DEBRIEF_EDITORIAL_HEADERS_JSON");
    const headers = {
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0",
      ...extraHeaders,
    } as Record<string, string>;

    if (process.env.DEBRIEF_EDITORIAL_BEARER_TOKEN) {
      headers.Authorization = `Bearer ${process.env.DEBRIEF_EDITORIAL_BEARER_TOKEN}`;
    }

    const timer = withTimeout(8000);

    try {
      const response = await fetch(url, {
        headers,
        signal: timer.signal,
      });

      if (!response.ok) {
        throw new Error(`Editorial HTTP ${response.status}`);
      }

      const raw = await response.json();
      const normalized = normalizeEditorialEnvelope(raw);

      await ctx.runMutation(internal.live.upsertHomepagePayload, normalized);

      const detail = `Homepage editorial payload refreshed from ${url}.`;
      await ctx.runMutation(internal.live.recordFeedRun, {
        source: "homepage-editorial-refresh",
        status: "success",
        startedAt,
        finishedAt: new Date().toISOString(),
        detail,
      });

      return {
        skipped: false,
        detail,
        editionDate: normalized.editionDate,
      };
    } catch (error: any) {
      await ctx.runMutation(internal.live.recordFeedRun, {
        source: "homepage-editorial-refresh",
        status: "error",
        startedAt,
        finishedAt: new Date().toISOString(),
        detail: error?.message || "Homepage editorial refresh failed.",
      });
      throw error;
    } finally {
      timer.clear();
    }
  },
});

export const refreshHomepageFeeds = internalAction({
  args: {},
  handler: async (ctx) => {
    const startedAt = new Date().toISOString();
    await ctx.runMutation(internal.live.recordFeedRun, {
      source: "homepage-refresh",
      status: "started",
      startedAt,
      detail:
        "Homepage refresh started. Current implementation refreshes stored editorial content plus selected X tracker accounts.",
    });

    const successParts: string[] = [];
    const errors: string[] = [];

    try {
      const editorial = await ctx.runAction(internal.live.refreshHomepageEditorialPayload, {});
      successParts.push(
        editorial?.skipped
          ? "editorial skipped (no DEBRIEF_EDITORIAL_URL)"
          : `editorial refreshed for ${editorial?.editionDate ?? "current edition"}`,
      );
    } catch (error: any) {
      errors.push(`editorial: ${error?.message || "unknown failure"}`);
    }

    try {
      await ctx.runAction(internal.xTracker.refreshSelectedAccounts, {});
      successParts.push("x tracker refreshed");
    } catch (error: any) {
      errors.push(`x tracker: ${error?.message || "unknown failure"}`);
    }

    const finishedAt = new Date().toISOString();

    if (errors.length === 0) {
      await ctx.runMutation(internal.live.recordFeedRun, {
        source: "homepage-refresh",
        status: "success",
        startedAt,
        finishedAt,
        detail: `Homepage refresh completed successfully (${successParts.join("; ")}).`,
      });
      return {
        ok: true,
        successParts,
        errors,
      };
    }

    const detail = `Homepage refresh finished with issues (${[
      ...successParts,
      ...errors,
    ].join("; ")}).`;
    await ctx.runMutation(internal.live.recordFeedRun, {
      source: "homepage-refresh",
      status: successParts.length ? "success" : "error",
      startedAt,
      finishedAt,
      detail,
    });

    if (!successParts.length) {
      throw new Error(detail);
    }

    return {
      ok: false,
      successParts,
      errors,
    };
  },
});
