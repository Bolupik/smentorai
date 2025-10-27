import { motion } from "framer-motion";
import aiCharacter from "@/assets/ai-character.jpg";
import ChatInterface from "@/components/ChatInterface";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden border-b-2 border-primary/50 bg-card/40 backdrop-blur-md"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20" style={{ animation: "gradient-shift 8s ease infinite", backgroundSize: "200% 200%" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 30% 50%, hsl(25 100% 50% / 0.1), transparent 50%)" }} />
        
        <div className="relative container mx-auto px-4 py-8">
          <div className="flex items-center gap-6 max-w-4xl mx-auto">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary animate-float toxic-glow"
            >
              <img 
                src={aiCharacter} 
                alt="Cyberpunk Halloween DeFi Guide" 
                className="w-full h-full object-cover"
              />
            </motion.div>
            
            <div className="flex-1">
              <motion.h1 
                className="text-4xl md:text-5xl font-bold gradient-text mb-2 flex items-center gap-3"
                animate={{ textShadow: ["0 0 10px hsl(25 100% 55% / 0.5)", "0 0 20px hsl(25 100% 55% / 0.8)", "0 0 10px hsl(25 100% 55% / 0.5)"] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🎃 Stacks Crypto Crypt 👻
              </motion.h1>
              <p className="text-foreground/90 text-lg">
                Your <span className="text-primary glow-text font-semibold">cyberpunk specter</span> guide to DeFi, NFTs, GameFi & Memecoins ⚡
              </p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Chat Interface */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="flex-1 container mx-auto max-w-5xl flex flex-col"
        style={{ height: "calc(100vh - 140px)" }}
      >
        <ChatInterface />
      </motion.main>
    </div>
  );
};

export default Index;
