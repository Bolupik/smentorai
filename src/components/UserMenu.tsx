import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Trophy } from "lucide-react";

interface UserMenuProps {
  exploredCount?: number;
  totalTopics?: number;
}

const UserMenu = ({ exploredCount = 0, totalTopics = 0 }: UserMenuProps) => {
  const { user, signOut, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />
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
          <span className="text-sm font-medium text-foreground hidden sm:inline">
            {username}
          </span>
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-card border-border">
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-foreground">{username}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 cursor-default">
          <Trophy className="w-4 h-4 text-primary" />
          <span className="text-sm">
            Progress: {exploredCount}/{totalTopics} topics
          </span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
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
