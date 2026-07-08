import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const TRACKER_FOCUS: Record<string, string> = {
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

export const getTrackerRows = query({
  args: {
    handles: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const out = [];

    for (const handle of args.handles) {
      const rows = await ctx.db
        .query("xPosts")
        .withIndex("by_handle_and_postedAt", (q) => q.eq("handle", handle))
        .order("desc")
        .take(1);

      const latest = rows[0];

      if (!latest) {
        out.push({
          handle,
          focus: TRACKER_FOCUS[handle] ?? "Live tracker",
          state: "Awaiting posts",
          meta: "No X posts have been ingested for this handle yet.",
        });
        continue;
      }

      const metricParts = [];
      if (typeof latest.likeCount === "number") metricParts.push(`Likes ${latest.likeCount}`);
      if (typeof latest.repostCount === "number") metricParts.push(`Reposts ${latest.repostCount}`);
      if (typeof latest.replyCount === "number") metricParts.push(`Replies ${latest.replyCount}`);

      out.push({
        handle,
        focus: TRACKER_FOCUS[handle] ?? "Live tracker",
        state: "Live",
        latestText: latest.text,
        meta: `${latest.authorDisplayName ?? handle} · ${relativeTime(latest.postedAt)}${metricParts.length ? ` · ${metricParts.join(" · ")}` : ""}`,
        url: latest.url,
        mediaUrl: latest.mediaUrl,
      });
    }

    return out;
  },
});
