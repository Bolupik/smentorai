import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface QuizStreakData {
  currentStreak: number;
  longestStreak: number;
  totalCompleted: number;
  completedToday: boolean;
  loading: boolean;
}

export const useQuizStreak = (): QuizStreakData => {
  const { user } = useAuth();
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [completedToday, setCompletedToday] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCurrentStreak(0);
      setLongestStreak(0);
      setTotalCompleted(0);
      setCompletedToday(false);
      setLoading(false);
      return;
    }

    const compute = async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from("daily_quiz_results")
          .select("quiz_date")
          .eq("user_id", user.id)
          .order("quiz_date", { ascending: false });

        if (!data || data.length === 0) {
          setLoading(false);
          return;
        }

        // Deduplicate dates (upsert might create one per day, but just in case)
        const dates = Array.from(
          new Set(data.map((r) => r.quiz_date))
        ).sort((a, b) => (a > b ? -1 : 1)); // descending

        setTotalCompleted(dates.length);

        const today = new Date().toISOString().split("T")[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

        setCompletedToday(dates[0] === today);

        // Current streak: consecutive days ending today or yesterday
        let streak = 0;
        let cursor = today;

        // Start from today or yesterday
        if (dates[0] !== today && dates[0] !== yesterday) {
          setCurrentStreak(0);
        } else {
          cursor = dates[0]; // start from latest
          for (const d of dates) {
            if (d === cursor) {
              streak++;
              // Go back one day
              const prev = new Date(cursor);
              prev.setDate(prev.getDate() - 1);
              cursor = prev.toISOString().split("T")[0];
            } else {
              break;
            }
          }
          setCurrentStreak(streak);
        }

        // Longest streak across all history
        let maxStreak = 0;
        let runStreak = 1;
        for (let i = 1; i < dates.length; i++) {
          const prev = new Date(dates[i - 1]);
          const curr = new Date(dates[i]);
          const diffDays = Math.round(
            (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (diffDays === 1) {
            runStreak++;
          } else {
            maxStreak = Math.max(maxStreak, runStreak);
            runStreak = 1;
          }
        }
        maxStreak = Math.max(maxStreak, runStreak);
        setLongestStreak(maxStreak);
      } finally {
        setLoading(false);
      }
    };

    compute();
  }, [user]);

  return { currentStreak, longestStreak, totalCompleted, completedToday, loading };
};
