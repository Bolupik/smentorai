import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import aiCharacter from "@/assets/ai-character.jpg";
import ChatInterface from "@/components/ChatInterface";

const Index = () => {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!showChat ? (
        <>
          {/* Split Navigation Header */}
          <motion.header
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="fixed top-0 left-0 right-0 z-50 px-6 py-6"
          >
            <div className="flex justify-between items-start">
              <motion.span 
                className="text-xs tracking-[0.3em] font-light text-foreground/80"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                STACKS
              </motion.span>
              <motion.span 
                className="text-xs tracking-[0.3em] font-light text-foreground/80"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                BITCOIN
              </motion.span>
              <motion.span 
                className="text-xs tracking-[0.3em] font-light text-foreground/80"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                LAYER
              </motion.span>
              <motion.span 
                className="text-xs tracking-[0.3em] font-light text-foreground/80"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                TWO
              </motion.span>
            </div>
          </motion.header>

          {/* Central Hero */}
          <main className="flex-1 flex flex-col items-center justify-center px-6">
            {/* AI Character Image */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="relative mb-8"
            >
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border border-border/50 shadow-lg">
                <img 
                  src={aiCharacter} 
                  alt="Stacks DeFi AI Assistant" 
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Subtle reflection effect */}
              <div 
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-32 h-8 bg-gradient-to-b from-foreground/5 to-transparent blur-lg"
              />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-5xl md:text-7xl font-extralight tracking-tight text-foreground mb-4 text-center"
            >
              STACKS AI
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="text-sm tracking-[0.2em] text-muted-foreground mb-16"
            >
              DEFI • NFTS • GAMEFI • BITCOIN L2
            </motion.p>
          </main>

          {/* Explore Button */}
          <motion.footer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2"
          >
            <button
              onClick={() => setShowChat(true)}
              className="group flex items-center gap-4 px-8 py-3 border border-foreground/20 hover:border-foreground/40 bg-background/80 backdrop-blur-sm transition-all duration-300"
            >
              <span className="w-3 h-3 bg-foreground" />
              <span className="text-sm tracking-[0.3em] font-light">EXPLORE</span>
              <span className="text-muted-foreground group-hover:translate-x-1 transition-transform">···</span>
            </button>
          </motion.footer>
        </>
      ) : (
        <>
          {/* Chat Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="border-b border-border/50 bg-background/80 backdrop-blur-sm"
          >
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <button
                onClick={() => setShowChat(false)}
                className="text-xs tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
              >
                ← BACK
              </button>
              <h1 className="text-sm tracking-[0.3em] font-light">STACKS AI</h1>
              <div className="w-12" />
            </div>
          </motion.header>

          {/* Chat Interface */}
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="flex-1 container mx-auto max-w-5xl flex flex-col"
            style={{ height: "calc(100vh - 60px)" }}
          >
            <ChatInterface />
          </motion.main>
        </>
      )}
    </div>
  );
};

export default Index;
