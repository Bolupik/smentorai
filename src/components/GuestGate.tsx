import { ReactNode } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useStacksAuth } from "@/hooks/useStacksAuth";
import { Button } from "./ui/button";
import { Lock, UserPlus, Wallet } from "lucide-react";

interface GuestGateProps {
  children?: ReactNode;
  /** Short label for what is being unlocked, e.g. "submit quiz answers" */
  featureLabel?: string;
}

/**
 * Wraps any feature and replaces it with an upgrade prompt when the current
 * user is an anonymous (guest) session. Can also be used standalone (no children)
 * as a full wall. Authenticated email users and wallet-connected users pass through.
 */
const GuestGate = ({ children, featureLabel = "use this feature" }: GuestGateProps) => {
  const { user } = useAuth();
  const { isAuthenticated: isWalletConnected } = useStacksAuth();
  const navigate = useNavigate();

  // Authenticated email user (non-anonymous) or wallet user → no gate
  const isRealUser = (user && !user.is_anonymous) || isWalletConnected;
  if (isRealUser) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col items-center justify-center gap-6 py-12 px-6 text-center rounded-xl border border-dashed border-border bg-card/50"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center"
      >
        <Lock className="w-7 h-7 text-primary" />
      </motion.div>

      <div className="space-y-2 max-w-xs">
        <h3 className="text-lg font-bold text-foreground">Sign in to {featureLabel}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Guest sessions are read-only. Create a free account or connect your Stacks wallet to unlock everything.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <Button
          onClick={() => navigate("/auth")}
          className="flex-1 gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Sign Up Free
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate("/auth")}
          className="flex-1 gap-2 border-primary/40 text-primary hover:bg-primary/10"
        >
          <Wallet className="w-4 h-4" />
          Connect Wallet
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Already have an account?{" "}
        <button
          onClick={() => navigate("/auth")}
          className="text-primary hover:underline font-medium"
        >
          Sign in
        </button>
      </p>
    </motion.div>
  );
};

export default GuestGate;
