import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import sammyMascot from "@/assets/sammy-mascot.jpg";

const ConnectionErrorBanner = () => {
  const { status, retry } = useNetworkStatus();
  const isOffline = status === "offline";
  const isChecking = status === "checking";

  return (
    <AnimatePresence>
      {(isOffline || isChecking) && (
        <motion.div
          key="conn-banner"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
          className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-between gap-3 px-4 sm:px-6 py-2.5 bg-card border-b border-destructive/40 shadow-lg shadow-black/40"
          style={{ backdropFilter: "blur(12px)" }}
        >
          {/* Left — Mascot + message */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Animated mascot */}
            <motion.div
              className="relative shrink-0 w-10 h-10 sm:w-12 sm:h-12"
              animate={
                isOffline
                  ? { rotate: [-3, 3, -3] }
                  : { rotate: 0 }
              }
              transition={{
                repeat: isOffline ? Infinity : 0,
                duration: 0.6,
                ease: "easeInOut",
              }}
            >
              <img
                src={sammyMascot}
                alt="Sammy warning"
                className="w-full h-full object-contain drop-shadow-[0_0_6px_hsl(0_85%_50%/0.6)]"
              />
              {/* Pulse ring */}
              {isOffline && (
                <motion.span
                  className="absolute inset-0 rounded-full border-2 border-destructive/50"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
                  transition={{ repeat: Infinity, duration: 1.8 }}
                />
              )}
            </motion.div>

            {/* Text */}
            <div className="min-w-0">
              {isOffline ? (
                <>
                  <p className="text-sm font-bold text-destructive leading-tight flex items-center gap-1.5">
                    <WifiOff className="w-3.5 h-3.5 shrink-0" />
                    Connection lost
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    Sammy can't reach the server · retrying automatically…
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-accent leading-tight flex items-center gap-1.5">
                    <Wifi className="w-3.5 h-3.5 shrink-0 animate-pulse" />
                    Reconnecting…
                  </p>
                  <p className="text-xs text-muted-foreground">Checking connection to the server</p>
                </>
              )}
            </div>
          </div>

          {/* Right — retry dots + button */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Animated dots while checking */}
            {isChecking && (
              <motion.div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-accent"
                    animate={{ opacity: [0.2, 1, 0.2], y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.2 }}
                  />
                ))}
              </motion.div>
            )}

            {isOffline && (
              <Button
                size="sm"
                variant="outline"
                onClick={retry}
                className="h-7 px-3 text-xs border-destructive/40 text-destructive hover:bg-destructive/10 gap-1.5"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConnectionErrorBanner;
