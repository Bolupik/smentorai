import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import aiCharacter from "@/assets/ai-character.png";
import ChatInterface from "@/components/ChatInterface";
import PreviewModal from "@/components/PreviewModal";
import SearchBar from "@/components/SearchBar";
import UserMenu from "@/components/UserMenu";
import { useAuth } from "@/contexts/AuthContext";
import { useTopicProgressDB } from "@/hooks/useTopicProgressDB";
import { topicsList } from "@/components/TopicCards";
import { Play, Info } from "lucide-react";

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

const pageTransition = {
  type: "tween" as const,
  ease: "easeInOut" as const,
  duration: 0.5
};

const Index = () => {
  const [showChat, setShowChat] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { exploredCount } = useTopicProgressDB();

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden">
      <AnimatePresence mode="wait">
        {!showChat ? (
          <motion.div
            key="landing"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="flex-1 flex flex-col relative"
          >
            {/* Netflix-style Full Screen Hero Background */}
            <div className="absolute inset-0 z-0">
              {/* Character as full background with Ken Burns effect */}
              <motion.div
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 20, ease: "linear" }}
                className="absolute inset-0"
              >
                <img 
                  src={aiCharacter} 
                  alt="Bear AI Assistant" 
                  className="w-full h-full object-cover object-top"
                />
              </motion.div>
              
              {/* Gradient overlays for Netflix look */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
              <div className="absolute inset-0 netflix-vignette" />
              <div className="absolute bottom-0 left-0 right-0 h-1/3 netflix-hero-glow" />
            </div>

            {/* Top Navigation Bar */}
            <motion.header
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative z-50 px-8 py-6"
            >
              <div className="flex items-center justify-between">
                <motion.div 
                  className="text-3xl font-bold tracking-tighter text-primary"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  STACKS
                </motion.div>
                <div className="flex items-center gap-6">
                  <motion.span 
                    className="text-sm font-medium text-foreground/80 hover:text-foreground cursor-pointer transition-colors hidden md:inline"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    DeFi
                  </motion.span>
                  <motion.span 
                    className="text-sm font-medium text-foreground/80 hover:text-foreground cursor-pointer transition-colors hidden md:inline"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    NFTs
                  </motion.span>
                  <motion.span 
                    className="text-sm font-medium text-foreground/80 hover:text-foreground cursor-pointer transition-colors hidden md:inline"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    GameFi
                  </motion.span>
                  <motion.span 
                    className="text-sm font-medium text-foreground/80 hover:text-foreground cursor-pointer transition-colors hidden lg:inline"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                  >
                    Bitcoin L2
                  </motion.span>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    <SearchBar variant="landing" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                  >
                    <UserMenu exploredCount={exploredCount} totalTopics={topicsList.length} />
                  </motion.div>
                </div>
              </div>
            </motion.header>

            {/* Hero Content - Bottom Left like Netflix */}
            <main className="relative z-10 flex-1 flex flex-col justify-end px-8 pb-32 md:pb-40">
              <div className="max-w-2xl">
                {/* Series badge */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex items-center gap-3 mb-4"
                >
                  <span className="text-primary font-bold text-lg tracking-wider">S</span>
                  <span className="text-xs tracking-[0.3em] text-muted-foreground uppercase">Series</span>
                </motion.div>

                {/* Main Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-foreground mb-6 leading-none"
                >
                  {"STACKS AI".split("").map((char, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.7 + index * 0.05,
                        duration: 0.4,
                        ease: "easeOut",
                      }}
                      className="inline-block"
                      style={{ minWidth: char === " " ? "0.25em" : "auto" }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </motion.h1>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                  className="text-lg md:text-xl text-foreground/80 mb-8 leading-relaxed max-w-xl"
                >
                  Your AI guide to the Stacks ecosystem. Learn DeFi, explore NFTs, master GameFi, and understand Bitcoin Layer 2 technology.
                </motion.p>

                {/* Netflix-style Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.4 }}
                  className="flex items-center gap-4"
                >
                  <button
                    onClick={() => setShowChat(true)}
                    className="group flex items-center gap-3 px-8 py-4 bg-foreground text-background font-bold text-lg rounded-sm hover:bg-foreground/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Play className="w-6 h-6 fill-current" />
                    <span>Start Learning</span>
                  </button>
                  <button 
                    onClick={() => setShowPreview(true)}
                    className="group flex items-center gap-3 px-8 py-4 bg-muted/80 text-foreground font-bold text-lg rounded-sm hover:bg-muted transition-all duration-300 backdrop-blur-sm"
                  >
                    <Info className="w-6 h-6" />
                    <span>More Info</span>
                  </button>
                </motion.div>

                {/* Maturity rating badge */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1.6 }}
                  className="flex items-center gap-4 mt-8"
                >
                  <span className="px-2 py-1 border border-muted-foreground/50 text-xs text-muted-foreground">
                    BITCOIN L2
                  </span>
                  <span className="text-sm text-muted-foreground">
                    2024 • DeFi Education • Interactive AI
                  </span>
                </motion.div>
              </div>
            </main>

            {/* Animated particles/sparkles */}
            <div className="absolute inset-0 pointer-events-none z-20">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-primary/30"
                  style={{
                    left: `${5 + Math.random() * 90}%`,
                    top: `${10 + Math.random() * 80}%`,
                  }}
                  animate={{
                    opacity: [0, 0.6, 0],
                    scale: [0, 1.5, 0],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="flex-1 flex flex-col"
          >
            {/* Chat Header - Netflix style */}
            <motion.header 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="border-b border-border/30 bg-background/95 backdrop-blur-md sticky top-0 z-50"
            >
              <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                <motion.button
                  whileHover={{ x: -5 }}
                  onClick={() => setShowChat(false)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <span className="text-lg">←</span>
                  <span>Back</span>
                </motion.button>
                <motion.div 
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary shadow-lg shadow-primary/20">
                    <img src={aiCharacter} alt="AI" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold tracking-tight text-primary">STACKS AI</h1>
                    <p className="text-xs text-muted-foreground">Your DeFi Guide</p>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <SearchBar variant="chat" />
                </motion.div>
              </div>
            </motion.header>

            {/* Chat Interface */}
            <main
              className="flex-1 flex flex-col"
              style={{ height: "calc(100vh - 73px)" }}
            >
              <ChatInterface />
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onStartLearning={() => {
          setShowPreview(false);
          setShowChat(true);
        }}
      />
    </div>
  );
};

export default Index;