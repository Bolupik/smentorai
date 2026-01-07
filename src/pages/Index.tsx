import { motion, AnimatePresence } from "framer-motion";
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
import { useAuth } from "@/contexts/AuthContext";
import { useTopicProgressDB } from "@/hooks/useTopicProgressDB";
import { useAdminRole } from "@/hooks/useAdminRole";
import { topicsList } from "@/components/TopicCards";
import { Play, Info, BookOpen, Library, Shield } from "lucide-react";

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
        {showAdmin && isAdmin ? (
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

            {/* Navigation */}
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
                  THE ARCHITECT
                </motion.div>
                <div className="flex items-center gap-6">
                  <motion.span 
                    className="text-sm font-medium text-foreground/80 hover:text-foreground cursor-pointer transition-colors hidden md:inline"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    Protocols
                  </motion.span>
                  <motion.span 
                    className="text-sm font-medium text-foreground/80 hover:text-foreground cursor-pointer transition-colors hidden md:inline"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    Architecture
                  </motion.span>
                  <motion.span 
                    className="text-sm font-medium text-foreground/80 hover:text-foreground cursor-pointer transition-colors hidden md:inline"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    Clarity
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

            {/* Hero Content */}
            <main className="relative z-10 flex-1 flex flex-col justify-end px-8 pb-32 md:pb-40">
              <div className="max-w-2xl">
                {/* Series badge */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex items-center gap-3 mb-4"
                >
                  <span className="text-primary font-bold text-lg tracking-wider">◆</span>
                  <span className="text-xs tracking-[0.3em] text-muted-foreground uppercase">Masterclass</span>
                </motion.div>

                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-foreground mb-6 leading-none"
                >
                  {"THE ARCHITECT".split("").map((char, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.7 + index * 0.04,
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

                {/* Description - Elegant prose */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                  className="text-lg md:text-xl text-foreground/80 mb-8 leading-relaxed max-w-xl font-light"
                >
                  A comprehensive discourse on the Stacks paradigm. Herein lies the knowledge to navigate decentralized finance, comprehend Bitcoin's programmable layer, and master the elegant precision of Clarity.
                </motion.p>

                {/* Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.4 }}
                  className="flex items-center gap-4 flex-wrap"
                >
                  <button
                    onClick={() => setShowChat(true)}
                    className="group flex items-center gap-3 px-8 py-4 bg-foreground text-background font-semibold text-lg rounded-sm hover:bg-foreground/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Play className="w-6 h-6 fill-current" />
                    <span>Begin Session</span>
                  </button>
                  <button
                    onClick={() => setShowQuiz(true)}
                    className="group flex items-center gap-3 px-8 py-4 bg-primary/20 text-primary border border-primary/50 font-semibold text-lg rounded-sm hover:bg-primary/30 transition-all duration-300"
                  >
                    <BookOpen className="w-5 h-5" />
                    <span>Assessment</span>
                  </button>
                  <button
                    onClick={() => setShowKnowledge(true)}
                    className="group flex items-center gap-3 px-6 py-4 bg-muted/60 text-foreground/80 font-medium text-lg rounded-sm hover:bg-muted transition-all duration-300 backdrop-blur-sm"
                  >
                    <Library className="w-5 h-5" />
                    <span>Contribute</span>
                  </button>
                  <button 
                    onClick={() => setShowPreview(true)}
                    className="group flex items-center gap-3 px-6 py-4 bg-muted/80 text-foreground font-semibold text-lg rounded-sm hover:bg-muted transition-all duration-300 backdrop-blur-sm"
                  >
                    <Info className="w-6 h-6" />
                    <span>Overview</span>
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => setShowAdmin(true)}
                      className="group flex items-center gap-3 px-6 py-4 bg-destructive/20 text-destructive border border-destructive/50 font-semibold text-lg rounded-sm hover:bg-destructive/30 transition-all duration-300"
                    >
                      <Shield className="w-5 h-5" />
                      <span>Admin</span>
                    </button>
                  )}
                </motion.div>

                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1.6 }}
                  className="flex items-center gap-4 mt-8"
                >
                  <span className="px-2 py-1 border border-muted-foreground/50 text-xs text-muted-foreground">
                    BITCOIN L2
                  </span>
                  <span className="text-sm text-muted-foreground font-light">
                    2025 • Technical Mastery • Guided Instruction
                  </span>
                </motion.div>
              </div>
              
              {/* Dapp Showcase at bottom */}
              <div className="absolute bottom-0 left-0 right-0 z-30">
                <DappShowcase />
              </div>
            </main>

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
