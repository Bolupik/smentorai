import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { connect, disconnect, isConnected } from "@stacks/connect";

export interface StacksUserData {
  address: string;
  bnsName?: string;
}

const STACKS_CONNECT_KEY = "@stacks/connect";

/** Read the stored session from localStorage (hex-encoded JSON) */
const readLocalStorage = (): { addresses?: { stx?: { address: string }[] } } | null => {
  try {
    const raw = localStorage.getItem(STACKS_CONNECT_KEY);
    if (!raw) return null;
    // @stacks/connect v8 stores as hex-encoded UTF-8 JSON
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

export const useStacksAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<StacksUserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadSession = async () => {
      try {
        if (isConnected()) {
          const address = getAddressFromStorage();
          if (address) {
            const bnsName = await fetchBnsName(address);
            setUserData({ address, bnsName });
            setIsAuthenticated(true);
          }
        }
      } catch {
        // no session
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);

  const signIn = useCallback(async () => {
    try {
      await connect();
      const address = getAddressFromStorage();
      if (address) {
        const bnsName = await fetchBnsName(address);
        setUserData({ address, bnsName });
        setIsAuthenticated(true);

        // Route new wallets to onboarding, returning wallets to home
        const onboardedKey = `stacks_onboarded_${address}`;
        const hasOnboarded = localStorage.getItem(onboardedKey);
      if (!hasOnboarded) {
        localStorage.setItem(onboardedKey, "true");
        navigate("/");
      } else {
        navigate("/");
      }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.toLowerCase().includes("wallet") ||
        msg.toLowerCase().includes("extension") ||
        msg.toLowerCase().includes("provider") ||
        msg.toLowerCase().includes("canceled")
      ) {
        // User canceled or no wallet — silently ignore
        return;
      }
      console.error("Stacks sign-in error:", err);
    }
  }, [navigate]);

  const signOut = useCallback(() => {
    try {
      disconnect();
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    setUserData(null);
    navigate("/auth");
  }, [navigate]);

  const truncateAddress = (addr: string) =>
    addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";

  return { isAuthenticated, userData, isLoading, signIn, signOut, truncateAddress };
};
