import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Map dapp name → topic pillar
const TOPIC_MAP: Record<string, string> = {
  "ALEX": "defi",
  "Arkadiko": "defi",
  "Bitflow": "defi",
  "Brotocol": "defi",
  "Charisma": "defi",
  "FastPool": "stacking",
  "Granite": "defi",
  "Hermetica": "defi",
  "Moonlabs": "defi",
  "STX City": "defi",
  "Velar": "defi",
  "Zest Protocol": "defi",
  "Gamma": "nft",
  "BNS Market": "nft",
  "Boom": "nft",
  "Tradeport": "nft",
  "Asigna": "wallets",
  "Leather": "wallets",
  "Ryder": "wallets",
  "Xverse": "wallets",
  "Hiro": "architecture",
  "Indexer": "architecture",
  "BlockSurvey": "tools",
  "BoostX": "tools",
  "BNS One": "tools",
  "LunarCrush": "tools",
  "STX Tools": "tools",
  "STX Watch": "tools",
  "STX20": "tools",
  "Stacks Mentor AI": "tools",
  "Chess on Chain": "tools",
  "Deorganized": "tools",
  "FAK": "tools",
  "Sigle": "tools",
  "Stone Zone": "tools",
  "Zero Authority DAO": "tools",
  "Skullcoin": "tools",
};

const SPONSORS = [
  { name: "ALEX", url: "https://alex.io", category: "defi" },
  { name: "Arkadiko", url: "https://arkadiko.finance", category: "defi" },
  { name: "Bitflow", url: "https://app.bitflow.finance", category: "defi" },
  { name: "Brotocol", url: "https://brotocol.xyz", category: "defi" },
  { name: "Charisma", url: "https://charisma.rocks", category: "defi" },
  { name: "FastPool", url: "https://fastpool.org", category: "defi" },
  { name: "Granite", url: "https://granite.world", category: "defi" },
  { name: "Hermetica", url: "https://hermetica.fi", category: "defi" },
  { name: "Moonlabs", url: "https://moonlabs.fun", category: "defi" },
  { name: "STX City", url: "https://stx.city", category: "defi" },
  { name: "Velar", url: "https://velar.com", category: "defi" },
  { name: "Zest Protocol", url: "https://zestprotocol.com", category: "defi" },
  { name: "Gamma", url: "https://gamma.io", category: "nft" },
  { name: "BNS Market", url: "https://bns.market", category: "nft" },
  { name: "Boom", url: "https://boom.money", category: "nft" },
  { name: "Tradeport", url: "https://tradeport.xyz", category: "nft" },
  { name: "Asigna", url: "https://asigna.io", category: "wallets" },
  { name: "Leather", url: "https://leather.io", category: "wallets" },
  { name: "Ryder", url: "https://ryder.id", category: "wallets" },
  { name: "Xverse", url: "https://xverse.app", category: "wallets" },
  { name: "Hiro", url: "https://hiro.so", category: "tools" },
  { name: "Indexer", url: "https://indexer.xyz", category: "tools" },
  { name: "BlockSurvey", url: "https://blocksurvey.io", category: "tools" },
  { name: "BoostX", url: "https://boostx.cc", category: "tools" },
  { name: "BNS One", url: "https://bns.one", category: "tools" },
  { name: "LunarCrush", url: "https://lunarcrush.com", category: "tools" },
  { name: "STX Tools", url: "https://stxtools.io", category: "tools" },
  { name: "STX Watch", url: "https://stxwatch.io", category: "tools" },
  { name: "STX20", url: "https://stx20.com", category: "tools" },
  { name: "Sigle", url: "https://sigle.io", category: "tools" },
  { name: "Deorganized", url: "https://deorganized.media", category: "tools" },
  { name: "Chess on Chain", url: "https://chessonchain.io", category: "tools" },
  { name: "Zero Authority DAO", url: "https://zeroauthoritydao.com", category: "tools" },
];

async function scrapeUrl(url: string, firecrawlKey: string): Promise<string | null> {
  try {
    const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${firecrawlKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
        onlyMainContent: true,
      }),
    });

    if (!res.ok) {
      console.error(`Firecrawl error for ${url}: ${res.status}`);
      return null;
    }

    const data = await res.json();
    // v1 API nests content inside data
    const markdown: string = data?.data?.markdown ?? data?.markdown ?? "";
    if (!markdown || markdown.trim().length < 100) return null;

    // Truncate to 4000 chars to keep DB entries concise
    return markdown.slice(0, 4000).trim();
  } catch (err) {
    console.error(`Scrape failed for ${url}:`, err);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!firecrawlKey) {
      return new Response(
        JSON.stringify({ error: "FIRECRAWL_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Use a fixed system user ID for seeded content
    // We'll use a sentinel UUID that won't clash with real users
    const SYSTEM_USER_ID = "00000000-0000-0000-0000-000000000001";

    // Check if system profile exists, create if not
    await supabase.from("profiles").upsert(
      { user_id: SYSTEM_USER_ID, username: "smentor-system", display_name: "SMentor System" },
      { onConflict: "user_id", ignoreDuplicates: true }
    );

    const results: { name: string; status: string; chars?: number }[] = [];
    let inserted = 0;
    let skipped = 0;
    let failed = 0;

    // Process sponsors in small batches to avoid timeouts
    for (const sponsor of SPONSORS) {
      // Check if entry already exists
      const { data: existing } = await supabase
        .from("knowledge_base")
        .select("id")
        .eq("link_url", sponsor.url)
        .maybeSingle();

      if (existing) {
        skipped++;
        results.push({ name: sponsor.name, status: "skipped (already exists)" });
        continue;
      }

      console.log(`Scraping ${sponsor.name} — ${sponsor.url}`);
      const markdown = await scrapeUrl(sponsor.url, firecrawlKey);

      if (!markdown) {
        failed++;
        results.push({ name: sponsor.name, status: "failed to scrape" });
        continue;
      }

      const topic = TOPIC_MAP[sponsor.name] ?? "tools";

      const content = `## ${sponsor.name}\n\n**Website:** ${sponsor.url}\n**Category:** ${sponsor.category}\n\n${markdown}`;

      const { error } = await supabase.from("knowledge_base").insert({
        user_id: SYSTEM_USER_ID,
        topic,
        category: sponsor.category,
        content,
        link_url: sponsor.url,
        approved: true,
        upvotes: 5,
      });

      if (error) {
        console.error(`DB insert error for ${sponsor.name}:`, error.message);
        failed++;
        results.push({ name: sponsor.name, status: `db error: ${error.message}` });
      } else {
        inserted++;
        results.push({ name: sponsor.name, status: "inserted", chars: content.length });
      }

      // Small delay to be polite to Firecrawl
      await new Promise((r) => setTimeout(r, 500));
    }

    return new Response(
      JSON.stringify({ inserted, skipped, failed, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("ingest-sponsors error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
