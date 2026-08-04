# Passkey (WebAuthn) + Stacks Wallet Authentication — Lovable Prompt

Copy-paste this after the Stacks wallet setup to add **passkey-first authentication**.
Users can sign up with Face ID / Touch ID / Windows Hello / device PIN and automatically receive a Stacks wallet + recovery phrase.

---

## Goal

- Let users **sign up with a passkey** (no password).
- During signup, **generate a Stacks wallet** (`@stacks/wallet-sdk`) and show the user a 24-word recovery phrase once.
- Save the Stacks address to their profile.
- Let existing signed-in users **register additional passkeys** from their profile.
- Let users **sign in with a passkey** on return visits.
- Treat passkey cancellation / missing credentials as silent — no red error banner.

---

## Prerequisites

Before pasting the main prompt, make sure the project has:

1. **Lovable Cloud enabled**.
2. A **`profiles` table** keyed by `user_id uuid` with at least: `username text`, `display_name text`, `stacks_address text`, `web3_onboarded boolean`.
3. The **Stacks wallet polyfills** already applied (`vite-plugin-node-polyfills`, `@stacks/connect`, Buffer/global aliases).

If any are missing, set them up first in a separate turn.

---

## The prompt

Paste everything inside the fenced block below as a single Lovable message:

```
Build a passkey-first authentication system for this app. The goal: users can
sign up with a passkey (Face ID / Touch ID / Windows Hello / PIN), get a
Stacks wallet created automatically, back up their 24-word recovery phrase,
and sign in later with the same passkey. Existing signed-in users can also add
extra passkeys from their profile.

=== Dependencies ===

Install:
  - @simplewebauthn/browser
  - @simplewebauthn/server
  - @stacks/wallet-sdk

Keep the existing vite-plugin-node-polyfills and @stacks/connect setup.

=== Database (single migration) ===

```sql
create table public.passkey_credentials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  credential_id text not null unique,
  public_key text not null,
  counter bigint not null default 0,
  transports text[] not null default '{}',
  label text,
  last_used_at timestamptz,
  created_at timestamptz not null default now()
);
grant select, insert, delete on public.passkey_credentials to authenticated;
grant all on public.passkey_credentials to service_role;
alter table public.passkey_credentials enable row level security;
create policy "own passkeys read"   on public.passkey_credentials for select to authenticated using (auth.uid() = user_id);
create policy "own passkeys insert" on public.passkey_credentials for insert to authenticated with check (auth.uid() = user_id);
create policy "own passkeys delete" on public.passkey_credentials for delete to authenticated using (auth.uid() = user_id);

create table public.webauthn_challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  session_key text not null unique,
  challenge text not null,
  kind text not null check (kind in ('register','authenticate')),
  expires_at timestamptz not null default (now() + interval '5 minutes'),
  created_at timestamptz not null default now()
);
grant all on public.webauthn_challenges to service_role;
alter table public.webauthn_challenges enable row level security;
```

=== Edge Function `passkey-auth` ===

Create `supabase/functions/passkey-auth/index.ts` using Deno + `@simplewebauthn/server@13`.

Actions dispatched by `body.action`:

| Action | Auth required | Purpose |
| --- | --- | --- |
| `signup-options` | No | `generateRegistrationOptions()` for a brand-new passkey account; save challenge with `user_id IS NULL` |
| `signup-verify` | No | `verifyRegistrationResponse()`; create a Supabase user with a synthetic email; insert passkey credential; upsert `profiles` row with `stacks_address`; return `token_hash` |
| `register-options` | Yes (Bearer JWT) | `generateRegistrationOptions()` for adding a passkey to an existing account |
| `register-verify` | Yes | `verifyRegistrationResponse()`; insert into `passkey_credentials` |
| `auth-options` | No | `generateAuthenticationOptions()` with discoverable credentials |
| `auth-verify` | No | `verifyAuthenticationResponse()`; look up credential by `response.id`; return `token_hash` for the linked account |

Key rules:

1. Derive `rpID` from the request `Origin` hostname; `expectedOrigin` is the full origin string.
2. Use `attestationType: "none"`, `residentKey: "preferred"`, `userVerification: "preferred"`.
3. Persist `credential.publicKey` as base64url using `isoBase64URL.fromBuffer`.
4. On authenticate, update `counter` and `last_used_at` after successful verification.
5. Issue sessions by calling `admin.auth.admin.generateLink({ type: 'magiclink', email })` and returning `properties.hashed_token`. The client exchanges it with `supabase.auth.verifyOtp({ token_hash, type: 'magiclink' })`.
6. For `signup-verify`: generate a synthetic email like `passkey-<uuid>@accounts.app.local`, create the user with `email_confirm: true` and a random password, set `user_metadata.auth_method = "passkey_wallet"`, then upsert the profile row with the provided `stacks_address` and `web3_onboarded = true`.
7. Delete the challenge row after use.
8. Return clear error messages for expired/missing challenges and unknown passkeys.

=== Client wrapper `src/lib/passkey.ts` ===

```ts
import { startRegistration, startAuthentication } from "@simplewebauthn/browser";
import { supabase } from "@/integrations/supabase/client";

export class PasskeyCancelledError extends Error {
  constructor(message = "Passkey prompt cancelled") {
    super(message);
    this.name = "PasskeyCancelledError";
  }
}

export function isPasskeyCancellation(err: unknown): boolean {
  if (!err) return false;
  if (err instanceof PasskeyCancelledError) return true;
  const anyErr = err as { name?: string; message?: string };
  const name = (anyErr.name || "").toLowerCase();
  const msg = (anyErr.message || "").toLowerCase();
  if (["notallowederror", "aborterror", "invalidstateerror"].includes(name)) return true;
  return (
    msg.includes("cancel") ||
    msg.includes("aborted") ||
    msg.includes("abort") ||
    msg.includes("not allowed") ||
    msg.includes("timed out") ||
    msg.includes("no available") ||
    msg.includes("no credentials") ||
    msg.includes("unknown passkey") ||
    msg.includes("credential manager") ||
    msg.includes("no passkey")
  );
}

async function callPasskey(action: string, body: Record<string, unknown> = {}) {
  const { data, error } = await supabase.functions.invoke("passkey-auth", {
    body: { action, ...body },
  });
  if (error) throw new Error(error.message || "Passkey request failed");
  if (data?.error) throw new Error(data.error);
  return data;
}

export function isPasskeySupported() {
  return (
    typeof window !== "undefined" &&
    typeof window.PublicKeyCredential !== "undefined"
  );
}

export async function registerPasskey(label?: string) {
  const { options, sessionKey } = await callPasskey("register-options");
  let attResp;
  try {
    attResp = await startRegistration({ optionsJSON: options });
  } catch (err) {
    if (isPasskeyCancellation(err)) throw new PasskeyCancelledError();
    throw err;
  }
  await callPasskey("register-verify", { sessionKey, response: attResp, label });
  return true;
}

export async function signUpWithPasskeyAndWallet({
  username,
  stacksAddress,
}: {
  username: string;
  stacksAddress: string;
}) {
  const { options, sessionKey } = await callPasskey("signup-options", { username });
  let attResp;
  try {
    attResp = await startRegistration({ optionsJSON: options });
  } catch (err) {
    if (isPasskeyCancellation(err)) throw new PasskeyCancelledError();
    throw err;
  }

  const result = await callPasskey("signup-verify", {
    sessionKey,
    response: attResp,
    username,
    stacksAddress,
  });

  if (!result.token_hash) throw new Error("No session token returned");
  const { error } = await supabase.auth.verifyOtp({
    token_hash: result.token_hash,
    type: "magiclink",
  });
  if (error) throw error;
  return { verified: true };
}

export async function signInWithPasskey() {
  const { options, sessionKey } = await callPasskey("auth-options");
  let asseResp;
  try {
    asseResp = await startAuthentication({ optionsJSON: options });
  } catch (err) {
    if (isPasskeyCancellation(err)) throw new PasskeyCancelledError();
    throw err;
  }
  const result = await callPasskey("auth-verify", { sessionKey, response: asseResp });
  if (result.needsEmail) return { verified: true, needsEmail: true };
  if (!result.token_hash) throw new Error("No session token returned");
  const { error } = await supabase.auth.verifyOtp({
    token_hash: result.token_hash,
    type: "magiclink",
  });
  if (error) throw error;
  return { verified: true, needsEmail: false };
}
```

=== Auth page UI (`src/pages/Auth.tsx`) ===

1. Add a "Sign up with a passkey" button on the signup side and a "Sign in with a passkey" button on the login side. Gate both on `isPasskeySupported()`.
2. When "Sign up with a passkey" is clicked:
   a. Generate a Stacks wallet locally using `@stacks/wallet-sdk` (`generateSecretKey`, `generateWallet`, `getStxAddress`).
   b. Open a modal/overlay that shows:
      - The generated Stacks address (truncated + copy button).
      - The 24-word recovery phrase (hidden by default; require a checkbox before revealing).
      - A "Create account & save passkey" button.
   c. On confirm, call `signUpWithPasskeyAndWallet({ username, stacksAddress })`.
   d. On success, close the modal and navigate home.
3. When "Sign in with a passkey" is clicked, call `signInWithPasskey()`. If it returns `needsEmail: true`, show a toast explaining the account needs a wallet reconnect. Catch `PasskeyCancelledError` and `isPasskeyCancellation()` errors silently — do NOT show a red "Passkey failed" banner.
4. After a normal email/password signup, optionally show the same passkey + wallet setup modal so email users can also add a passkey and get a wallet.

=== Profile settings ===

Add a "Passkeys" panel in the profile that:
- Lists rows from `passkey_credentials` (label, created_at, last_used_at).
- Has an "Add a passkey" button calling `registerPasskey()`.
- Has a trash icon to delete each row (RLS scopes to owner).
- Silently ignores `PasskeyCancelledError`.

=== Error handling ===

- Treat user cancellation (`NotAllowedError`, `AbortError`, manual dismiss, "no passkey") as silent — do not toast.
- On "Challenge expired" (5 min), restart the flow.
- If `verifyRegistrationResponse` throws, surface `err.message` — usually origin/rpID mismatch.
- If passkey signup fails after the Supabase user was already created, surface the error but do not leave a dangling half-registered state if possible.

=== Acceptance criteria ===

After the build, all of these must pass without code changes:

1. New user clicks "Sign up with a passkey" → WebAuthn prompt appears → account created → profile row has `stacks_address` set → user lands signed in.
2. The recovery phrase is shown once during signup and can be copied.
3. Returning user clicks "Sign in with a passkey" → authenticates → lands signed in.
4. User cancels the WebAuthn prompt during sign-in → no red toast, button returns to idle.
5. User has no passkey on this device and clicks sign-in → no red toast, button returns to idle.
6. Signed-in user can add a second passkey from profile settings.
7. Signed-in user can delete a passkey from profile settings.
8. Mobile browsers without passkey support show the button disabled or hidden.

Do not finish until every branch above works.
```

---

## After Lovable finishes

Run the acceptance checklist at the bottom of the prompt yourself before shipping. The most common failures and fixes:

| Symptom | Fix |
|---|---|
| `Buffer is not defined` | Re-add `vite-plugin-node-polyfills` to `vite.config.ts`. |
| `publicKey` cannot be stored | Ensure you use `isoBase64URL.fromBuffer(credential.publicKey)` before inserting. |
| Passkey registered on preview won't work on prod | Passkeys are scoped to `rpID`/hostname — register one per domain. |
| "No session token returned" | Check that `admin.auth.admin.generateLink` succeeded and `properties.hashed_token` exists. |
| Red toast on cancellation | Make sure `isPasskeyCancellation()` covers `NotAllowedError` and the UI catches `PasskeyCancelledError`. |
| Wallet address not saved | Verify the `signup-verify` action upserts the `profiles` row with `stacks_address`. |

---

## Security notes

- The synthetic email is internal-only; never expose it in the UI.
- The recovery phrase is generated client-side and shown once. Do not send it to the server or store it.
- `passkey_credentials` is scoped by RLS so users can only read/delete their own rows.
- `webauthn_challenges` is server-only; no authenticated policies.
