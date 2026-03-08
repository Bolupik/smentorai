import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useStacksAuth } from "@/hooks/useStacksAuth";
import { motion } from "framer-motion";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const { isAuthenticated: isWalletConnected, isLoading: isWalletLoading } = useStacksAuth();
  const navigate = useNavigate();

  const authLoading = isLoading || isWalletLoading;
  const isAuthorized = !!user || isWalletConnected;

  useEffect(() => {
    if (!authLoading && !isAuthorized) {
      navigate("/auth");
    }
  }, [isAuthorized, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full"
          />
          <p className="text-muted-foreground text-sm">Initializing...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
