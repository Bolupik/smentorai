import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Grid3X3 } from "lucide-react";
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

const dapps = [
  { name: "Stacks Mentor AI", tagline: "AI-powered learning for Stacks", url: "https://stacks-mentor-ai.lovable.app", logo: stacksMentorLogo },
  { name: "BoostX", tagline: "Amplify your crypto journey", url: "https://boostx.cc/", logo: boostxLogo },
  { name: "Zest Protocol", tagline: "DeFi lending on Bitcoin", url: "https://app.zestprotocol.com", logo: zestLogo },
  { name: "STX Tools", tagline: "Essential Stacks analytics", url: "https://stxtools.io/", logo: stxtoolsLogo },
  { name: "Deorganized", tagline: "Web3 media & insights", url: "https://deorganized.media", logo: deorganizedLogo },
  { name: "Hermetica", tagline: "Bitcoin-backed stablecoin", url: "https://portfolio.hermetica.fi", logo: hermeticaLogo },
  { name: "Ryder", tagline: "Self-custody wallet", url: "https://ryder.id", logo: ryderLogo },
  { name: "FAK", tagline: "Fun on Stacks", url: "https://fak.fun", logo: fakLogo },
  { name: "Gamma", tagline: "NFT marketplace", url: "https://gamma.io", logo: gammaLogo },
  { name: "Bitflow", tagline: "DeFi on Bitcoin", url: "https://app.bitflow.finance", logo: bitflowLogo },
  { name: "Zero Authority DAO", tagline: "Decentralized governance", url: "https://zeroauthoritydao.com", logo: zeroauthorityLogo },
  { name: "Velar", tagline: "DeFi Hub", url: "https://velar.com", logo: velarLogo },
  { name: "ALEX", tagline: "Bitcoin DeFi", url: "https://alex.io", logo: alexLogo },
  { name: "Arkadiko", tagline: "Stablecoin Protocol", url: "https://arkadiko.finance", logo: arkadikoLogo },
];

const DappCard = ({ dapp, compact = false }: { dapp: typeof dapps[0]; compact?: boolean }) => (
  <a
    href={dapp.url}
    target="_blank"
    rel="noopener noreferrer"
    className={`group flex-shrink-0 ${compact ? 'w-full' : 'w-48'}`}
  >
    <div className={`relative overflow-hidden rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm ${compact ? 'p-4' : 'p-4'} hover:border-primary/50 hover:bg-card transition-all duration-300`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
          <img 
            src={dapp.logo} 
            alt={`${dapp.name} logo`} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="font-semibold text-foreground text-sm truncate group-hover:text-primary transition-colors">
              {dapp.name}
            </h4>
            <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </div>
          <p className="text-xs text-muted-foreground truncate">{dapp.tagline}</p>
        </div>
      </div>
    </div>
  </a>
);

const DappShowcase = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Duplicate dapps for seamless loop
  const duplicatedDapps = [...dapps, ...dapps];

  return (
    <section className="py-8 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">Explore Stacks Ecosystem</h3>
          <p className="text-sm text-muted-foreground">Discover apps built on Stacks</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Grid3X3 className="w-4 h-4" />
              View All
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Grid3X3 className="w-5 h-5 text-primary" />
                Stacks Ecosystem
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {dapps.map((dapp) => (
                <DappCard key={dapp.name} dapp={dapp} compact />
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-4">
              Click any app to visit • Always verify URLs before connecting your wallet
            </p>
          </DialogContent>
        </Dialog>
      </div>

      {/* Auto-scrolling marquee */}
      <div className="relative">
        {/* Gradient fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        
        <motion.div
          className="flex gap-4 px-4"
          animate={{
            x: [0, -50 * dapps.length],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 30,
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
