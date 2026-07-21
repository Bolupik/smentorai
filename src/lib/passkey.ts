import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";
import { supabase } from "@/integrations/supabase/client";

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
  const attResp = await startRegistration({ optionsJSON: options });
  await callPasskey("register-verify", {
    sessionKey,
    response: attResp,
    label,
  });
  return true;
}

/**
 * Sign in with a passkey. On success, establishes a Supabase session.
 * Returns { verified, needsEmail? } — needsEmail is true for wallet-only accounts.
 */
export async function signInWithPasskey() {
  const { options, sessionKey } = await callPasskey("auth-options");
  const asseResp = await startAuthentication({ optionsJSON: options });
  const result = await callPasskey("auth-verify", {
    sessionKey,
    response: asseResp,
  });
  if (result.needsEmail) return { verified: true, needsEmail: true };
  if (!result.token_hash) throw new Error("No session token returned");
  const { error } = await supabase.auth.verifyOtp({
    token_hash: result.token_hash,
    type: "magiclink",
  });
  if (error) throw error;
  return { verified: true, needsEmail: false };
}
