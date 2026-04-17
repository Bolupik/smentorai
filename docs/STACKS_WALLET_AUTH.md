# Stacks Wallet Authentication — Operator Guide

> A complete reference for how SMentor connects Stacks wallets (Xverse, Leather), links them to Supabase identities, and recovers from common errors. Use this when wiring a new project, debugging a broken sign-in, or onboarding a contributor.

---

## 1. Architecture at a glance

| Layer | Library | Purpose |
|---|---|---|
| Wallet popup | [`@stacks/connect`](https://www.npmjs.com/package/@stacks/connect) v8+ | Triggers the wallet extension, returns the user's STX address |
| Local persistence | `localStorage` key `@stacks/connect` | Hex-encoded blob holding the connected addresses |
| BNS lookup | `https://api.bnsv2.com` | Resolves `.btc` / `.stx` names for a given address |
| Identity bridge | Supabase anonymous sign-in | Gives every wallet user a real `auth.users` row so RLS works |
| Account resolver | Edge function `resolve-wallet-login` | When a wallet is reconnected, finds the linked email account and sends a magic link instead of creating a duplicate |

The full flow lives in `src/contexts/StacksAuthContext.tsx`. Treat that file as the single source of truth.

---

## 2. Required Vite configuration

Stacks libraries are Node-targeted. Without polyfills the wallet popup throws `Buffer is not defined` or `process is not defined` and never opens.

`vite.config.ts` must include:

```ts
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      globals: { Buffer: true, global: true, process: true },
      protocolImports: true,
    }),
  ],
  resolve: {
    alias: {
      // Some Stacks deps still publish CommonJS — alias them to the ESM build
      "@stacks/transactions": "@stacks/transactions/dist/esm",
    },
  },
});
```

If you ever see `ReferenceError: process is not defined` in the browser console after a clean install, the polyfill plugin was dropped. Reinstall it.

---

## 3. The connect flow (happy path)

```
User clicks "Connect Wallet"
        │
        ▼
connect()  ← @stacks/connect opens wallet popup
        │
        ▼
waitForAddress()  ← polls localStorage["@stacks/connect"] for up to 8s
        │
        ▼
fetchBnsName(address)  ← optional, best-effort
        │
        ▼
tryResumeLinkedAccount(address)
        │
        ├── linked + hasEmail + sent → magic link sent → user opens email → DONE
        │
        └── not linked → ensureSupabaseSession(address, bnsName)
                             │
                             ├── existing session?  → upsert profile.stacks_address
                             └── no session?        → signInAnonymously() + insert profile
```

All four steps are wrapped in `try/catch`. The wallet popup may be cancelled, the BNS API may rate-limit, the edge function may be down — none of these should crash the UI.

---

## 4. Reading the connected address

`@stacks/connect` v8 stores the session as a **hex-encoded UTF-8 JSON blob** under `localStorage["@stacks/connect"]`. Older versions used plain JSON under `blockstack-session` or `stacks-session`.

`getAddressFromStorage()` tries every known format. **Do not** call wallet APIs directly to read the address — always use this helper. It handles:

- Hex blob (v8): decode bytes → JSON → `addresses.stx[0].address`
- Plain JSON (v7): `addresses.stx[0].address` or `addresses.mainnet.address`
- Legacy: `userData.profile.stxAddress.mainnet`

If you need to support a new wallet release, add the parsing branch to that single helper — never sprinkle it across components.

---

## 5. Linking a wallet to a Supabase identity

Wallets cannot sign Supabase JWTs, so the project bridges identities like this:

1. **Wallet-only user**: on first connect we call `supabase.auth.signInAnonymously()` and write a `profiles` row with `user_id = anon_user.id`, `stacks_address = <addr>`.
2. **Email user adds a wallet**: from the profile editor, the wallet popup runs, then `saveWalletToProfile()` writes the address onto their existing profile row (RLS allows because `auth.uid() = user_id`).
3. **Wallet user adds an email**: `LinkEmailPanel` calls `supabase.auth.updateUser({ email, password })` which **upgrades the anonymous account in place**. Supabase sends a confirmation email; once clicked, `is_anonymous` flips to `false` and the same `user_id` keeps all progress.
4. **Returning wallet user (previously linked an email)**: instead of creating a fresh anonymous account, `resolve-wallet-login` finds the linked email and sends a magic link. The user signs back into the original account.

A partial unique index on `profiles.stacks_address` (`WHERE stacks_address IS NOT NULL`) guarantees one wallet ↔ one account.

---

## 6. The `resolve-wallet-login` edge function

**Purpose**: prevent duplicate accounts when a wallet user comes back after linking an email.

**Request**: `POST { address: "SP..." }`
**Response**:
| Field | Meaning |
|---|---|
| `linked: false` | No prior profile — caller creates a new anonymous session |
| `linked: true, hasEmail: false` | Wallet was linked to an anon-only account — caller falls back to anon flow |
| `linked: true, hasEmail: true, sent: true, email` | Magic link sent — caller shows a "check your inbox" toast and stops |

**Required secrets** (already configured): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

The function uses the **service role** because it needs `auth.admin.getUserById` and must read profiles across users. Never expose the service role key client-side.

---

## 7. Sign-out

```ts
signOut() {
  disconnect();              // clears @stacks/connect localStorage
  supabase.auth.signOut();   // clears the anon/email session
  navigate("/auth");
}
```

Both calls are wrapped in `try { } catch { /* ignore */ }` — disconnecting from a wallet that's already gone or signing out of a session that already expired must not throw.

---

## 8. Loading-state safety

Mobile browsers have no wallet extension, so `isConnected()` may hang. The provider sets a **2-second hard timeout** that always resolves `isLoading` to `false`. Without it, `ProtectedRoute` would show its spinner forever on mobile.

If you add new async work to `loadSession()`, make sure it can't keep the timeout from firing.

---

## 9. Common errors and how to recover

| Symptom | Likely cause | Fix |
|---|---|---|
| Wallet popup never opens | Vite polyfills missing | Reinstall `vite-plugin-node-polyfills`, restart dev server |
| `ReferenceError: Buffer is not defined` | Same as above | Same as above |
| Popup opens, closes, nothing happens | User cancelled — message includes "canceled" / "wallet" / "extension" | Already silently swallowed in `signIn` catch block |
| Address never resolves after popup confirm | Wallet stored data under a new key | Add a new branch in `getAddressFromStorage()` |
| `duplicate key value violates unique constraint "profiles_stacks_address_unique"` | Two accounts trying to claim the same wallet | Expected — the resolver flow should prevent this; if it slips through, manually merge the accounts |
| Magic link never arrives | Email auth disabled, or domain not verified | Check Cloud → Users → Auth Settings; verify the sender domain in Cloud → Emails |
| Wallet user sees a fresh empty account on return | `resolve-wallet-login` not deployed, or returning `{ linked: false }` | Redeploy the function; check edge function logs for the address |
| `Anonymous sign-in failed` warning in console | `external_anonymous_users_enabled` is off | Enable anonymous users in Cloud → Users → Auth Settings |

---

## 10. Testing checklist

Before shipping a change to wallet auth, walk through every branch:

1. **New wallet, new user** — connect → lands in app, anonymous session created, profile row exists with `stacks_address`.
2. **Same wallet, second visit** — connect → no duplicate profile, signed straight back in.
3. **Wallet user adds email** — profile editor → enter email + password → confirmation mail received → click link → returns to app, `is_anonymous = false`, email visible in profile.
4. **Email user adds wallet** — profile editor → click Connect → wallet popup → address saved to profile, no duplicate Supabase user.
5. **Email user signs out, returns via wallet** — connect → magic link arrives at the linked email → click link → signs into the ORIGINAL account, all progress intact.
6. **Mobile (no wallet extension)** — page loads in under 2 s, no infinite spinner, "Sign In" button visible.
7. **User cancels the wallet popup** — no error toast, no console error, button returns to idle.

All seven must pass. If any breaks, check the corresponding section above before changing code.

---

## 11. Files involved

| File | Role |
|---|---|
| `src/contexts/StacksAuthContext.tsx` | Provider, sign-in/out, address parsing, BNS lookup, resume-linked-account |
| `src/hooks/useStacksAuth.ts` | Re-export shim for backwards compatibility |
| `src/components/ProfileEditor.tsx` | UI for linking email ↔ wallet from the profile page |
| `src/components/UserMenu.tsx` | Renders the connected-wallet badge in the header |
| `src/components/ProtectedRoute.tsx` | Treats either an email user OR a connected wallet as authorized |
| `supabase/functions/resolve-wallet-login/index.ts` | Server-side wallet → linked email lookup |

Touch any of these and re-run the testing checklist in §10.
