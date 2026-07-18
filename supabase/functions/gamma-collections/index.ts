// Fetches real collection metadata (name, image, floor, url) from stacks.gamma.io
// by parsing each collection page's og:image and embedded JSON.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

interface CollectionOut {
  slug: string;
  name: string;
  image: string;
  floor: string;
  url: string;
  category: string;
  tags: string[];
}

// Curated slugs — kept in sync with known live Stacks NFT collections on Gamma.
// Tags power the client-side search / filter.
const DEFAULT_SLUGS: { slug: string; category: string; tags: string[] }[] = [
  { slug: "the-guests", category: "Collectibles", tags: ["pfp", "blue-chip", "art"] },
  { slug: "megapont-ape-club", category: "Collectibles", tags: ["pfp", "apes", "blue-chip"] },
  { slug: "bitcoin-monkeys", category: "Collectibles", tags: ["pfp", "og", "blue-chip"] },
  { slug: "crashpunks-v2", category: "Collectibles", tags: ["pfp", "punks", "og"] },
  { slug: "satoshibles", category: "Collectibles", tags: ["pfp", "blue-chip", "og"] },
  { slug: "stacks-parrots", category: "Collectibles", tags: ["pfp", "animals"] },
  { slug: "galactic-geckos", category: "Gaming", tags: ["pfp", "gaming", "utility"] },
  { slug: "bitcoin-wizards", category: "Collectibles", tags: ["pfp", "wizards", "lore"] },
  { slug: "nakamoto-punks", category: "Collectibles", tags: ["pfp", "punks", "nakamoto"] },
  { slug: "bns", category: "Utility", tags: ["names", "utility", "bns", "domains"] },
  { slug: "megapont-robot-factory", category: "Collectibles", tags: ["pfp", "robots"] },
  { slug: "the-explorer-guild", category: "Collectibles", tags: ["pfp", "utility"] },
  { slug: "bitcoin-birds", category: "Collectibles", tags: ["pfp", "animals"] },
  { slug: "boomboxes", category: "Music", tags: ["music", "audio"] },
  { slug: "project-indigo", category: "Fine Art", tags: ["art", "generative"] },
  { slug: "lil-possums", category: "Collectibles", tags: ["pfp", "animals"] },
  { slug: "the-frens", category: "Collectibles", tags: ["pfp", "community"] },
  { slug: "stacks-punks", category: "Collectibles", tags: ["pfp", "punks", "og"] },
  { slug: "free-punks-v2", category: "Collectibles", tags: ["pfp", "punks", "free-mint"] },
  { slug: "bitcoin-degens", category: "Collectibles", tags: ["pfp", "degen"] },
];

const CACHE_TTL_MS = 30 * 60 * 1000;
const cache = new Map<string, { data: CollectionOut; expires: number }>();

function pretty(slug: string) {
  return slug.split("-").map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
}

async function fetchCollection(
  slug: string,
  category: string,
  tags: string[],
): Promise<CollectionOut | null> {
  const cached = cache.get(slug);
  if (cached && cached.expires > Date.now()) return cached.data;

  const url = `https://stacks.gamma.io/collections/${slug}`;
  try {
    const res = await fetch(url, {
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; SMentorBot/1.0; +https://smentorai.lovable.app)",
        accept: "text/html",
      },
    });
    if (!res.ok) return null;
    const html = await res.text();

    const ogMatch = html.match(/property="og:image"\s+content="([^"]+)"/i);
    let image = ogMatch?.[1] ?? "";
    image = image.replace(
      /https:\/\/images\.gamma\.io\/cdn-cgi\/image\/[^/]+\//,
      "https://images.gamma.io/cdn-cgi/image/quality=80,width=600,height=600/",
    );

    const titleMatch = html.match(/property="og:title"\s+content="([^"]+)"/i);
    const name = (titleMatch?.[1] ?? pretty(slug)).replace(/\s*\|\s*Gamma.*$/, "").trim();

    let floor = "View on Gamma";
    const floorMatch = html.match(/"floor(?:Price)?"\s*:\s*"?([\d.]+)"?/i);
    if (floorMatch) {
      const n = parseFloat(floorMatch[1]);
      if (!isNaN(n) && n > 0) {
        floor = n >= 1000 ? `${(n / 1000).toFixed(1)}K STX` : `${n} STX`;
      }
    }

    if (!image) return null;
    const data: CollectionOut = { slug, name, image, floor, url, category, tags };
    cache.set(slug, { data, expires: Date.now() + CACHE_TTL_MS });
    return data;
  } catch (_e) {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    let slugs = DEFAULT_SLUGS;
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      if (Array.isArray(body?.slugs) && body.slugs.length) {
        slugs = body.slugs
          .filter((s: unknown) => typeof s === "string")
          .map((s: string) => ({ slug: s, category: "Collectibles", tags: [] }));
      }
    }

    const results = await Promise.all(
      slugs.map(({ slug, category, tags }) => fetchCollection(slug, category, tags)),
    );
    const collections = results.filter((c): c is CollectionOut => !!c);

    return new Response(
      JSON.stringify({ collections, fetched_at: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (e) {
    console.error("gamma-collections error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
