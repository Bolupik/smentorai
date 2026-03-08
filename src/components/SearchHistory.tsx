import { motion, AnimatePresence } from "framer-motion";
import { History, X, Trash2, Clock, Search } from "lucide-react";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { formatDistanceToNow } from "date-fns";

interface SearchHistoryProps {
  onSelectQuery: (query: string) => void;
}

const SearchHistory = ({ onSelectQuery }: SearchHistoryProps) => {
  const { history, removeFromHistory, clearHistory } = useSearchHistory();
  const [isOpen, setIsOpen] = useState(false);

  // Need to import useState separately
  if (!isOpen) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="relative flex items-center gap-2 px-3 py-2 rounded-full border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background/80 hover:border-primary/50 transition-all duration-200 text-sm text-muted-foreground"
      >
        <History className="w-4 h-4" />
        <span className="hidden sm:inline">History</span>
        {history.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
            {history.length > 9 ? "9+" : history.length}
          </span>
        )}
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        className="relative w-full max-w-md bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
          <div className="flex items-center gap-2.5">
            <History className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground tracking-tight">Search History</span>
            {history.length > 0 && (
              <span className="text-xs text-muted-foreground">({history.length})</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded-md hover:bg-destructive/10"
              >
                <Trash2 className="w-3 h-3" />
                Clear all
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="max-h-96 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "hsl(var(--border)) transparent" }}>
          {history.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <Search className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No searches yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Your chat questions will appear here</p>
            </div>
          ) : (
            <ul className="py-2">
              <AnimatePresence initial={false}>
                {history.map((item) => (
                  <motion.li
                    key={item.timestamp}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10, height: 0 }}
                    className="group flex items-start gap-3 px-5 py-3 hover:bg-muted/40 transition-colors cursor-pointer"
                    onClick={() => {
                      onSelectQuery(item.query);
                      setIsOpen(false);
                    }}
                  >
                    <Clock className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-snug line-clamp-2">{item.query}</p>
                      <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                        {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromHistory(item.timestamp);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all flex-shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Re-export with useState inside component properly
import { useState } from "react";
export default SearchHistory;
