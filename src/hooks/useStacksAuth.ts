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

/**
 * Poll localStorage until the wallet address appears (or timeout).
 * @stacks/connect writes to localStorage *after* the connect() promise resolves,
 * so we need a short polling loop.
 */
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

export const useStacksAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<StacksUserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // On mount, check for an existing wallet session
  useEffect(() => {
    // Safety timeout: always resolve within 2s to prevent blank screen on mobile
    // where wallet extensions are unavailable
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
            // Fetch BNS name in the background — doesn't block auth
            fetchBnsName(address).then((bnsName) => {
              if (bnsName) setUserData((prev) => (prev ? { ...prev, bnsName } : prev));
            });
            return;
          }
        }
      } catch {
        // no session / no wallet extension (common on mobile)
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

      // Poll for the address because @stacks/connect writes localStorage asynchronously
      const address = await waitForAddress();
      if (address) {
        const bnsName = await fetchBnsName(address);
        setUserData({ address, bnsName });
        setIsAuthenticated(true);

        // Route new wallets to onboarding, returning wallets to home
        const onboardedKey = `stacks_onboarded_${address}`;
        const hasOnboarded = localStorage.getItem(onboardedKey);
        if (!hasOnboarded) {
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
