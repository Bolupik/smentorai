# Passkey (WebAuthn) Authentication — Lovable Prompt

Copy-paste this after the Stacks wallet setup to add passkey sign-in as a second, portable identity for the same account.

---

## Goal

Let users sign in with **Face ID / Touch ID / Windows Hello / device PIN** instead of a password. Passkeys are bound to the user's existing Supabase account (created via email OR wallet), so the same account can be reached from any device that has a registered passkey.

## Libraries

Install (both required):

```bash
npm i @simplewebauthn/browser @simplewebauthn/server
```

- `@simplewebauthn/browser` — used in the React client to invoke `navigator.credentials`.
- `@simplewebauthn/server` — used inside the Supabase Edge Function to generate/verify WebAuthn ceremonies.
- (Optional, only if you also want a Stacks wallet identity on the same account) `@stacks/wallet-sdk` — for deterministic wallet-secret handling on server flows.

## Database (single migration)

```sql
create table public.passkey_credentials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  credential_id text not null unique,
  public_key text not null,          -- base64url
  counter bigint not null default 0,
  transports text[] not null default '{}',
  label text,
  last_used_at timestamptz,
  created_at timestamptz not null default now()
);
grant select, delete on public.passkey_credentials to authenticated;
grant all on public.passkey_credentials to service_role;
alter table public.passkey_credentials enable row level security;
create policy "own passkeys read"   on public.passkey_credentials for select to authenticated using (auth.uid() = user_id);
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
-- server-only table: no policies for authenticated
```

## Edge Function `passkey-auth`

Deploy with default `verify_jwt = false`; the function itself validates the Bearer JWT on register endpoints using the anon client.

Four actions dispatched by `body.action`:

| Action | Auth required | Purpose |
| --- | --- | --- |
| `register-options`  | Yes | `generateRegistrationOptions()` → save challenge, return options + `sessionKey` |
| `register-verify`   | Yes | `verifyRegistrationResponse()` → insert row in `passkey_credentials` |
| `auth-options`      | No  | `generateAuthenticationOptions()` (discoverable creds, no allowlist) |
| `auth-verify`       | No  | `verifyAuthenticationResponse()` → issue a magic-link `token_hash` via `admin.auth.admin.generateLink({ type: 'magiclink', email })` |

Key rules:

1. Derive `rpID` from the request's `Origin` hostname; `expectedOrigin` is the full origin string.
2. Use `attestationType: "none"` and `residentKey: "preferred"` for the widest compatibility.
3. Persist `credential.publicKey` as base64url — never raw binary — using `isoBase64URL.fromBuffer`.
4. On authenticate, look the credential up by `response.id`, verify, then update `counter` and `last_used_at`.
5. To create a Supabase session, call `admin.auth.admin.generateLink({ type: 'magiclink', email })` and return `properties.hashed_token` to the client. The client then calls `supabase.auth.verifyOtp({ token_hash, type: 'magiclink' })`.
6. If the account has no email (wallet-only), return `{ needsEmail: true }` and tell the user to reconnect their wallet — passkeys can't stand in for a wallet-only session because the server cannot mint one without an email.
7. Delete the challenge row after use.

## Client wrapper `src/lib/passkey.ts`

```ts
import { startRegistration, startAuthentication } from "@simplewebauthn/browser";
import { supabase } from "@/integrations/supabase/client";

async function call(action: string, body: Record<string, unknown> = {}) {
  const { data, error } = await supabase.functions.invoke("passkey-auth", { body: { action, ...body } });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data;
}

export const isPasskeySupported = () =>
  typeof window !== "undefined" && !!window.PublicKeyCredential;

export async function registerPasskey(label?: string) {
  const { options, sessionKey } = await call("register-options");
  const resp = await startRegistration({ optionsJSON: options });
  await call("register-verify", { sessionKey, response: resp, label });
}

export async function signInWithPasskey() {
  const { options, sessionKey } = await call("auth-options");
  const resp = await startAuthentication({ optionsJSON: options });
  const result = await call("auth-verify", { sessionKey, response: resp });
  if (result.needsEmail) return { verified: true, needsEmail: true };
  const { error } = await supabase.auth.verifyOtp({ token_hash: result.token_hash, type: "magiclink" });
  if (error) throw error;
  return { verified: true, needsEmail: false };
}
```

## UI integration

- **Auth page**: add a "Sign in with a passkey" button next to email/wallet options; call `signInWithPasskey()`. Gate on `isPasskeySupported()`.
- **Profile settings**: add a "Passkeys" panel that:
  - Lists rows from `passkey_credentials` (label, created_at, last_used_at).
  - "Add a passkey" button calls `registerPasskey()`.
  - Trash icon deletes the row (RLS scopes to owner).

## Error handling

- Treat user cancellation (`NotAllowedError`, "cancel", "aborted") as silent — don't toast.
- On `Challenge expired` (5 min), simply restart the flow.
- If `verifyRegistrationResponse` throws, surface `err.message` — usually origin/rpID mismatch, meaning the app is being hit from a URL whose hostname differs from what the browser saw.

## Gotchas

- **Origin must be HTTPS** (localhost is treated as secure). Preview/prod origin must match `rpID` (hostname portion).
- **One rpID per project**. Passkeys registered on `preview--abc.lovable.app` won't authenticate on `example.com` — that's a WebAuthn guarantee.
- **Wallet-only accounts have no email** in `auth.users`; document that they must use their wallet, not passkeys, until they link an email.
- Never store the raw `publicKey` buffer directly — always base64url encode/decode using `@simplewebauthn/server/helpers`.
