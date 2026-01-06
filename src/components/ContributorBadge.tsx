import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { User } from "lucide-react";
import { useContributorProfile } from "@/hooks/useContributorProfile";

interface ContributorBadgeProps {
  userId: string;
  showName?: boolean;
  size?: "sm" | "md";
}

const ContributorBadge = ({ userId, showName = true, size = "sm" }: ContributorBadgeProps) => {
  const { profile, loading } = useContributorProfile(userId);

  const avatarSize = size === "sm" ? "w-5 h-5" : "w-8 h-8";
  const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";

  if (loading) {
    return (
      <div className="flex items-center gap-1.5">
        <div className={`${avatarSize} rounded-full bg-muted animate-pulse`} />
        {showName && <div className="w-16 h-3 bg-muted rounded animate-pulse" />}
      </div>
    );
  }

  const displayName = profile?.display_name || "Anonymous";

  return (
    <div className="flex items-center gap-1.5">
      <Avatar className={avatarSize}>
        <AvatarImage src={profile?.avatar_url || undefined} />
        <AvatarFallback className="text-xs">
          <User className={iconSize} />
        </AvatarFallback>
      </Avatar>
      {showName && (
        <span className="text-xs text-muted-foreground">{displayName}</span>
      )}
    </div>
  );
};

export default ContributorBadge;
