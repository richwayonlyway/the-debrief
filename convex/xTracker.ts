import { api, internal } from "./_generated/api";
import { internalAction, mutation, query } from "./_generated/server";
import { v } from "convex/values";

const TRACKER_HANDLES = [
  "@NoLimitGains",
  "@unsusual_whales",
  "@DeItaone",
] as const;
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

function normalizeHandle(handle: string) {
  return handle.trim().replace(/^@+/, "");
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

function shortText(value: string, maxLength = 280) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

async function fetchXJson(url: URL, token: string) {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0",
    },
  });

  if (!response.ok) {
    throw new Error(`x API HTTP ${response.status}`);
  }

  return response.json();
}

async function fetchXUserByUsername(username: string, token: string) {
  const url = new URL(`https://api.x.com/2/users/by/username/${encodeURIComponent(username)}`);
  url.searchParams.set("user.fields", "id,name,username,profile_image_url");
  const payload = await fetchXJson(url, token);
  if (!payload || !payload.data || !payload.data.id) {
    throw new Error(`x user lookup failed for ${username}`);
  }
  return payload.data;
}

async function fetchXPostsByUserId(userId: string, token: string) {
  const url = new URL(`https://api.x.com/2/users/${encodeURIComponent(userId)}/tweets`);
  url.searchParams.set("exclude", "replies,retweets");
  url.searchParams.set("max_results", "5");
  url.searchParams.set("tweet.fields", "created_at,public_metrics,attachments");
  url.searchParams.set("expansions", "attachments.media_keys");
  url.searchParams.set("media.fields", "preview_image_url,url,type");
  return fetchXJson(url, token);
}

function pickMediaUrl(payload: any, tweet: any) {
  const media = payload?.includes?.media;
  const mediaKeys = tweet?.attachments?.media_keys;
  if (!Array.isArray(media) || !Array.isArray(mediaKeys) || !mediaKeys.length) return undefined;
  const first = media.find((item: any) => mediaKeys.includes(item.media_key));
  return first?.url || first?.preview_image_url || undefined;
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

export const refreshSelectedAccounts = internalAction({
  args: {},
  handler: async (ctx) => {
    const token = process.env.X_BEARER_TOKEN;
    const startedAt = new Date().toISOString();

    await ctx.runMutation(internal.live.recordFeedRun, {
      source: "x-tracker-refresh",
      status: "started",
      startedAt,
      detail: `Refreshing ${TRACKER_HANDLES.length} selected tracker accounts from the official X API.`,
    });

    if (!token) {
      const detail =
        "Missing X_BEARER_TOKEN. Set it in Convex before enabling scheduled X tracker refreshes.";
      await ctx.runMutation(internal.live.recordFeedRun, {
        source: "x-tracker-refresh",
        status: "error",
        startedAt,
        finishedAt: new Date().toISOString(),
        detail,
      });
      throw new Error(detail);
    }

    const usernameOverrides = parseJsonEnv("X_TRACKER_USERNAME_MAP_JSON") as Record<
      string,
      string
    >;
    const results = [];

    try {
      for (const handle of TRACKER_HANDLES) {
        const normalized = normalizeHandle(handle);
        const lookupUsername =
          usernameOverrides[handle] ||
          usernameOverrides[normalized] ||
          normalized;

        const user = await fetchXUserByUsername(lookupUsername, token);
        const timeline = await fetchXPostsByUserId(user.id, token);
        const posts = Array.isArray(timeline?.data) ? timeline.data : [];

        await ctx.runMutation(api.xTracker.upsertPosts, {
          handle,
          posts: posts.map((post: any) => ({
            postId: String(post.id),
            text: shortText(String(post.text || "")),
            url: `https://x.com/${user.username}/status/${post.id}`,
            postedAt: String(post.created_at),
            authorDisplayName: user.name ? String(user.name) : undefined,
            mediaUrl: pickMediaUrl(timeline, post),
            likeCount:
              typeof post?.public_metrics?.like_count === "number"
                ? post.public_metrics.like_count
                : undefined,
            repostCount:
              typeof post?.public_metrics?.retweet_count === "number"
                ? post.public_metrics.retweet_count
                : undefined,
            replyCount:
              typeof post?.public_metrics?.reply_count === "number"
                ? post.public_metrics.reply_count
                : undefined,
            quoteCount:
              typeof post?.public_metrics?.quote_count === "number"
                ? post.public_metrics.quote_count
                : undefined,
          })),
        });

        results.push(`${handle}:${posts.length}`);
      }

      await ctx.runMutation(internal.live.recordFeedRun, {
        source: "x-tracker-refresh",
        status: "success",
        startedAt,
        finishedAt: new Date().toISOString(),
        detail: `Refreshed X tracker accounts successfully (${results.join(", ")}).`,
      });
    } catch (error: any) {
      await ctx.runMutation(internal.live.recordFeedRun, {
        source: "x-tracker-refresh",
        status: "error",
        startedAt,
        finishedAt: new Date().toISOString(),
        detail: error?.message || "Unknown X tracker refresh failure.",
      });
      throw error;
    }
  },
});
