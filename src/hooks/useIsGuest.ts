import { useAuth } from "@/contexts/AuthContext";
import { useStacksAuth } from "./useStacksAuth";

/**
 * Returns true when the current session is an anonymous (guest) user —
 * i.e. they signed in with signInAnonymously() and have neither a
 * verified email nor a connected Stacks wallet.
 */
export const useIsGuest = (): boolean => {
  const { user } = useAuth();
  const { isAuthenticated: isWalletConnected } = useStacksAuth();

  if (isWalletConnected) return false;
  if (!user) return false;
  return !!user.is_anonymous;
};
