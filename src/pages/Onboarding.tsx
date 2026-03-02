import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Baby, Sparkles, GraduationCap, Brain, CheckCircle } from "lucide-react";
import aiCharacter from "@/assets/ai-character.png";

type AgeLevel = "child" | "teen" | "adult" | "expert";

const ageLevels: { value: AgeLevel; label: string; icon: React.ReactNode; description: string; age: string; color: string }[] = [
  { value: "child", label: "Kid Mode", icon: <Baby className="w-6 h-6" />, description: "Super simple & fun explanations", age: "Ages 6–10", color: "text-green-400 border-green-400/40 bg-green-400/10 hover:border-green-400/70" },
  { value: "teen", label: "Teen Mode", icon: <Sparkles className="w-6 h-6" />, description: "Clear, engaging & easy to follow", age: "Ages 11–17", color: "text-blue-400 border-blue-400/40 bg-blue-400/10 hover:border-blue-400/70" },
  { value: "adult", label: "Adult Mode", icon: <GraduationCap className="w-6 h-6" />, description: "Detailed explanations with examples", age: "Ages 18+", color: "text-purple-400 border-purple-400/40 bg-purple-400/10 hover:border-purple-400/70" },
  { value: "expert", label: "Expert Mode", icon: <Brain className="w-6 h-6" />, description: "Technical, precise & in-depth", age: "Developers", color: "text-orange-400 border-orange-400/40 bg-orange-400/10 hover:border-orange-400/70" },
];

const Onboarding = () => {
  const [selectedLevel, setSelectedLevel] = useState<AgeLevel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Wait for session to be established after email confirmation
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Listen for auth state change (email confirmation triggers this)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sess) => {
          if (sess) {
            setCheckingAuth(false);
            subscription.unsubscribe();
          }
        });
        // Timeout fallback — redirect to auth if no session after 5s
        setTimeout(() => {
          subscription.unsubscribe();
          setCheckingAuth(false);
        }, 5000);
      } else {
        setCheckingAuth(false);
      }
    };
    checkSession();
  }, []);

  const handleContinue = async () => {
    if (!selectedLevel) {
      toast({ title: "Please select your learning level", description: "This helps Sammy personalise your experience.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Not signed in", description: "Please sign in to continue.", variant: "destructive" });
        navigate("/auth");
        return;
      }

      const { error } = await supabase.from("profiles").upsert(
        { user_id: user.id, age_level: selectedLevel },
        { onConflict: "user_id" }
      );

      if (error) {
        // If trigger blocks it (already set), proceed anyway
        console.warn("Profile upsert note:", error.message);
      }

      toast({ title: "All set! 🎉", description: `Welcome to Sammy — your journey starts now.` });
      navigate("/");
    } catch {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full"
          />
          <p className="text-muted-foreground text-sm">Verifying your account…</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left - hero */}
      <div className="hidden lg:flex lg:w-2/5 relative">
        <img src={aiCharacter} alt="Sammy" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="absolute bottom-12 left-12 max-w-sm z-10">
          <h2 className="text-3xl font-black text-foreground mb-3">Meet <span className="text-primary">Sammy</span></h2>
          <p className="text-muted-foreground">Your AI guide to the Stacks ecosystem — personalised for the way you learn.</p>
        </div>
      </div>

      {/* Right - selection */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="w-8 h-8 text-primary" />
            </motion.div>
            <h1 className="text-3xl font-black text-foreground mb-2">Email Verified! 🎉</h1>
            <p className="text-muted-foreground">One last step — choose your learning level.</p>
            <p className="text-xs text-muted-foreground/70 mt-1">This shapes how Sammy explains concepts to you and <strong>cannot be changed later</strong>.</p>
          </div>

          {/* Level grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {ageLevels.map((level, i) => (
              <motion.button
                key={level.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                onClick={() => setSelectedLevel(level.value)}
                className={`relative p-5 rounded-xl border-2 text-left transition-all duration-200 ${
                  selectedLevel === level.value
                    ? `border-primary bg-primary/15 shadow-lg shadow-primary/20`
                    : `border-border bg-card ${level.color}`
                }`}
              >
                {selectedLevel === level.value && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                  >
                    <CheckCircle className="w-3 h-3 text-primary-foreground" />
                  </motion.div>
                )}
                <div className={`mb-3 ${selectedLevel === level.value ? "text-primary" : ""}`}>
                  {level.icon}
                </div>
                <h3 className={`font-bold text-base mb-1 ${selectedLevel === level.value ? "text-primary" : "text-foreground"}`}>
                  {level.label}
                </h3>
                <p className="text-xs text-muted-foreground mb-1">{level.description}</p>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {level.age}
                </span>
              </motion.button>
            ))}
          </div>

          <Button
            onClick={handleContinue}
            disabled={!selectedLevel || isLoading}
            className="w-full py-6 text-lg font-bold"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                />
                Setting up your profile…
              </span>
            ) : (
              "Start Learning with Sammy →"
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Onboarding;
