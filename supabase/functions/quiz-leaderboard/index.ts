import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const date = url.searchParams.get("date") ?? new Date().toISOString().split("T")[0];

    // Fetch today's results ordered by score desc, then fastest completion
    const { data: results, error } = await supabase
      .from("daily_quiz_results")
      .select("user_id, score, total, completed_at")
      .eq("quiz_date", date)
      .order("score", { ascending: false })
      .order("completed_at", { ascending: true })
      .limit(20);

    if (error) throw error;
    if (!results || results.length === 0) {
      return new Response(JSON.stringify({ leaderboard: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch profile info for these users
    const userIds = [...new Set(results.map((r) => r.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, username, avatar_url")
      .in("user_id", userIds);

    const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) ?? []);

    const leaderboard = results.map((r, i) => {
      const profile = profileMap.get(r.user_id);
      const name =
        profile?.display_name ||
        profile?.username ||
        `User ${r.user_id.slice(0, 6)}`;
      return {
        rank: i + 1,
        user_id: r.user_id,
        name,
        avatar_url: profile?.avatar_url ?? null,
        score: r.score,
        total: r.total,
        pct: Math.round((r.score / (r.total || 15)) * 100),
        completed_at: r.completed_at,
      };
    });

    return new Response(JSON.stringify({ leaderboard, date }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("quiz-leaderboard error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
