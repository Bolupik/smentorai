import { useState, useEffect } from "react";

const STORAGE_KEY = "stacks-ai-topic-progress";

export interface TopicProgress {
  explored: boolean;
  lastVisited?: number;
}

export type ProgressMap = Record<string, TopicProgress>;

export const useTopicProgress = () => {
  const [progress, setProgress] = useState<ProgressMap>({});

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setProgress(JSON.parse(stored));
      } catch {
        setProgress({});
      }
    }
  }, []);

  const markExplored = (topicTitle: string) => {
    setProgress((prev) => {
      const updated = {
        ...prev,
        [topicTitle]: { explored: true, lastVisited: Date.now() },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const isExplored = (topicTitle: string) => progress[topicTitle]?.explored ?? false;

  const exploredCount = Object.values(progress).filter((p) => p.explored).length;

  const resetProgress = () => {
    setProgress({});
    localStorage.removeItem(STORAGE_KEY);
  };

  return { progress, markExplored, isExplored, exploredCount, resetProgress };
};
