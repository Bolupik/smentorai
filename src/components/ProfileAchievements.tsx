import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Award, BookOpen, Library, Zap, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useStacksAuth } from "@/hooks/useStacksAuth";
import { useTopicProgressDB } from "@/hooks/useTopicProgressDB";
import { useAchievements } from "@/hooks/useAchievements";
import { useQuizStreak } from "@/hooks/useQuizStreak";
import { cn } from "@/lib/utils";

// ─── Quiz badge definitions ──────────────────────────────────────────────────
const QUIZ_BADGES = [
  { id: "quiz-first",   label: "First Quiz",      icon: "📝", desc: "Complete your first quiz",          minScore: 1  },
  { id: "quiz-half",    label: "Half Way",         icon: "⚡", desc: "Score 50% or higher on a quiz",    minScore: 50 },
  { id: "quiz-sharp",   label: "Sharp Mind",       icon: "🧠", desc: "Score 70% or higher on a quiz",   minScore: 70 },
  { id: "quiz-perfect", label: "Perfect Score",    icon: "🌟", desc: "Score 100% on any quiz",           minScore: 100 },
];

// ─── Streak badge definitions ─────────────────────────────────────────────────
const STREAK_BADGES = [
  { id: "streak-3",  label: "On Fire",        icon: "🔥", desc: "Complete quizzes 3 days in a row",   min: 3  },
  { id: "streak-7",  label: "Week Warrior",   icon: "⚡", desc: "Complete quizzes 7 days in a row",   min: 7  },
  { id: "streak-14", label: "Fortnight",      icon: "📚", desc: "Complete quizzes 14 days in a row",  min: 14 },
  { id: "streak-30", label: "Monthly Master", icon: "🏆", desc: "Complete quizzes 30 days in a row",  min: 30 },
];

// ─── Contribution badge definitions ─────────────────────────────────────────
const CONTRIB_BADGES = [
  { id: "contrib-first",  label: "Contributor",    icon: "✍️", desc: "Get your first contribution approved",   min: 1  },
  { id: "contrib-three",  label: "Prolific",        icon: "📚", desc: "Have 3 contributions approved",          min: 3  },
  { id: "contrib-ten",    label: "Knowledge Guru",  icon: "🎓", desc: "Have 10 contributions approved",         min: 10 },
];

// ─── Section divider ─────────────────────────────────────────────────────────
const SectionHeader = ({ icon: Icon, label, earned, total }: {
  icon: React.ElementType; label: string; earned: number; total: number;
}) => (
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2">
      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
    </div>
    <span className="text-[11px] font-bold text-primary">{earned}/{total}</span>
  </div>
);

// ─── Single Badge ─────────────────────────────────────────────────────────────
const Badge = ({ icon, label, desc, unlocked, idx }: {
  icon: string; label: string; desc: string; unlocked: boolean; idx: number;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.7 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: idx * 0.05, type: "spring", stiffness: 200, damping: 14 }}
    whileHover={{ y: -3, scale: 1.06 }}
    className="group relative flex flex-col items-center"
  >
    <div className={cn(
      "w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-2xl mb-1.5 transition-all duration-200",
      unlocked
        ? "bg-gradient-to-br from-primary/20 to-accent/10 border-primary/50 shadow-md shadow-primary/15"
        : "bg-muted/30 border-border/40 grayscale opacity-45"
    )}>
      {unlocked ? icon : <Lock className="w-5 h-5 text-muted-foreground/60" />}
    </div>
    <span className={cn(
      "text-[10px] font-medium text-center leading-tight max-w-[56px]",
      unlocked ? "text-foreground" : "text-muted-foreground"
    )}>
      {label}
    </span>

    {/* Tooltip */}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover border border-border rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 w-36">
      <p className="text-[11px] font-semibold text-foreground text-center">{label}</p>
      <p className="text-[10px] text-muted-foreground text-center mt-0.5">{desc}</p>
      {unlocked && <p className="text-[10px] text-primary font-bold text-center mt-1">✨ Earned!</p>}
    </div>
  </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ProfileAchievements = () => {
  const { user } = useAuth();
  const { isAuthenticated: isWalletConnected, userData: walletData } = useStacksAuth();
  const { progress, exploredCount } = useTopicProgressDB();

  const [bestQuizScore, setBestQuizScore] = useState<number>(0);
  const [approvedContribs, setApprovedContribs] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Topic achievements via existing hook
  const { achievements: topicAchievements, unlockedCount: topicUnlocked } = useAchievements(progress);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (user) {
          // Best quiz score from localStorage (persisted by StacksQuiz)
          const quizKey = `quiz_best_score_${user.id}`;
          const stored = localStorage.getItem(quizKey);
          if (stored) setBestQuizScore(Number(stored));

          // Approved contributions count
          const { count } = await supabase
            .from("knowledge_base")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("approved", true);
          setApprovedContribs(count ?? 0);

        } else if (isWalletConnected && walletData?.address) {
          // Wallet user: read quiz score from localStorage
          const quizKey = `quiz_best_score_wallet_${walletData.address}`;
          const stored = localStorage.getItem(quizKey);
          if (stored) setBestQuizScore(Number(stored));
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, isWalletConnected, walletData]);

  // ── Compute unlocked states ────────────────────────────────────────────────
  const quizBadgesUnlocked = QUIZ_BADGES.map((b) => ({
    ...b,
    unlocked: b.id === "quiz-first" ? bestQuizScore > 0 : bestQuizScore >= b.minScore,
  }));

  const contribBadgesUnlocked = CONTRIB_BADGES.map((b) => ({
    ...b,
    unlocked: approvedContribs >= b.min,
  }));

  const topicBadgesEarned = topicAchievements.filter((a) => a.unlocked).length;
  const quizBadgesEarned  = quizBadgesUnlocked.filter((b) => b.unlocked).length;
  const contribBadgesEarned = contribBadgesUnlocked.filter((b) => b.unlocked).length;
  const totalEarned = topicBadgesEarned + quizBadgesEarned + contribBadgesEarned;
  const totalBadges = topicAchievements.length + QUIZ_BADGES.length + CONTRIB_BADGES.length;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border/50 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
          <Award className="w-4 h-4 text-accent" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground text-sm">Achievement Wall</h3>
          <p className="text-xs text-muted-foreground">{totalEarned} of {totalBadges} earned</p>
        </div>
        {/* Progress bar */}
        <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${totalBadges > 0 ? (totalEarned / totalBadges) * 100 : 0}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
          />
        </div>
      </div>

      <div className="p-5 space-y-6">
        {loading ? (
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className="w-14 h-14 rounded-2xl bg-muted/40 animate-pulse" />
                <div className="w-10 h-2 rounded bg-muted/40 animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* ── Topic Badges ── */}
            <div>
              <SectionHeader
                icon={Zap}
                label="Topics Explored"
                earned={topicBadgesEarned}
                total={topicAchievements.length}
              />
              <div className="grid grid-cols-4 gap-3">
                {topicAchievements.map((a, i) => (
                  <Badge
                    key={a.id}
                    icon={a.icon}
                    label={a.title}
                    desc={a.description}
                    unlocked={a.unlocked}
                    idx={i}
                  />
                ))}
              </div>
            </div>

            {/* ── Quiz Badges ── */}
            <div>
              <SectionHeader
                icon={BookOpen}
                label="Quiz Performance"
                earned={quizBadgesEarned}
                total={QUIZ_BADGES.length}
              />
              <div className="grid grid-cols-4 gap-3">
                {quizBadgesUnlocked.map((b, i) => (
                  <Badge
                    key={b.id}
                    icon={b.icon}
                    label={b.label}
                    desc={b.desc}
                    unlocked={b.unlocked}
                    idx={i}
                  />
                ))}
              </div>
              {bestQuizScore > 0 && (
                <p className="text-[10px] text-muted-foreground mt-2 text-right">
                  Best score: <span className="text-primary font-semibold">{bestQuizScore}%</span>
                </p>
              )}
            </div>

            {/* ── Contribution Badges ── */}
            <div>
              <SectionHeader
                icon={Library}
                label="Knowledge Contributions"
                earned={contribBadgesEarned}
                total={CONTRIB_BADGES.length}
              />
              <div className="grid grid-cols-3 gap-3">
                {contribBadgesUnlocked.map((b, i) => (
                  <Badge
                    key={b.id}
                    icon={b.icon}
                    label={b.label}
                    desc={b.desc}
                    unlocked={b.unlocked}
                    idx={i}
                  />
                ))}
              </div>
              {approvedContribs > 0 && (
                <p className="text-[10px] text-muted-foreground mt-2 text-right">
                  Approved: <span className="text-primary font-semibold">{approvedContribs} contribution{approvedContribs !== 1 ? "s" : ""}</span>
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileAchievements;
