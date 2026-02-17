import { motion, AnimatePresence } from "framer-motion";
import WhitepaperSection from "@/components/WhitepaperSection";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import aiCharacter from "@/assets/ai-character.png";
import ChatInterface from "@/components/ChatInterface";
import PreviewModal from "@/components/PreviewModal";
import SearchBar from "@/components/SearchBar";
import UserMenu from "@/components/UserMenu";
import StacksQuiz from "@/components/StacksQuiz";
import KnowledgeBase from "@/components/KnowledgeBase";
import AdminPanel from "@/components/AdminPanel";
import ProfileEditor from "@/components/ProfileEditor";
import DappShowcase from "@/components/DappShowcase";
import { CommunitySentiment } from "@/components/CommunitySentiment";
import { useAuth } from "@/contexts/AuthContext";
import { useTopicProgressDB } from "@/hooks/useTopicProgressDB";
import { useAdminRole } from "@/hooks/useAdminRole";
import { topicsList } from "@/components/TopicCards";
import { Play, Info, BookOpen, Library, Shield, Activity } from "lucide-react";

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
  const [showQuiz, setShowQuiz] = useState(false);
  const [showKnowledge, setShowKnowledge] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showSentiment, setShowSentiment] = useState(false);
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const { exploredCount } = useTopicProgressDB();
  const { isAdmin } = useAdminRole();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full"
          />
          <p className="text-muted-foreground text-sm font-light tracking-wide">Initializing the Archive...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden">
      <AnimatePresence mode="wait">
        {showSentiment ? (
          <motion.div
            key="sentiment"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="flex-1 flex flex-col"
          >
            <motion.header
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-b border-border/30 bg-background/95 backdrop-blur-md sticky top-0 z-50"
            >
              <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                <motion.button
                  whileHover={{ x: -5 }}
                  onClick={() => setShowSentiment(false)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <span className="text-lg">←</span>
                  <span>Return</span>
                </motion.button>
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-orange-500" />
                  <h1 className="text-lg font-semibold tracking-tight">Community Pulse</h1>
                </div>
                <UserMenu exploredCount={exploredCount} totalTopics={topicsList.length} />
              </div>
            </motion.header>
            <main className="flex-1 flex flex-col items-center justify-start p-6 overflow-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full max-w-4xl py-8"
              >
                <CommunitySentiment />
              </motion.div>
            </main>
          </motion.div>
        ) : showAdmin && isAdmin ? (
          <motion.div
            key="admin"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="flex-1 flex flex-col"
          >
            <motion.header
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-b border-border/30 bg-background/95 backdrop-blur-md sticky top-0 z-50"
            >
              <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                <motion.button
                  whileHover={{ x: -5 }}
                  onClick={() => setShowAdmin(false)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <span className="text-lg">←</span>
                  <span>Return</span>
                </motion.button>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-destructive" />
                  <h1 className="text-lg font-semibold tracking-tight">Admin Panel</h1>
                </div>
                <UserMenu exploredCount={exploredCount} totalTopics={topicsList.length} />
              </div>
            </motion.header>
            <main className="flex-1 flex flex-col items-center justify-start p-6 overflow-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full max-w-2xl py-8"
              >
                <AdminPanel />
              </motion.div>
            </main>
          </motion.div>
        ) : showKnowledge ? (
          <motion.div
            key="knowledge"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="flex-1 flex flex-col"
          >
            <motion.header
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-b border-border/30 bg-background/95 backdrop-blur-md sticky top-0 z-50"
            >
              <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                <motion.button
                  whileHover={{ x: -5 }}
                  onClick={() => setShowKnowledge(false)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <span className="text-lg">←</span>
                  <span>Return</span>
                </motion.button>
                <div className="flex items-center gap-3">
                  <Library className="w-5 h-5 text-primary" />
                  <h1 className="text-lg font-semibold tracking-tight">Knowledge Repository</h1>
                </div>
                <UserMenu exploredCount={exploredCount} totalTopics={topicsList.length} />
              </div>
            </motion.header>
            <main className="flex-1 flex flex-col items-center justify-start p-6 overflow-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full max-w-2xl py-8 space-y-6"
              >
                <ProfileEditor />
                <KnowledgeBase />
              </motion.div>
            </main>
          </motion.div>
        ) : showQuiz ? (
          <motion.div
            key="quiz"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="flex-1 flex flex-col"
          >
            {/* Quiz Header */}
            <motion.header
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-b border-border/30 bg-background/95 backdrop-blur-md sticky top-0 z-50"
            >
              <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                <motion.button
                  whileHover={{ x: -5 }}
                  onClick={() => setShowQuiz(false)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <span className="text-lg">←</span>
                  <span>Return</span>
                </motion.button>
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <h1 className="text-lg font-semibold tracking-tight">Knowledge Assessment</h1>
                </div>
                <UserMenu exploredCount={exploredCount} totalTopics={topicsList.length} />
              </div>
            </motion.header>

            {/* Quiz Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full max-w-2xl"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Stacks Ecosystem Proficiency</h2>
                  <p className="text-muted-foreground">
                    A technical assessment to evaluate your comprehension of core architectural principles.
                  </p>
                </div>
                <StacksQuiz />
              </motion.div>
            </main>
          </motion.div>
        ) : !showChat ? (
          <motion.div
            key="landing"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="flex-1 flex flex-col relative"
          >
            {/* Full Screen Hero Background */}
            <div className="absolute inset-0 z-0">
              <motion.div
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 20, ease: "linear" }}
                className="absolute inset-0"
              >
                <img 
                  src={aiCharacter} 
                  alt="The Architect" 
                  className="w-full h-full object-cover object-top"
                />
              </motion.div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
              <div className="absolute inset-0 netflix-vignette" />
              <div className="absolute bottom-0 left-0 right-0 h-1/3 netflix-hero-glow" />
            </div>

            {/* Navigation - Mobile optimized */}
            <motion.header
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative z-50 px-4 sm:px-8 py-4 sm:py-6"
            >
              <div className="flex items-center justify-between">
                <motion.div 
                  className="text-xl sm:text-3xl font-bold tracking-tighter text-primary"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <span className="hidden sm:inline">THE ARCHITECT</span>
                  <span className="sm:hidden">ARCHITECT</span>
                </motion.div>
                <div className="flex items-center gap-2 sm:gap-6">
                  <motion.span 
                    className="text-xs sm:text-sm font-medium text-foreground/80 hover:text-foreground cursor-pointer transition-colors hidden lg:inline"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    Protocols
                  </motion.span>
                  <motion.span 
                    className="text-xs sm:text-sm font-medium text-foreground/80 hover:text-foreground cursor-pointer transition-colors hidden lg:inline"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    Architecture
                  </motion.span>
                  <motion.span 
                    className="text-xs sm:text-sm font-medium text-foreground/80 hover:text-foreground cursor-pointer transition-colors hidden xl:inline"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    Clarity
                  </motion.span>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="hidden sm:block"
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

            {/* Hero Content - Mobile optimized */}
            <main className="relative z-10 flex-1 flex flex-col justify-end px-4 sm:px-8 pb-28 sm:pb-32 md:pb-40">
              <div className="max-w-2xl">
                {/* Series badge */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4"
                >
                  <motion.span 
                    className="text-primary font-bold text-base sm:text-lg tracking-wider"
                    animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                  >
                    ◆
                  </motion.span>
                  <span className="text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] text-muted-foreground uppercase">Masterclass</span>
                </motion.div>

                {/* Title - Responsive sizing */}
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-foreground mb-4 sm:mb-6 leading-none"
                >
                  {"THE ARCHITECT".split("").map((char, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, y: 20, rotateX: -90 }}
                      animate={{ opacity: 1, y: 0, rotateX: 0 }}
                      transition={{
                        delay: 0.7 + index * 0.04,
                        duration: 0.5,
                        ease: [0.6, -0.05, 0.01, 0.99],
                      }}
                      className="inline-block hover:text-primary transition-colors duration-200"
                      style={{ minWidth: char === " " ? "0.25em" : "auto" }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </motion.h1>

                {/* Description - Mobile optimized */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                  className="text-sm sm:text-lg md:text-xl text-foreground/80 mb-6 sm:mb-8 leading-relaxed max-w-xl font-light"
                >
                  A comprehensive discourse on the Stacks paradigm. Master decentralized finance, Bitcoin's programmable layer, and the elegance of Clarity.
                </motion.p>

                {/* Buttons - Mobile responsive grid */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.4 }}
                  className="flex flex-wrap gap-2 sm:gap-3 md:gap-4"
                >
                  <motion.button
                    onClick={() => setShowChat(true)}
                    className="group flex items-center gap-2 sm:gap-3 px-4 sm:px-8 py-3 sm:py-4 bg-foreground text-background font-semibold text-sm sm:text-lg rounded-sm hover:bg-foreground/90 transition-all duration-300 shadow-lg hover:shadow-xl"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Play className="w-4 h-4 sm:w-6 sm:h-6 fill-current" />
                    <span>Begin</span>
                  </motion.button>
                  <motion.button
                    onClick={() => setShowQuiz(true)}
                    className="group flex items-center gap-2 px-4 sm:px-8 py-3 sm:py-4 bg-primary/20 text-primary border border-primary/50 font-semibold text-sm sm:text-lg rounded-sm hover:bg-primary/30 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Assessment</span>
                    <span className="sm:hidden">Quiz</span>
                  </motion.button>
                  <motion.button
                    onClick={() => setShowKnowledge(true)}
                    className="group flex items-center gap-2 px-3 sm:px-6 py-3 sm:py-4 bg-muted/60 text-foreground/80 font-medium text-sm sm:text-lg rounded-sm hover:bg-muted transition-all duration-300 backdrop-blur-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Library className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Contribute</span>
                  </motion.button>
                  <motion.button
                    onClick={() => setShowSentiment(true)}
                    className="group flex items-center gap-2 px-3 sm:px-6 py-3 sm:py-4 bg-orange-500/20 text-orange-400 border border-orange-500/50 font-semibold text-sm sm:text-lg rounded-sm hover:bg-orange-500/30 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Pulse</span>
                  </motion.button>
                  <motion.button 
                    onClick={() => setShowPreview(true)}
                    className="group flex items-center gap-2 px-3 sm:px-6 py-3 sm:py-4 bg-muted/80 text-foreground font-semibold text-sm sm:text-lg rounded-sm hover:bg-muted transition-all duration-300 backdrop-blur-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Info className="w-4 h-4 sm:w-6 sm:h-6" />
                    <span className="hidden sm:inline">Overview</span>
                  </motion.button>
                  {isAdmin && (
                    <motion.button
                      onClick={() => setShowAdmin(true)}
                      className="group flex items-center gap-2 px-3 sm:px-6 py-3 sm:py-4 bg-destructive/20 text-destructive border border-destructive/50 font-semibold text-sm sm:text-lg rounded-sm hover:bg-destructive/30 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden sm:inline">Admin</span>
                    </motion.button>
                  )}
                </motion.div>

                {/* Badge - Mobile optimized */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1.6 }}
                  className="flex flex-wrap items-center gap-2 sm:gap-4 mt-6 sm:mt-8"
                >
                  <span className="px-2 py-1 border border-muted-foreground/50 text-[10px] sm:text-xs text-muted-foreground">
                    BITCOIN L2
                  </span>
                  <span className="text-xs sm:text-sm text-muted-foreground font-light">
                    2025 • Technical Mastery
                  </span>
                </motion.div>
              </div>
            </main>
            
            {/* Dapp Showcase - Fixed at very bottom */}
            <div className="relative z-40">
              <DappShowcase />
            </div>

            {/* Whitepaper Section */}
            <WhitepaperSection />

            {/* Subtle particles */}
            <div className="absolute inset-0 pointer-events-none z-20">
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-primary/20"
                  style={{
                    left: `${5 + Math.random() * 90}%`,
                    top: `${10 + Math.random() * 80}%`,
                  }}
                  animate={{
                    opacity: [0, 0.4, 0],
                    scale: [0, 1.2, 0],
                  }}
                  transition={{
                    duration: 4 + Math.random() * 2,
                    repeat: Infinity,
                    delay: i * 0.4,
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
            {/* Chat Header */}
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
                  <span>Return</span>
                </motion.button>
                <motion.div 
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary shadow-lg shadow-primary/20">
                    <img src={aiCharacter} alt="The Architect" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold tracking-tight text-primary">THE ARCHITECT</h1>
                    <p className="text-xs text-muted-foreground">Your Guide to Mastery</p>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-4"
                >
                  <SearchBar variant="chat" />
                  <UserMenu exploredCount={exploredCount} totalTopics={topicsList.length} />
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
