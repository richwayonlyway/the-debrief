import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  homepagePayloads: defineTable({
    slug: v.string(),
    editionDate: v.string(),
    generatedAt: v.string(),
    payload: v.any(),
    sourceNotes: v.optional(v.array(v.string())),
  }).index("by_slug", ["slug"]),

  xPosts: defineTable({
    handle: v.string(),
    postId: v.string(),
    text: v.string(),
    url: v.string(),
    postedAt: v.string(),
    authorDisplayName: v.optional(v.string()),
    mediaUrl: v.optional(v.string()),
    likeCount: v.optional(v.number()),
    repostCount: v.optional(v.number()),
    replyCount: v.optional(v.number()),
    quoteCount: v.optional(v.number()),
  })
    .index("by_handle", ["handle"])
    .index("by_handle_and_postedAt", ["handle", "postedAt"])
    .index("by_post_id", ["postId"]),

  feedRuns: defineTable({
    source: v.string(),
    status: v.union(v.literal("started"), v.literal("success"), v.literal("error")),
    startedAt: v.string(),
    finishedAt: v.optional(v.string()),
    detail: v.optional(v.string()),
  }).index("by_source_and_startedAt", ["source", "startedAt"]),
});
