import { motion } from "framer-motion";
import { Card, CardContent } from "./ui/card";

interface TopicCardsProps {
  onTopicClick: (topic: string) => void;
}

const topics = [
  {
    icon: "🏗️",
    title: "Stacks Architecture",
    description: "Proof of Transfer (PoX) consensus on Bitcoin L2",
    prompt: "Explain the Stacks blockchain architecture, the Proof of Transfer (PoX) consensus mechanism, and how it connects to Bitcoin"
  },
  {
    icon: "📜",
    title: "Clarity Language",
    description: "Decidable smart contracts for Bitcoin",
    prompt: "Explain Clarity, the smart contract language for Stacks. What makes it unique and how does its decidability improve security?"
  },
  {
    icon: "💰",
    title: "DeFi Protocols",
    description: "ALEX, Arkadiko, Velar - decentralized finance",
    prompt: "What are the main DeFi protocols on Stacks and how do they work?"
  },
  {
    icon: "🎨",
    title: "NFTs & Collections",
    description: "Digital collectibles: Monkeys, Puppets & more",
    prompt: "Tell me about NFTs on Stacks - marketplaces and top collections"
  },
  {
    icon: "🚀",
    title: "Memecoins",
    description: "WELSH, RYDER, BOOM - community tokens",
    prompt: "What memecoins exist on Stacks? How do I trade them safely?"
  },
  {
    icon: "₿",
    title: "STX Stacking",
    description: "Earn Bitcoin by stacking your STX tokens",
    prompt: "How does STX stacking work? How can I earn Bitcoin rewards?"
  },
  {
    icon: "🔗",
    title: "sBTC Integration",
    description: "Bitcoin integration in DeFi with sBTC",
    prompt: "What is sBTC and how will it change DeFi on Stacks?"
  },
  {
    icon: "🔐",
    title: "Security & Wallets",
    description: "Best practices and wallet recommendations",
    prompt: "What are security best practices and which wallets should I use?"
  }
];

const TopicCards = ({ onTopicClick }: TopicCardsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {topics.map((topic, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          whileHover={{ y: -2 }}
        >
          <Card 
            className="cursor-pointer border border-border/50 hover:border-foreground/30 transition-all duration-300 bg-card/60 backdrop-blur-sm group"
            onClick={() => onTopicClick(topic.prompt)}
          >
            <CardContent className="p-4">
              <div className="text-2xl mb-2">{topic.icon}</div>
              <h3 className="text-xs tracking-wide font-medium mb-1 text-foreground group-hover:text-primary transition-colors">
                {topic.title}
              </h3>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                {topic.description}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default TopicCards;
