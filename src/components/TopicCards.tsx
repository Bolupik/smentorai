import { motion } from "framer-motion";
import { Play, CheckCircle, Zap, Code, Coins, Palette, Rocket, Layers, Shield, TrendingUp } from "lucide-react";
import { Progress } from "./ui/progress";

import topicArchitecture from "@/assets/topic-architecture.png";
import topicClarity from "@/assets/topic-clarity.png";
import topicDefi from "@/assets/topic-defi.png";
import topicNft from "@/assets/topic-nft.png";
import topicMeme from "@/assets/topic-meme.png";
import topicTools from "@/assets/topic-tools.png";
import topicWallets from "@/assets/topic-wallets.png";
import topicSecurity from "@/assets/topic-security.png";

interface TopicCardsProps {
  onTopicClick: (topic: string, title: string) => void;
  exploredTopics: Set<string>;
  totalTopics: number;
  exploredCount: number;
}

const topics = [
  {
    image: topicArchitecture,
    title: "Stacks Architecture",
    description: "Nakamoto upgrade, sBTC rollout & Satoshi roadmap",
    prompt: "Explain the Stacks blockchain architecture including the Nakamoto upgrade completed in 2024. Cover the Proof of Transfer (PoX) consensus, how sBTC enables two-way BTC transfers between Bitcoin L1 and Stacks L2 (with withdrawal limits of 150 BTC/day), and the upcoming Satoshi upgrades roadmap including fee abstraction (paying fees in sBTC), self-minting sBTC, and Clarity 4 with WebAssembly support.",
    icon: Layers,
    color: "from-blue-500/20 to-cyan-500/20",
    accentColor: "text-cyan-400"
  },
  {
    image: topicClarity,
    title: "Clarity Language",
    description: "Decidable smart contracts for Bitcoin",
    prompt: "Explain Clarity, the smart contract language for Stacks. What makes it unique and how does its decidability improve security?",
    icon: Code,
    color: "from-purple-500/20 to-pink-500/20",
    accentColor: "text-purple-400"
  },
  {
    image: topicDefi,
    title: "DeFi Protocols",
    description: "Zest, Granite, Bitflow, USDCx stablecoin",
    prompt: "What are the main DeFi protocols on Stacks? Cover the latest integrations including Circle's USDCx (USDC-backed stablecoin via xReserve infrastructure launched late 2025), Zest Protocol for multi-asset lending, Granite for borrowing USDCx against BTC, and Bitflow for USDCx trading pairs. Also mention ALEX, Arkadiko, and Velar DEXs.",
    icon: Coins,
    color: "from-green-500/20 to-emerald-500/20",
    accentColor: "text-emerald-400"
  },
  {
    image: topicNft,
    title: "NFTs & Collections",
    description: "Gamma marketplace: The Guests, Leo Cats, BNS & more",
    prompt: "Tell me about NFTs on Stacks. Gamma (stacks.gamma.io) is the open marketplace for Bitcoin NFTs, supporting both Stacks L2 NFTs and Bitcoin L1 Ordinals. Popular collections include The Guests, SpaghettiPunk Club, Leo Cats, and Megapont Ape Club. It also hosts BNS (Bitcoin Name System) for human-readable names on Bitcoin. Categories include Collectibles, Fine Art, Photography, and Music. How do I get started with NFTs on Stacks?",
    icon: Palette,
    color: "from-pink-500/20 to-rose-500/20",
    accentColor: "text-pink-400"
  },
  {
    image: topicMeme,
    title: "Memecoins",
    description: "WELSH, LEO, NOT, DOG, Teiko & more on DEXs",
    prompt: "Tell me about memecoins on Stacks. According to Tenero.io, popular memecoins include WELSH (Welshcorgicoin), LEO, NOT, DOG, Teiko, PEPE, sAI, NASTY, and FlatEarth. These are traded on DEXs like Bitflow, Velar, and ALEX. Tenero provides real-time analytics showing volume, netflow, active traders, and recent trades. How do I safely trade memecoins on Stacks?",
    icon: Rocket,
    color: "from-yellow-500/20 to-orange-500/20",
    accentColor: "text-yellow-400"
  },
  {
    image: topicTools,
    title: "Tools",
    description: "Hiro, STXTools, STX.City, explorers & dev tools",
    prompt: "What are the essential tools in the Stacks ecosystem? Cover developer tools like Hiro Platform (Clarinet, Explorer, API), STXTools for analytics and portfolio tracking, STX.City for token launches, Stacks Explorer for on-chain data, and other community tools. How do these tools help developers and users navigate the Stacks ecosystem?",
    icon: TrendingUp,
    color: "from-amber-500/20 to-yellow-500/20",
    accentColor: "text-amber-400"
  },
  {
    image: topicWallets,
    title: "Wallets",
    description: "Xverse, Leather, Asigna & Fordefi",
    prompt: "What wallets are available on Stacks and how do I choose the right one? Cover the major ecosystem wallets: Xverse (mobile & browser, supports sBTC, USDCx, stacking), Leather (browser extension by Hiro, open-source), Asigna (multisig wallet for teams and DAOs), and Fordefi (institutional-grade MPC wallet). Compare features, security models, and use cases for each wallet.",
    icon: Zap,
    color: "from-orange-500/20 to-red-500/20",
    accentColor: "text-orange-400"
  },
  {
    image: topicSecurity,
    title: "Security",
    description: "Best practices, audits & safe DeFi usage",
    prompt: "What are the security best practices for using the Stacks ecosystem? Cover smart contract auditing (Coinfabrik, Asymmetric Research), the Immunefi bug bounty program, how Clarity's decidability prevents common vulnerabilities, safe DeFi practices (checking approvals, avoiding scams), and how to protect your wallet and private keys.",
    icon: Shield,
    color: "from-red-500/20 to-rose-500/20",
    accentColor: "text-red-400"
  }
];

// Animation variants for staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2
    }
  }
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    scale: 0.9
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15
    }
  }
};

const TopicCards = ({ onTopicClick, exploredTopics, totalTopics, exploredCount }: TopicCardsProps) => {
  const progressPercent = totalTopics > 0 ? (exploredCount / totalTopics) * 100 : 0;

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="px-2 sm:px-4"
    >
      {/* Progress Header */}
      <motion.div
        variants={cardVariants}
        className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-card/80 to-card/60 border border-border/30 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs sm:text-sm font-medium text-foreground">Your Progress</span>
          <motion.span 
            className="text-xs text-primary font-bold"
            key={exploredCount}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {exploredCount} / {totalTopics} explored
          </motion.span>
        </div>
        <Progress value={progressPercent} className="h-1.5 sm:h-2 bg-muted" />
      </motion.div>

      <motion.h3
        variants={cardVariants}
        className="text-base sm:text-lg font-bold text-foreground mb-3 sm:mb-4 flex items-center gap-2"
      >
        <span className="text-shimmer">Popular Topics</span>
        <motion.span
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          🔥
        </motion.span>
      </motion.h3>
      
      <motion.div 
        className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4"
        variants={containerVariants}
      >
        {topics.map((topic, idx) => {
          const isExplored = exploredTopics.has(topic.title);
          const Icon = topic.icon;
          
          return (
            <motion.div
              key={idx}
              variants={cardVariants}
              whileHover={{ 
                scale: 1.03, 
                y: -6,
                transition: { type: "spring", stiffness: 400, damping: 20 }
              }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onTopicClick(topic.prompt, topic.title)}
              className="group cursor-pointer"
            >
              <div className={`card-3d relative overflow-hidden rounded-xl bg-gradient-to-br ${topic.color} border transition-all duration-300 ${
                isExplored 
                  ? "border-primary/50 ring-1 ring-primary/30 animate-border-dance" 
                  : "border-border/30 hover:border-primary/50"
              }`}>
                {/* Subtle glow effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-primary/10 via-transparent to-transparent" />
                
                {/* Image section */}
                <div className="relative h-20 sm:h-28 md:h-32 overflow-hidden">
                  <motion.img 
                    src={topic.image} 
                    alt={topic.title}
                    className={`w-full h-full object-cover transition-all duration-700 ${
                      isExplored ? "opacity-90" : "opacity-70 group-hover:opacity-90"
                    }`}
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                  
                  {/* Play button overlay */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileHover={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                  >
                    <motion.div 
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-foreground/90 flex items-center justify-center shadow-xl"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 text-background fill-current ml-0.5" />
                    </motion.div>
                  </motion.div>

                  {/* Episode number badge with icon */}
                  <motion.span 
                    className={`absolute top-1.5 left-1.5 sm:top-2 sm:left-2 px-1.5 sm:px-2 py-0.5 bg-background/80 backdrop-blur-sm rounded text-[9px] sm:text-[10px] font-bold flex items-center gap-1 ${topic.accentColor}`}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + idx * 0.05 }}
                  >
                    <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span className="text-foreground">{String(idx + 1).padStart(2, "0")}</span>
                  </motion.span>

                  {/* Explored checkmark with animation */}
                  {isExplored && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2"
                    >
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary flex items-center justify-center shadow-lg animate-glow-pulse">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground" />
                      </div>
                    </motion.div>
                  )}
                </div>
                
                {/* Text section */}
                <div className="p-2 sm:p-3">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Icon className={`w-3 h-3 sm:w-4 sm:h-4 ${topic.accentColor} flex-shrink-0`} />
                    <h4 className={`text-xs sm:text-sm font-bold group-hover:text-primary transition-colors line-clamp-1 ${
                      isExplored ? "text-primary" : "text-foreground"
                    }`}>
                      {topic.title}
                    </h4>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 line-clamp-2 leading-tight">
                    {topic.description}
                  </p>
                </div>

                {/* Progress bar - filled if explored */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 bg-muted/50 overflow-hidden">
                  <motion.div
                    initial={{ width: isExplored ? "100%" : "0%" }}
                    animate={{ width: isExplored ? "100%" : "0%" }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-primary to-accent"
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

export const topicsList = topics;

export default TopicCards;