import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, MessageSquare, BookOpen, Library, Activity, Grid3X3, Trophy, Mic, Image, Wallet } from "lucide-react";
import { Button } from "./ui/button";

interface GuideTourProps {
  open: boolean;
  onClose: () => void;
  onAction?: (action: string) => void;
}

const steps = [
  {
    icon: MessageSquare,
    title: "Chat with SAMMY",
    tag: "Core Feature",
    description:
      "SAMMY THE AI is your personal guide to the Stacks ecosystem. Ask any question in plain English — from "What is Proof of Transfer?" to "How do I use sBTC?" — and get a clear, level-adapted answer.",
    tips: [
      "Type anything and press Send",
      "Follow up with more questions for deeper dives",
      "SAMMY adapts explanations to your learning level",
    ],
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Grid3X3,
    title: "Explore Topics",
    tag: "Learning Paths",
    description:
      "Choose from 8 curated topic cards — Architecture, Clarity, DeFi, NFTs, Memecoins, Tools, Wallets, and Security. Each one launches a guided lesson with SAMMY.",
    tips: [
      "Click any topic card to start a lesson",
      "Explored topics are marked with a checkmark",
      "Track your progress across all 8 topics",
    ],
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: BookOpen,
    title: "Take the Quiz",
    tag: "Assessment",
    description:
      "Test your Stacks knowledge with 50+ questions across 6 categories: Architecture, Clarity, DeFi & sBTC, NFTs, Security, and Advanced. Optional timed mode available.",
    tips: [
      "Every answer includes a detailed explanation",
      "Your best score is saved to your profile",
      "Quiz completions count toward your engagement points",
    ],
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
  {
    icon: Library,
    title: "Knowledge Base",
    tag: "Community",
    description:
      "Browse and contribute knowledge entries written by the community. Upvote good content, leave comments, and submit your own insights — approved entries are injected into SAMMY's context.",
    tips: [
      "Search and filter entries by topic or category",
      "Submit your own knowledge with optional links and images",
      "Contributions approved by admins earn you +30 points",
    ],
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    icon: Activity,
    title: "Community Pulse",
    tag: "Live Data",
    description:
      "A real-time dashboard showing live STX & BTC prices, block height, PoX cycle, mempool size, stacked STX, and active signers — refreshed every 60 seconds from the Hiro Stacks API.",
    tips: [
      "Data refreshes every 60 seconds automatically",
      "See trending topics and community hot takes",
      "Check the Sentiment Meter for the community mood",
    ],
    color: "text-orange-400",
    bg: "bg-orange-500/10",
  },
  {
    icon: Trophy,
    title: "Achievements",
    tag: "Gamification",
    description:
      "Earn badges as you explore topics, complete quizzes, and contribute knowledge. View your achievement wall on your profile — and share badges on Twitter/X.",
    tips: [
      "Open My Profile to see your badge collection",
      "Explore all 8 topics to unlock the mastery badge",
      "Badges can be shared directly to Twitter/X",
    ],
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    icon: Wallet,
    title: "Wallet Connect",
    tag: "Web3",
    description:
      "Connect your Stacks wallet (Xverse, Leather, or Asigna) to save your progress on-chain. Wallet users get a dedicated learning profile tied to their address.",
    tips: [
      "Supported wallets: Xverse, Leather, Asigna",
      "Progress and learning level are saved per wallet",
      "BNS names are displayed in your profile",
    ],
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    icon: Mic,
    title: "Voice & Infographics",
    tag: "Accessibility",
    description:
      "Every SAMMY response can be read aloud using the voice narration button. For complex topics like Proof of Transfer, SAMMY also auto-generates visual infographics inline.",
    tips: [
      "Tap the speaker icon on any message to hear it",
      "Infographics generate automatically for complex topics",
      "Great for auditory learners and on-the-go use",
    ],
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
];

const GuideTour = ({ open, onClose }: GuideTourProps) => {
  const [step, setStep] = useState(0);

  const current = steps[step];
  const Icon = current.icon;
  const isFirst = step === 0;
  const isLast = step === steps.length - 1;

  const handleClose = () => {
    setStep(0);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="w-full max-w-lg bg-card border border-border/60 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    App Guide
                  </span>
                  <span className="text-xs text-muted-foreground/50">
                    {step + 1} / {steps.length}
                  </span>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress dots */}
              <div className="flex gap-1.5 px-6 pt-3">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i === step
                        ? "bg-primary w-6"
                        : i < step
                        ? "bg-primary/40 w-3"
                        : "bg-muted w-3"
                    }`}
                  />
                ))}
              </div>

              {/* Step content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="px-6 pt-5 pb-6"
                >
                  {/* Icon + tag */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl ${current.bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${current.color}`} />
                    </div>
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${current.color}`}>
                        {current.tag}
                      </span>
                      <h2 className="text-lg font-bold text-foreground leading-tight">
                        {current.title}
                      </h2>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                    {current.description}
                  </p>

                  {/* Tips */}
                  <div className="space-y-2">
                    {current.tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${current.color} opacity-70`} />
                        <span className="text-xs text-muted-foreground leading-relaxed">{tip}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Footer */}
              <div className="px-6 pb-6 flex items-center justify-between border-t border-border/30 pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep((s) => s - 1)}
                  disabled={isFirst}
                  className="text-muted-foreground"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>

                {isLast ? (
                  <Button size="sm" onClick={handleClose} className="px-6">
                    Get Started
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => setStep((s) => s + 1)} className="px-6">
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default GuideTour;
