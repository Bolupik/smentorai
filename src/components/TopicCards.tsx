import { motion } from "framer-motion";
import { Play, CheckCircle } from "lucide-react";
import { Progress } from "./ui/progress";

import topicArchitecture from "@/assets/topic-architecture.png";
import topicClarity from "@/assets/topic-clarity.png";
import topicDefi from "@/assets/topic-defi.png";
import topicNft from "@/assets/topic-nft.png";
import topicMeme from "@/assets/topic-meme.png";
import topicStacking from "@/assets/topic-stacking.png";
import topicSbtc from "@/assets/topic-sbtc.png";
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
    description: "Proof of Transfer (PoX) consensus on Bitcoin L2",
    prompt: "Explain the Stacks blockchain architecture, the Proof of Transfer (PoX) consensus mechanism, and how it connects to Bitcoin"
  },
  {
    image: topicClarity,
    title: "Clarity Language",
    description: "Decidable smart contracts for Bitcoin",
    prompt: "Explain Clarity, the smart contract language for Stacks. What makes it unique and how does its decidability improve security?"
  },
  {
    image: topicDefi,
    title: "DeFi Protocols",
    description: "ALEX, Arkadiko, Velar - decentralized finance",
    prompt: "What are the main DeFi protocols on Stacks and how do they work?"
  },
  {
    image: topicNft,
    title: "NFTs & Collections",
    description: "Gamma marketplace: The Guests, Leo Cats, BNS & more",
    prompt: "Tell me about NFTs on Stacks. Gamma (stacks.gamma.io) is the open marketplace for Bitcoin NFTs, supporting both Stacks L2 NFTs and Bitcoin L1 Ordinals. Popular collections include The Guests, SpaghettiPunk Club, Leo Cats, and Megapont Ape Club. It also hosts BNS (Bitcoin Name System) for human-readable names on Bitcoin. Categories include Collectibles, Fine Art, Photography, and Music. How do I get started with NFTs on Stacks?"
  },
  {
    image: topicMeme,
    title: "Memecoins",
    description: "WELSH, RYDER, BOOM - community tokens",
    prompt: "What memecoins exist on Stacks? How do I trade them safely?"
  },
  {
    image: topicStacking,
    title: "STX Stacking",
    description: "Earn Bitcoin by stacking your STX tokens",
    prompt: "How does STX stacking work? How can I earn Bitcoin rewards?"
  },
  {
    image: topicSbtc,
    title: "sBTC Integration",
    description: "Bitcoin integration in DeFi with sBTC",
    prompt: "What is sBTC and how will it change DeFi on Stacks?"
  },
  {
    image: topicSecurity,
    title: "Security & Wallets",
    description: "Best practices and wallet recommendations",
    prompt: "What are security best practices and which wallets should I use?"
  }
];

const TopicCards = ({ onTopicClick, exploredTopics, totalTopics, exploredCount }: TopicCardsProps) => {
  const progressPercent = totalTopics > 0 ? (exploredCount / totalTopics) * 100 : 0;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="px-2"
    >
      {/* Progress Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mb-6 p-4 rounded-xl bg-card/60 border border-border/30 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Your Progress</span>
          <span className="text-xs text-primary font-bold">{exploredCount} / {totalTopics} explored</span>
        </div>
        <Progress value={progressPercent} className="h-2 bg-muted" />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="text-lg font-bold text-foreground mb-4"
      >
        Popular Topics
      </motion.h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {topics.map((topic, idx) => {
          const isExplored = exploredTopics.has(topic.title);
          
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + idx * 0.05 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onTopicClick(topic.prompt, topic.title)}
              className="group cursor-pointer"
            >
              <div className={`relative overflow-hidden rounded-lg bg-card border transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-primary/10 ${
                isExplored ? "border-primary/50 ring-1 ring-primary/20" : "border-border/30 hover:border-primary/50"
              }`}>
                {/* Image section */}
                <div className="relative h-28 md:h-32 overflow-hidden">
                  <img 
                    src={topic.image} 
                    alt={topic.title}
                    className={`w-full h-full object-cover group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 ${
                      isExplored ? "opacity-90" : "opacity-80"
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                  
                  {/* Play button overlay */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <div className="w-12 h-12 rounded-full bg-foreground/90 flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 text-background fill-current ml-0.5" />
                    </div>
                  </motion.div>

                  {/* Episode number badge */}
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-background/80 backdrop-blur-sm rounded text-[10px] font-bold text-foreground">
                    {String(idx + 1).padStart(2, "0")}
                  </span>

                  {/* Explored checkmark */}
                  {isExplored && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
                        <CheckCircle className="w-4 h-4 text-primary-foreground" />
                      </div>
                    </motion.div>
                  )}
                </div>
                
                {/* Text section */}
                <div className="p-3">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm font-bold group-hover:text-primary transition-colors line-clamp-1 ${
                      isExplored ? "text-primary" : "text-foreground"
                    }`}>
                      {topic.title}
                    </h4>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {topic.description}
                  </p>
                </div>

                {/* Progress bar - filled if explored */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                  <motion.div
                    initial={{ width: isExplored ? "100%" : 0 }}
                    animate={{ width: isExplored ? "100%" : 0 }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-primary"
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export const topicsList = topics;

export default TopicCards;