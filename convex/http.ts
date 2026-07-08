import { httpRouter } from "convex/server";

import { api } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/debrief-live",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const payload = await ctx.runQuery(api.live.getHomepagePayload, {});
    return Response.json(payload ?? {});
  }),
});

export default http;
