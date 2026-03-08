import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { flushQueue, queueSize } from "@/lib/offlineQueue";
import { toast } from "sonner";

type NetworkStatus = "online" | "offline" | "checking";

/**
 * Monitors real connectivity to the backend by:
 * 1. Listening to browser online/offline events
 * 2. Periodically pinging the backend on failure
 * 3. Exposing a manual retry trigger
 * 4. Auto-flushing the offline write queue when connectivity is restored
 */
export const useNetworkStatus = () => {
  const [status, setStatus] = useState<NetworkStatus>("checking");
  const [retryCount, setRetryCount] = useState(0);
  const prevStatusRef = useRef<NetworkStatus>("checking");

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

  // Auto-flush the offline queue when we transition from offline → online
  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = status;

    if (status === "online" && (prev === "offline" || prev === "checking")) {
      const pending = queueSize();
      if (pending > 0) {
        flushQueue().then((flushed) => {
          if (flushed > 0) {
            toast.success(
              `Back online! ${flushed} saved action${flushed > 1 ? "s" : ""} synced. ✓`,
              { duration: 4000 }
            );
          }
        });
      } else if (prev === "offline") {
        // Just came back online with nothing to flush
        toast.success("Connection restored!", { duration: 3000 });
      }
    }
  }, [status]);

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
