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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.3
    }
  }
};

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.5, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 150,
      damping: 12
    }
  }
};

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
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="mt-6 sm:mt-8 px-2 sm:px-4"
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-bold text-foreground">Achievements</h3>
        <motion.span 
          className="text-xs text-primary font-bold"
          key={unlockedCount}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {unlockedCount} / {totalAchievements} unlocked
        </motion.span>
      </div>

      <motion.div 
        className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-3"
        variants={containerVariants}
      >
        {achievements.map((achievement, idx) => (
          <motion.div
            key={achievement.id}
            variants={badgeVariants}
            whileHover={{ scale: 1.1, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className="group relative"
          >
            <div
              className={`relative flex flex-col items-center p-2 sm:p-3 rounded-xl border transition-all duration-300 ${
                achievement.unlocked
                  ? "bg-gradient-to-br from-primary/20 to-primary/5 border-primary/50 shadow-lg shadow-primary/10 animate-glow-pulse"
                  : "bg-card/40 border-border/30 opacity-50 hover:opacity-70"
              }`}
            >
              <motion.div
                className={`text-xl sm:text-2xl md:text-3xl mb-1 transition-transform duration-300 ${
                  achievement.unlocked ? "" : "grayscale"
                }`}
                animate={achievement.unlocked ? { 
                  rotateY: [0, 360],
                } : {}}
                transition={{ 
                  duration: 0.8, 
                  delay: idx * 0.1,
                  ease: "easeOut"
                }}
              >
                {achievement.unlocked ? (
                  achievement.icon
                ) : (
                  <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                )}
              </motion.div>
              <span
                className={`text-[8px] sm:text-[10px] md:text-xs font-medium text-center leading-tight ${
                  achievement.unlocked ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {achievement.title}
              </span>
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-card border border-border rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 min-w-[100px] sm:min-w-[140px]">
              <p className="text-[10px] sm:text-xs font-medium text-foreground text-center">{achievement.title}</p>
              <p className="text-[8px] sm:text-[10px] text-muted-foreground text-center mt-1">{achievement.description}</p>
              {achievement.unlocked && (
                <motion.div 
                  className="flex items-center justify-center gap-1 mt-1 sm:mt-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <span className="text-[9px] sm:text-[10px] text-primary font-bold">✨ Unlocked!</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

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
