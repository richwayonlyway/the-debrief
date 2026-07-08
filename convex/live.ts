import { internal } from "./_generated/api";
import {
  internalAction,
  internalMutation,
  mutation,
  query,
} from "./_generated/server";
import { v } from "convex/values";

const HOMEPAGE_SLUG = "homepage";

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
