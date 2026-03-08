import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { connect, disconnect, isConnected } from "@stacks/connect";
import { supabase } from "@/integrations/supabase/client";

export interface StacksUserData {
  address: string;
  bnsName?: string;
}

interface StacksAuthContextType {
  isAuthenticated: boolean;
  userData: StacksUserData | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => void;
  truncateAddress: (addr: string) => string;
}

const StacksAuthContext = createContext<StacksAuthContextType | undefined>(undefined);

const STACKS_CONNECT_KEY = "@stacks/connect";

const readLocalStorage = (): { addresses?: { stx?: { address: string }[] } } | null => {
  try {
    const raw = localStorage.getItem(STACKS_CONNECT_KEY);
    if (!raw) return null;
    const bytes = new Uint8Array(raw.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
};

const getAddressFromStorage = (): string | undefined => {
  try {
    const data = readLocalStorage();
    return data?.addresses?.stx?.[0]?.address;
  } catch {
    return undefined;
  }
};

const fetchBnsName = async (address: string): Promise<string | undefined> => {
  try {
    const res = await fetch(`https://api.bnsv2.com/names/address/${address}/valid`);
    if (!res.ok) return undefined;
    const data = await res.json();
    return data?.names?.[0] ?? undefined;
  } catch {
    return undefined;
  }
};

const waitForAddress = (maxMs = 3000, intervalMs = 100): Promise<string | undefined> =>
  new Promise((resolve) => {
    const start = Date.now();
    const check = () => {
      const addr = getAddressFromStorage();
      if (addr) return resolve(addr);
      if (Date.now() - start > maxMs) return resolve(undefined);
      setTimeout(check, intervalMs);
    };
    check();
  });

/**
 * Ensures a Supabase anonymous session exists for wallet users.
 * This gives wallet users a real auth.uid() so all RLS-protected
 * tables (topic_progress, daily_quiz_results, profiles, knowledge_base)
 * work exactly like they do for email-authenticated users.
 */
const ensureSupabaseSession = async (address: string, bnsName?: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) return; // already signed in

    const { data, error } = await supabase.auth.signInAnonymously();
    if (error || !data.user) return;

    // Create / update their profile row so DB-backed features work
    await supabase.from("profiles").upsert(
      {
        user_id: data.user.id,
        username: bnsName || address,
        display_name: bnsName || address,
      },
      { onConflict: "user_id" }
    );
  } catch {
    // Non-fatal: wallet auth still works, DB features degrade gracefully
  }
};

export const StacksAuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<StacksUserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Safety timeout: always resolve within 2s (mobile has no wallet extension)
    const timeout = setTimeout(() => setIsLoading(false), 2000);

    const loadSession = async () => {
      try {
        if (isConnected()) {
          const address = getAddressFromStorage();
          if (address) {
            setUserData({ address });
            setIsAuthenticated(true);
            clearTimeout(timeout);
            setIsLoading(false);

            // Ensure a Supabase session exists (for DB access parity with email users)
            const bnsName = await fetchBnsName(address);
            if (bnsName) setUserData((prev) => (prev ? { ...prev, bnsName } : prev));
            await ensureSupabaseSession(address, bnsName);
            return;
          }
        }
      } catch {
        // No wallet extension (common on mobile)
      }
      clearTimeout(timeout);
      setIsLoading(false);
    };

    loadSession();
    return () => clearTimeout(timeout);
  }, []);

  const signIn = useCallback(async () => {
    try {
      await connect();
      const address = await waitForAddress();
      if (address) {
        const bnsName = await fetchBnsName(address);
        setUserData({ address, bnsName });
        setIsAuthenticated(true);

        // Give this wallet user a Supabase anonymous session so all DB
        // features (topic progress, quiz results, profiles, knowledge base)
        // work exactly like they do for email-authenticated users.
        await ensureSupabaseSession(address, bnsName);

        const onboardedKey = `stacks_onboarded_${address}`;
        if (!localStorage.getItem(onboardedKey)) {
          localStorage.setItem(onboardedKey, "true");
        }
        navigate("/");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.toLowerCase().includes("wallet") ||
        msg.toLowerCase().includes("extension") ||
        msg.toLowerCase().includes("provider") ||
        msg.toLowerCase().includes("canceled")
      ) {
        return;
      }
      console.error("Stacks sign-in error:", err);
    }
  }, [navigate]);

  const signOut = useCallback(async () => {
    try { disconnect(); } catch { /* ignore */ }
    // Also sign out from Supabase so the anonymous session is cleared
    try { await supabase.auth.signOut(); } catch { /* ignore */ }
    setIsAuthenticated(false);
    setUserData(null);
    navigate("/auth");
  }, [navigate]);

  const truncateAddress = (addr: string) =>
    addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";

  return (
    <StacksAuthContext.Provider value={{ isAuthenticated, userData, isLoading, signIn, signOut, truncateAddress }}>
      {children}
    </StacksAuthContext.Provider>
  );
};

export const useStacksAuth = () => {
  const context = useContext(StacksAuthContext);
  if (context === undefined) {
    throw new Error("useStacksAuth must be used within a StacksAuthProvider");
  }
  return context;
};
