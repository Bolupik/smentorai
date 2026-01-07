import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Grid3X3, Filter } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

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

const dapps = [
  { name: "Stacks Mentor AI", tagline: "AI-powered learning for Stacks", url: "https://stacks-mentor-ai.lovable.app", logo: stacksMentorLogo, category: "Tools" as Category },
  { name: "BoostX", tagline: "Amplify your crypto journey", url: "https://boostx.cc/", logo: boostxLogo, category: "Tools" as Category },
  { name: "Zest Protocol", tagline: "DeFi lending on Bitcoin", url: "https://app.zestprotocol.com", logo: zestLogo, category: "DeFi" as Category },
  { name: "STX Tools", tagline: "Essential Stacks analytics", url: "https://stxtools.io/", logo: stxtoolsLogo, category: "Tools" as Category },
  { name: "Deorganized", tagline: "Web3 media & insights", url: "https://deorganized.media", logo: deorganizedLogo, category: "Other" as Category },
  { name: "Hermetica", tagline: "Bitcoin-backed stablecoin", url: "https://portfolio.hermetica.fi", logo: hermeticaLogo, category: "DeFi" as Category },
  { name: "Ryder", tagline: "Self-custody wallet", url: "https://ryder.id", logo: ryderLogo, category: "Wallets" as Category },
  { name: "FAK", tagline: "Fun on Stacks", url: "https://fak.fun", logo: fakLogo, category: "Other" as Category },
  { name: "Gamma", tagline: "NFT marketplace", url: "https://gamma.io", logo: gammaLogo, category: "NFT" as Category },
  { name: "Bitflow", tagline: "DeFi on Bitcoin", url: "https://app.bitflow.finance", logo: bitflowLogo, category: "DeFi" as Category },
  { name: "Zero Authority DAO", tagline: "Decentralized governance", url: "https://zeroauthoritydao.com", logo: zeroauthorityLogo, category: "Other" as Category },
  { name: "Velar", tagline: "DeFi Hub", url: "https://velar.com", logo: velarLogo, category: "DeFi" as Category },
  { name: "ALEX", tagline: "Bitcoin DeFi", url: "https://alex.io", logo: alexLogo, category: "DeFi" as Category },
  { name: "Arkadiko", tagline: "Stablecoin Protocol", url: "https://arkadiko.finance", logo: arkadikoLogo, category: "DeFi" as Category },
];

const categoryColors: Record<Category, string> = {
  All: "bg-primary/20 text-primary border-primary/30",
  DeFi: "bg-green-500/20 text-green-400 border-green-500/30",
  NFT: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Tools: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Wallets: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Other: "bg-muted text-muted-foreground border-border",
};

const DappCard = ({ dapp, compact = false }: { dapp: typeof dapps[0]; compact?: boolean }) => (
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
        <span className={`inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full border ${categoryColors[dapp.category]}`}>
          {dapp.category}
        </span>
      )}
    </div>
  </a>
);

const DappShowcase = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");

  // Duplicate dapps for seamless loop
  const duplicatedDapps = [...dapps, ...dapps, ...dapps];
  
  const filteredDapps = selectedCategory === "All" 
    ? dapps 
    : dapps.filter(dapp => dapp.category === selectedCategory);

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

      {/* Auto-scrolling marquee */}
      <div className="relative pb-3">
        {/* Gradient fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        
        <motion.div
          className="flex gap-3 sm:gap-4"
          animate={{
            x: [0, -176 * dapps.length],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 40,
              ease: "linear",
            },
          }}
        >
          {duplicatedDapps.map((dapp, index) => (
            <DappCard key={`${dapp.name}-${index}`} dapp={dapp} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default DappShowcase;
