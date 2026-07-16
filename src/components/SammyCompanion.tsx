import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import SammyNarrator from "./SammyNarrator";
import type { BearAction } from "./SammyBear3D";

interface SammyCompanionProps {
  /** Rotating lines the companion cycles through. */
  tips?: string[];
  /** Auto-open the tip bubble on mount. */
  autoGreetMs?: number;
}

const DEFAULT_TIPS = [
  "Hey! I'm Sammy. Tap me anytime for a quick nudge.",
  "New here? Try asking me about sBTC or Nakamoto in the chat.",
  "The Knowledge Repository just got tags — search 'PoX-5' or 'clarity'.",
  "Take today's quiz to keep your streak alive 🔥",
];

const SammyCompanion = ({ tips = DEFAULT_TIPS, autoGreetMs = 1800 }: SammyCompanionProps) => {
  const [open, setOpen] = useState(false);
  const [tipIdx, setTipIdx] = useState(0);
  const [action, setAction] = useState<BearAction>("idle");

  useEffect(() => {
    const id = window.setTimeout(() => {
      setOpen(true);
      setAction("wave");
      window.setTimeout(() => setAction("talk"), 900);
    }, autoGreetMs);
    return () => window.clearTimeout(id);
  }, [autoGreetMs]);

  const cycleTip = () => {
    setTipIdx((i) => (i + 1) % tips.length);
    setAction("talk");
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2 pointer-events-none">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="pointer-events-auto max-w-[240px] px-4 py-2.5 rounded-2xl rounded-br-sm bg-card border border-primary/30 shadow-xl text-xs sm:text-sm text-foreground leading-relaxed"
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
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => {
          setOpen((o) => !o);
          setAction("wave");
        }}
        className="pointer-events-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primary/25 to-primary/5 border border-primary/40 shadow-xl backdrop-blur-sm overflow-hidden"
        aria-label="Open Sammy the AI"
      >
        <SammyNarrator height={96} showBubble={false} action={action} compact />
      </motion.button>
    </div>
  );
};

export default SammyCompanion;
