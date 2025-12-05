import { motion } from "framer-motion";
import { Card, CardContent } from "./ui/card";

import topicArchitecture from "@/assets/topic-architecture.png";
import topicClarity from "@/assets/topic-clarity.png";
import topicDefi from "@/assets/topic-defi.png";
import topicNft from "@/assets/topic-nft.png";
import topicMeme from "@/assets/topic-meme.png";
import topicStacking from "@/assets/topic-stacking.png";
import topicSbtc from "@/assets/topic-sbtc.png";
import topicSecurity from "@/assets/topic-security.png";

interface TopicCardsProps {
  onTopicClick: (topic: string) => void;
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
    description: "Digital collectibles: Monkeys, Puppets & more",
    prompt: "Tell me about NFTs on Stacks - marketplaces and top collections"
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

const TopicCards = ({ onTopicClick }: TopicCardsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {topics.map((topic, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          whileHover={{ y: -3, scale: 1.02 }}
        >
          <Card 
            className="cursor-pointer border border-border/30 hover:border-primary/40 transition-all duration-300 bg-card/60 backdrop-blur-sm group overflow-hidden relative"
            onClick={() => onTopicClick(topic.prompt)}
          >
            <CardContent className="p-0">
              {/* Image section */}
              <div className="relative h-24 overflow-hidden">
                <img 
                  src={topic.image} 
                  alt={topic.title}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
                {/* Scene number */}
                <span className="absolute top-2 left-2 text-[9px] tracking-[0.3em] text-muted-foreground/60 font-mono">
                  {String(idx + 1).padStart(2, "0")}
                </span>
              </div>
              
              {/* Text section - screenplay style */}
              <div className="p-3 pt-1">
                <h3 className="text-[11px] uppercase tracking-[0.15em] font-medium text-foreground group-hover:text-primary transition-colors mb-1">
                  {topic.title}
                </h3>
                <p className="text-[9px] text-muted-foreground leading-relaxed italic">
                  {topic.description}
                </p>
                {/* Action indicator */}
                <div className="mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="w-3 h-[1px] bg-primary" />
                  <span className="text-[8px] tracking-[0.2em] text-primary uppercase">Enter</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default TopicCards;