import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { connect, disconnect, isConnected, getLocalStorage } from "@stacks/connect";

export interface StacksUserData {
  address: string;
  bnsName?: string;
}

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

const getAddressFromStorage = (): string | undefined => {
  try {
    const localData = getLocalStorage();
    return (localData as { addresses?: { stx?: { address: string }[] } })?.addresses?.stx?.[0]?.address;
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
      // connect() in v8 is async — resolves when the user approves
      await connect();
      const address = getAddressFromStorage();
      if (address) {
        const bnsName = await fetchBnsName(address);
        setUserData({ address, bnsName });
        setIsAuthenticated(true);
        navigate("/");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.toLowerCase().includes("wallet") ||
        msg.toLowerCase().includes("extension") ||
        msg.toLowerCase().includes("provider")
      ) {
        alert(
          "No compatible Stacks wallet detected. Please install Xverse, Leather, or Asigna and try again."
        );
      }
      console.error("Stacks sign-in error:", err);
    }
  }, [navigate]);

  const signOut = useCallback(() => {
    disconnect();
    setIsAuthenticated(false);
    setUserData(null);
    navigate("/auth");
  }, [navigate]);

  const truncateAddress = (addr: string) =>
    addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";

  return { isAuthenticated, userData, isLoading, signIn, signOut, truncateAddress };
};
