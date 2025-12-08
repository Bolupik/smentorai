import { motion } from "framer-motion";
import { Twitter, Share2, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

interface ShareAchievementProps {
  unlockedCount: number;
  totalAchievements: number;
  exploredCount: number;
  totalTopics: number;
  allCompleted: boolean;
}

const ShareAchievement = ({ 
  unlockedCount, 
  totalAchievements, 
  exploredCount, 
  totalTopics,
  allCompleted 
}: ShareAchievementProps) => {
  const [copied, setCopied] = useState(false);

  const getShareText = () => {
    if (allCompleted) {
      return `🏆 I just became a Stacks Master! Completed all ${totalTopics} topics and unlocked ${unlockedCount}/${totalAchievements} achievements on Stacks AI.\n\nLearn about Bitcoin L2, DeFi, NFTs & more 👇`;
    }
    return `🎯 Learning about Stacks blockchain! Explored ${exploredCount}/${totalTopics} topics and unlocked ${unlockedCount}/${totalAchievements} achievements.\n\nJoin me on Stacks AI 👇`;
  };

  const shareUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shareText = getShareText();
  
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Stacks AI Achievement",
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Share failed:", err);
        }
      }
    }
  };

  if (exploredCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="mt-4 flex flex-wrap items-center justify-center gap-2"
    >
      <span className="text-xs text-muted-foreground mr-1">Share your progress:</span>
      
      <Button
        variant="outline"
        size="sm"
        asChild
        className="rounded-full text-xs hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2] hover:border-[#1DA1F2]/50 transition-all"
      >
        <a href={twitterUrl} target="_blank" rel="noopener noreferrer">
          <Twitter className="w-3.5 h-3.5 mr-1.5" />
          Post on X
        </a>
      </Button>

      {typeof navigator !== "undefined" && navigator.share && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleNativeShare}
          className="rounded-full text-xs hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all"
        >
          <Share2 className="w-3.5 h-3.5 mr-1.5" />
          Share
        </Button>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyLink}
        className="rounded-full text-xs hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all"
      >
        {copied ? (
          <>
            <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-green-500" />
            Copied!
          </>
        ) : (
          <>
            <Share2 className="w-3.5 h-3.5 mr-1.5" />
            Copy Link
          </>
        )}
      </Button>
    </motion.div>
  );
};

export default ShareAchievement;
