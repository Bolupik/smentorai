import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { connect, disconnect, isConnected, getLocalStorage } from "@stacks/connect";

export interface StacksUserData {
  address: string;
  bnsName?: string;
}

export const useStacksAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<StacksUserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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

  const loadSession = useCallback(async () => {
    try {
      if (isConnected()) {
        const localData = getLocalStorage();
        const address = localData?.addresses?.stx?.[0]?.address;
        if (address) {
          const bnsName = await fetchBnsName(address);
          setUserData({ address, bnsName });
          setIsAuthenticated(true);
        }
      }
    } catch {
      // no persisted session
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const signIn = useCallback(async () => {
    try {
      await connect({
        onFinish: async (payload) => {
          const address =
            payload?.userSession?.loadUserData()?.profile?.stxAddress?.mainnet ??
            getLocalStorage()?.addresses?.stx?.[0]?.address;

          if (address) {
            const bnsName = await fetchBnsName(address);
            setUserData({ address, bnsName });
            setIsAuthenticated(true);
            navigate("/");
          }
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes("wallet") || msg.toLowerCase().includes("extension")) {
        alert(
          "No compatible Stacks wallet detected. Please install Xverse, Leather, or Asigna and try again."
        );
      }
      throw err;
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
