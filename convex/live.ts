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

export const refreshHomepageFeeds = internalAction({
  args: {},
  handler: async (ctx) => {
    const startedAt = new Date().toISOString();
    await ctx.runMutation(internal.live.recordFeedRun, {
      source: "homepage-refresh",
      status: "started",
      startedAt,
      detail: "Stub action. Replace this with newsletter parsing, market data refresh, and X ingestion.",
    });

    // This scaffold keeps the action safe to deploy before external APIs are connected.
    await ctx.runMutation(internal.live.recordFeedRun, {
      source: "homepage-refresh",
      status: "success",
      startedAt,
      finishedAt: new Date().toISOString(),
      detail: "No-op scaffold completed. Connect ingestion sources before enabling production refreshes.",
    });
  },
});
