import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_USER_ID = "00000000-0000-0000-0000-000000000001";

// Tier-1 Stacks NFT collections with known URLs for guaranteed deep coverage
const KNOWN_COLLECTIONS = [
  { name: "Bitcoin Monkeys", url: "https://gamma.io/collections/bitcoin-monkeys" },
  { name: "Megapont Ape Club", url: "https://gamma.io/collections/megapont-ape-club" },
  { name: "Stacks Parrots", url: "https://gamma.io/collections/stacks-parrots" },
  { name: "Crash Punks", url: "https://gamma.io/collections/crashpunks-v2" },
  { name: "Satoshibles", url: "https://gamma.io/collections/satoshibles" },
  { name: "StacksFrens", url: "https://gamma.io/collections/stacksfreens" },
  { name: "Stacks Punks", url: "https://gamma.io/collections/stacks-punks" },
  { name: "Bitcoin Wizards", url: "https://gamma.io/collections/bitcoin-wizards" },
  { name: "Bored Ape Club Stacks", url: "https://gamma.io/collections/bored-ape-club-stacks" },
  { name: "Space Robots", url: "https://gamma.io/collections/space-robots" },
  { name: "Ordinal Zombies", url: "https://gamma.io/collections/ordinal-zombies" },
  { name: "Stacks Skulls", url: "https://gamma.io/collections/stacks-skulls" },
  { name: "Rawr Bears", url: "https://gamma.io/collections/rawr-bears" },
  { name: "Block Surfers", url: "https://gamma.io/collections/block-surfers" },
  { name: "Stacks Citizens", url: "https://gamma.io/collections/stacks-citizens" },
  { name: "Galactic Geckos", url: "https://gamma.io/collections/galactic-geckos" },
  { name: "Muneeb NFT", url: "https://gamma.io/collections/muneeb-nft" },
  { name: "Stacked Nouns", url: "https://gamma.io/collections/stacked-nouns" },
  { name: "Pixel Cowboys", url: "https://gamma.io/collections/pixel-cowboys" },
  { name: "Stacks Turtles", url: "https://gamma.io/collections/stacks-turtles" },
  { name: "Bitcoin Birds", url: "https://gamma.io/collections/bitcoin-birds" },
  { name: "Stacks Dogs", url: "https://gamma.io/collections/stacks-dogs" },
  { name: "Stack City", url: "https://gamma.io/collections/stack-city" },
  { name: "Stellar Foxes", url: "https://gamma.io/collections/stellar-foxes" },
  { name: "Stacks Wolves", url: "https://gamma.io/collections/stacks-wolves" },
];

// Also scrape Gamma's main discovery pages for broader ecosystem knowledge
const GAMMA_OVERVIEW_PAGES = [
  { name: "Gamma.io NFT Marketplace Overview", url: "https://gamma.io" },
  { name: "Gamma.io Collections Explorer", url: "https://gamma.io/collections" },
  { name: "Gamma.io Launchpad", url: "https://gamma.io/launchpad" },
  { name: "Gamma.io Stacks NFT Blog", url: "https://gamma.io/blog" },
  { name: "Gamma.io About", url: "https://gamma.io/about" },
];

// Core Stacks NFT protocol + ecosystem pages
const NFT_ECOSYSTEM_PAGES = [
  {
    name: "SIP-009 NFT Standard (Stacks)",
    url: "https://github.com/stacksgov/sips/blob/main/sips/sip-009/sip-009-nft-standard.md",
  },
  {
    name: "Stacks NFT Ecosystem Overview",
    url: "https://docs.stacks.co/reference/nfts",
  },
  {
    name: "Clarity NFT Trait Reference",
    url: "https://docs.stacks.co/clarity/reference/nft-trait",
  },
  {
    name: "Tradeport Stacks NFT Marketplace",
    url: "https://tradeport.xyz/stacks",
  },
  {
    name: "Boom NFT Marketplace",
    url: "https://boom.money",
  },
];

async function scrapeUrl(url: string, firecrawlKey: string, maxChars = 7000): Promise<string | null> {
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
        waitFor: 2000,
      }),
    });

    if (!res.ok) {
      console.error(`Firecrawl error for ${url}: ${res.status}`);
      return null;
    }

    const data = await res.json();
    const markdown: string = data?.data?.markdown ?? data?.markdown ?? "";
    if (!markdown || markdown.trim().length < 80) return null;

    return markdown.slice(0, maxChars).trim();
  } catch (err) {
    console.error(`Scrape failed for ${url}:`, err);
    return null;
  }
}

async function mapGammaCollections(firecrawlKey: string): Promise<string[]> {
  try {
    console.log("Mapping gamma.io for collection URLs...");
    const res = await fetch("https://api.firecrawl.dev/v1/map", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${firecrawlKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: "https://gamma.io",
        search: "collections",
        limit: 300,
        includeSubdomains: false,
      }),
    });

    if (!res.ok) {
      console.error(`Map error: ${res.status}`);
      return [];
    }

    const data = await res.json();
    const links: string[] = data?.links ?? [];

    // Filter to only collection-specific pages
    return links.filter(
      (l) =>
        l.includes("gamma.io/collections/") &&
        !l.includes("?") &&
        !l.endsWith("/collections") &&
        l.split("/").length >= 5
    );
  } catch (err) {
    console.error("Map failed:", err);
    return [];
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

    let body: { mode?: string; forceUpdate?: boolean; batchIndex?: number } = {};
    try { body = await req.json(); } catch (_) { /* no body */ }

    const mode = body.mode ?? "overview"; // "overview" | "collections" | "ecosystem" | "all"
    const forceUpdate = body.forceUpdate ?? false;
    const batchIndex = body.batchIndex ?? 0;
    const BATCH_SIZE = 6;

    // Ensure system user profile exists
    await supabase.from("profiles").upsert(
      { user_id: SYSTEM_USER_ID, username: "smentor-system", display_name: "SMentor System" },
      { onConflict: "user_id", ignoreDuplicates: true }
    );

    let pagesToProcess: { name: string; url: string }[] = [];

    if (mode === "overview" || mode === "all") {
      pagesToProcess = [...pagesToProcess, ...GAMMA_OVERVIEW_PAGES];
    }
    if (mode === "ecosystem" || mode === "all") {
      pagesToProcess = [...pagesToProcess, ...NFT_ECOSYSTEM_PAGES];
    }
    if (mode === "collections" || mode === "all") {
      // First try to discover more collections via map
      let discoveredUrls = await mapGammaCollections(firecrawlKey);
      console.log(`Discovered ${discoveredUrls.length} collection URLs via map`);

      // Merge with known collections (deduplicate)
      const knownUrls = new Set(KNOWN_COLLECTIONS.map((c) => c.url));
      const discovered = discoveredUrls
        .filter((u) => !knownUrls.has(u))
        .slice(0, 60) // cap at 60 discovered
        .map((u) => {
          const slug = u.split("/").pop() ?? u;
          return { name: `NFT Collection: ${slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}`, url: u };
        });

      pagesToProcess = [...pagesToProcess, ...KNOWN_COLLECTIONS, ...discovered];
    }

    const batch = pagesToProcess.slice(batchIndex * BATCH_SIZE, (batchIndex + 1) * BATCH_SIZE);
    const totalBatches = Math.ceil(pagesToProcess.length / BATCH_SIZE);

    const results: { name: string; status: string; chars?: number }[] = [];
    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    let failed = 0;

    for (const page of batch) {
      // Check if entry already exists
      const { data: existing } = await supabase
        .from("knowledge_base")
        .select("id")
        .eq("link_url", page.url)
        .maybeSingle();

      if (existing && !forceUpdate) {
        skipped++;
        results.push({ name: page.name, status: "skipped (exists)" });
        continue;
      }

      console.log(`Scraping: ${page.name} — ${page.url}`);
      await new Promise((r) => setTimeout(r, 500));

      const markdown = await scrapeUrl(page.url, firecrawlKey, 8000);

      if (!markdown) {
        failed++;
        results.push({ name: page.name, status: "failed to scrape" });
        continue;
      }

      // Build rich content with Stacks-native context
      const isCollection = page.url.includes("/collections/");
      const collectionSlug = isCollection ? page.url.split("/collections/")[1] : null;

      const content = isCollection
        ? `## Stacks NFT Collection: ${page.name}

**Marketplace:** Gamma.io (https://gamma.io)
**Collection URL:** ${page.url}
**Blockchain:** Stacks (Bitcoin L2)
**NFT Standard:** SIP-009 (Non-Fungible Token Trait)
**Smart Contract Language:** Clarity
**Topic:** nft
**Category:** nft

### About This Collection
${markdown}

### Stacks NFT Technical Context
- All Stacks NFTs implement the SIP-009 NFT trait defined in Clarity smart contracts
- NFT ownership is secured by Bitcoin via Proof of Transfer (PoX) consensus
- Stacks NFTs can include post-conditions to protect buyers from rug pulls
- Contract addresses follow the format: \`SP...<owner>.<contract-name>\`
- NFTs on Stacks are transferable cross-wallet (Xverse, Leather, Asigna)
- Gamma.io supports both fixed-price listings and auctions for Stacks NFTs
- The sBTC upgrade enables Bitcoin-native settlement for NFT trades
`
        : `## ${page.name}

**Source:** ${page.url}
**Topic:** nft
**Category:** nft
**Blockchain:** Stacks (Bitcoin L2)

${markdown}
`;

      if (existing && forceUpdate) {
        const { error } = await supabase
          .from("knowledge_base")
          .update({ content, link_url: page.url, approved: true, upvotes: 12 })
          .eq("id", existing.id);

        if (error) {
          failed++;
          results.push({ name: page.name, status: `db error: ${error.message}` });
        } else {
          updated++;
          results.push({ name: page.name, status: "updated", chars: content.length });
        }
      } else {
        const { error } = await supabase.from("knowledge_base").insert({
          user_id: SYSTEM_USER_ID,
          topic: "nft",
          category: "nft",
          content,
          link_url: page.url,
          approved: true,
          upvotes: 12,
        });

        if (error) {
          failed++;
          results.push({ name: page.name, status: `db error: ${error.message}` });
        } else {
          inserted++;
          results.push({ name: page.name, status: "inserted", chars: content.length });
        }
      }
    }

    return new Response(
      JSON.stringify({
        mode,
        batchIndex,
        totalBatches,
        totalPages: pagesToProcess.length,
        batchSize: batch.length,
        inserted,
        updated,
        skipped,
        failed,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("ingest-gamma-nfts error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
