import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_USER_ID = "00000000-0000-0000-0000-000000000001";

// All pages to process — Gamma overview + NFT ecosystem docs + individual collections
const ALL_PAGES: { name: string; url: string; type: "overview" | "ecosystem" | "collection" }[] = [
  // --- Gamma platform overview pages ---
  { name: "Gamma.io NFT Marketplace Overview", url: "https://gamma.io", type: "overview" },
  { name: "Gamma.io Collections Explorer", url: "https://gamma.io/collections", type: "overview" },
  { name: "Gamma.io Launchpad", url: "https://gamma.io/launchpad", type: "overview" },
  { name: "Gamma.io Blog", url: "https://gamma.io/blog", type: "overview" },

  // --- NFT protocol & ecosystem docs ---
  { name: "SIP-009 Non-Fungible Token Standard", url: "https://github.com/stacksgov/sips/blob/main/sips/sip-009/sip-009-nft-standard.md", type: "ecosystem" },
  { name: "Stacks NFT Docs (docs.stacks.co)", url: "https://docs.stacks.co/reference/nfts", type: "ecosystem" },
  { name: "Clarity NFT Trait Reference", url: "https://docs.stacks.co/clarity/reference/nft-trait", type: "ecosystem" },
  { name: "Tradeport Stacks NFT Marketplace", url: "https://tradeport.xyz/stacks", type: "ecosystem" },
  { name: "Boom.money NFT Marketplace", url: "https://boom.money", type: "ecosystem" },
  { name: "BNS.market Bitcoin Name Service Marketplace", url: "https://bns.market", type: "ecosystem" },

  // --- Individual Stacks NFT collections on Gamma ---
  { name: "Bitcoin Monkeys", url: "https://gamma.io/collections/bitcoin-monkeys", type: "collection" },
  { name: "Megapont Ape Club", url: "https://gamma.io/collections/megapont-ape-club", type: "collection" },
  { name: "Stacks Parrots", url: "https://gamma.io/collections/stacks-parrots", type: "collection" },
  { name: "Crash Punks", url: "https://gamma.io/collections/crashpunks-v2", type: "collection" },
  { name: "Satoshibles", url: "https://gamma.io/collections/satoshibles", type: "collection" },
  { name: "StacksFrens", url: "https://gamma.io/collections/stacksfreens", type: "collection" },
  { name: "Stacks Punks", url: "https://gamma.io/collections/stacks-punks", type: "collection" },
  { name: "Bitcoin Wizards", url: "https://gamma.io/collections/bitcoin-wizards", type: "collection" },
  { name: "Space Robots", url: "https://gamma.io/collections/space-robots", type: "collection" },
  { name: "Ordinal Zombies", url: "https://gamma.io/collections/ordinal-zombies", type: "collection" },
  { name: "Stacks Skulls", url: "https://gamma.io/collections/stacks-skulls", type: "collection" },
  { name: "Rawr Bears", url: "https://gamma.io/collections/rawr-bears", type: "collection" },
  { name: "Block Surfers", url: "https://gamma.io/collections/block-surfers", type: "collection" },
  { name: "Galactic Geckos", url: "https://gamma.io/collections/galactic-geckos", type: "collection" },
  { name: "Stacked Nouns", url: "https://gamma.io/collections/stacked-nouns", type: "collection" },
  { name: "Pixel Cowboys", url: "https://gamma.io/collections/pixel-cowboys", type: "collection" },
  { name: "Bitcoin Birds", url: "https://gamma.io/collections/bitcoin-birds", type: "collection" },
  { name: "Stacks Dogs", url: "https://gamma.io/collections/stacks-dogs", type: "collection" },
  { name: "Stellar Foxes", url: "https://gamma.io/collections/stellar-foxes", type: "collection" },
  { name: "Stacks Wolves", url: "https://gamma.io/collections/stacks-wolves", type: "collection" },
  { name: "Stacks Citizens", url: "https://gamma.io/collections/stacks-citizens", type: "collection" },
  { name: "Stack City", url: "https://gamma.io/collections/stack-city", type: "collection" },
  { name: "Stacks Turtles", url: "https://gamma.io/collections/stacks-turtles", type: "collection" },
  { name: "Muneeb NFT", url: "https://gamma.io/collections/muneeb-nft", type: "collection" },
  { name: "BNS Names Collection", url: "https://gamma.io/collections/bns", type: "collection" },
  { name: "Stacks Punks V2", url: "https://gamma.io/collections/stacks-punks-v2", type: "collection" },
  { name: "Stacks Space Penguins", url: "https://gamma.io/collections/stacks-space-penguins", type: "collection" },
  { name: "Boom NFTs", url: "https://gamma.io/collections/boom-nfts", type: "collection" },
  { name: "Lil Crashpunks", url: "https://gamma.io/collections/lil-crashpunks", type: "collection" },
  { name: "Bitcoin Deer", url: "https://gamma.io/collections/bitcoin-deer", type: "collection" },
  { name: "StacksCity Genesis", url: "https://gamma.io/collections/stackscity-genesis", type: "collection" },
  { name: "Mega NFT", url: "https://gamma.io/collections/mega-nft", type: "collection" },
  { name: "Stacks Cats", url: "https://gamma.io/collections/stacks-cats", type: "collection" },
  { name: "Stacks Aliens", url: "https://gamma.io/collections/stacks-aliens", type: "collection" },
  { name: "Bitcoin Penguins", url: "https://gamma.io/collections/bitcoin-penguins", type: "collection" },
  { name: "Nakamoto Punks", url: "https://gamma.io/collections/nakamoto-punks", type: "collection" },
  { name: "Stacks Legends", url: "https://gamma.io/collections/stacks-legends", type: "collection" },
  { name: "sBTC NFT Collection", url: "https://gamma.io/collections/sbtc-nft", type: "collection" },
  { name: "Proof of Work NFT", url: "https://gamma.io/collections/proof-of-work-nft", type: "collection" },
  { name: "Stacks Robots", url: "https://gamma.io/collections/stacks-robots", type: "collection" },
  { name: "Charisma NFT", url: "https://gamma.io/collections/charisma-nft", type: "collection" },
  { name: "ALEX NFT", url: "https://gamma.io/collections/alex-nft", type: "collection" },
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
        waitFor: 2000,
      }),
    });

    if (!res.ok) {
      console.error(`Firecrawl error for ${url}: ${res.status}`);
      return null;
    }

    const data = await res.json();
    const markdown: string = data?.data?.markdown ?? data?.markdown ?? "";
    if (!markdown || markdown.trim().length < 60) return null;
    return markdown.slice(0, 8000).trim();
  } catch (err) {
    console.error(`Scrape failed for ${url}:`, err);
    return null;
  }
}

function buildContent(page: { name: string; url: string; type: string }, markdown: string): string {
  if (page.type === "collection") {
    return `## Stacks NFT Collection: ${page.name}

**Marketplace:** Gamma.io
**Collection URL:** ${page.url}
**Blockchain:** Stacks (Bitcoin L2)
**NFT Standard:** SIP-009
**Smart Contract Language:** Clarity
**Topic:** nft
**Category:** nft

### Collection Details
${markdown}

### Stacks NFT Technical Context
- Implements the SIP-009 Non-Fungible Token trait in Clarity
- Ownership secured by Bitcoin via Proof of Transfer (PoX)
- Post-conditions prevent rug pulls during transfers
- Contract format: \`SP...<owner>.<contract-name>\`
- Compatible with Xverse, Leather, and Asigna wallets
- Tradeable on Gamma.io, Tradeport, and Boom marketplaces
- The Nakamoto upgrade enables 5-second block times for faster NFT settlement
`;
  }

  if (page.type === "ecosystem") {
    return `## Stacks NFT Ecosystem: ${page.name}

**Source:** ${page.url}
**Topic:** nft
**Category:** nft
**Blockchain:** Stacks (Bitcoin L2)

${markdown}
`;
  }

  // overview
  return `## ${page.name}

**Source:** ${page.url}
**Topic:** nft
**Category:** nft

${markdown}
`;
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

    let batchIndex = 0;
    let forceUpdate = false;
    try {
      const body = await req.json();
      if (typeof body?.batchIndex === "number") batchIndex = body.batchIndex;
      if (typeof body?.forceUpdate === "boolean") forceUpdate = body.forceUpdate;
    } catch (_) { /* no body */ }

    const BATCH_SIZE = 5;
    const totalBatches = Math.ceil(ALL_PAGES.length / BATCH_SIZE);
    const batch = ALL_PAGES.slice(batchIndex * BATCH_SIZE, (batchIndex + 1) * BATCH_SIZE);

    // Ensure system user exists
    await supabase.from("profiles").upsert(
      { user_id: SYSTEM_USER_ID, username: "smentor-system", display_name: "SMentor System" },
      { onConflict: "user_id", ignoreDuplicates: true }
    );

    const results: { name: string; status: string; chars?: number }[] = [];
    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    let failed = 0;

    for (const page of batch) {
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

      console.log(`Scraping: ${page.name}`);
      await new Promise((r) => setTimeout(r, 400));

      const markdown = await scrapeUrl(page.url, firecrawlKey);

      if (!markdown) {
        // For collections that 404 or return no content, still insert a skeleton entry
        // so the AI knows it exists on Stacks
        if (page.type === "collection") {
          const skeletonContent = buildContent(page, `_Live data unavailable at scrape time. This is a Stacks NFT collection available on Gamma.io. All Stacks NFTs implement SIP-009 in Clarity smart contracts and are secured by Bitcoin via Proof of Transfer._`);
          const { error } = await supabase.from("knowledge_base").insert({
            user_id: SYSTEM_USER_ID,
            topic: "nft",
            category: "nft",
            content: skeletonContent,
            link_url: page.url,
            approved: true,
            upvotes: 5,
          });
          if (!error) {
            inserted++;
            results.push({ name: page.name, status: "inserted (skeleton)", chars: skeletonContent.length });
          } else {
            failed++;
            results.push({ name: page.name, status: `db error: ${error.message}` });
          }
          continue;
        }
        failed++;
        results.push({ name: page.name, status: "failed to scrape" });
        continue;
      }

      const content = buildContent(page, markdown);

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
        batchIndex,
        totalBatches,
        totalPages: ALL_PAGES.length,
        batchSize: batch.length,
        inserted,
        updated,
        skipped,
        failed,
        results,
        nextBatch: batchIndex + 1 < totalBatches ? batchIndex + 1 : null,
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
