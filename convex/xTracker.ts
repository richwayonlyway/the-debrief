import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const upsertPosts = mutation({
  args: {
    handle: v.string(),
    posts: v.array(
      v.object({
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
      }),
    ),
  },
  handler: async (ctx, args) => {
    for (const post of args.posts) {
      const existing = await ctx.db
        .query("xPosts")
        .withIndex("by_post_id", (q) => q.eq("postId", post.postId))
        .take(1);

      if (existing[0]) {
        await ctx.db.patch(existing[0]._id, {
          handle: args.handle,
          ...post,
        });
      } else {
        await ctx.db.insert("xPosts", {
          handle: args.handle,
          ...post,
        });
      }
    }
  },
});

export const listLatestByHandle = query({
  args: {
    handles: v.array(v.string()),
    limitPerHandle: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limitPerHandle = args.limitPerHandle ?? 3;
    const out = [];

    for (const handle of args.handles) {
      const rows = await ctx.db
        .query("xPosts")
        .withIndex("by_handle_and_postedAt", (q) => q.eq("handle", handle))
        .order("desc")
        .take(limitPerHandle);

      out.push({
        handle,
        posts: rows,
      });
    }

    return out;
  },
});
