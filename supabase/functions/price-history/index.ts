import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const IDS: Record<string, string> = { stx: "blockstack", btc: "bitcoin" };
const cache = new Map<string, { at: number; payload: unknown }>();
const TTL = 5 * 60 * 1000;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const asset = (url.searchParams.get("asset") || "stx").toLowerCase();
    const days = Math.min(365, Math.max(1, Number(url.searchParams.get("days") || 7)));
    const coin = IDS[asset];
    if (!coin) {
      return new Response(JSON.stringify({ success: false, error: "Unsupported asset" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const key = `${asset}:${days}`;
    const hit = cache.get(key);
    if (hit && Date.now() - hit.at < TTL) {
      return new Response(JSON.stringify(hit.payload), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=${days}${days > 1 ? "&interval=hourly" : ""}`,
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) throw new Error(`CoinGecko error ${res.status}`);
    const json = await res.json();

    const points = (json.prices || []).map((p: [number, number]) => ({ t: p[0], price: p[1] }));
    if (!points.length) throw new Error("No price data returned");

    const first = points[0].price;
    const last = points[points.length - 1].price;

    // Reference = price ~24h before the latest point (previous day close)
    const dayAgoTs = points[points.length - 1].t - 24 * 3600 * 1000;
    let prevDay = first;
    for (const p of points) {
      if (p.t <= dayAgoTs) prevDay = p.price;
      else break;
    }

    const payload = {
      success: true,
      asset,
      days,
      points,
      first,
      last,
      prevDayPrice: prevDay,
      changePct: prevDay ? ((last - prevDay) / prevDay) * 100 : 0,
      rangeChangePct: first ? ((last - first) / first) * 100 : 0,
      updatedAt: new Date().toISOString(),
    };

    cache.set(key, { at: Date.now(), payload });

    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("price-history error:", e);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to load price history. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
