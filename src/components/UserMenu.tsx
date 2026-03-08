import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useStacksAuth } from "@/hooks/useStacksAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Trophy, Wallet, UserCircle } from "lucide-react";

interface UserMenuProps {
  exploredCount?: number;
  totalTopics?: number;
}

const UserMenu = ({ exploredCount = 0, totalTopics = 0 }: UserMenuProps) => {
  const { user, signOut, isLoading } = useAuth();
  const { isAuthenticated: isWalletConnected, userData: walletData, signOut: walletSignOut, truncateAddress } = useStacksAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />;
  }

  // Wallet-only connected (no Supabase session)
  if (!user && isWalletConnected && walletData) {
    const displayName = walletData.bnsName || truncateAddress(walletData.address);
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground hidden sm:inline">
              {displayName}
            </span>
          </motion.button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 bg-card border-border">
          <div className="px-3 py-2">
            {walletData.bnsName && (
              <p className="text-sm font-semibold text-foreground">{walletData.bnsName}</p>
            )}
            <p className="text-xs text-muted-foreground font-mono break-all">{walletData.address}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-2 cursor-default">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="text-sm">Progress: {exploredCount}/{totalTopics} topics</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => walletSignOut()}
            className="gap-2 text-destructive focus:text-destructive cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Disconnect Wallet
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (!user) {
    return (
      <Button
        onClick={() => navigate("/auth")}
        variant="outline"
        size="sm"
        className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
      >
        <User className="w-4 h-4 mr-2" />
        Sign In
      </Button>
    );
  }

  const username = user.user_metadata?.username || user.email?.split("@")[0] || "User";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
            <span className="text-xs font-bold text-primary-foreground">
              {username.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-sm font-medium text-foreground hidden sm:inline">{username}</span>
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-card border-border">
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-foreground">{username}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          {isWalletConnected && walletData && (
            <p className="text-xs text-primary mt-1 font-mono truncate">
              🔗 {walletData.bnsName || truncateAddress(walletData.address)}
            </p>
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 cursor-default">
          <Trophy className="w-4 h-4 text-primary" />
          <span className="text-sm">Progress: {exploredCount}/{totalTopics} topics</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            if (isWalletConnected) walletSignOut();
            await signOut();
            navigate("/");
          }}
          className="gap-2 text-destructive focus:text-destructive cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
