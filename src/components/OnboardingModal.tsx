import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Baby, Sparkles, GraduationCap, Brain, CheckCircle, Wallet, X } from "lucide-react";
import { useStacksAuth } from "@/hooks/useStacksAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

type AgeLevel = "child" | "teen" | "adult" | "expert";

const ageLevels: {
  value: AgeLevel;
  label: string;
  icon: React.ReactNode;
  description: string;
  age: string;
  color: string;
}[] = [
  {
    value: "child",
    label: "Kid Mode",
    icon: <Baby className="w-6 h-6" />,
    description: "Super simple & fun explanations",
    age: "Ages 6–10",
    color: "text-green-400 border-green-400/40 bg-green-400/10 hover:border-green-400/70",
  },
  {
    value: "teen",
    label: "Teen Mode",
    icon: <Sparkles className="w-6 h-6" />,
    description: "Clear, engaging & easy to follow",
    age: "Ages 11–17",
    color: "text-blue-400 border-blue-400/40 bg-blue-400/10 hover:border-blue-400/70",
  },
  {
    value: "adult",
    label: "Adult Mode",
    icon: <GraduationCap className="w-6 h-6" />,
    description: "Detailed explanations with examples",
    age: "Ages 18+",
    color: "text-purple-400 border-purple-400/40 bg-purple-400/10 hover:border-purple-400/70",
  },
  {
    value: "expert",
    label: "Expert Mode",
    icon: <Brain className="w-6 h-6" />,
    description: "Technical, precise & in-depth",
    age: "Developers",
    color: "text-orange-400 border-orange-400/40 bg-orange-400/10 hover:border-orange-400/70",
  },
];

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}

const OnboardingModal = ({ open, onComplete }: OnboardingModalProps) => {
  const [selectedLevel, setSelectedLevel] = useState<AgeLevel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated: isWalletConnected, userData: walletData } = useStacksAuth();

  const handleContinue = async () => {
    if (!selectedLevel) {
      toast({
        title: "Please select your learning level",
        description: "This helps Sammy personalise your experience.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Stacks wallet user — persist to localStorage
      if (isWalletConnected && walletData?.address) {
        localStorage.setItem(`stacks_age_level_${walletData.address}`, selectedLevel);
        toast({ title: "All set! 🎉", description: "Welcome to SMentor — your journey starts now." });
        onComplete();
        navigate("/");
        return;
      }

      // Email-auth user — persist to database profile
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Not signed in", description: "Please sign in to continue.", variant: "destructive" });
        navigate("/auth");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .upsert({ user_id: user.id, age_level: selectedLevel }, { onConflict: "user_id" });

      if (error) {
        console.warn("Profile upsert note:", error.message);
      }

      toast({ title: "All set! 🎉", description: "Welcome to SMentor — your journey starts now." });
      onComplete();
      navigate("/");
    } catch {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const isWalletFlow = isWalletConnected && !!walletData?.address;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-lg w-full p-0 overflow-hidden border-border/60 bg-background"
        // Prevent closing by clicking outside
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Hidden accessibility title/description */}
        <DialogHeader className="sr-only">
          <DialogTitle>Choose your learning level</DialogTitle>
          <DialogDescription>Select the learning level that best fits you to personalise your SMentor experience.</DialogDescription>
        </DialogHeader>

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.1 }}
              className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4"
            >
              {isWalletFlow ? (
                <Wallet className="w-7 h-7 text-primary" />
              ) : (
                <CheckCircle className="w-7 h-7 text-primary" />
              )}
            </motion.div>
            <h2 className="text-2xl font-black text-foreground mb-1">
              {isWalletFlow ? "Wallet Connected! 🎉" : "Email Verified! 🎉"}
            </h2>
            <p className="text-muted-foreground text-sm">One last step — choose your learning level.</p>
            {isWalletFlow && walletData?.bnsName && (
              <p className="text-xs text-primary/80 mt-1 font-medium">Welcome, {walletData.bnsName} 👋</p>
            )}
            <p className="text-xs text-muted-foreground/60 mt-1">This shapes how Sammy explains concepts to you.</p>
          </div>

          {/* Level grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {ageLevels.map((level, i) => (
              <motion.button
                key={level.value}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                onClick={() => setSelectedLevel(level.value)}
                className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  selectedLevel === level.value
                    ? "border-primary bg-primary/15 shadow-lg shadow-primary/20"
                    : `border-border bg-card ${level.color}`
                }`}
              >
                {selectedLevel === level.value && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center"
                  >
                    <CheckCircle className="w-2.5 h-2.5 text-primary-foreground" />
                  </motion.div>
                )}
                <div className={`mb-2 ${selectedLevel === level.value ? "text-primary" : ""}`}>{level.icon}</div>
                <h3
                  className={`font-bold text-sm mb-0.5 ${
                    selectedLevel === level.value ? "text-primary" : "text-foreground"
                  }`}
                >
                  {level.label}
                </h3>
                <p className="text-xs text-muted-foreground mb-1">{level.description}</p>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {level.age}
                </span>
              </motion.button>
            ))}
          </div>

          <Button
            onClick={handleContinue}
            disabled={!selectedLevel || isLoading}
            className="w-full py-5 text-base font-bold"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full"
                />
                Setting up your profile…
              </span>
            ) : (
              "Start Learning with Sammy →"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
