import { useState, useEffect, useCallback } from "react";

const HISTORY_KEY = "sammy_search_history";
const MAX_HISTORY = 50;

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

export const useSearchHistory = () => {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  const addToHistory = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setHistory((prev) => {
      const filtered = prev.filter(
        (item) => item.query.toLowerCase() !== trimmed.toLowerCase()
      );
      const updated = [
        { query: trimmed, timestamp: Date.now() },
        ...filtered,
      ].slice(0, MAX_HISTORY);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeFromHistory = useCallback((timestamp: number) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.timestamp !== timestamp);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  }, []);

  return { history, addToHistory, removeFromHistory, clearHistory };
};
