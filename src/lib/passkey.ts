import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";
import { supabase } from "@/integrations/supabase/client";

export class PasskeyCancelledError extends Error {
  constructor(message = "Passkey prompt cancelled") {
    super(message);
    this.name = "PasskeyCancelledError";
  }
}

/** True when the WebAuthn ceremony was dismissed, timed out, or no credential exists. */
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
    msg.includes("not allowed") ||
    msg.includes("timed out") ||
    msg.includes("no available") ||
    msg.includes("no credentials") ||
    msg.includes("unknown passkey")
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
  let asseResp;
  try {
    asseResp = await startAuthentication({ optionsJSON: options });
  } catch (err) {
    if (isPasskeyCancellation(err)) throw new PasskeyCancelledError();
    throw err;
  }
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
