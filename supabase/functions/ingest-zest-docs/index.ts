import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DOCS_URL = "https://docs.zestprotocol.com/llms-full.txt";
const SYSTEM_USER_ID = "00000000-0000-0000-0000-000000000001";
const MAX_CHARS = 14000;

type Group = {
  topic: string;
  sections: number[]; // 1-based indexes into the split doc sections
  category: string;
  link_url: string;
  tags: string[];
};

const GROUPS: Group[] = [
  {
    topic: "Zest Protocol: Bitcoin Lending Overview",
    sections: [1],
    category: "defi",
    link_url: "https://docs.zestprotocol.com/start/what-is-zest-protocol",
    tags: ["zest", "bitcoin", "lending", "defi"],
  },
  {
    topic: "Zest Bitcoin Collateral Vaults: Concept & Design",
    sections: [2],
    category: "defi",
    link_url:
      "https://docs.zestprotocol.com/start/bitcoin-collateral-vaults/introducing-bitcoin-collateral-vaults",
    tags: ["zest", "bitvm", "collateral", "btc", "vaults"],
  },
  {
    topic: "Zest Bitcoin Collateral Vaults: Path to Mainnet",
    sections: [3],
    category: "defi",
    link_url:
      "https://docs.zestprotocol.com/start/bitcoin-collateral-vaults/how-zest-protocol-brings-bitcoin-collateral-vaults-to-mainnet",
    tags: ["zest", "bitvm", "mainnet", "collateral", "btc"],
  },
  {
    topic: "Zest Stacks Market V2: Overview, Earning & Borrowing",
    sections: [4, 5, 6],
    category: "defi",
    link_url: "https://docs.zestprotocol.com/start/borrow/introducing-stacks-market-v2",
    tags: ["zest", "stacks-market", "borrow", "yield", "sbtc"],
  },
  {
    topic: "Zest Stacks Market V2: Risk Groups & Risk Parameters",
    sections: [7, 8, 9],
    category: "defi",
    link_url: "https://docs.zestprotocol.com/start/borrow/v2-market-design/risk-groups",
    tags: ["zest", "risk", "ltv", "market-design"],
  },
  {
    topic: "Zest Stacks Market V2: Liquidations",
    sections: [10, 11, 12],
    category: "defi",
    link_url: "https://docs.zestprotocol.com/start/borrow/v2-market-design/liquidations",
    tags: ["zest", "liquidations", "health-factor", "risk"],
  },
  {
    topic: "Zest Stacks Market V2: Oracles & Interest Rate Mechanism",
    sections: [13, 14],
    category: "defi",
    link_url: "https://docs.zestprotocol.com/start/borrow/v2-market-design/oracles",
    tags: ["zest", "oracles", "interest-rates", "pyth"],
  },
  {
    topic: "Zest Stacks Market V2: Protocol Deep Dive & V1 to V2 Migration",
    sections: [15, 16],
    category: "defi",
    link_url: "https://docs.zestprotocol.com/start/borrow/v2-market-design/protocol-deep-dive",
    tags: ["zest", "protocol", "migration", "v2"],
  },
  {
    topic: "Zest Stacks Market V2: Smart Contracts (Market, Vaults, DAO)",
    sections: [18, 19, 20, 21, 22, 23, 24, 26, 27, 28, 29],
    category: "clarity",
    link_url:
      "https://docs.zestprotocol.com/start/stacks-market-smart-contracts/v2-contracts",
    tags: ["zest", "clarity", "contracts", "dao", "vaults"],
  },
  {
    topic: "Zest Stacks Market: Audits & Error Codes",
    sections: [30, 31],
    category: "security",
    link_url: "https://docs.zestprotocol.com/start/stacks-market-smart-contracts/audits",
    tags: ["zest", "audits", "security", "error-codes"],
  },
  {
    topic: "Zest Stacks Swap: Overview, How to Swap & Supported DEXes",
    sections: [32, 33, 34],
    category: "defi",
    link_url: "https://docs.zestprotocol.com/start/stacks-swap/introducing-stacks-swap",
    tags: ["zest", "swap", "dex", "aggregator"],
  },
  {
    topic: "Zest Stacks Swap: Fees, Price Protection & FAQ",
    sections: [35, 36],
    category: "defi",
    link_url: "https://docs.zestprotocol.com/start/stacks-swap/fees-and-price-protection",
    tags: ["zest", "swap", "fees", "slippage"],
  },
  {
    topic: "Zest Stacks Swap: Contracts, Audits & Error Codes",
    sections: [37, 38, 39],
    category: "clarity",
    link_url: "https://docs.zestprotocol.com/start/stacks-swap-smart-contracts/contracts",
    tags: ["zest", "swap", "contracts", "audits"],
  },
  {
    topic: "Zest Stacks Vaults: Automated Yield Strategies",
    sections: [40],
    category: "defi",
    link_url: "https://docs.zestprotocol.com/start/stacks-vaults/introducing-stacks-vaults",
    tags: ["zest", "vaults", "yield", "strategies"],
  },
  {
    topic: "ZEST Token: Utility, Distribution, Airdrop & Bridging",
    sections: [41, 42, 43, 44],
    category: "defi",
    link_url: "https://docs.zestprotocol.com/start/zest-token/zest",
    tags: ["zest", "token", "airdrop", "tokenomics", "bridge"],
  },
  {
    topic: "Zest Stacks Market V1: Legacy User Guide & Protocol Design",
    sections: [45, 46, 47, 48, 49, 50, 51, 52],
    category: "defi",
    link_url: "https://docs.zestprotocol.com/start/borrow-1/stacks-market-v1-user-guide",
    tags: ["zest", "v1", "legacy", "borrow", "e-mode"],
  },
  {
    topic: "Zest Stacks Market V1: Smart Contracts Overview",
    sections: [53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63],
    category: "clarity",
    link_url:
      "https://docs.zestprotocol.com/start/borrow-1/stacks-market-v1-smart-contracts-overview",
    tags: ["zest", "v1", "contracts", "clarity"],
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const res = await fetch(DOCS_URL);
    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch docs [${res.status}]` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const raw = await res.text();
    const sections = raw.split(/^# /m).slice(1);

    await supabase.from("profiles").upsert(
      { user_id: SYSTEM_USER_ID, username: "smentor-system", display_name: "SMentor System" },
      { onConflict: "user_id", ignoreDuplicates: true },
    );

    const results: { topic: string; status: string; chars: number }[] = [];

    for (const g of GROUPS) {
      const body = g.sections
        .map((i) => sections[i - 1])
        .filter(Boolean)
        .map((s) => "## " + s.trim())
        .join("\n\n");

      if (!body) {
        results.push({ topic: g.topic, status: "no content", chars: 0 });
        continue;
      }

      let content =
        `# ${g.topic}\n\n*Source: Zest Protocol official documentation (${g.link_url})*\n\n` +
        body;
      if (content.length > MAX_CHARS) {
        content =
          content.slice(0, MAX_CHARS).replace(/\n[^\n]*$/, "") +
          `\n\n…(truncated — full docs: ${g.link_url})`;
      }

      const { data: existing } = await supabase
        .from("knowledge_base")
        .select("id")
        .eq("link_url", g.link_url)
        .maybeSingle();

      const payload = {
        user_id: SYSTEM_USER_ID,
        topic: g.topic,
        category: g.category,
        content,
        link_url: g.link_url,
        tags: g.tags,
        approved: true,
        upvotes: 12,
      };

      const { error } = existing
        ? await supabase.from("knowledge_base").update(payload).eq("id", existing.id)
        : await supabase.from("knowledge_base").insert(payload);

      if (error) {
        console.error(`DB error for ${g.topic}:`, error.message);
        results.push({ topic: g.topic, status: `error: ${error.message}`, chars: content.length });
      } else {
        results.push({
          topic: g.topic,
          status: existing ? "updated" : "inserted",
          chars: content.length,
        });
      }
    }

    return new Response(JSON.stringify({ total: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("ingest-zest-docs error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
