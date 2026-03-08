import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAdminRole } from "@/hooks/useAdminRole";
import { useAuth } from "@/contexts/AuthContext";
import { useStacksAuth } from "@/hooks/useStacksAuth";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Trophy,
  Loader2,
  Lock,
  RotateCcw,
  Flame,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface QuizQuestion {
  id: number;
  topic: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface DailyQuiz {
  id: string;
  quiz_date: string;
  questions: QuizQuestion[];
}

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner: "text-green-400",
  intermediate: "text-yellow-400",
  advanced: "text-red-400",
};

const TOPIC_EMOJI: Record<string, string> = {
  architecture: "🏗️",
  clarity: "📜",
  defi: "💱",
  nft: "🎨",
  security: "🔒",
  stacking: "📈",
  sbtc: "₿",
  tools: "🛠️",
  wallets: "👛",
};

export default function DailyQuizPanel() {
  const { user } = useAuth();
  const { isAuthenticated: isWalletConnected } = useStacksAuth();
  const { isAdmin, loading: adminLoading } = useAdminRole();

  const [open, setOpen] = useState(false);
  const [quiz, setQuiz] = useState<DailyQuiz | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Quiz state
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [finished, setFinished] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [prevScore, setPrevScore] = useState<number | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const isAuthorized = !!user || isWalletConnected;

  // Check if user already completed today's quiz
  const checkPriorResult = useCallback(async () => {
    if (!user || !isAdmin) return;
    const { data } = await supabase
      .from("daily_quiz_results")
      .select("score")
      .eq("user_id", user.id)
      .eq("quiz_date", today)
      .maybeSingle();
    if (data) {
      setAlreadyDone(true);
      setPrevScore(data.score);
    }
  }, [user, isAdmin, today]);

  const loadQuiz = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      // Try local cache first
      const { data } = await supabase
        .from("daily_quizzes")
        .select("id, quiz_date, questions")
        .eq("quiz_date", today)
        .maybeSingle();

      if (data) {
        setQuiz(data as unknown as DailyQuiz);
        return;
      }

      // Generate via edge function
      setGenerating(true);
      const { data: fn, error } = await supabase.functions.invoke("generate-daily-quiz");
      if (error) throw error;
      if (fn?.quiz) setQuiz(fn.quiz as unknown as DailyQuiz);
      else throw new Error("No quiz returned");
    } catch (err) {
      console.error("loadQuiz error:", err);
      toast.error("Could not load today's quiz. Try again.");
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  }, [isAdmin, today]);

  useEffect(() => {
    if (open && isAdmin && !quiz) {
      loadQuiz();
      checkPriorResult();
    }
  }, [open, isAdmin, quiz, loadQuiz, checkPriorResult]);

  const handleSelect = (idx: number) => {
    if (revealed) return;
    setSelected(idx);
  };

  const handleSubmit = () => {
    if (selected === null || !quiz) return;
    const newAnswers = [...answers];
    newAnswers[current] = selected;
    setAnswers(newAnswers);
    setRevealed(true);
  };

  const handleNext = () => {
    if (!quiz) return;
    if (current < quiz.questions.length - 1) {
      setCurrent((c) => c + 1);
      setSelected(answers[current + 1] ?? null);
      setRevealed(answers[current + 1] !== null && answers[current + 1] !== undefined);
    } else {
      finishQuiz();
    }
  };

  const handlePrev = () => {
    if (current > 0) {
      setCurrent((c) => c - 1);
      setSelected(answers[current - 1] ?? null);
      setRevealed(answers[current - 1] !== null && answers[current - 1] !== undefined);
    }
  };

  const finishQuiz = async () => {
    if (!quiz || !user) return;
    const score = answers.filter(
      (a, i) => a === quiz.questions[i]?.correctAnswer
    ).length;
    setFinished(true);

    try {
      await supabase.from("daily_quiz_results").upsert({
        user_id: user.id,
        quiz_date: today,
        score,
        total: quiz.questions.length,
        answers,
      }, { onConflict: "user_id,quiz_date" });
    } catch (err) {
      console.error("Save result error:", err);
    }
  };

  const resetQuiz = () => {
    setCurrent(0);
    setSelected(null);
    setRevealed(false);
    setAnswers([]);
    setFinished(false);
    setAlreadyDone(false);
    setPrevScore(null);
  };

  const score = answers.filter(
    (a, i) => quiz && a === quiz.questions[i]?.correctAnswer
  ).length;

  const q = quiz?.questions[current];

  // ── Floating tab button ──────────────────────────────────────────────────────
  return (
    <>
      {/* Tab trigger on right edge */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.8, type: "spring", stiffness: 200 }}
        className={cn(
          "fixed right-0 top-1/2 -translate-y-1/2 z-50",
          "flex flex-col items-center gap-1 px-2 py-4",
          "bg-card border border-border border-r-0 rounded-l-xl",
          "shadow-xl shadow-black/30 hover:shadow-primary/20",
          "transition-all duration-300 hover:bg-primary/10 group"
        )}
      >
        <CalendarDays className="w-4 h-4 text-primary" />
        <span
          className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground group-hover:text-primary transition-colors"
          style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
        >
          Daily Quiz
        </span>
        {isAdmin && !alreadyDone && (
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        )}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop on mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 sm:hidden"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={cn(
                "fixed right-0 top-0 h-full z-50",
                "w-full sm:w-[380px]",
                "bg-card border-l border-border shadow-2xl shadow-black/50",
                "flex flex-col overflow-hidden"
              )}
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-border/50 flex items-center gap-3 shrink-0">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CalendarDays className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-foreground text-sm">Daily Challenge</h2>
                  <p className="text-xs text-muted-foreground">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto">
                {/* ── NOT ADMIN: Coming Soon ── */}
                {!adminLoading && !isAdmin && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center h-full p-8 text-center gap-5"
                  >
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                      <Lock className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-lg mb-2">Coming Soon</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed max-w-[260px]">
                        Daily AI-generated quizzes are in development. Check back soon to test your Stacks knowledge every day!
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {["Architecture", "Clarity", "DeFi", "Security", "sBTC"].map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-2 py-1 rounded-md bg-muted/50 border border-border/50 text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Sparkles className="w-3 h-3 text-primary" />
                      15 questions · AI-powered · Refreshes daily
                    </div>
                  </motion.div>
                )}

                {/* ── ADMIN: Quiz content ── */}
                {!adminLoading && isAdmin && (
                  <div className="p-5 space-y-4">
                    {/* Loading */}
                    {(loading || generating) && (
                      <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">
                          {generating ? "Generating today's quiz with AI…" : "Loading…"}
                        </p>
                      </div>
                    )}

                    {/* Already completed */}
                    {!loading && !generating && alreadyDone && !finished && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-10 space-y-4"
                      >
                        <Trophy className="w-12 h-12 mx-auto text-primary" />
                        <h3 className="font-bold text-foreground">Already completed today!</h3>
                        <p className="text-sm text-muted-foreground">
                          You scored <span className="text-primary font-bold">{prevScore}/15</span> on today's quiz.
                        </p>
                        <p className="text-xs text-muted-foreground">Come back tomorrow for a new challenge.</p>
                        <Button variant="outline" size="sm" onClick={resetQuiz} className="gap-2 mt-2">
                          <RotateCcw className="w-3.5 h-3.5" />
                          Retake Anyway
                        </Button>
                      </motion.div>
                    )}

                    {/* Finished screen */}
                    {!loading && !generating && finished && quiz && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-8 space-y-5"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", delay: 0.1 }}
                        >
                          <Trophy
                            className={cn(
                              "w-14 h-14 mx-auto",
                              score / quiz.questions.length >= 0.8
                                ? "text-primary"
                                : "text-muted-foreground"
                            )}
                          />
                        </motion.div>
                        <div>
                          <p className="text-4xl font-black text-primary">
                            {score}/{quiz.questions.length}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {Math.round((score / quiz.questions.length) * 100)}% correct
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground px-4">
                          {score >= 13
                            ? "🔥 Outstanding! You've mastered the Stacks ecosystem."
                            : score >= 10
                            ? "⚡ Great effort! Keep exploring to reach mastery."
                            : "💡 Good start. Review the topics and try again tomorrow!"}
                        </p>
                        {/* Per-question review */}
                        <div className="space-y-2 text-left max-h-64 overflow-y-auto pr-1">
                          {quiz.questions.map((q, i) => (
                            <div
                              key={q.id}
                              className={cn(
                                "flex items-start gap-2 px-3 py-2 rounded-lg text-xs border",
                                answers[i] === q.correctAnswer
                                  ? "bg-green-500/10 border-green-500/20"
                                  : "bg-red-500/10 border-red-500/20"
                              )}
                            >
                              {answers[i] === q.correctAnswer ? (
                                <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                              )}
                              <p className="text-muted-foreground leading-relaxed line-clamp-2">
                                {q.question}
                              </p>
                            </div>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={resetQuiz}
                          className="gap-2"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Retake
                        </Button>
                      </motion.div>
                    )}

                    {/* Active quiz */}
                    {!loading && !generating && quiz && !finished && !alreadyDone && q && (
                      <motion.div
                        key={current}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        {/* Progress */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Question {current + 1} of {quiz.questions.length}</span>
                            <span className="flex items-center gap-1">
                              <Flame className="w-3 h-3 text-primary" />
                              {score} correct
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-primary rounded-full"
                              animate={{ width: `${((current + 1) / quiz.questions.length) * 100}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                        </div>

                        {/* Topic & difficulty */}
                        <div className="flex items-center gap-2">
                          <span className="text-base">
                            {TOPIC_EMOJI[q.topic?.toLowerCase()] ?? "🧠"}
                          </span>
                          <span className="text-xs text-muted-foreground capitalize">{q.topic}</span>
                          <span className={cn("text-[10px] ml-auto capitalize font-medium", DIFFICULTY_COLOR[q.difficulty])}>
                            {q.difficulty}
                          </span>
                        </div>

                        {/* Question */}
                        <p className="text-sm font-medium text-foreground leading-relaxed">
                          {q.question}
                        </p>

                        {/* Options */}
                        <div className="space-y-2">
                          {q.options.map((opt, idx) => {
                            const isSelected = selected === idx;
                            const isCorrect = idx === q.correctAnswer;
                            const isWrong = revealed && isSelected && !isCorrect;
                            const isGreen = revealed && isCorrect;

                            return (
                              <button
                                key={idx}
                                onClick={() => handleSelect(idx)}
                                disabled={revealed}
                                className={cn(
                                  "w-full text-left px-4 py-3 rounded-lg border text-sm transition-all duration-200",
                                  "disabled:cursor-default",
                                  isGreen
                                    ? "bg-green-500/15 border-green-500/50 text-foreground"
                                    : isWrong
                                    ? "bg-red-500/15 border-red-500/50 text-foreground"
                                    : isSelected
                                    ? "bg-primary/15 border-primary/50 text-foreground"
                                    : "bg-muted/30 border-border hover:border-primary/40 hover:bg-primary/5"
                                )}
                              >
                                <span className="flex items-center gap-3">
                                  <span className="text-xs font-bold text-muted-foreground w-4 shrink-0">
                                    {String.fromCharCode(65 + idx)}
                                  </span>
                                  <span className="flex-1">{opt}</span>
                                  {isGreen && <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />}
                                  {isWrong && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation */}
                        <AnimatePresence>
                          {revealed && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="bg-muted/40 border border-border/50 rounded-lg px-4 py-3">
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  <span className="font-semibold text-foreground">Explanation: </span>
                                  {q.explanation}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handlePrev}
                            disabled={current === 0}
                            className="gap-1 text-xs h-8"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            Back
                          </Button>
                          {!revealed ? (
                            <Button
                              size="sm"
                              onClick={handleSubmit}
                              disabled={selected === null}
                              className="h-8 px-5 text-xs"
                            >
                              Submit
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={handleNext}
                              className="h-8 px-5 text-xs gap-1"
                            >
                              {current < quiz.questions.length - 1 ? (
                                <>Next <ChevronRight className="w-3.5 h-3.5" /></>
                              ) : (
                                <>Finish <Trophy className="w-3.5 h-3.5" /></>
                              )}
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Admin loading shimmer */}
                {adminLoading && (
                  <div className="flex items-center justify-center h-full py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
