import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { motion, AnimatePresence } from "framer-motion";
import SammyBear3D, { type BearAction } from "./SammyBear3D";

interface SammyNarratorProps {
  /** Line the bear speaks. When it changes, the bear animates a talk cycle. */
  message?: string;
  /** Override the current action manually. If omitted, `message` toggles talk automatically. */
  action?: BearAction;
  /** Container height in px. Default 200. */
  height?: number;
  /** Show the speech bubble. Default true when `message` is set. */
  showBubble?: boolean;
  /** Compact circular framing (used in corner/empty-state). */
  compact?: boolean;
}

/**
 * Interactive 3D Sammy the AI narrator.
 *
 * Uses procedural geometry (no GLB) so it loads instantly and works offline.
 * When `message` changes it plays a short talk animation, otherwise it idles.
 */
const SammyNarrator = ({
  message,
  action,
  height = 200,
  showBubble = true,
  compact = false,
}: SammyNarratorProps) => {
  const [talking, setTalking] = useState(false);

  useEffect(() => {
    if (!message) return;
    setTalking(true);
    // Roughly 55ms per character, clamped, matches natural reading pace
    const ms = Math.min(6500, Math.max(1400, message.length * 55));
    const id = window.setTimeout(() => setTalking(false), ms);
    return () => window.clearTimeout(id);
  }, [message]);

  const effectiveAction: BearAction = action ?? (talking ? "talk" : "idle");

  return (
    <div className="w-full flex flex-col items-center">
      <div
        className={`relative w-full ${compact ? "rounded-full" : "rounded-2xl"} overflow-hidden`}
        style={{
          height,
          background:
            "radial-gradient(ellipse at center top, hsl(var(--primary) / 0.18), transparent 65%), linear-gradient(180deg, hsl(var(--muted) / 0.25), transparent)",
        }}
        aria-label="Sammy the AI mascot"
      >
        <Canvas
          shadows
          camera={{ position: [0, 0.6, 3.2], fov: 38 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.65} />
          <directionalLight
            position={[3, 4, 4]}
            intensity={1.1}
            castShadow
            shadow-mapSize-width={512}
            shadow-mapSize-height={512}
          />
          <directionalLight position={[-3, 2, 1]} intensity={0.35} color="#8ec5ff" />
          <Suspense fallback={null}>
            <SammyBear3D action={effectiveAction} />
          </Suspense>
        </Canvas>

        {/* Soft floor shadow */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-24 h-3 rounded-full bg-black/25 blur-md pointer-events-none" />
      </div>

      <AnimatePresence>
        {showBubble && message && (
          <motion.div
            key={message}
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="relative mt-3 max-w-sm mx-auto px-4 py-2.5 rounded-2xl bg-card border border-primary/30 shadow-lg text-sm text-foreground leading-relaxed text-center"
          >
            <span
              aria-hidden
              className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-card border-l border-t border-primary/30"
            />
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SammyNarrator;
