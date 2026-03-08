import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

type NetworkStatus = "online" | "offline" | "checking";

/**
 * Monitors real connectivity to the backend by:
 * 1. Listening to browser online/offline events
 * 2. Periodically pinging the backend on failure
 * 3. Exposing a manual retry trigger
 */
export const useNetworkStatus = () => {
  const [status, setStatus] = useState<NetworkStatus>("checking");
  const [retryCount, setRetryCount] = useState(0);

  const checkConnectivity = useCallback(async () => {
    setStatus("checking");
    try {
      // Lightweight ping — just read the session (no DB query needed)
      await supabase.auth.getSession();
      setStatus("online");
    } catch {
      setStatus("offline");
    }
  }, []);

  // Initial check + reconnect after browser comes back online
  useEffect(() => {
    checkConnectivity();

    const handleOnline = () => checkConnectivity();
    const handleOffline = () => setStatus("offline");

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [checkConnectivity]);

  // Auto-retry every 8s while offline
  useEffect(() => {
    if (status !== "offline") return;
    const timer = setTimeout(() => {
      setRetryCount((c) => c + 1);
      checkConnectivity();
    }, 8000);
    return () => clearTimeout(timer);
  }, [status, retryCount, checkConnectivity]);

  const retry = useCallback(() => {
    setRetryCount((c) => c + 1);
    checkConnectivity();
  }, [checkConnectivity]);

  return { status, retry };
};
