interface Env {
  STATIONS_KV: KVNamespace;
  STATIONS_KV_KEY?: string;
}

const DEFAULT_KV_KEY = "stations.json";
const CACHE_CONTROL = "public, max-age=60, s-maxage=300";

const corsHeaders = {
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonResponse(body: unknown, status = 200, extraHeaders: HeadersInit = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders,
      ...extraHeaders,
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin");
    const allowOrigin = origin ?? "*";

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          ...corsHeaders,
          "Access-Control-Allow-Origin": allowOrigin,
        },
      });
    }

    if (request.method !== "GET") {
      return jsonResponse({ error: "Method not allowed." }, 405, {
        "Access-Control-Allow-Origin": allowOrigin,
      });
    }

    try {
      const key = env.STATIONS_KV_KEY?.trim() || DEFAULT_KV_KEY;
      const raw = await env.STATIONS_KV.get(key);

      if (!raw) {
        return jsonResponse({ error: `Station data not found for key "${key}" in Cloudflare KV.` }, 404, {
          "Access-Control-Allow-Origin": allowOrigin,
        });
      }

      return new Response(raw, {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": CACHE_CONTROL,
          ...corsHeaders,
          "Access-Control-Allow-Origin": allowOrigin,
        },
      });
    } catch (error) {
      console.error("Failed to read station data from Cloudflare KV:", error);
      return jsonResponse({ error: "Unable to load station data from Cloudflare KV." }, 500, {
        "Access-Control-Allow-Origin": allowOrigin,
      });
    }
  },
};
