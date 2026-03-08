import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { retryWithBackoff } from "@/lib/retryWithBackoff";

export interface TopicProgress {
  explored: boolean;
  lastVisited?: string;
}

export type ProgressMap = Record<string, TopicProgress>;

const LOCAL_STORAGE_KEY = "stacks-ai-topic-progress";

/**
 * Resolves the currently authenticated user regardless of auth method.
 * Works for email users, wallet (anonymous) users, and guest users alike.
 */
const getCurrentUserId = async (): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
};

export const useTopicProgressDB = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressMap>({});
  const [isLoading, setIsLoading] = useState(true);

  // Resolve user ID from Supabase session (works for all auth methods)
  useEffect(() => {
    let cancelled = false;
    getCurrentUserId().then((id) => {
      if (!cancelled) setUserId(id);
    });

    // Also listen for auth state changes (e.g. wallet sign-in completing)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) setUserId(session?.user?.id ?? null);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  // Load progress from DB or localStorage whenever userId changes
  useEffect(() => {
    const loadProgress = async () => {
      setIsLoading(true);

      if (userId) {
        // Load from database — with retry on transient network errors
        const { data, error } = await retryWithBackoff(() =>
          Promise.resolve(
            supabase
              .from("topic_progress")
              .select("topic_title, explored, last_visited")
              .eq("user_id", userId)
          )
        );

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

              for (const topic of localTopics) {
                if (!dbTopics.has(topic) && localProgress[topic].explored) {
                  await supabase.from("topic_progress").upsert({
                    user_id: userId,
                    topic_title: topic,
                    explored: true,
                    last_visited: new Date().toISOString(),
                  });
                }
              }
              localStorage.removeItem(LOCAL_STORAGE_KEY);
            } catch {
              // Ignore parse errors
            }
          }
        }
      } else {
        // Load from localStorage for unauthenticated users
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
  }, [userId]);

  const markExplored = useCallback(async (topicTitle: string) => {
    const newProgress: TopicProgress = {
      explored: true,
      lastVisited: new Date().toISOString(),
    };

    // Optimistic update
    setProgress((prev) => ({ ...prev, [topicTitle]: newProgress }));

    // Re-fetch current user in case session resolved after mount
    const currentUserId = userId ?? await getCurrentUserId();

    if (currentUserId) {
      await supabase.from("topic_progress").upsert({
        user_id: currentUserId,
        topic_title: topicTitle,
        explored: true,
        last_visited: new Date().toISOString(),
      });
    } else {
      const updated = { ...progress, [topicTitle]: newProgress };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }
  }, [userId, progress]);

  const isExplored = (topicTitle: string) => progress[topicTitle]?.explored ?? false;

  const exploredCount = Object.values(progress).filter((p) => p.explored).length;

  const resetProgress = useCallback(async () => {
    setProgress({});
    const currentUserId = userId ?? await getCurrentUserId();
    if (currentUserId) {
      await supabase.from("topic_progress").delete().eq("user_id", currentUserId);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [userId]);

  return { progress, markExplored, isExplored, exploredCount, resetProgress, isLoading };
};
