import { useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { ExternalLink, Grid3X3, Filter, Star, Users, Zap } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

// Import logos
import stacksMentorLogo from "@/assets/sponsors/stacks-mentor-ai.png";
import boostxLogo from "@/assets/sponsors/boostx.png";
import zestLogo from "@/assets/sponsors/zest.jpg";
import stxtoolsLogo from "@/assets/sponsors/stxtools.ico";
import deorganizedLogo from "@/assets/sponsors/deorganized.jpg";
import hermeticaLogo from "@/assets/sponsors/hermetica.jpg";
import ryderLogo from "@/assets/sponsors/ryder.png";
import fakLogo from "@/assets/sponsors/fak.jpg";
import gammaLogo from "@/assets/sponsors/gamma.jpg";
import bitflowLogo from "@/assets/sponsors/bitflow.ico";
import zeroauthorityLogo from "@/assets/sponsors/zeroauthority.ico";
import velarLogo from "@/assets/sponsors/velar.jpg";
import alexLogo from "@/assets/sponsors/alex.jpg";
import arkadikoLogo from "@/assets/sponsors/arkadiko.jpg";

type Category = "All" | "DeFi" | "NFT" | "Tools" | "Wallets" | "Other";

const categories: Category[] = ["All", "DeFi", "NFT", "Tools", "Wallets", "Other"];

type DappInfo = {
  name: string;
  tagline: string;
  url: string;
  logo: string;
  category: Category;
  description: string;
  highlights: string[];
  rating: number;
};

const dapps: DappInfo[] = [
  { 
    name: "Stacks Mentor AI", 
    tagline: "AI-powered learning for Stacks", 
    url: "https://stacks-mentor-ai.lovable.app", 
    logo: stacksMentorLogo, 
    category: "Tools",
    description: "Your personal AI guide to mastering the Stacks ecosystem. Interactive lessons, quizzes, and real-time assistance for developers and enthusiasts.",
    highlights: ["Interactive AI Chat", "Progress Tracking", "Multi-topic Coverage"],
    rating: 4.9
  },
  { 
    name: "BoostX", 
    tagline: "Amplify your crypto journey", 
    url: "https://boostx.cc/", 
    logo: boostxLogo, 
    category: "Tools",
    description: "Comprehensive toolkit for maximizing your Stacks investments. Track portfolios, analyze trends, and boost your DeFi strategies.",
    highlights: ["Portfolio Analytics", "Yield Optimization", "Market Insights"],
    rating: 4.7
  },
  { 
    name: "Zest Protocol", 
    tagline: "DeFi lending on Bitcoin", 
    url: "https://app.zestprotocol.com", 
    logo: zestLogo, 
    category: "DeFi",
    description: "The leading Bitcoin-native lending protocol. Borrow against your BTC or earn yield by providing liquidity. Fully decentralized and secure.",
    highlights: ["BTC Collateral", "Competitive Rates", "Non-custodial"],
    rating: 4.8
  },
  { 
    name: "STX Tools", 
    tagline: "Essential Stacks analytics", 
    url: "https://stxtools.io/", 
    logo: stxtoolsLogo, 
    category: "Tools",
    description: "Real-time analytics dashboard for the Stacks ecosystem. Track transactions, monitor wallets, and analyze on-chain data with precision.",
    highlights: ["Live Data", "Wallet Tracking", "Transaction History"],
    rating: 4.6
  },
  { 
    name: "Deorganized", 
    tagline: "Web3 media & insights", 
    url: "https://deorganized.media", 
    logo: deorganizedLogo, 
    category: "Other",
    description: "Independent media platform covering Bitcoin L2s and the Stacks ecosystem. News, analysis, and community perspectives.",
    highlights: ["Daily Updates", "Expert Analysis", "Community Focus"],
    rating: 4.5
  },
  { 
    name: "Hermetica", 
    tagline: "Bitcoin-backed stablecoin", 
    url: "https://portfolio.hermetica.fi", 
    logo: hermeticaLogo, 
    category: "DeFi",
    description: "Create and manage Bitcoin-backed stablecoins. Maintain exposure to BTC while accessing stable liquidity for DeFi activities.",
    highlights: ["BTC-backed", "Stable Yields", "Low Fees"],
    rating: 4.7
  },
  { 
    name: "Ryder", 
    tagline: "Self-custody wallet", 
    url: "https://ryder.id", 
    logo: ryderLogo, 
    category: "Wallets",
    description: "Next-generation hardware wallet designed for Stacks and Bitcoin. True self-custody with an intuitive user experience.",
    highlights: ["Hardware Security", "Easy Setup", "Multi-chain"],
    rating: 4.8
  },
  { 
    name: "FAK", 
    tagline: "Fun on Stacks", 
    url: "https://fak.fun", 
    logo: fakLogo, 
    category: "Other",
    description: "The fun side of Stacks! Memes, community events, and entertainment built on Bitcoin's programmable layer.",
    highlights: ["Community Driven", "NFT Drops", "Events"],
    rating: 4.4
  },
  { 
    name: "Gamma", 
    tagline: "NFT marketplace", 
    url: "https://gamma.io", 
    logo: gammaLogo, 
    category: "NFT",
    description: "The premier NFT marketplace on Stacks. Discover, mint, and trade unique digital collectibles secured by Bitcoin.",
    highlights: ["Top Collections", "Creator Tools", "Low Fees"],
    rating: 4.9
  },
  { 
    name: "Bitflow", 
    tagline: "DeFi on Bitcoin", 
    url: "https://app.bitflow.finance", 
    logo: bitflowLogo, 
    category: "DeFi",
    description: "Seamless token swaps and liquidity provision on Stacks. Fast, secure, and built for the Bitcoin DeFi ecosystem.",
    highlights: ["Instant Swaps", "Deep Liquidity", "Low Slippage"],
    rating: 4.7
  },
  { 
    name: "Zero Authority DAO", 
    tagline: "Decentralized governance", 
    url: "https://zeroauthoritydao.com", 
    logo: zeroauthorityLogo, 
    category: "Other",
    description: "Community-governed DAO pushing the boundaries of decentralization on Stacks. Participate in proposals and shape the future.",
    highlights: ["Voting Power", "Proposals", "Treasury"],
    rating: 4.5
  },
  { 
    name: "Velar", 
    tagline: "DeFi Hub", 
    url: "https://velar.com", 
    logo: velarLogo, 
    category: "DeFi",
    description: "All-in-one DeFi hub for Stacks. Swap, stake, farm, and bridge assets across the Bitcoin ecosystem.",
    highlights: ["Multi-feature", "High APY", "Cross-chain"],
    rating: 4.6
  },
  { 
    name: "ALEX", 
    tagline: "Bitcoin DeFi", 
    url: "https://alex.io", 
    logo: alexLogo, 
    category: "DeFi",
    description: "The most comprehensive DeFi platform on Bitcoin. Advanced trading, lending, and yield strategies powered by Stacks.",
    highlights: ["Order Book DEX", "Launchpad", "Staking"],
    rating: 4.8
  },
  { 
    name: "Arkadiko", 
    tagline: "Stablecoin Protocol", 
    url: "https://arkadiko.finance", 
    logo: arkadikoLogo, 
    category: "DeFi",
    description: "Mint USDA stablecoins using STX as collateral. The backbone of stable liquidity in the Stacks DeFi ecosystem.",
    highlights: ["USDA Minting", "Vaults", "Governance"],
    rating: 4.7
  },
];

const categoryColors: Record<Category, string> = {
  All: "bg-primary/20 text-primary border-primary/30",
  DeFi: "bg-green-500/20 text-green-400 border-green-500/30",
  NFT: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Tools: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Wallets: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Other: "bg-muted text-muted-foreground border-border",
};

const DappCard = ({ dapp, compact = false }: { dapp: DappInfo; compact?: boolean }) => (
  <a
    href={dapp.url}
    target="_blank"
    rel="noopener noreferrer"
    className={`group flex-shrink-0 ${compact ? 'w-full' : 'w-40 sm:w-48'}`}
  >
    <div className={`relative overflow-hidden rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm ${compact ? 'p-3 sm:p-4' : 'p-3 sm:p-4'} hover:border-primary/50 hover:bg-card transition-all duration-300`}>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
          <img 
            src={dapp.logo} 
            alt={`${dapp.name} logo`} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="font-semibold text-foreground text-xs sm:text-sm truncate group-hover:text-primary transition-colors">
              {dapp.name}
            </h4>
            <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{dapp.tagline}</p>
        </div>
      </div>
      {compact && (
        <div className="mt-2 space-y-2">
          <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full border ${categoryColors[dapp.category]}`}>
            {dapp.category}
          </span>
          <p className="text-[10px] text-muted-foreground line-clamp-2">{dapp.description}</p>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <span className="text-[10px] text-muted-foreground">{dapp.rating}</span>
          </div>
        </div>
      )}
    </div>
  </a>
);

// Enhanced card with hover tooltip for marquee
const MarqueeCard = ({ dapp, onHover }: { dapp: DappInfo; onHover: (hovering: boolean) => void }) => (
  <TooltipProvider delayDuration={200}>
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.a
          href={dapp.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex-shrink-0 w-40 sm:w-48"
          onMouseEnter={() => onHover(true)}
          onMouseLeave={() => onHover(false)}
          whileHover={{ 
            scale: 1.08, 
            y: -8,
            zIndex: 50,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <motion.div 
            className="relative overflow-hidden rounded-xl border border-border/50 bg-card/90 backdrop-blur-md p-3 sm:p-4 transition-all duration-300"
            whileHover={{
              borderColor: "hsl(var(--primary))",
              boxShadow: "0 20px 40px -15px hsl(var(--primary) / 0.3), 0 0 20px -5px hsl(var(--primary) / 0.2)",
            }}
          >
            {/* Glow effect on hover */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
            
            <div className="relative flex items-center gap-2 sm:gap-3">
              <motion.div 
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden bg-muted flex items-center justify-center flex-shrink-0 ring-2 ring-transparent group-hover:ring-primary/50 transition-all"
                whileHover={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.5 }}
              >
                <img 
                  src={dapp.logo} 
                  alt={`${dapp.name} logo`} 
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-semibold text-foreground text-xs sm:text-sm truncate group-hover:text-primary transition-colors">
                    {dapp.name}
                  </h4>
                  <motion.div
                    initial={{ opacity: 0, x: -5 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="opacity-0 group-hover:opacity-100"
                  >
                    <ExternalLink className="w-3 h-3 text-primary" />
                  </motion.div>
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{dapp.tagline}</p>
              </div>
            </div>

            {/* Rating badge */}
            <motion.div 
              className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              initial={{ scale: 0 }}
              whileHover={{ scale: 1 }}
            >
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span className="text-[10px] font-medium text-yellow-500">{dapp.rating}</span>
            </motion.div>
          </motion.div>
        </motion.a>
      </TooltipTrigger>
      <TooltipContent 
        side="top" 
        className="max-w-xs p-4 bg-card/95 backdrop-blur-lg border-primary/30"
        sideOffset={12}
      >
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <img 
              src={dapp.logo} 
              alt={dapp.name} 
              className="w-10 h-10 rounded-lg object-cover"
            />
            <div>
              <h4 className="font-bold text-foreground">{dapp.name}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${categoryColors[dapp.category]}`}>
                  {dapp.category}
                </span>
                <div className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs text-muted-foreground">{dapp.rating}</span>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground leading-relaxed">
            {dapp.description}
          </p>
          
          <div className="flex flex-wrap gap-1.5">
            {dapp.highlights.map((highlight, i) => (
              <span 
                key={i}
                className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-md bg-primary/10 text-primary border border-primary/20"
              >
                <Zap className="w-2.5 h-2.5" />
                {highlight}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-1.5 pt-1 border-t border-border/50">
            <Users className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Click to visit</span>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const DappShowcase = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");
  const [isPaused, setIsPaused] = useState(false);
  const controls = useAnimationControls();

  // Duplicate dapps for seamless loop
  const duplicatedDapps = [...dapps, ...dapps, ...dapps];
  
  const filteredDapps = selectedCategory === "All" 
    ? dapps 
    : dapps.filter(dapp => dapp.category === selectedCategory);

  const handleHover = (hovering: boolean) => {
    setIsPaused(hovering);
  };

  return (
    <section className="w-full bg-background/80 backdrop-blur-sm border-t border-border/30">
      {/* Simple header with View All */}
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Stacks Ecosystem
        </h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
              <Grid3X3 className="w-3.5 h-3.5 mr-1.5" />
              View All
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Grid3X3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Stacks Ecosystem
              </DialogTitle>
            </DialogHeader>
            
            {/* Category Filter */}
            <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
              <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="flex gap-1.5 sm:gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium rounded-full border transition-all whitespace-nowrap ${
                      selectedCategory === category
                        ? categoryColors[category]
                        : "bg-background text-muted-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-3">
              {filteredDapps.map((dapp) => (
                <DappCard key={dapp.name} dapp={dapp} compact />
              ))}
            </div>
            {filteredDapps.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No dApps found in this category
              </p>
            )}
            <p className="text-[10px] sm:text-xs text-muted-foreground text-center mt-4">
              Click any app to visit • Always verify URLs before connecting your wallet
            </p>
          </DialogContent>
        </Dialog>
      </div>

      {/* Auto-scrolling marquee with pause on hover */}
      <div className="relative pb-3 overflow-hidden">
        {/* Gradient fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        
        <motion.div
          className="flex gap-3 sm:gap-4 pl-4"
          animate={{
            x: isPaused ? undefined : [0, -176 * dapps.length],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 40,
              ease: "linear",
            },
          }}
          style={{ willChange: "transform" }}
        >
          {duplicatedDapps.map((dapp, index) => (
            <MarqueeCard 
              key={`${dapp.name}-${index}`} 
              dapp={dapp} 
              onHover={handleHover}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default DappShowcase;