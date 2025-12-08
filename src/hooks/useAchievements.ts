import { useMemo } from "react";
import { ProgressMap } from "./useTopicProgress";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requiredTopics: string[];
  unlocked: boolean;
}

const achievementDefinitions: Omit<Achievement, "unlocked">[] = [
  {
    id: "first-step",
    title: "First Step",
    description: "Explore your first topic",
    icon: "🎯",
    requiredTopics: [], // Any 1 topic
  },
  {
    id: "architect",
    title: "Architect",
    description: "Learn about Stacks Architecture & Clarity",
    icon: "🏗️",
    requiredTopics: ["Stacks Architecture", "Clarity Language"],
  },
  {
    id: "defi-explorer",
    title: "DeFi Explorer",
    description: "Master DeFi Protocols & STX Stacking",
    icon: "💰",
    requiredTopics: ["DeFi Protocols", "STX Stacking"],
  },
  {
    id: "collector",
    title: "Digital Collector",
    description: "Discover NFTs & Memecoins",
    icon: "🖼️",
    requiredTopics: ["NFTs & Collections", "Memecoins"],
  },
  {
    id: "bitcoin-native",
    title: "Bitcoin Native",
    description: "Understand sBTC Integration",
    icon: "₿",
    requiredTopics: ["sBTC Integration"],
  },
  {
    id: "security-expert",
    title: "Security Expert",
    description: "Learn Security & Wallets best practices",
    icon: "🛡️",
    requiredTopics: ["Security & Wallets"],
  },
  {
    id: "stacks-master",
    title: "Stacks Master",
    description: "Complete all topics - You're ready!",
    icon: "🏆",
    requiredTopics: [
      "Stacks Architecture",
      "Clarity Language",
      "DeFi Protocols",
      "NFTs & Collections",
      "Memecoins",
      "STX Stacking",
      "sBTC Integration",
      "Security & Wallets",
    ],
  },
];

export const useAchievements = (progress: ProgressMap) => {
  const exploredTopics = useMemo(() => {
    return new Set(
      Object.entries(progress)
        .filter(([, p]) => p.explored)
        .map(([title]) => title)
    );
  }, [progress]);

  const achievements: Achievement[] = useMemo(() => {
    return achievementDefinitions.map((def) => {
      let unlocked = false;

      if (def.id === "first-step") {
        unlocked = exploredTopics.size >= 1;
      } else {
        unlocked = def.requiredTopics.every((topic) => exploredTopics.has(topic));
      }

      return { ...def, unlocked };
    });
  }, [exploredTopics]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalAchievements = achievements.length;
  const allCompleted = achievements.find((a) => a.id === "stacks-master")?.unlocked ?? false;

  return { achievements, unlockedCount, totalAchievements, allCompleted };
};
