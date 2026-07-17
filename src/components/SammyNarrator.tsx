import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { motion, AnimatePresence } from "framer-motion";
import SammyBear3D, { type BearAction } from "./SammyBear3D";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface SammyNarratorProps {
  message?: string;
  action?: BearAction;
  /** Container height in px. Default 200. */
  height?: number;
  showBubble?: boolean;
  compact?: boolean;
  /** Render only the bear head (used for small corner/companion display). */
  headOnly?: boolean;
}

/**
 * Interactive 3D Sammy the AI narrator.
 * Respects prefers-reduced-motion: swaps the Canvas for a static mascot avatar
 * so no continuous rAF loops run on the user's device.
 */
const SammyNarrator = ({
  message,
  action,
  height = 200,
  showBubble = true,
  compact = false,
  headOnly = false,
}: SammyNarratorProps) => {
  const reducedMotion = usePrefersReducedMotion();
  const [talking, setTalking] = useState(false);

  useEffect(() => {
    if (!message) return;
    setTalking(true);
    const ms = Math.min(6500, Math.max(1400, message.length * 55));
    const id = window.setTimeout(() => setTalking(false), ms);
    return () => window.clearTimeout(id);
  }, [message]);

  const effectiveAction: BearAction = action ?? (talking && !reducedMotion ? "talk" : "idle");

  // Head-only tightens the camera and hides the floor shadow
  const camPos: [number, number, number] = headOnly ? [0, 0.05, 2.2] : [0, 0.6, 3.2];
  const fov = headOnly ? 32 : 38;

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
          shadows={!reducedMotion}
          camera={{ position: camPos, fov }}
          dpr={reducedMotion ? 1 : [1, 2]}
          frameloop={reducedMotion ? "demand" : "always"}
          gl={{ antialias: !reducedMotion, alpha: true, powerPreference: "low-power" }}
        >
          <ambientLight intensity={0.7} />
          <directionalLight
            position={[3, 4, 4]}
            intensity={1.05}
            castShadow={!reducedMotion}
            shadow-mapSize-width={512}
            shadow-mapSize-height={512}
          />
          <directionalLight position={[-3, 2, 1]} intensity={0.35} color="#8ec5ff" />
          <Suspense fallback={null}>
            <SammyBear3D action={effectiveAction} headOnly={headOnly} reducedMotion={reducedMotion} />
          </Suspense>
        </Canvas>

        {!headOnly && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-24 h-3 rounded-full bg-black/25 blur-md pointer-events-none" />
        )}
      </div>

      <AnimatePresence>
        {showBubble && message && (
          <motion.div
            key={message}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.96 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.96 }}
            transition={reducedMotion ? { duration: 0.15 } : { type: "spring", stiffness: 260, damping: 22 }}
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
