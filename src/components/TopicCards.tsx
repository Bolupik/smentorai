import { motion } from "framer-motion";
import { CheckCircle, Zap, Code, Coins, Palette, Rocket, Layers, Shield, TrendingUp, ArrowRight } from "lucide-react";
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
  },
  {
    image: topicClarity,
    title: "Clarity Language",
    description: "Decidable smart contracts for Bitcoin",
    prompt: "Explain Clarity, the smart contract language for Stacks. What makes it unique and how does its decidability improve security?",
    icon: Code,
  },
  {
    image: topicDefi,
    title: "DeFi Protocols",
    description: "Zest, Granite, Bitflow, USDCx stablecoin",
    prompt: "What are the main DeFi protocols on Stacks? Cover the latest integrations including Circle's USDCx (USDC-backed stablecoin via xReserve infrastructure launched late 2025), Zest Protocol for multi-asset lending, Granite for borrowing USDCx against BTC, and Bitflow for USDCx trading pairs. Also mention ALEX, Arkadiko, and Velar DEXs.",
    icon: Coins,
  },
  {
    image: topicNft,
    title: "NFTs & Collections",
    description: "Gamma marketplace: The Guests, Leo Cats, BNS & more",
    prompt: "Tell me about NFTs on Stacks. Gamma (stacks.gamma.io) is the open marketplace for Bitcoin NFTs, supporting both Stacks L2 NFTs and Bitcoin L1 Ordinals. Popular collections include The Guests, SpaghettiPunk Club, Leo Cats, and Megapont Ape Club. It also hosts BNS (Bitcoin Name System) for human-readable names on Bitcoin. Categories include Collectibles, Fine Art, Photography, and Music. How do I get started with NFTs on Stacks?",
    icon: Palette,
  },
  {
    image: topicMeme,
    title: "Memecoins",
    description: "WELSH, LEO, NOT, DOG, Teiko & more on DEXs",
    prompt: "Tell me about memecoins on Stacks. According to Tenero.io, popular memecoins include WELSH (Welshcorgicoin), LEO, NOT, DOG, Teiko, PEPE, sAI, NASTY, and FlatEarth. These are traded on DEXs like Bitflow, Velar, and ALEX. Tenero provides real-time analytics showing volume, netflow, active traders, and recent trades. How do I safely trade memecoins on Stacks?",
    icon: Rocket,
  },
  {
    image: topicTools,
    title: "Tools",
    description: "BNS, BoostX, Hiro, STXTools & more",
    prompt: "What are the essential tools in the Stacks ecosystem?\n\n**BNS (Bitcoin Name System):** BNS lets users register human-readable names (.btc, .stx, .id) on Bitcoin via Stacks. The BNS Community (bns.foundation) provides education and resources, while BNS One (bns.one) is an all-in-one platform for registering, renewing, transferring, and trading BNS names.\n\n**BoostX:** A Chrome browser extension that brings Bitcoin-backed DeFi to social platforms like X (Twitter) and Discord. Users can tip, boost, and airdrop tokens (STX, sBTC, USDh) directly from social feeds. It integrates with BNS names for intuitive sending.\n\nAlso cover Hiro Platform (Clarinet, Explorer, API), STXTools for analytics and portfolio tracking, STX.City for token launches, and Stacks Explorer for on-chain data. How do these tools help developers and users navigate the Stacks ecosystem?",
    icon: TrendingUp,
  },
  {
    image: topicWallets,
    title: "Wallets",
    description: "Xverse, Leather, Asigna & Fordefi",
    prompt: "What wallets are available on Stacks and how do I choose the right one? Cover the major ecosystem wallets: Xverse (mobile & browser, supports sBTC, USDCx, stacking), Leather (browser extension by Hiro, open-source), Asigna (multisig wallet for teams and DAOs), and Fordefi (institutional-grade MPC wallet). Compare features, security models, and use cases for each wallet.",
    icon: Zap,
  },
  {
    image: topicSecurity,
    title: "Security",
    description: "Best practices, audits & safe DeFi usage",
    prompt: "What are the security best practices for using the Stacks ecosystem? Cover smart contract auditing (Coinfabrik, Asymmetric Research), the Immunefi bug bounty program, how Clarity's decidability prevents common vulnerabilities, safe DeFi practices (checking approvals, avoiding scams), and how to protect your wallet and private keys.",
    icon: Shield,
  }
];

const TopicCards = ({ onTopicClick, exploredTopics, totalTopics, exploredCount }: TopicCardsProps) => {
  const progressPercent = totalTopics > 0 ? (exploredCount / totalTopics) * 100 : 0;

  return (
    <div className="px-2 sm:px-4">
      {/* Progress Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex-1 mr-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Your Progress</span>
            <span className="text-xs text-primary font-semibold">
              {exploredCount} / {totalTopics}
            </span>
          </div>
          <Progress value={progressPercent} className="h-1 bg-muted" />
        </div>
      </div>

      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Topics
      </h3>

      {/* Topic grid — 2 columns on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {topics.map((topic, idx) => {
          const isExplored = exploredTopics.has(topic.title);
          const Icon = topic.icon;

          return (
            <motion.button
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.25 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onTopicClick(topic.prompt, topic.title)}
              className={`group text-left rounded-xl border overflow-hidden transition-colors duration-200 ${
                isExplored
                  ? "border-primary/40 bg-primary/5"
                  : "border-border/40 bg-card hover:border-border/70 hover:bg-card/80"
              }`}
            >
              {/* Image */}
              <div className="relative h-20 sm:h-24 overflow-hidden">
                <img
                  src={topic.image}
                  alt={topic.title}
                  className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                    isExplored ? "opacity-80" : "opacity-60 group-hover:opacity-75"
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />

                {isExplored && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-2.5 sm:p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isExplored ? "text-primary" : "text-muted-foreground group-hover:text-foreground"} transition-colors`} />
                  <span className={`text-xs font-semibold leading-tight truncate ${isExplored ? "text-primary" : "text-foreground"}`}>
                    {topic.title}
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight line-clamp-2">
                  {topic.description}
                </p>
                <div className={`mt-2 flex items-center gap-1 text-[10px] font-medium transition-colors ${
                  isExplored ? "text-primary/70" : "text-muted-foreground/60 group-hover:text-muted-foreground"
                }`}>
                  {isExplored ? (
                    <span>Explored</span>
                  ) : (
                    <>
                      <span>Explore</span>
                      <ArrowRight className="w-3 h-3" />
                    </>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export const topicsList = topics;

export default TopicCards;
