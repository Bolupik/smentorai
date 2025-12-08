import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { Achievement } from "@/hooks/useAchievements";
import ShareAchievement from "./ShareAchievement";

interface AchievementBadgesProps {
  achievements: Achievement[];
  unlockedCount: number;
  totalAchievements: number;
  exploredCount: number;
  totalTopics: number;
  allCompleted: boolean;
}

const AchievementBadges = ({ 
  achievements, 
  unlockedCount, 
  totalAchievements,
  exploredCount,
  totalTopics,
  allCompleted
}: AchievementBadgesProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mt-8 px-2"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground">Achievements</h3>
        <span className="text-xs text-primary font-bold">{unlockedCount} / {totalAchievements} unlocked</span>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
        {achievements.map((achievement, idx) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 + idx * 0.05 }}
            className="group relative"
          >
            <div
              className={`relative flex flex-col items-center p-3 rounded-xl border transition-all duration-300 ${
                achievement.unlocked
                  ? "bg-primary/10 border-primary/50 shadow-lg shadow-primary/10"
                  : "bg-card/40 border-border/30 opacity-50"
              }`}
            >
              <div
                className={`text-2xl md:text-3xl mb-1 transition-transform duration-300 ${
                  achievement.unlocked ? "group-hover:scale-110" : "grayscale"
                }`}
              >
                {achievement.unlocked ? (
                  achievement.icon
                ) : (
                  <Lock className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <span
                className={`text-[10px] md:text-xs font-medium text-center leading-tight ${
                  achievement.unlocked ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {achievement.title}
              </span>
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-card border border-border rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 min-w-[140px]">
              <p className="text-xs font-medium text-foreground text-center">{achievement.title}</p>
              <p className="text-[10px] text-muted-foreground text-center mt-1">{achievement.description}</p>
              {achievement.unlocked && (
                <div className="flex items-center justify-center gap-1 mt-2">
                  <span className="text-[10px] text-primary font-bold">Unlocked!</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <ShareAchievement
        unlockedCount={unlockedCount}
        totalAchievements={totalAchievements}
        exploredCount={exploredCount}
        totalTopics={totalTopics}
        allCompleted={allCompleted}
      />
    </motion.div>
  );
};

export default AchievementBadges;
