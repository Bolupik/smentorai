import { useState } from "react";
import { motion } from "framer-motion";
import { Baby, GraduationCap, Brain, Sparkles } from "lucide-react";
import { Slider } from "./ui/slider";

type AgeLevel = "child" | "teen" | "adult" | "expert";

interface AgeSelectorProps {
  value: AgeLevel;
  onChange: (value: AgeLevel) => void;
}

const ageLevels: { value: AgeLevel; label: string; icon: React.ReactNode; description: string; age: string }[] = [
  { value: "child", label: "Kid Mode", icon: <Baby className="w-4 h-4" />, description: "Super simple & fun!", age: "6-10" },
  { value: "teen", label: "Teen Mode", icon: <Sparkles className="w-4 h-4" />, description: "Clear & engaging", age: "11-17" },
  { value: "adult", label: "Adult Mode", icon: <GraduationCap className="w-4 h-4" />, description: "Detailed explanations", age: "18+" },
  { value: "expert", label: "Expert Mode", icon: <Brain className="w-4 h-4" />, description: "Technical & precise", age: "Dev" },
];

const levelToIndex = (level: AgeLevel): number => {
  const idx = ageLevels.findIndex((l) => l.value === level);
  return idx >= 0 ? idx : 2;
};

const indexToLevel = (index: number): AgeLevel => {
  return ageLevels[index]?.value || "adult";
};

const AgeSelector = ({ value, onChange }: AgeSelectorProps) => {
  const currentIndex = levelToIndex(value);
  const current = ageLevels[currentIndex];

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-muted/50 border border-border/50">
      <div className="flex items-center gap-2 min-w-[100px] sm:min-w-[120px]">
        <motion.div
          key={current.value}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-1.5 rounded-lg bg-primary/20 text-primary"
        >
          {current.icon}
        </motion.div>
        <div className="hidden sm:block">
          <p className="text-xs font-medium text-foreground leading-tight">{current.label}</p>
          <p className="text-[10px] text-muted-foreground">{current.description}</p>
        </div>
        <span className="sm:hidden text-xs font-medium text-foreground">{current.label}</span>
      </div>
      
      <Slider
        value={[currentIndex]}
        onValueChange={(v) => onChange(indexToLevel(v[0]))}
        max={3}
        step={1}
        className="w-24 sm:w-32"
      />
      
      <span className="text-[10px] text-muted-foreground bg-background/50 px-2 py-0.5 rounded-full border border-border/30">
        {current.age}
      </span>
    </div>
  );
};

export default AgeSelector;
export type { AgeLevel };
