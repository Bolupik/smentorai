import { lazy, Suspense, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { BearAction } from "./SammyBear3D";

// Lazy-load the 3D narrator so three.js is not in the initial bundle.
const SammyNarrator = lazy(() => import("./SammyNarrator"));

interface SammyCompanionProps {
  tips?: string[];
  autoGreetMs?: number;
}

const DEFAULT_TIPS = [
  "Hey! I'm Sammy. Tap me anytime for a quick nudge.",
  "New here? Try asking me about sBTC or Nakamoto in the chat.",
  "The Knowledge Repository just got tags — search 'PoX-5' or 'clarity'.",
  "Take today's quiz to keep your streak alive 🔥",
];

/** Schedule work after the page is idle, with a safe fallback. */
const runWhenIdle = (cb: () => void, timeout = 2500) => {
  if (typeof window === "undefined") return () => {};
  const w = window as unknown as {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };
  if (w.requestIdleCallback) {
    const id = w.requestIdleCallback(cb, { timeout });
    return () => w.cancelIdleCallback?.(id);
  }
  const id = window.setTimeout(cb, timeout);
  return () => window.clearTimeout(id);
};

const SammyCompanion = ({ tips = DEFAULT_TIPS, autoGreetMs = 1800 }: SammyCompanionProps) => {
  const reducedMotion = usePrefersReducedMotion();
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [tipIdx, setTipIdx] = useState(0);
  const [action, setAction] = useState<BearAction>("idle");

  // Defer mount until the browser is idle to keep TTI low.
  useEffect(() => {
    return runWhenIdle(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    const id = window.setTimeout(() => {
      setOpen(true);
      if (!reducedMotion) {
        setAction("wave");
        window.setTimeout(() => setAction("talk"), 900);
      }
    }, autoGreetMs);
    return () => window.clearTimeout(id);
  }, [ready, autoGreetMs, reducedMotion]);

  if (!ready) return null;

  const cycleTip = () => {
    setTipIdx((i) => (i + 1) % tips.length);
    if (!reducedMotion) setAction("talk");
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2 pointer-events-none">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.9 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.9 }}
            transition={reducedMotion ? { duration: 0.15 } : undefined}
            className="pointer-events-auto max-w-[220px] px-3.5 py-2 rounded-2xl rounded-br-sm bg-card border border-primary/30 shadow-xl text-xs text-foreground leading-relaxed"
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Dismiss Sammy"
              className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3" />
            </button>
            {tips[tipIdx]}
            <button
              onClick={cycleTip}
              className="block mt-1.5 text-[11px] font-medium text-primary hover:underline"
            >
              Next tip →
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={reducedMotion ? undefined : { scale: 1.06 }}
        whileTap={reducedMotion ? undefined : { scale: 0.94 }}
        onClick={() => {
          setOpen((o) => !o);
          if (!reducedMotion) setAction("wave");
        }}
        className="pointer-events-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary/25 to-primary/5 border border-primary/40 shadow-xl backdrop-blur-sm overflow-hidden"
        aria-label="Open Sammy the AI"
      >
        <Suspense fallback={<div className="w-full h-full rounded-full bg-primary/10 animate-pulse" />}>
          <SammyNarrator height={64} showBubble={false} action={action} compact headOnly />
        </Suspense>
      </motion.button>
    </div>
  );
};

export default SammyCompanion;
