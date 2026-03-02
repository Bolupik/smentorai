import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Volume2 } from "lucide-react";
import aiCharacter from "@/assets/ai-character.png";

import topicDefi from "@/assets/topic-defi.png";
import topicNft from "@/assets/topic-nft.png";
import topicStacking from "@/assets/topic-stacking.png";
import topicSbtc from "@/assets/topic-sbtc.png";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartLearning: () => void;
}

const features = [
  {
    image: topicDefi,
    title: "DeFi Protocols",
    description: "Master decentralized finance on Bitcoin L2"
  },
  {
    image: topicNft,
    title: "NFT Ecosystem",
    description: "Explore digital collectibles & marketplaces"
  },
  {
    image: topicStacking,
    title: "STX Stacking",
    description: "Earn Bitcoin rewards by stacking"
  },
  {
    image: topicSbtc,
    title: "sBTC Integration",
    description: "Unlock Bitcoin in DeFi applications"
  }
];

const PreviewModal = ({ isOpen, onClose, onStartLearning }: PreviewModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-4 md:inset-10 lg:inset-20 z-50 overflow-hidden rounded-lg"
          >
            <div className="relative w-full h-full bg-card border border-border overflow-y-auto">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
              >
                <X className="w-6 h-6 text-foreground" />
              </button>

              {/* Hero Section with Video-like preview */}
              <div className="relative h-[50vh] min-h-[300px]">
                {/* Background image with animation */}
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  <img
                    src={aiCharacter}
                   alt="Sammy"
                    className="w-full h-full object-cover object-top"
                  />
                </motion.div>
                
                {/* Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-card/50 via-transparent to-card/50" />
                
                {/* Animated particles */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(15)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 rounded-full bg-primary/40"
                      style={{
                        left: `${10 + Math.random() * 80}%`,
                        top: `${20 + Math.random() * 60}%`,
                      }}
                      animate={{
                        opacity: [0, 0.8, 0],
                        scale: [0, 1.5, 0],
                        y: [0, -20, 0],
                      }}
                      transition={{
                        duration: 2 + Math.random() * 2,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>

                {/* Play indicator */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-20 h-20 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center border border-primary/40"
                  >
                    <Volume2 className="w-8 h-8 text-primary" />
                  </motion.div>
                </motion.div>
              </div>

              {/* Content */}
              <div className="relative z-10 p-6 md:p-10 -mt-20">
                {/* Title section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-bold rounded">
                      NEW
                    </span>
                    <span className="text-sm text-muted-foreground">2024</span>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">Interactive AI</span>
                  </div>
                  
                  <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">
                    SAMMY
                  </h2>
                  
                  <p className="text-lg text-foreground/80 max-w-2xl mb-8 leading-relaxed">
                    Your personal AI guide to the Stacks ecosystem. Learn about DeFi protocols, 
                    NFT collections, STX stacking, sBTC integration, and everything Bitcoin Layer 2.
                    Interactive conversations with voice narration available.
                  </p>

                  {/* Buttons */}
                  <div className="flex items-center gap-4 mb-12">
                    <button
                      onClick={onStartLearning}
                      className="flex items-center gap-3 px-8 py-4 bg-foreground text-background font-bold text-lg rounded hover:bg-foreground/90 transition-all duration-300 transform hover:scale-105"
                    >
                      <Play className="w-6 h-6 fill-current" />
                      <span>Start Learning</span>
                    </button>
                    <button
                      onClick={onClose}
                      className="px-8 py-4 bg-muted/80 text-foreground font-medium rounded hover:bg-muted transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>

                {/* What you'll learn section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="text-xl font-bold text-foreground mb-6">What You'll Learn</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {features.map((feature, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + idx * 0.1 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="group relative overflow-hidden rounded-lg bg-muted/30 border border-border/50 hover:border-primary/50 transition-all cursor-pointer"
                      >
                        <div className="relative h-32 overflow-hidden">
                          <img
                            src={feature.image}
                            alt={feature.title}
                            className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                        </div>
                        <div className="p-3">
                          <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                            {feature.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {feature.description}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Additional info */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-12 pt-6 border-t border-border"
                >
                  <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      Real-time AI responses
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      Voice narration
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-accent" />
                      8 learning topics
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PreviewModal;