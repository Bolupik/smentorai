import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, ExternalLink } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface SearchResult {
  title: string;
  description: string;
  category: string;
  url?: string;
  action?: string;
}

const stacksDapps: SearchResult[] = [
  // DeFi Protocols
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
    title: "Bitflow Finance",
    description: "Stablecoin-focused DEX - deep liquidity for price-stable asset trading",
    category: "DEX",
    url: "https://www.bitflow.finance",
  },
  {
    title: "Hermetica",
    description: "DeFi vaults protocol - automated yield strategies for stSTX and BTC",
    category: "Vaults",
    url: "https://www.hermetica.fi",
  },
  {
    title: "XLink",
    description: "Cross-chain bridge - bridge assets between Bitcoin L2s and other chains",
    category: "Bridge",
    url: "https://www.xlink.network",
  },
  {
    title: "Lisa Protocol",
    description: "Liquid stacking alternative - earn BTC rewards with LiSTX tokens",
    category: "Stacking",
    url: "https://www.lisalab.io",
  },
  // NFT Marketplaces
  {
    title: "Gamma",
    description: "Premier NFT marketplace on Stacks - buy, sell, and create NFTs",
    category: "NFT",
    url: "https://gamma.io",
  },
  {
    title: "STXNFT",
    description: "NFT marketplace with social features - discover and trade Stacks NFTs",
    category: "NFT",
    url: "https://stxnft.com",
  },
  // Wallets
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
  // Infrastructure
  {
    title: "Stacks Explorer",
    description: "Official block explorer - track transactions, contracts, and addresses",
    category: "Tools",
    url: "https://explorer.hiro.so",
  },
  {
    title: "Hiro Platform",
    description: "Developer tools and APIs for building on Stacks",
    category: "Tools",
    url: "https://www.hiro.so",
  },
  // Exchanges
  {
    title: "Buy STX on OKX",
    description: "Major exchange with STX trading pairs",
    category: "Exchange",
    url: "https://www.okx.com",
  },
  {
    title: "Buy STX on Binance",
    description: "World's largest crypto exchange - STX/USDT, STX/BTC pairs",
    category: "Exchange",
    url: "https://www.binance.com",
  },
  {
    title: "Buy STX on Coinbase",
    description: "US-regulated exchange for buying STX",
    category: "Exchange",
    url: "https://www.coinbase.com",
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
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (query.trim()) {
      const filtered = stacksDapps.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [query]);

  const handleResultClick = (result: SearchResult) => {
    if (result.url) {
      window.open(result.url, "_blank", "noopener,noreferrer");
    }
    if (result.action && onSearch) {
      onSearch(result.action);
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
            <span className="text-sm text-muted-foreground hidden sm:inline">Search dApps</span>
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, width: 200 }}
            animate={{ opacity: 1, width: 320 }}
            exit={{ opacity: 0, width: 200 }}
            className="relative"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary/50 bg-background/95 backdrop-blur-sm">
              <Search className="w-4 h-4 text-primary" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Stacks dApps..."
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

            {/* Results dropdown */}
            <AnimatePresence>
              {(results.length > 0 || query.trim()) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-2 left-0 right-0 bg-card/95 backdrop-blur-md border border-border/50 rounded-xl shadow-xl overflow-hidden z-50 max-h-80 overflow-y-auto"
                >
                  {results.length > 0 ? (
                    <div className="py-2">
                      {results.map((result, idx) => (
                        <motion.button
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => handleResultClick(result)}
                          className="w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left group"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-foreground truncate">
                                {result.title}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getCategoryColor(
                                  result.category
                                )}`}
                              >
                                {result.category}
                              </span>
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
                  ) : (
                    <div className="px-4 py-6 text-center text-muted-foreground text-sm">
                      No dApps found for "{query}"
                    </div>
                  )}
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
