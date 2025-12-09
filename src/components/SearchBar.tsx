import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ExternalLink, Github, Loader2 } from "lucide-react";
import { Input } from "./ui/input";

interface SearchResult {
  title: string;
  description: string;
  category: string;
  url?: string;
  stars?: number;
  language?: string;
}

// Static Stacks dApps as fallback/defaults
const stacksDapps: SearchResult[] = [
  {
    title: "ALEX",
    description: "Leading DEX on Stacks - swap, stake, farm, and earn yield on Bitcoin DeFi",
    category: "DEX",
    url: "https://alexgo.io",
  },
  {
    title: "StackingDAO",
    description: "Liquid stacking protocol - earn BTC yield while keeping liquidity with stSTX",
    category: "Stacking",
    url: "https://www.stackingdao.com",
  },
  {
    title: "Zest Protocol",
    description: "Bitcoin-native lending protocol - borrow and lend with BTC on Stacks",
    category: "Lending",
    url: "https://www.zestprotocol.com",
  },
  {
    title: "Arkadiko",
    description: "Self-repaying loans - mint USDA stablecoin using STX as collateral",
    category: "Stablecoin",
    url: "https://arkadiko.finance",
  },
  {
    title: "Velar",
    description: "DEX with perpetuals - swap assets and trade with up to 20x leverage",
    category: "DEX",
    url: "https://www.velar.co",
  },
  {
    title: "Gamma",
    description: "Premier NFT marketplace on Stacks - buy, sell, and create NFTs",
    category: "NFT",
    url: "https://gamma.io",
  },
  {
    title: "Leather Wallet",
    description: "Privacy-focused Bitcoin and Stacks wallet - browser extension",
    category: "Wallet",
    url: "https://leather.io",
  },
  {
    title: "Xverse Wallet",
    description: "Mobile-first Bitcoin and Stacks wallet - iOS, Android, and desktop",
    category: "Wallet",
    url: "https://www.xverse.app",
  },
];

interface SearchBarProps {
  onSearch?: (query: string) => void;
  variant?: "landing" | "chat";
}

const SearchBar = ({ onSearch, variant = "landing" }: SearchBarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchMode, setSearchMode] = useState<"local" | "github">("local");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchGitHub = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Search GitHub for Clarity language repos
      const response = await fetch(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(
          searchQuery + " language:clarity"
        )}&sort=stars&order=desc&per_page=15`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("GitHub API error");
      }

      const data = await response.json();
      
      const githubResults: SearchResult[] = data.items?.map((repo: any) => ({
        title: repo.full_name,
        description: repo.description || "No description available",
        category: "GitHub",
        url: repo.html_url,
        stars: repo.stargazers_count,
        language: repo.language || "Clarity",
      })) || [];

      setResults(githubResults);
    } catch (error) {
      console.error("GitHub search error:", error);
      // Fall back to local search on error
      const filtered = stacksDapps.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setResults(filtered);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchLocal = useCallback((searchQuery: string) => {
    if (searchQuery.trim()) {
      const filtered = stacksDapps.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchMode === "github") {
      debounceRef.current = setTimeout(() => {
        searchGitHub(query);
      }, 400);
    } else {
      searchLocal(query);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, searchMode, searchGitHub, searchLocal]);

  const handleResultClick = (result: SearchResult) => {
    if (result.url) {
      window.open(result.url, "_blank", "noopener,noreferrer");
    }
    if (onSearch) {
      onSearch(result.title);
    }
    setIsOpen(false);
    setQuery("");
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      DEX: "bg-emerald-500/20 text-emerald-400",
      Stacking: "bg-amber-500/20 text-amber-400",
      Lending: "bg-blue-500/20 text-blue-400",
      Stablecoin: "bg-green-500/20 text-green-400",
      Vaults: "bg-purple-500/20 text-purple-400",
      Bridge: "bg-cyan-500/20 text-cyan-400",
      NFT: "bg-pink-500/20 text-pink-400",
      Wallet: "bg-orange-500/20 text-orange-400",
      Tools: "bg-slate-500/20 text-slate-400",
      Exchange: "bg-yellow-500/20 text-yellow-400",
      GitHub: "bg-gray-500/20 text-gray-300",
    };
    return colors[category] || "bg-muted text-muted-foreground";
  };

  return (
    <div ref={containerRef} className="relative">
      <AnimatePresence>
        {!isOpen ? (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background/80 hover:border-primary/50 transition-all duration-300 ${
              variant === "chat" ? "text-sm" : ""
            }`}
          >
            <Search className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground hidden sm:inline">Search Clarity dApps</span>
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, width: 200 }}
            animate={{ opacity: 1, width: 380 }}
            exit={{ opacity: 0, width: 200 }}
            className="relative"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary/50 bg-background/95 backdrop-blur-sm">
              {isLoading ? (
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              ) : (
                <Search className="w-4 h-4 text-primary" />
              )}
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Clarity projects on GitHub..."
                className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 text-sm placeholder:text-muted-foreground"
              />
              <button
                onClick={() => {
                  setIsOpen(false);
                  setQuery("");
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Toggle */}
            <div className="absolute top-full mt-2 left-0 right-0 flex gap-1 px-2">
              <button
                onClick={() => setSearchMode("github")}
                className={`flex-1 text-xs py-1.5 px-3 rounded-t-lg transition-colors ${
                  searchMode === "github"
                    ? "bg-card/95 text-foreground border-t border-x border-border/50"
                    : "bg-muted/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Github className="w-3 h-3 inline mr-1" />
                GitHub Clarity
              </button>
              <button
                onClick={() => setSearchMode("local")}
                className={`flex-1 text-xs py-1.5 px-3 rounded-t-lg transition-colors ${
                  searchMode === "local"
                    ? "bg-card/95 text-foreground border-t border-x border-border/50"
                    : "bg-muted/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                Stacks dApps
              </button>
            </div>

            {/* Results dropdown */}
            <AnimatePresence>
              {(results.length > 0 || query.trim() || isLoading) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-10 left-0 right-0 bg-card/95 backdrop-blur-md border border-border/50 rounded-xl shadow-xl overflow-hidden z-50 max-h-80 overflow-y-auto"
                >
                  {isLoading ? (
                    <div className="px-4 py-6 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Searching GitHub...
                    </div>
                  ) : results.length > 0 ? (
                    <div className="py-2">
                      {results.map((result, idx) => (
                        <motion.button
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          onClick={() => handleResultClick(result)}
                          className="w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left group"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-medium text-foreground truncate max-w-[200px]">
                                {result.title}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getCategoryColor(
                                  result.category
                                )}`}
                              >
                                {result.category}
                              </span>
                              {result.stars !== undefined && (
                                <span className="text-[10px] text-yellow-400 flex items-center gap-0.5">
                                  ⭐ {result.stars.toLocaleString()}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {result.description}
                            </p>
                          </div>
                          {result.url && (
                            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  ) : query.trim() ? (
                    <div className="px-4 py-6 text-center text-muted-foreground text-sm">
                      No Clarity projects found for "{query}"
                    </div>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
