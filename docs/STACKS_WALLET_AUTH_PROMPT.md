# Stacks Wallet Authentication — Lovable Prompt

> Copy the prompt in §2 into a fresh Lovable project (with Lovable Cloud enabled) to reproduce SMentor's Stacks wallet authentication system end-to-end. §1 lists the prerequisites Lovable needs to know about. §3 lists the verification steps to run after the build finishes.

---

## 1. Prerequisites (tell Lovable first)

Before pasting the main prompt, make sure the project has:

1. **Lovable Cloud enabled** (Connectors → Lovable Cloud → Enable). The prompt assumes Supabase-backed auth + database + edge functions are available.
2. **Anonymous sign-ins enabled** in Cloud → Users → Auth Settings (`external_anonymous_users_enabled = true`). Wallet users get an anonymous Supabase identity on first connect so RLS still works.
3. A **`profiles` table** keyed by `user_id uuid` with at least: `display_name text`, `username text`, `stacks_address text`, `bns_name text`, plus RLS policies allowing `auth.uid() = user_id` to select/insert/update their own row.

If any of those are missing, ask Lovable to set them up first in a separate turn.

---

## 2. The prompt

Paste everything inside the fenced block below as a single Lovable message:

```
Build a Stacks-wallet authentication system for this app. The goal: any user
can sign in with a Stacks wallet (Xverse, Leather), gets a real Supabase
identity so RLS works, and is reconnected to the SAME account on every
return visit — no duplicates, no lost progress.

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
     d. Call ensureSupabaseSession(address, bnsName).
     e. Set localStorage[`stacks_onboarded_${address}`] = "true" so onboarding
        modals don't re-fire.
     f. navigate("/").
     g. Catch errors. If message includes "wallet", "extension", "provider",
        or "canceled", swallow silently (user closed popup). Otherwise log.

6. ensureSupabaseSession(address, bnsName):
     - If a session already exists, upsert the profiles row with the wallet
       address (and display_name/username/bns_name if BNS resolved),
       onConflict: "user_id".
     - If no session, call supabase.auth.signInAnonymously(), then upsert
       the profile row with user_id = new anon user, username = bnsName ??
       address.slice(0,20), stacks_address, bns_name.
     - Wrap in try/catch — DB failures must NOT break wallet auth.

7. signOut(): try { disconnect() } catch {}, try { await supabase.auth.signOut()
   } catch {}, clear local state, navigate("/auth").

8. truncateAddress(addr) → "SP1234…ABCD".

9. Export useStacksAuth() hook that throws if used outside the provider.

=== ProtectedRoute ===
Update src/components/ProtectedRoute.tsx so a user is considered authorised
when useStacksAuth().isAuthenticated is true. While the context is loading,
show a spinner.

=== App wiring ===
Wrap the router (in src/App.tsx) with <StacksAuthProvider> INSIDE
<BrowserRouter> (it uses useNavigate).

=== Acceptance criteria ===
After the build, all five of these must pass without code changes:

1. Brand new wallet → connect → lands in app, anonymous Supabase session
   exists, profiles row has stacks_address set.
2. Same wallet, second visit → connect → no duplicate profile, signed
   straight back in, BNS name (if any) shown in the user menu.
3. Returning user across browsers (different devices, same wallet) →
   connect → reaches the same profile row (guaranteed by the partial
   unique index on stacks_address).
4. Mobile (no wallet extension) → page loads in under 2 seconds, no
   infinite spinner, "Sign In" button visible.
5. User cancels the wallet popup → no error toast, no console error,
   button returns to idle.

Do not finish until every branch above works.
```

---

## 3. After Lovable finishes

Run the 5-step acceptance checklist at the bottom of the prompt yourself before shipping. The most common failures and fixes:

| Symptom | Fix |
|---|---|
| `Buffer is not defined` in console | `vite-plugin-node-polyfills` was dropped — re-add it to `vite.config.ts`. |
| `Anonymous sign-in failed` warning | Toggle on `external_anonymous_users_enabled` in Cloud → Users → Auth Settings. |
| Wallet popup never opens | The `connect()` call ran before the polyfills were applied — restart the dev server after installing them. |
| Address never resolves after popup confirm | Wallet stored data under a new key — add a new branch in `getAddressFromStorage()`. |
| Infinite spinner on mobile | The 2-second safety timeout in the provider's `useEffect` was removed — restore it. |

For deeper architectural reference (parsing helpers, identity-bridge rationale), see `docs/STACKS_WALLET_AUTH.md`.
