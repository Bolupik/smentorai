// Passkey (WebAuthn) auth using @simplewebauthn/server.
// Actions: register-options | register-verify | auth-options | auth-verify
// - Register requires an authenticated user (Bearer token) — adds a passkey to their account.
// - Authenticate is public; on success returns { token_hash } that the client
//   exchanges for a Supabase session via supabase.auth.verifyOtp({ type: 'magiclink' }).

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "npm:@simplewebauthn/server@13";
import {
  isoBase64URL,
  isoUint8Array,
} from "npm:@simplewebauthn/server@13/helpers";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function deriveRp(origin: string): { rpID: string; origin: string } {
  const url = new URL(origin);
  return { rpID: url.hostname, origin: url.origin };
}

function randomKey() {
  return crypto.randomUUID() + "-" + crypto.randomUUID();
}

async function getUserFromAuthHeader(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;
  const jwt = authHeader.replace("Bearer ", "");
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await userClient.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const origin = req.headers.get("origin") || req.headers.get("referer") || "";
    if (!origin) return json({ error: "Missing origin" }, 400);
    const { rpID, origin: expectedOrigin } = deriveRp(origin);

    const body = await req.json().catch(() => ({}));
    const action = String(body.action || "");

    // ─────────────── REGISTER: OPTIONS ───────────────
    if (action === "register-options") {
      const user = await getUserFromAuthHeader(req);
      if (!user) return json({ error: "Sign in required to register a passkey" }, 401);

      const { data: existing } = await admin
        .from("passkey_credentials")
        .select("credential_id, transports")
        .eq("user_id", user.id);

      const options = await generateRegistrationOptions({
        rpName: "SMentor",
        rpID,
        userID: isoUint8Array.fromUTF8String(user.id),
        userName: user.email ?? user.id,
        userDisplayName: user.email ?? "SMentor user",
        attestationType: "none",
        authenticatorSelection: {
          residentKey: "preferred",
          userVerification: "preferred",
        },
        excludeCredentials: (existing ?? []).map((c) => ({
          id: c.credential_id,
          transports: c.transports as AuthenticatorTransport[] | undefined,
        })),
      });

      const sessionKey = randomKey();
      await admin.from("webauthn_challenges").insert({
        session_key: sessionKey,
        user_id: user.id,
        challenge: options.challenge,
        kind: "register",
      });

      return json({ options, sessionKey });
    }

    // ─────────────── REGISTER: VERIFY ───────────────
    if (action === "register-verify") {
      const user = await getUserFromAuthHeader(req);
      if (!user) return json({ error: "Sign in required" }, 401);
      const { sessionKey, response, label } = body;
      if (!sessionKey || !response) return json({ error: "Missing params" }, 400);

      const { data: chal } = await admin
        .from("webauthn_challenges")
        .select("*")
        .eq("session_key", sessionKey)
        .eq("kind", "register")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!chal) return json({ error: "Challenge expired" }, 400);
      if (new Date(chal.expires_at) < new Date()) return json({ error: "Challenge expired" }, 400);

      const verification = await verifyRegistrationResponse({
        response,
        expectedChallenge: chal.challenge,
        expectedOrigin,
        expectedRPID: rpID,
      });

      if (!verification.verified || !verification.registrationInfo) {
        return json({ error: "Verification failed" }, 400);
      }

      const { credential } = verification.registrationInfo;
      await admin.from("passkey_credentials").insert({
        user_id: user.id,
        credential_id: credential.id,
        public_key: isoBase64URL.fromBuffer(credential.publicKey),
        counter: credential.counter,
        transports: credential.transports ?? [],
        label: label ?? "Passkey",
      });

      await admin.from("webauthn_challenges").delete().eq("session_key", sessionKey);
      return json({ verified: true });
    }

    // ─────────────── AUTHENTICATE: OPTIONS ───────────────
    if (action === "auth-options") {
      const options = await generateAuthenticationOptions({
        rpID,
        userVerification: "preferred",
        // Discoverable credentials — no allowCredentials list
      });
      const sessionKey = randomKey();
      await admin.from("webauthn_challenges").insert({
        session_key: sessionKey,
        challenge: options.challenge,
        kind: "authenticate",
      });
      return json({ options, sessionKey });
    }

    // ─────────────── AUTHENTICATE: VERIFY ───────────────
    if (action === "auth-verify") {
      const { sessionKey, response } = body;
      if (!sessionKey || !response) return json({ error: "Missing params" }, 400);

      const { data: chal } = await admin
        .from("webauthn_challenges")
        .select("*")
        .eq("session_key", sessionKey)
        .eq("kind", "authenticate")
        .maybeSingle();
      if (!chal) return json({ error: "Challenge expired" }, 400);
      if (new Date(chal.expires_at) < new Date()) return json({ error: "Challenge expired" }, 400);

      const credId: string = response.id;
      const { data: cred } = await admin
        .from("passkey_credentials")
        .select("*")
        .eq("credential_id", credId)
        .maybeSingle();
      if (!cred) return json({ error: "Unknown passkey" }, 404);

      const verification = await verifyAuthenticationResponse({
        response,
        expectedChallenge: chal.challenge,
        expectedOrigin,
        expectedRPID: rpID,
        credential: {
          id: cred.credential_id,
          publicKey: isoBase64URL.toBuffer(cred.public_key),
          counter: Number(cred.counter),
          transports: cred.transports as AuthenticatorTransport[] | undefined,
        },
      });

      if (!verification.verified) return json({ error: "Verification failed" }, 401);

      // Update counter & last used
      await admin
        .from("passkey_credentials")
        .update({
          counter: verification.authenticationInfo.newCounter,
          last_used_at: new Date().toISOString(),
        })
        .eq("id", cred.id);
      await admin.from("webauthn_challenges").delete().eq("session_key", sessionKey);

      // Issue a Supabase session by generating a magic-link token_hash the client
      // can immediately exchange. Requires the user to have an email.
      const { data: userRow, error: userErr } = await admin.auth.admin.getUserById(cred.user_id);
      if (userErr || !userRow.user) return json({ error: "Account not found" }, 404);
      const email = userRow.user.email;
      if (!email) {
        return json(
          {
            verified: true,
            needsEmail: true,
            error:
              "This passkey is linked to a wallet-only account. Reconnect your Stacks wallet to sign in.",
          },
          200,
        );
      }

      const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
        type: "magiclink",
        email,
      });
      if (linkErr || !link.properties?.hashed_token) {
        return json({ error: "Could not issue session" }, 500);
      }

      return json({
        verified: true,
        token_hash: link.properties.hashed_token,
        email,
      });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (err) {
    console.error("passkey-auth error", err);
    return json({ error: (err as Error).message || "Internal error" }, 500);
  }
});
