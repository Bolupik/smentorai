import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DOCS_URL = "https://docs.stackingdao.com/stackingdao/llms-full.txt";
const SYSTEM_USER_ID = "00000000-0000-0000-0000-000000000001";
const MAX_CHARS = 14000;

type Group = {
  topic: string;
  sections: number[]; // 1-based indexes into the split doc sections (English part)
  category: string;
  link_url: string;
  tags: string[];
};

const GROUPS: Group[] = [
  {
    topic: "Stacking DAO: Overview & Why Liquid Stacking Matters",
    sections: [1, 2],
    category: "defi",
    link_url: "https://docs.stackingdao.com/stackingdao",
    tags: ["stackingdao", "liquid-staking", "stx", "stacking", "defi"],
  },
  {
    topic: "Stacking DAO: Instant & Daily Yield and the Points Program",
    sections: [3, 4],
    category: "defi",
    link_url: "https://docs.stackingdao.com/stackingdao/instant-and-daily-yield",
    tags: ["stackingdao", "yield", "points", "rewards"],
  },
  {
    topic: "stSTX: Liquid Staking with STX Rewards (Deposit, Switch, Withdraw)",
    sections: [5, 6, 7, 8],
    category: "defi",
    link_url: "https://docs.stackingdao.com/stackingdao/ststx",
    tags: ["stackingdao", "ststx", "liquid-staking", "withdrawals", "stx"],
  },
  {
    topic: "stSTXbtc: Liquid Staking with BTC Rewards (Deposit, Switch, Withdraw)",
    sections: [9, 10, 11, 12],
    category: "defi",
    link_url: "https://docs.stackingdao.com/stackingdao/ststxbtc",
    tags: ["stackingdao", "ststxbtc", "bitcoin", "yield", "pox"],
  },
  {
    topic: "stBTC: Liquid BTC Staking with BTC Rewards",
    sections: [13],
    category: "defi",
    link_url: "https://docs.stackingdao.com/stackingdao/stbtc",
    tags: ["stackingdao", "stbtc", "sbtc", "bitcoin", "yield"],
  },
  {
    topic: "Stacking DAO Native Staking with BTC Yield: Deposits & Withdrawals",
    sections: [14, 15, 16, 17],
    category: "stacks",
    link_url: "https://docs.stackingdao.com/stackingdao/native-staking",
    tags: ["stackingdao", "native-staking", "pox", "btc-yield", "stx"],
  },
  {
    topic: "Stacking DAO Signers: Delegations, Analytics & Onboarding",
    sections: [18, 20],
    category: "stacks",
    link_url: "https://docs.stackingdao.com/stackingdao/signer-delegations-and-analytics",
    tags: ["stackingdao", "signers", "delegation", "analytics", "nakamoto"],
  },
  {
    topic: "Stacking DAO: Risks & Frequently Asked Questions",
    sections: [19],
    category: "security",
    link_url: "https://docs.stackingdao.com/stackingdao/frequently-asked-questions",
    tags: ["stackingdao", "faq", "risk", "unstacking"],
  },
  {
    topic: "Stacking DAO Smart Contracts: stSTX, stSTXbtc, stBTC Core & Switching",
    sections: [21, 22, 23, 24],
    category: "clarity",
    link_url: "https://docs.stackingdao.com/stackingdao/ststx-stacking-dao-core",
    tags: ["stackingdao", "clarity", "contracts", "core", "switch"],
  },
  {
    topic: "Stacking DAO: Audits, Security, Essential Links & Restrictions",
    sections: [25, 26, 27, 28],
    category: "security",
    link_url: "https://docs.stackingdao.com/stackingdao/audits-and-security",
    tags: ["stackingdao", "audits", "security", "links", "disclaimer"],
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
        `# ${g.topic}\n\n*Source: Stacking DAO official documentation (${g.link_url})*\n\n` +
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
    console.error("ingest-stackingdao-docs error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
