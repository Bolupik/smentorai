import { motion } from "framer-motion";
import { Card, CardContent } from "./ui/card";

interface TopicCardsProps {
  onTopicClick: (topic: string) => void;
}

const topics = [
  {
    icon: "🏗️",
    title: "Stacks Architecture",
    description: "Bitcoin-secured Layer 2 with smart contracts",
    prompt: "Explain the Stacks blockchain architecture and how it connects to Bitcoin"
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
    icon: "🎮",
    title: "GameFi",
    description: "Play-to-earn blockchain gaming ecosystem",
    prompt: "Explain GameFi on Stacks - what gaming projects exist?"
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {topics.map((topic, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: idx * 0.1, type: "spring" }}
          whileHover={{ scale: 1.05, y: -5 }}
        >
          <Card 
            className="cursor-pointer border-2 border-primary/30 hover:border-primary transition-all duration-300 bg-card/60 backdrop-blur-md hover:bg-card/80 group brand-glow"
            onClick={() => onTopicClick(topic.prompt)}
          >
            <CardContent className="p-5">
              <motion.div 
                className="text-4xl mb-3 group-hover:scale-110 transition-transform"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                {topic.icon}
              </motion.div>
              <h3 className="text-base font-bold mb-2 text-primary glow-text group-hover:text-accent transition-colors">
                {topic.title}
              </h3>
              <p className="text-xs text-muted-foreground group-hover:text-foreground/80 transition-colors">
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
