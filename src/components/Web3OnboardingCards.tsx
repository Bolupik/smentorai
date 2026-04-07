import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Wallet, Coins, Shield, Link2, ArrowRight, ArrowLeft, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Card {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  points: string[];
  gradient: string;
}

const cards: Card[] = [
  {
    icon: <Globe className="w-10 h-10" />,
    title: "What is Web3?",
    subtitle: "The internet, evolved",
    points: [
      "Web3 is the next generation of the internet where YOU own your data and digital assets.",
      "Unlike Web2 (Google, Facebook), no single company controls everything.",
      "It's powered by blockchain — a shared, transparent ledger that nobody can tamper with.",
    ],
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    icon: <Link2 className="w-10 h-10" />,
    title: "What is Blockchain?",
    subtitle: "The foundation of trust",
    points: [
      "A blockchain is like a public notebook that everyone can read but nobody can erase.",
      "Every transaction is recorded permanently and verified by thousands of computers worldwide.",
      "Bitcoin was the first blockchain. Stacks builds smart contracts on top of Bitcoin's security.",
    ],
    gradient: "from-orange-500/20 to-amber-500/20",
  },
  {
    icon: <Wallet className="w-10 h-10" />,
    title: "Wallets & Keys",
    subtitle: "Your digital identity",
    points: [
      "A crypto wallet is like your personal vault — it stores your digital assets and identity.",
      "Your secret recovery phrase (seed phrase) is the master key. Never share it with anyone!",
      "Popular Stacks wallets include Leather and Xverse — you can connect one to SMentor.",
    ],
    gradient: "from-purple-500/20 to-violet-500/20",
  },
  {
    icon: <Coins className="w-10 h-10" />,
    title: "Tokens & NFTs",
    subtitle: "Digital ownership",
    points: [
      "Tokens (like STX) are digital currencies you can send, receive, and use in apps.",
      "NFTs are unique digital items — art, collectibles, or even event tickets — that you truly own.",
      "Unlike regular files, NFTs prove authenticity and ownership on the blockchain.",
    ],
    gradient: "from-green-500/20 to-emerald-500/20",
  },
  {
    icon: <Shield className="w-10 h-10" />,
    title: "Staying Safe in Web3",
    subtitle: "Protect yourself",
    points: [
      "Never share your seed phrase or private keys — legitimate services will NEVER ask for them.",
      "Always double-check URLs and transaction details before confirming anything.",
      "Start with small amounts while you're learning. Take your time — there's no rush!",
    ],
    gradient: "from-red-500/20 to-rose-500/20",
  },
];

interface Web3OnboardingCardsProps {
  open: boolean;
  onComplete: () => void;
}

const Web3OnboardingCards = ({ open, onComplete }: Web3OnboardingCardsProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const card = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;
  const isLast = currentIndex === cards.length - 1;

  const goNext = () => {
    if (isLast) {
      onComplete();
      return;
    }
    setDirection(1);
    setCurrentIndex((i) => i + 1);
  };

  const goBack = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((i) => i - 1);
    }
  };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0, scale: 0.95 }),
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-md w-full p-0 overflow-hidden border-border/60 bg-background"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Web3 Onboarding</DialogTitle>
          <DialogDescription>Learn the basics of Web3 and blockchain technology.</DialogDescription>
        </DialogHeader>

        <div className="p-6">
          {/* Header with progress and skip */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-muted-foreground">
              {currentIndex + 1} of {cards.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onComplete}
              className="text-xs text-muted-foreground hover:text-foreground gap-1 h-7"
            >
              Skip <X className="w-3 h-3" />
            </Button>
          </div>

          <Progress value={progress} className="h-1.5 mb-6" />

          {/* Card */}
          <div className="relative min-h-[320px] overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
              >
                {/* Icon + gradient header */}
                <div className={`rounded-2xl bg-gradient-to-br ${card.gradient} p-6 mb-5 flex items-center gap-4`}>
                  <div className="p-3 rounded-xl bg-background/80 text-primary">
                    {card.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-foreground">{card.title}</h3>
                    <p className="text-xs text-muted-foreground font-medium">{card.subtitle}</p>
                  </div>
                </div>

                {/* Points */}
                <div className="space-y-3">
                  {card.points.map((point, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.1 }}
                      className="flex gap-3 items-start"
                    >
                      <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <p className="text-sm text-foreground/90 leading-relaxed">{point}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              disabled={currentIndex === 0}
              className="gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <Button onClick={goNext} className="gap-1 font-bold">
              {isLast ? (
                <>Let's Go! <Sparkles className="w-4 h-4" /></>
              ) : (
                <>Next <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Web3OnboardingCards;
