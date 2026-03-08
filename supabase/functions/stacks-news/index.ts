import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const STACKS_KEYWORDS = [
  "stacks", "stx", "sbtc", "clarity smart contract", "proof of transfer",
  "nakamoto upgrade", "bitcoin l2", "stacking rewards", "stacks blockchain",
  "hiro systems", "leather wallet", "xverse", "stacks defi", "stacks nft",
  "blockstack", "dual stacking", "stacks ecosystem",
];

const BTC_NEWS_KEYWORDS = [
  "bitcoin", "btc", "satoshi", "lightning network", "bitcoin defi",
  "bitcoin layer", "bitcoin smart contract", "bitcoin programmable",
];

function scoreRelevance(title: string, description: string): number {
  const text = `${title} ${description}`.toLowerCase();
  let score = 0;
  for (const kw of STACKS_KEYWORDS) {
    if (text.includes(kw)) score += kw.startsWith("stacks") ? 3 : 2;
  }
  for (const kw of BTC_NEWS_KEYWORDS) {
    if (text.includes(kw)) score += 1;
  }
  return score;
}

function extractTags(title: string, description: string): string[] {
  const text = `${title} ${description}`.toLowerCase();
  const tags: string[] = [];
  if (text.includes("sbtc") || text.includes("s-btc")) tags.push("sBTC");
  if (text.includes("defi") || text.includes("yield") || text.includes("stacking")) tags.push("DeFi");
  if (text.includes("nft") || text.includes("collectible")) tags.push("NFT");
  if (text.includes("clarity") || text.includes("smart contract")) tags.push("Clarity");
  if (text.includes("wallet") || text.includes("xverse") || text.includes("leather")) tags.push("Wallets");
  if (text.includes("security") || text.includes("vulnerability")) tags.push("Security");
  if (text.includes("bitcoin") || text.includes("btc")) tags.push("Bitcoin");
  if (text.includes("upgrade") || text.includes("nakamoto") || text.includes("protocol")) tags.push("Protocol");
  if (text.includes("price") || text.includes("market") || text.includes("rally")) tags.push("Markets");
  return [...new Set(tags)];
}

// ── CryptoCompare news ────────────────────────────────────────────────────────

async function fetchCryptoCompareNews(): Promise<any[]> {
  try {
    // Fetch STX-specific news first
    const [stxRes, btcRes] = await Promise.all([
      fetch(
        "https://min-api.cryptocompare.com/data/v2/news/?categories=STX,Stacks&lang=EN&sortOrder=latest",
        { headers: { "Accept": "application/json" } }
      ),
      fetch(
        "https://min-api.cryptocompare.com/data/v2/news/?categories=BTC&lang=EN&sortOrder=latest",
        { headers: { "Accept": "application/json" } }
      ),
    ]);

    const articles: any[] = [];

    if (stxRes.ok) {
      const stxData = await stxRes.json();
      if (stxData.Data) articles.push(...stxData.Data.slice(0, 15));
    }

    if (btcRes.ok) {
      const btcData = await btcRes.json();
      if (btcData.Data) {
        // Only include BTC articles that mention Stacks-related terms
        const stacksRelated = (btcData.Data as any[]).filter((a: any) => {
          const text = `${a.title} ${a.body}`.toLowerCase();
          return STACKS_KEYWORDS.some((kw) => text.includes(kw));
        });
        articles.push(...stacksRelated.slice(0, 10));
      }
    }

    return articles.map((a: any) => ({
      title: a.title,
      summary: a.body?.slice(0, 400) || "",
      url: a.url,
      source: a.source_info?.name || a.source || "CryptoCompare",
      image_url: a.imageurl || null,
      published_at: new Date(a.published_on * 1000).toISOString(),
      relevance_score: scoreRelevance(a.title, a.body || ""),
      tags: extractTags(a.title, a.body || ""),
    }));
  } catch (err) {
    console.error("CryptoCompare fetch error:", err);
    return [];
  }
}

// ── RSS fallback (CoinDesk / Stacks.co) ──────────────────────────────────────

async function fetchRSSNews(url: string, sourceName: string): Promise<any[]> {
  try {
    const res = await fetch(url, { headers: { "Accept": "application/rss+xml, text/xml" } });
    if (!res.ok) return [];
    const xml = await res.text();

    const items: any[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
      const item = match[1];
      const title = (/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/).exec(item)?.[1] ||
                    (/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/).exec(item)?.[2] || "";
      const link = (/<link>(.*?)<\/link>/).exec(item)?.[1] || "";
      const desc = (/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/).exec(item)?.[1] ||
                   (/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/).exec(item)?.[2] || "";
      const pubDate = (/<pubDate>(.*?)<\/pubDate>/).exec(item)?.[1] || new Date().toISOString();
      const enclosure = (/<enclosure[^>]+url="([^"]+)"/).exec(item)?.[1] || null;

      if (!title || !link) continue;

      const score = scoreRelevance(title, desc);
      if (score === 0) continue; // Skip irrelevant articles from generic feeds

      items.push({
        title: title.trim(),
        summary: desc.replace(/<[^>]+>/g, "").trim().slice(0, 400),
        url: link.trim(),
        source: sourceName,
        image_url: enclosure,
        published_at: new Date(pubDate).toISOString(),
        relevance_score: score,
        tags: extractTags(title, desc),
      });
    }

    return items;
  } catch (err) {
    console.error(`RSS fetch error (${sourceName}):`, err);
    return [];
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const db = createClient(supabaseUrl, serviceKey);

  try {
    const url = new URL(req.url);
    const mode = url.searchParams.get("mode") || "read"; // "read" or "refresh"

    // ── REFRESH MODE: fetch fresh articles and upsert ───────────────────────
    if (mode === "refresh") {
      console.log("Refreshing Stacks news...");

      const [cryptoCompareArticles, coindeskArticles, stacksRSS] = await Promise.all([
        fetchCryptoCompareNews(),
        fetchRSSNews("https://www.coindesk.com/arc/outboundfeeds/rss/", "CoinDesk"),
        fetchRSSNews("https://stacks.org/feed", "Stacks.org"),
      ]);

      const allArticles = [
        ...cryptoCompareArticles,
        ...coindeskArticles,
        ...stacksRSS,
      ].filter((a) => a.relevance_score > 0);

      // Deduplicate by URL
      const seen = new Set<string>();
      const unique = allArticles.filter((a) => {
        if (seen.has(a.url)) return false;
        seen.add(a.url);
        return true;
      });

      // Sort by relevance then recency
      unique.sort((a, b) => b.relevance_score - a.relevance_score || new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

      const top50 = unique.slice(0, 50);

      if (top50.length > 0) {
        const { error } = await db
          .from("stacks_news")
          .upsert(top50, { onConflict: "url", ignoreDuplicates: false });

        if (error) {
          console.error("Upsert error:", error);
          throw error;
        }

        console.log(`Upserted ${top50.length} news articles`);
      }

      return new Response(
        JSON.stringify({ success: true, refreshed: top50.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── READ MODE: return cached articles from DB ────────────────────────────
    const { data, error } = await db
      .from("stacks_news")
      .select("id, title, summary, url, source, image_url, published_at, relevance_score, tags")
      .order("published_at", { ascending: false })
      .limit(30);

    if (error) throw error;

    // If DB is empty, trigger a background refresh and return empty
    if (!data || data.length === 0) {
      // Fire-and-forget refresh
      fetch(`${supabaseUrl}/functions/v1/stacks-news?mode=refresh`, {
        headers: { Authorization: `Bearer ${serviceKey}` },
      }).catch(() => {});

      return new Response(
        JSON.stringify({ success: true, articles: [], refreshing: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, articles: data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("stacks-news error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
