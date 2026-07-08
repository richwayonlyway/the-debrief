import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "refresh debrief homepage snapshot",
  { hourUTC: 13, minuteUTC: 0 },
  internal.live.refreshHomepageFeeds,
);

crons.interval(
  "refresh x tracker snapshot",
  { minutes: 5 },
  internal.live.refreshHomepageFeeds,
);

crons.cron(
  "refresh cftc cot after friday release",
  "30 20 * * 5",
  internal.live.refreshHomepageFeeds,
);

export default crons;
