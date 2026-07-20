interface Env {
  STATIONS_KV: KVNamespace;
  STATIONS_KV_KEY?: string;
}

const DEFAULT_KV_KEY = "stations.json";

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    const key = env.STATIONS_KV_KEY || DEFAULT_KV_KEY;
    const raw = await env.STATIONS_KV.get(key);

    if (!raw) {
      return new Response(
        JSON.stringify({ error: `Station data not found for key "${key}" in Cloudflare KV.` }),
        { status: 404, headers: { "Content-Type": "application/json; charset=utf-8" } }
      );
    }

    return new Response(raw, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=60, s-maxage=300",
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Unable to load station data from Cloudflare KV." }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }
};
