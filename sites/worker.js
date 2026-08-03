const API_ORIGIN = "https://thedebrief.vercel.app";
const API_PATHS = new Set(["/api/live", "/api/market", "/api/company"]);

function apiHeaders(headers) {
  const next = new Headers(headers);
  next.set("Access-Control-Allow-Origin", "*");
  next.set("X-Debrief-Data-Upstream", "Vercel");
  return next;
}

async function proxyApi(request, url) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (request.method !== "GET") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { Allow: "GET, OPTIONS" },
    });
  }

  const upstream = new URL(url.pathname + url.search, API_ORIGIN);
  const response = await fetch(upstream, {
    headers: {
      Accept: request.headers.get("Accept") || "application/json",
      "User-Agent": "The Debrief Sites Worker",
    },
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: apiHeaders(response.headers),
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (API_PATHS.has(url.pathname)) {
      try {
        return await proxyApi(request, url);
      } catch (error) {
        return Response.json(
          {
            error: "data_upstream_unavailable",
            message: error instanceof Error ? error.message : "Unknown error",
          },
          {
            status: 502,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Cache-Control": "no-store",
            },
          },
        );
      }
    }

    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404 || url.pathname.includes(".")) {
      return response;
    }

    return env.ASSETS.fetch(new Request(new URL("/index.html", request.url), request));
  },
};
