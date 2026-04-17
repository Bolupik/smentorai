// Resolves a Stacks wallet address to a previously-linked account.
// If the wallet was linked to a real (email-verified) account, send that
// user a magic link so they can sign back into the SAME account instead
// of creating a new anonymous one.
//
// Returns:
//   { linked: false }                              → no prior account, caller should fall back to anon flow
//   { linked: true, hasEmail: true,  email }       → magic link sent; caller should prompt user to check inbox
//   { linked: true, hasEmail: false }              → wallet was linked to an anon-only account; caller falls back to anon flow

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { address } = await req.json().catch(() => ({}));
    if (typeof address !== "string" || address.length < 20 || address.length > 80) {
      return json({ error: "Invalid wallet address" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // 1. Find the profile linked to this wallet address (if any).
    const { data: profile, error: profileErr } = await admin
      .from("profiles")
      .select("user_id")
      .eq("stacks_address", address)
      .maybeSingle();

    if (profileErr) {
      console.error("profile lookup failed", profileErr);
      return json({ linked: false });
    }
    if (!profile?.user_id) return json({ linked: false });

    // 2. Look up the auth user. If they have a verified email, send a magic link.
    const { data: userRes, error: userErr } = await admin.auth.admin.getUserById(profile.user_id);
    if (userErr || !userRes?.user) return json({ linked: false });

    const authUser = userRes.user;
    const email = authUser.email;
    const isAnon = (authUser as { is_anonymous?: boolean }).is_anonymous === true;

    if (!email || isAnon) {
      // Wallet was linked to an account that has no real email identity yet —
      // safe to keep the existing anon-session flow on the client.
      return json({ linked: true, hasEmail: false });
    }

    // 3. Send a magic link so the wallet user signs back into THIS account.
    const origin = req.headers.get("origin") ?? supabaseUrl;
    const { error: linkErr } = await admin.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${origin}/`, shouldCreateUser: false },
    });
    if (linkErr) {
      console.error("magic link send failed", linkErr);
      return json({ linked: true, hasEmail: true, email, sent: false });
    }

    return json({ linked: true, hasEmail: true, email, sent: true });
  } catch (err) {
    console.error("resolve-wallet-login error", err);
    return json({ error: "Internal error" }, 500);
  }
});
