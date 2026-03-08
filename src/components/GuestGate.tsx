import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, UserPlus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsGuest } from "@/hooks/useIsGuest";
import { ReactNode } from "react";

interface GuestGateProps {
  children?: ReactNode;
  /** Short label describing what's locked, e.g. "quiz submissions" */
  feature?: string;
  /** If true, wraps children in a relative container and overlays the gate */
  overlay?: boolean;
}

/**
 * Renders a sign-up prompt in place of (or on top of) restricted content
 * when the current user is an anonymous guest.
 */
const GuestGate = ({ children, feature = "this feature", overlay = false }: GuestGateProps) => {
  const isGuest = useIsGuest();
  const navigate = useNavigate();

  if (!isGuest) return <>{children}</>;

  const prompt = (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center text-center gap-4 px-6 py-10 rounded-xl border border-border bg-card/90 backdrop-blur-sm"
    >
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
        <Lock className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-foreground mb-1">Create an account to unlock</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Guest sessions can't access {feature}. Sign up to save progress, earn achievements, and contribute.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs">
        <Button
          size="sm"
          className="flex-1 gap-2"
          onClick={() => navigate("/auth")}
        >
          <UserPlus className="w-4 h-4" />
          Sign Up Free
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 gap-2"
          onClick={() => navigate("/auth")}
        >
          <Wallet className="w-4 h-4" />
          Use Wallet
        </Button>
      </div>
    </motion.div>
  );

  if (overlay) {
    return (
      <div className="relative">
        <div className="pointer-events-none select-none opacity-30 blur-[2px]">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center p-4">
          {prompt}
        </div>
      </div>
    );
  }

  return prompt;
};

export default GuestGate;
