import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
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
import DailyQuizPanel from "@/components/DailyQuizPanel";
import { CommunitySentiment } from "@/components/CommunitySentiment";
import OnboardingModal from "@/components/OnboardingModal";
import Web3ExperienceModal from "@/components/Web3ExperienceModal";
import Web3OnboardingCards from "@/components/Web3OnboardingCards";
import type { Web3Experience } from "@/components/Web3ExperienceModal";
import GuideTour from "@/components/GuideTour";
import Footer from "@/components/Footer";
import SammyCompanion from "@/components/SammyCompanion";
import { useAuth } from "@/contexts/AuthContext";
import { useStacksAuth } from "@/hooks/useStacksAuth";
import { useTopicProgressDB } from "@/hooks/useTopicProgressDB";
import { useAdminRole } from "@/hooks/useAdminRole";
import { topicsList } from "@/components/TopicCards";
import { Play, Info, BookOpen, Library, Shield, Activity, UserCircle, HelpCircle } from "lucide-react";

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

const Dashboard = () => {
  const [showChat, setShowChat] = useState(false);
  const { scrollY: heroScrollY } = useScroll();
  const heroImageY = useTransform(heroScrollY, [0, 900], ["0%", "16%"]);
  const heroImageScale = useTransform(heroScrollY, [0, 900], [1, 1.12]);
  const heroContentY = useTransform(heroScrollY, [0, 900], [0, -70]);
  const heroContentOpacity = useTransform(heroScrollY, [0, 650], [1, 0]);
  const [showPreview, setShowPreview] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showKnowledge, setShowKnowledge] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showSentiment, setShowSentiment] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showWeb3Experience, setShowWeb3Experience] = useState(false);
  const [showWeb3Cards, setShowWeb3Cards] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const { isAuthenticated: isWalletConnected, userData: walletData, isLoading: isWalletLoading } = useStacksAuth();
  const { exploredCount } = useTopicProgressDB();
  const { isAdmin } = useAdminRole();

  const isAuthorized = !!user || isWalletConnected;
  const authLoading = isLoading || isWalletLoading;

  // Redirect to auth if not logged in via email or wallet
  useEffect(() => {
    if (!authLoading && !isAuthorized) {
      navigate("/auth");
    }
  }, [isAuthorized, authLoading, navigate]);

  // Auto-show onboarding modal for first-time users.
  // Works for BOTH email users (real session) and wallet users (anonymous session).
  // We call supabase.auth.getUser() directly so we always get the current session
  // user regardless of which auth method was used.
  useEffect(() => {
    if (authLoading || !isAuthorized) return;

    import("@/integrations/supabase/client").then(({ supabase }) => {
      supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
        if (!currentUser) return;

        const onboardedKey = `onboarded_${currentUser.id}`;
        if (localStorage.getItem(onboardedKey)) return;

        supabase
          .from("profiles")
          .select("age_level, web3_experience, web3_onboarded")
          .eq("user_id", currentUser.id)
          .maybeSingle()
          .then(({ data }) => {
            if (!data?.age_level) {
              // Step 1: age level onboarding
              setShowOnboarding(true);
            } else if (!data?.web3_experience) {
              // Step 2: Web3 experience question
              localStorage.setItem(onboardedKey, "true");
              setShowWeb3Experience(true);
            } else if (!data?.web3_onboarded) {
              // Step 3: if beginner and hasn't done cards yet
              localStorage.setItem(onboardedKey, "true");
              if (data.web3_experience === "complete_beginner") {
                setShowWeb3Cards(true);
              }
            } else {
              localStorage.setItem(onboardedKey, "true");
            }
          });
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthorized, user?.id, isWalletConnected]);

  // Show loading while checking auth
  if (authLoading) {
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
          <p className="text-muted-foreground text-sm font-light tracking-wide">Loading Sammy…</p>
        </motion.div>
      </div>
    );
  }

  // Show loading instead of null to prevent blank flash while redirect fires
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden">
      <AnimatePresence mode="wait">
        {showProfile ? (
          <motion.div
            key="profile"
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
                  onClick={() => setShowProfile(false)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <span className="text-lg">←</span>
                  <span>Return</span>
                </motion.button>
                <div className="flex items-center gap-3">
                  <UserCircle className="w-5 h-5 text-primary" />
                  <h1 className="text-lg font-semibold tracking-tight">My Profile</h1>
                </div>
                <UserMenu exploredCount={exploredCount} totalTopics={topicsList.length} onOpenProfile={() => setShowProfile(true)} />
              </div>
            </motion.header>
            <main className="flex-1 flex flex-col items-center justify-start p-6 overflow-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full max-w-md py-8"
              >
                <ProfileEditor />
              </motion.div>
            </main>
          </motion.div>
        ) : showSentiment ? (
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
                <UserMenu exploredCount={exploredCount} totalTopics={topicsList.length} onOpenProfile={() => setShowProfile(true)} />
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
                <UserMenu exploredCount={exploredCount} totalTopics={topicsList.length} onOpenProfile={() => setShowProfile(true)} />
              </div>
            </motion.header>
            <main className="flex-1 flex flex-col items-center justify-start p-6 overflow-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full max-w-3xl py-8"
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
                <UserMenu exploredCount={exploredCount} totalTopics={topicsList.length} onOpenProfile={() => setShowProfile(true)} />
              </div>
            </motion.header>
            <main className="flex-1 flex flex-col items-center justify-start p-6 overflow-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full max-w-2xl py-8 space-y-6"
              >
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
                <UserMenu exploredCount={exploredCount} totalTopics={topicsList.length} onOpenProfile={() => setShowProfile(true)} />
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
                style={{ y: heroImageY, scale: heroImageScale }}
                className="absolute inset-0"
              >
                <img 
                  src={aiCharacter} 
                  alt="Sammy" 
                  className="w-full h-full object-cover object-top opacity-70"
                />
              </motion.div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background/80" />
              <div className="absolute inset-0 tactical-grid opacity-60" />
              <div className="absolute inset-0 netflix-vignette" />
              <div className="absolute bottom-0 left-0 right-0 h-1/3 netflix-hero-glow" />
            </div>

            {/* Animated scanline overlay */}
            <div className="pointer-events-none absolute inset-0 z-30 tactical-scanlines opacity-[0.05]" />

            {/* Navigation - Mobile optimized */}
            <motion.header
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative z-50 px-4 sm:px-8 py-4 sm:py-6"
            >
              <div className="flex items-center justify-between">
                <motion.div 
                  className="flex items-center gap-2 sm:gap-3 group cursor-default"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-primary rotate-45 flex items-center justify-center transition-colors duration-300 group-hover:bg-primary">
                    <div className="w-1.5 h-1.5 bg-foreground -rotate-45" />
                  </div>
                  <span className="font-display text-base sm:text-2xl tracking-tighter uppercase text-foreground">
                    <span className="hidden sm:inline">SAMMY THE AI</span>
                    <span className="sm:hidden">SAMMY</span>
                  </span>
                </motion.div>
                <div className="flex items-center gap-2 sm:gap-6">
                  {["Protocols", "Architecture", "Clarity"].map((label, i) => (
                    <motion.span
                      key={label}
                      className={`font-tactical text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-primary cursor-pointer transition-colors ${i === 2 ? "hidden xl:inline" : "hidden lg:inline"}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                    >
                      {label}
                    </motion.span>
                  ))}
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
                    <UserMenu exploredCount={exploredCount} totalTopics={topicsList.length} onOpenProfile={() => setShowProfile(true)} />
                  </motion.div>
                </div>
              </div>
            </motion.header>

            {/* Hero Content - Mobile optimized */}
            <motion.main
              style={{ y: heroContentY, opacity: heroContentOpacity }}
              className="relative z-10 flex-1 flex flex-col justify-end px-4 sm:px-8 pb-48 sm:pb-56 md:pb-64"
            >
              <div className="max-w-2xl">
                {/* System status badge */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex items-center gap-3 mb-4 sm:mb-6"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                  </span>
                  <span className="font-tactical text-[9px] sm:text-[10px] tracking-[0.3em] uppercase font-bold text-primary">
                    AI Module: Active
                  </span>
                </motion.div>

                {/* Title - stacked outline / glitch red */}
                <div className="mb-4 sm:mb-6">
                  <motion.h2
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.5 }}
                    className="font-display text-5xl sm:text-7xl md:text-8xl leading-[0.8] tracking-tighter uppercase italic text-outline"
                  >
                    SAMMY
                  </motion.h2>
                  <motion.h1
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.65 }}
                    className="font-display text-5xl sm:text-7xl md:text-8xl leading-[0.8] tracking-tighter uppercase italic text-primary glitch-text"
                  >
                    THE AI
                  </motion.h1>
                </div>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                  className="text-sm sm:text-lg text-foreground/60 mb-6 sm:mb-8 leading-relaxed max-w-md font-medium italic border-l-2 border-primary pl-4"
                >
                  The premier intelligent layer for the Bitcoin ecosystem. Master decentralized finance, Bitcoin's programmable layer, and the elegance of Clarity.
                </motion.p>

                {/* CTA cluster */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.05 }}
                  className="flex flex-col gap-3 max-w-xl"
                >
                  <motion.button
                    onClick={() => setShowChat(true)}
                    className="cta-sheen w-full py-4 sm:py-5 bg-primary text-primary-foreground font-display text-base sm:text-lg tracking-widest uppercase flex items-center justify-center gap-3 shadow-[0_0_30px_hsl(var(--primary)/0.3)] hover:brightness-110 transition-all"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                    <span>Begin Mission</span>
                  </motion.button>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                    {[
                      { label: "Assessment", icon: BookOpen, onClick: () => setShowQuiz(true) },
                      { label: "Pulse.net", icon: Activity, onClick: () => setShowSentiment(true) },
                      { label: "Contribute", icon: Library, onClick: () => setShowKnowledge(true) },
                      { label: "Overview", icon: Info, onClick: () => setShowPreview(true) },
                      { label: "Guide", icon: HelpCircle, onClick: () => setShowGuide(true) },
                      ...(isAdmin ? [{ label: "Admin", icon: Shield, onClick: () => setShowAdmin(true) }] : []),
                    ].map(({ label, icon: Icon, onClick }, i) => (
                      <motion.button
                        key={label}
                        onClick={onClick}
                        className="tactical-corners tactical-panel py-3 sm:py-4 px-2 flex items-center justify-center gap-2 font-tactical text-[9px] sm:text-[10px] tracking-widest uppercase text-foreground/80 hover:text-foreground transition-colors"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.15 + i * 0.06 }}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Icon className="w-3.5 h-3.5 text-primary" />
                        <span>{label}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Telemetry strip — network / assets / access */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1.5 }}
                  className="mt-8 sm:mt-10 pt-5 border-t border-foreground/10 flex items-end justify-between gap-4 max-w-xl"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-bold text-primary tracking-widest uppercase">Network</span>
                    <div className="flex items-center gap-2">
                      <span className="font-tactical text-[10px] sm:text-xs text-foreground">STX-L2</span>
                      <span className="flex -space-x-1.5">
                        {["STX", "BTC", "AI"].map((t) => (
                          <span
                            key={t}
                            className="w-6 h-6 rounded-full border border-foreground/15 bg-muted flex items-center justify-center text-[7px] font-bold text-foreground/70"
                          >
                            {t}
                          </span>
                        ))}
                      </span>
                    </div>
                  </div>
                  <div className="hidden sm:flex flex-col items-center gap-1">
                    <span className="text-[8px] font-bold text-primary tracking-widest uppercase">Protocol</span>
                    <span className="font-tactical text-[10px] sm:text-xs text-foreground">BITCOIN L2</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[8px] font-bold text-primary tracking-widest uppercase">Access</span>
                    <span className="font-tactical text-[10px] sm:text-xs font-bold text-foreground">ENCRYPTED</span>
                  </div>
                </motion.div>
              </div>
            </motion.main>

            {/* Bottom decorative telemetry bar */}
            <div className="relative z-40 h-1 w-full flex">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.6, delay: 0.6, ease: "easeOut" }}
              />
              <div className="h-full w-24 bg-foreground/20" />
            </div>

            
            {/* Dapp Showcase - Fixed at very bottom */}
            <div className="relative z-40">
              <DappShowcase />
            </div>

            {/* Footer */}
            <div className="relative z-40">
              <Footer />
            </div>

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
                    <img src={aiCharacter} alt="Sammy" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold tracking-tight text-primary">SAMMY THE AI</h1>
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
                  <UserMenu exploredCount={exploredCount} totalTopics={topicsList.length} onOpenProfile={() => setShowProfile(true)} />
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
      <OnboardingModal
        open={showOnboarding}
        onComplete={() => {
          setShowOnboarding(false);
          // After age level, show Web3 experience question
          setShowWeb3Experience(true);
        }}
      />
      <Web3ExperienceModal
        open={showWeb3Experience}
        onComplete={async (experience: Web3Experience) => {
          setShowWeb3Experience(false);
          // Save to DB
          const { supabase } = await import("@/integrations/supabase/client");
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          if (currentUser) {
            await supabase
              .from("profiles")
              .update({ web3_experience: experience } as any)
              .eq("user_id", currentUser.id);
          }
          // If complete beginner, show onboarding cards
          if (experience === "complete_beginner") {
            setShowWeb3Cards(true);
          }
        }}
      />
      <Web3OnboardingCards
        open={showWeb3Cards}
        onComplete={async () => {
          setShowWeb3Cards(false);
          // Mark web3 onboarded
          const { supabase } = await import("@/integrations/supabase/client");
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          if (currentUser) {
            await supabase
              .from("profiles")
              .update({ web3_onboarded: true } as any)
              .eq("user_id", currentUser.id);
          }
        }}
      />
      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onStartLearning={() => {
          setShowPreview(false);
          setShowChat(true);
        }}
      />
      <GuideTour open={showGuide} onClose={() => setShowGuide(false)} />

      {/* Daily Quiz – floats on right edge of every dashboard view */}
      <DailyQuizPanel />

      {/* Persistent 3D Sammy companion — hidden during modal/onboarding flows */}
      {!showOnboarding && !showWeb3Experience && !showWeb3Cards && !showChat && (
        <SammyCompanion />
      )}
    </div>
  );
};

export default Dashboard;
