# Stacks Wallet Authentication — Lovable Prompt

> Copy the prompt in §2 into a fresh Lovable project (with Lovable Cloud enabled) to reproduce SMentor's Stacks wallet + email unified authentication system end-to-end. §1 lists the prerequisites Lovable needs to know about. §3 lists the verification steps to run after the build finishes.

---

## 1. Prerequisites (tell Lovable first)

Before pasting the main prompt, make sure the project has:

1. **Lovable Cloud enabled** (Connectors → Lovable Cloud → Enable). The prompt assumes Supabase-backed auth + database + edge functions are available.
2. **Anonymous sign-ins enabled** in Cloud → Users → Auth Settings (`external_anonymous_users_enabled = true`). Wallet users get an anonymous Supabase identity on first connect.
3. **Email auth enabled with confirmation required** (do NOT enable auto-confirm). Cloud → Users → Auth Settings.
4. A **`profiles` table** keyed by `user_id uuid` with at least: `display_name text`, `username text`, `stacks_address text`, `bns_name text`, plus RLS policies allowing `auth.uid() = user_id` to select/insert/update their own row.

If any of those are missing, ask Lovable to set them up first in a separate turn.

---

## 2. The prompt

Paste everything inside the fenced block below as a single Lovable message:

```
Build a unified Stacks-wallet + email authentication system for this app. The
goal: any user can sign in with EITHER an email/password OR a Stacks wallet
(Xverse, Leather), can later link the other identity from their profile, and
will always land back in the SAME account on every return visit — no
duplicates, no lost progress.

=== Dependencies ===
Install:
  - @stacks/connect (latest v8+)
  - vite-plugin-node-polyfills

Update vite.config.ts to add:
  import { nodePolyfills } from "vite-plugin-node-polyfills";
  plugins: [
    react(),
    nodePolyfills({
      globals: { Buffer: true, global: true, process: true },
      protocolImports: true,
    }),
  ],
  resolve: {
    alias: { "@stacks/transactions": "@stacks/transactions/dist/esm" },
  },

Without these polyfills the wallet popup will throw "Buffer is not defined".

=== Database ===
Add a partial unique index so one wallet can only be linked to one account:
  CREATE UNIQUE INDEX IF NOT EXISTS profiles_stacks_address_unique
    ON public.profiles (stacks_address)
    WHERE stacks_address IS NOT NULL;

=== Edge function: resolve-wallet-login ===
Create supabase/functions/resolve-wallet-login/index.ts.

Purpose: when a wallet reconnects, check whether that address was previously
linked to a real (email-verified) account. If yes, send that email a magic
link so the user signs back into their ORIGINAL account instead of getting a
fresh anonymous one.

Behaviour:
  - POST { address: string }
  - Use the service role key to query profiles where stacks_address = address.
  - If no profile → return { linked: false }.
  - If profile exists, look up the auth user via auth.admin.getUserById.
    - If user has no email or is_anonymous → { linked: true, hasEmail: false }
    - If user has a verified email → call auth.signInWithOtp({ email,
      options: { emailRedirectTo: `${origin}/`, shouldCreateUser: false } })
      and return { linked: true, hasEmail: true, sent: true, email }.
  - Wrap everything in try/catch and return { linked: false } on any failure
    (never break the client flow).
  - Add CORS headers (Access-Control-Allow-Origin: *, allow authorization,
    apikey, content-type, x-client-info).
  - Handle OPTIONS preflight.

=== Auth context: src/contexts/StacksAuthContext.tsx ===
Create a React context provider exporting:
  interface StacksUserData { address: string; bnsName?: string }
  { isAuthenticated, userData, isLoading, signIn, signOut, truncateAddress }

Implementation rules:

1. Address parsing helper getAddressFromStorage() must try multiple
   localStorage keys in order: "@stacks/connect", "blockstack-session",
   "stacks-session". For each key:
     a. If the value is a hex string (even length, /^[0-9a-f]+$/i), decode
        bytes → UTF-8 → JSON, then read addresses.stx[0].address or
        addresses.mainnet.address.
     b. Otherwise JSON.parse and try addresses.stx[0].address,
        addresses.mainnet.address, or userData.profile.stxAddress.mainnet.
   Return undefined if nothing matches. Never throw.

2. fetchBnsName(address) hits https://api.bnsv2.com/names/address/{address}/valid
   and prefers .btc > .stx > .id namespaces, filtering out revoked names.
   Returns the full_name string or undefined. Best-effort, never throws.

3. waitForAddress(maxMs=8000, interval=150) polls getAddressFromStorage until
   found or timeout. The popup confirm can take several seconds.

4. On mount (useEffect):
     - Set a 2-second safety timeout that always resolves isLoading=false
       (mobile has no wallet extension and isConnected() can hang).
     - If isConnected() and an address is in storage, set authenticated state
       immediately, then in the background fetch BNS and call
       ensureSupabaseSession(address, bnsName).

5. signIn():
     a. await connect() — opens wallet popup.
     b. address = await waitForAddress(); if none, return silently.
     c. Fetch BNS name. Set userData and isAuthenticated.
     d. If no existing supabase session, call resolve-wallet-login.
        - If response says sent magic link → toast "Welcome back! We sent a
          sign-in link to {email}." (duration 9s), navigate("/"), return.
     e. Otherwise call ensureSupabaseSession(address, bnsName).
     f. Set localStorage[`stacks_onboarded_${address}`] = "true" so onboarding
        modals don't re-fire.
     g. navigate("/").
     h. Catch errors. If message includes "wallet", "extension", "provider",
        or "canceled", swallow silently (user closed popup). Otherwise log.

6. ensureSupabaseSession(address, bnsName):
     - If a session exists (email or anon), upsert profiles row with the
       wallet address (and display_name/username/bns_name if BNS resolved),
       onConflict: "user_id".
     - If no session, call supabase.auth.signInAnonymously(), then upsert
       the profile row with user_id = new anon user, username = bnsName ??
       address.slice(0,20), stacks_address, bns_name.
     - Wrap in try/catch — DB failures must NOT break wallet auth.

7. signOut(): try { disconnect() } catch {}, try { await supabase.auth.signOut()
   } catch {}, clear local state, navigate("/auth").

8. truncateAddress(addr) → "SP1234…ABCD".

9. Export useStacksAuth() hook that throws if used outside the provider.

=== Profile editor: link/unlink panels ===
In src/components/ProfileEditor.tsx (or wherever profile editing lives), add:

LinkEmailPanel (shown when the current Supabase user is anonymous):
  - Email + password inputs.
  - On submit: supabase.auth.updateUser({ email, password, options: {
      emailRedirectTo: `${window.location.origin}/` } })
  - Show "Check your inbox to confirm." Subscribe to
    supabase.auth.onAuthStateChange and when event === "USER_UPDATED" and
    user.email is present and is_anonymous is false, refresh the UI and
    toast "Email linked to your account."

LinkWalletPanel (shown when profile.stacks_address is empty):
  - Button "Connect Stacks Wallet". On click:
      await connect();
      const address = await waitForAddress();
      if (!address) return;
      const bnsName = await fetchBnsName(address);
      await supabase.from("profiles").update({
        stacks_address: address,
        bns_name: bnsName ?? null,
      }).eq("user_id", currentUser.id);
  - On unique-violation error (23505), toast "This wallet is already linked
    to another account."

=== ProtectedRoute ===
Update src/components/ProtectedRoute.tsx so a user is considered authorised
if EITHER the Supabase session exists OR useStacksAuth().isAuthenticated is
true. While either context is loading, show the existing spinner.

=== App wiring ===
Wrap the router (in src/App.tsx) with <StacksAuthProvider> INSIDE
<BrowserRouter> (it uses useNavigate).

=== Acceptance criteria ===
After the build, all seven of these must pass without code changes:

1. Brand new wallet → connect → lands in app, anonymous Supabase session
   exists, profiles row has stacks_address set.
2. Same wallet, second visit → connect → no duplicate profile, signed
   straight back in.
3. Wallet user adds email from profile → enters email + password →
   confirmation email arrives → click link → returns to app with
   is_anonymous = false and the email visible in profile.
4. Email user adds wallet from profile → wallet popup → address saved to
   their profile, no new Supabase user created.
5. Email user signs out, returns and connects the linked wallet → magic
   link arrives at the linked email → click → signs back into the ORIGINAL
   account, all progress intact (NOT a fresh anonymous account).
6. Mobile (no wallet extension) → page loads in under 2 seconds, no
   infinite spinner, "Sign In" button visible.
7. User cancels the wallet popup → no error toast, no console error,
   button returns to idle.

Do not finish until every branch above works.
```

---

## 3. After Lovable finishes

Run the 7-step acceptance checklist at the bottom of the prompt yourself before shipping. The most common failures and fixes:

| Symptom | Fix |
|---|---|
| `Buffer is not defined` in console | `vite-plugin-node-polyfills` was dropped — re-add it to `vite.config.ts`. |
| Magic link never arrives | Email auth is disabled, or sender domain not verified in Cloud → Emails. |
| Wallet user gets a fresh empty account on return | `resolve-wallet-login` not deployed, or the partial unique index on `stacks_address` was skipped. |
| `Anonymous sign-in failed` warning | Toggle on `external_anonymous_users_enabled` in Cloud → Users → Auth Settings. |
| Infinite spinner on mobile | The 2-second safety timeout in the provider's `useEffect` was removed — restore it. |

For deeper architectural reference (parsing helpers, identity-bridge rationale, edge function internals), see `docs/STACKS_WALLET_AUTH.md`.
