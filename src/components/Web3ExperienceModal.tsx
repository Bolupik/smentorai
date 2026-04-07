import { useState } from "react";
import { motion } from "framer-motion";
import { Globe, Lightbulb, Rocket, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export type Web3Experience = "complete_beginner" | "some_knowledge" | "experienced";

const experienceLevels: {
  value: Web3Experience;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}[] = [
  {
    value: "complete_beginner",
    label: "Completely New",
    icon: <Globe className="w-6 h-6" />,
    description: "I've heard of crypto but don't really understand it yet",
    color: "text-green-400 border-green-400/40 bg-green-400/10",
  },
  {
    value: "some_knowledge",
    label: "Some Knowledge",
    icon: <Lightbulb className="w-6 h-6" />,
    description: "I know some basics like wallets and tokens but want to learn more",
    color: "text-blue-400 border-blue-400/40 bg-blue-400/10",
  },
  {
    value: "experienced",
    label: "Experienced",
    icon: <Rocket className="w-6 h-6" />,
    description: "I'm already comfortable with Web3 — just here to learn Stacks",
    color: "text-purple-400 border-purple-400/40 bg-purple-400/10",
  },
];

interface Web3ExperienceModalProps {
  open: boolean;
  onComplete: (experience: Web3Experience) => void;
}

const Web3ExperienceModal = ({ open, onComplete }: Web3ExperienceModalProps) => {
  const [selected, setSelected] = useState<Web3Experience | null>(null);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-md w-full p-0 overflow-hidden border-border/60 bg-background"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>How new are you to Web3?</DialogTitle>
          <DialogDescription>Tell us about your Web3 experience so we can personalise your journey.</DialogDescription>
        </DialogHeader>

        <div className="p-8">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.1 }}
              className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4"
            >
              <Zap className="w-7 h-7 text-primary" />
            </motion.div>
            <h2 className="text-2xl font-black text-foreground mb-1">One More Thing! 🌐</h2>
            <p className="text-muted-foreground text-sm">How familiar are you with Web3 and blockchain?</p>
          </div>

          <div className="space-y-3 mb-6">
            {experienceLevels.map((level, i) => (
              <motion.button
                key={level.value}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                onClick={() => setSelected(level.value)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-4 ${
                  selected === level.value
                    ? "border-primary bg-primary/15 shadow-lg shadow-primary/20"
                    : `border-border bg-card hover:border-border/80 ${level.color}`
                }`}
              >
                <div className={`p-2 rounded-lg ${selected === level.value ? "bg-primary/20 text-primary" : ""}`}>
                  {level.icon}
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold text-sm ${selected === level.value ? "text-primary" : "text-foreground"}`}>
                    {level.label}
                  </h3>
                  <p className="text-xs text-muted-foreground">{level.description}</p>
                </div>
              </motion.button>
            ))}
          </div>

          <Button
            onClick={() => selected && onComplete(selected)}
            disabled={!selected}
            className="w-full py-5 text-base font-bold"
          >
            Continue →
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Web3ExperienceModal;
