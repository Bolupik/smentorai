import { motion } from "framer-motion";
import { Card } from "./ui/card";
import { BookOpen, Code, Coins, Lock, Wallet, TrendingUp } from "lucide-react";

interface TopicCardsProps {
  onTopicClick: (topic: string) => void;
}

const topics = [
  {
    icon: BookOpen,
    title: "Getting Started",
    description: "Learn the basics of Stacks and DeFi",
    prompt: "I'm new to Stacks. Can you give me a comprehensive introduction to the Stacks blockchain and how it works with Bitcoin?",
  },
  {
    icon: Code,
    title: "Clarity Smart Contracts",
    description: "Write secure contracts in Clarity",
    prompt: "Teach me about Clarity smart contracts. Show me examples and explain the key differences from other smart contract languages.",
  },
  {
    icon: Coins,
    title: "STX Stacking",
    description: "Earn Bitcoin by stacking STX",
    prompt: "Explain how STX stacking works and walk me through the process step-by-step. What are the requirements and risks?",
  },
  {
    icon: Lock,
    title: "DeFi Protocols",
    description: "Explore ALEX, Arkadiko, and more",
    prompt: "Give me an overview of the major DeFi protocols on Stacks like ALEX and Arkadiko. How do I use them safely?",
  },
  {
    icon: Wallet,
    title: "Wallet Setup",
    description: "Secure your assets properly",
    prompt: "Help me set up a Stacks wallet securely. What are the best practices and which wallet should I use?",
  },
  {
    icon: TrendingUp,
    title: "Trading & Liquidity",
    description: "Swaps, pools, and yield farming",
    prompt: "Teach me about providing liquidity and yield farming on Stacks. What is impermanent loss and how do I manage risk?",
  },
];

const TopicCards = ({ onTopicClick }: TopicCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {topics.map((topic, idx) => (
        <motion.div
          key={topic.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1, duration: 0.4 }}
        >
          <Card
            className="p-6 cursor-pointer hover:border-primary/50 transition-all duration-300 hover:shadow-lg bg-card/50 backdrop-blur-sm group"
            onClick={() => onTopicClick(topic.prompt)}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <topic.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                  {topic.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {topic.description}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default TopicCards;
