import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface TopicProgress {
  explored: boolean;
  lastVisited?: string;
}

export type ProgressMap = Record<string, TopicProgress>;

const LOCAL_STORAGE_KEY = "stacks-ai-topic-progress";

export const useTopicProgressDB = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ProgressMap>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load progress from DB or localStorage
  useEffect(() => {
    const loadProgress = async () => {
      setIsLoading(true);
      
      if (user) {
        // Load from database
        const { data, error } = await supabase
          .from("topic_progress")
          .select("topic_title, explored, last_visited")
          .eq("user_id", user.id);

        if (!error && data) {
          const progressMap: ProgressMap = {};
          data.forEach((item) => {
            progressMap[item.topic_title] = {
              explored: item.explored,
              lastVisited: item.last_visited,
            };
          });
          setProgress(progressMap);
          
          // Sync any local progress to DB
          const localStored = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (localStored) {
            try {
              const localProgress = JSON.parse(localStored) as ProgressMap;
              const localTopics = Object.keys(localProgress);
              const dbTopics = new Set(Object.keys(progressMap));
              
              // Upload local topics not in DB
              for (const topic of localTopics) {
                if (!dbTopics.has(topic) && localProgress[topic].explored) {
                  await supabase.from("topic_progress").upsert({
                    user_id: user.id,
                    topic_title: topic,
                    explored: true,
                    last_visited: new Date().toISOString(),
                  });
                }
              }
              
              // Clear local storage after sync
              localStorage.removeItem(LOCAL_STORAGE_KEY);
            } catch {
              // Ignore parse errors
            }
          }
        }
      } else {
        // Load from localStorage for non-authenticated users
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          try {
            setProgress(JSON.parse(stored));
          } catch {
            setProgress({});
          }
        }
      }
      
      setIsLoading(false);
    };

    loadProgress();
  }, [user]);

  const markExplored = async (topicTitle: string) => {
    const newProgress: TopicProgress = {
      explored: true,
      lastVisited: new Date().toISOString(),
    };

    // Optimistic update
    setProgress((prev) => ({
      ...prev,
      [topicTitle]: newProgress,
    }));

    if (user) {
      // Save to database
      await supabase.from("topic_progress").upsert({
        user_id: user.id,
        topic_title: topicTitle,
        explored: true,
        last_visited: new Date().toISOString(),
      });
    } else {
      // Save to localStorage
      const updated = {
        ...progress,
        [topicTitle]: newProgress,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }
  };

  const isExplored = (topicTitle: string) => progress[topicTitle]?.explored ?? false;

  const exploredCount = Object.values(progress).filter((p) => p.explored).length;

  const resetProgress = async () => {
    setProgress({});
    
    if (user) {
      await supabase.from("topic_progress").delete().eq("user_id", user.id);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  return { progress, markExplored, isExplored, exploredCount, resetProgress, isLoading };
};
