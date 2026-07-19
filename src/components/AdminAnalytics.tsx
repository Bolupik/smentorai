import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  BookOpen,
  Brain,
  TrendingUp,
  Map,
  Newspaper,
  Activity,
  RefreshCw,
  Loader2,
  BarChart3,
  Award,
  Clock,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";

interface AnalyticsData {
  totalUsers: number;
  newUsers7d: number;
  newUsers30d: number;
  approvedContributions: number;
  pendingContributions: number;
  totalQuizResults: number;
  quizResults7d: number;
  avgQuizScore: number | null;
  activeQuizUsers7d: number;
  totalTopicExplores: number;
  usersWithProgress: number;
  totalNewsArticles: number;
}

interface DailySignup {
  day: string;
  new_users: number;
}

interface TopicStat {
  topic: string;
  count: number;
}

interface AgeStat {
  age_level: string;
  count: number;
}

interface RawData {
  profiles: { created_at: string; age_level: string | null }[];
  kb: { created_at: string; approved: boolean }[];
  quizzes: { completed_at: string; score: number; total: number; user_id: string }[];
  progress: { user_id: string; last_visited: string | null }[];
  news: { fetched_at: string | null; published_at: string | null }[];
}

type SeriesMode = "daily" | "cumulative" | "avg" | "distinct";

interface MetricSpec {
  key: string;
  label: string;
  description: string;
  source: keyof RawData;
  dateField: string;
  filter?: (row: any) => boolean;
  mode: SeriesMode;
  color: string;
  windowDays?: number;
  valueField?: string; // for avg
}

const METRIC_SPECS: Record<string, MetricSpec> = {
  totalUsers: {
    key: "totalUsers",
    label: "Total Users",
    description: "Cumulative signups over the last 30 days",
    source: "profiles",
    dateField: "created_at",
    mode: "cumulative",
    color: "hsl(var(--primary))",
  },
  newUsers7d: {
    key: "newUsers7d",
    label: "New Users (7d)",
    description: "Daily new signups — last 14 days",
    source: "profiles",
    dateField: "created_at",
    mode: "daily",
    color: "hsl(142 71% 45%)",
    windowDays: 14,
  },
  newUsers30d: {
    key: "newUsers30d",
    label: "New Users (30d)",
    description: "Daily new signups — last 30 days",
    source: "profiles",
    dateField: "created_at",
    mode: "daily",
    color: "hsl(var(--primary))",
  },
  approvedContributions: {
    key: "approvedContributions",
    label: "Approved Knowledge",
    description: "Cumulative approved entries — last 30 days",
    source: "kb",
    dateField: "created_at",
    filter: (r) => r.approved === true,
    mode: "cumulative",
    color: "hsl(142 71% 45%)",
  },
  pendingContributions: {
    key: "pendingContributions",
    label: "Pending Review",
    description: "Daily incoming submissions — last 30 days",
    source: "kb",
    dateField: "created_at",
    filter: (r) => r.approved === false,
    mode: "daily",
    color: "hsl(45 93% 47%)",
  },
  totalNewsArticles: {
    key: "totalNewsArticles",
    label: "News Articles",
    description: "Cumulative indexed articles — last 30 days",
    source: "news",
    dateField: "fetched_at",
    mode: "cumulative",
    color: "hsl(var(--primary))",
  },
  totalQuizResults: {
    key: "totalQuizResults",
    label: "Quiz Attempts",
    description: "Daily attempts — last 30 days",
    source: "quizzes",
    dateField: "completed_at",
    mode: "daily",
    color: "hsl(var(--primary))",
  },
  quizResults7d: {
    key: "quizResults7d",
    label: "Quiz Attempts (7d)",
    description: "Daily attempts — last 14 days",
    source: "quizzes",
    dateField: "completed_at",
    mode: "daily",
    color: "hsl(var(--primary))",
    windowDays: 14,
  },
  activeQuizUsers7d: {
    key: "activeQuizUsers7d",
    label: "Active Quiz Users",
    description: "Distinct users per day — last 14 days",
    source: "quizzes",
    dateField: "completed_at",
    mode: "distinct",
    color: "hsl(142 71% 45%)",
    windowDays: 14,
  },
  avgQuizScore: {
    key: "avgQuizScore",
    label: "Avg Quiz Score",
    description: "Daily average score % — last 30 days",
    source: "quizzes",
    dateField: "completed_at",
    mode: "avg",
    color: "hsl(142 71% 45%)",
    valueField: "score",
  },
  totalTopicExplores: {
    key: "totalTopicExplores",
    label: "Topic Explores",
    description: "Daily topic visits — last 30 days",
    source: "progress",
    dateField: "last_visited",
    mode: "daily",
    color: "hsl(var(--primary))",
  },
  usersWithProgress: {
    key: "usersWithProgress",
    label: "Users Exploring",
    description: "Distinct users visiting topics per day — last 30 days",
    source: "progress",
    dateField: "last_visited",
    mode: "distinct",
    color: "hsl(var(--primary))",
  },
};

const AGE_LABELS: Record<string, string> = {
  child: "Child",
  teen: "Teen",
  adult: "Adult",
  expert: "Expert",
};

const TOPIC_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--primary) / 0.8)",
  "hsl(var(--primary) / 0.65)",
  "hsl(var(--primary) / 0.5)",
  "hsl(var(--primary) / 0.4)",
  "hsl(var(--primary) / 0.3)",
];

const StatCard = ({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  delay,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  delay?: number;
  onClick?: () => void;
}) => (
  <motion.button
    type="button"
    onClick={onClick}
    disabled={!onClick}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay ?? 0, duration: 0.4 }}
    className={`text-left bg-background rounded-xl border border-border p-4 flex flex-col gap-2 transition-all ${
      onClick
        ? "cursor-pointer hover:border-primary/60 hover:shadow-md hover:-translate-y-0.5"
        : "cursor-default"
    }`}
  >
    <div className="flex items-center gap-2">
      <div className={`p-1.5 rounded-lg ${accent ?? "bg-primary/15"}`}>
        <Icon className={`w-4 h-4 ${accent ? "text-current" : "text-primary"}`} />
      </div>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      {onClick && (
        <TrendingUp className="w-3 h-3 text-muted-foreground/60 ml-auto" />
      )}
    </div>
    <span className="text-2xl font-black text-foreground tracking-tight">{value}</span>
    {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
  </motion.button>
);

const AdminAnalytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [signups, setSignups] = useState<DailySignup[]>([]);
  const [topics, setTopics] = useState<TopicStat[]>([]);
  const [ages, setAges] = useState<AgeStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [raw, setRaw] = useState<RawData | null>(null);
  const [activeMetric, setActiveMetric] = useState<string | null>(null);

  const fetchAll = async () => {
    try {
      const [profilesRes, kbRes, quizRes, progressRes, newsRes, topicsRes] = await Promise.all([
        supabase.from("profiles").select("created_at, age_level"),
        supabase.from("knowledge_base").select("created_at, approved, topic"),
        supabase.from("daily_quiz_results").select("completed_at, score, total, user_id"),
        supabase.from("topic_progress").select("user_id, last_visited"),
        supabase.from("stacks_news").select("fetched_at, published_at"),
        supabase.from("knowledge_base").select("topic").eq("approved", true),
      ]);

      const profileRows = profilesRes.data ?? [];
      const kbRows = kbRes.data ?? [];
      const quizAll = quizRes.data ?? [];
      const progressAll = progressRes.data ?? [];
      const newsRows = newsRes.data ?? [];

      const now = Date.now();
      const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
      const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

      const totalUsers = profileRows.length;
      const newUsers7d = profileRows.filter((p) => new Date(p.created_at).getTime() >= sevenDaysAgo).length;
      const newUsers30d = profileRows.filter((p) => new Date(p.created_at).getTime() >= thirtyDaysAgo).length;

      const approvedContributions = kbRows.filter((k: any) => k.approved).length;
      const pendingContributions = kbRows.filter((k: any) => !k.approved).length;

      const totalQuizResults = quizAll.length;
      const quizResults7d = quizAll.filter((q: any) => new Date(q.completed_at).getTime() >= sevenDaysAgo).length;
      const activeQuizUsers7d = new Set(
        quizAll.filter((q: any) => new Date(q.completed_at).getTime() >= sevenDaysAgo).map((q: any) => q.user_id)
      ).size;
      const validScores = quizAll.filter((q: any) => q.total > 0);
      const avgQuizScore =
        validScores.length > 0
          ? Math.round(validScores.reduce((acc: number, q: any) => acc + (q.score / q.total) * 100, 0) / validScores.length)
          : null;

      const totalTopicExplores = progressAll.length;
      const usersWithProgress = new Set(progressAll.map((p: any) => p.user_id)).size;

      setRaw({
        profiles: profileRows as any,
        kb: kbRows as any,
        quizzes: quizAll as any,
        progress: progressAll as any,
        news: newsRows as any,
      });

      setData({
        totalUsers,
        newUsers7d,
        newUsers30d,
        approvedContributions,
        pendingContributions,
        totalQuizResults,
        quizResults7d,
        avgQuizScore,
        activeQuizUsers7d,
        totalTopicExplores,
        usersWithProgress,
        totalNewsArticles: newsRows.length,
      });

      // Signups bar chart (last 14 days)
      const buckets: Record<string, number> = {};
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now - i * 24 * 60 * 60 * 1000);
        buckets[d.toISOString().slice(0, 10)] = 0;
      }
      profileRows.forEach((p: any) => {
        const key = p.created_at.slice(0, 10);
        if (key in buckets) buckets[key] = (buckets[key] ?? 0) + 1;
      });
      setSignups(
        Object.entries(buckets).map(([day, new_users]) => ({
          day: day.slice(5),
          new_users,
        }))
      );

      // Topics chart
      const topicMap: Record<string, number> = {};
      (topicsRes.data ?? []).forEach((r: any) => {
        topicMap[r.topic] = (topicMap[r.topic] ?? 0) + 1;
      });
      setTopics(
        Object.entries(topicMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([topic, count]) => ({ topic, count }))
      );

      // Ages
      const ageMap: Record<string, number> = {};
      profileRows.forEach((r: any) => {
        if (r.age_level) ageMap[r.age_level] = (ageMap[r.age_level] ?? 0) + 1;
      });
      setAges(Object.entries(ageMap).map(([age_level, count]) => ({ age_level, count })));
    } catch (err) {
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const refresh = () => {
    setRefreshing(true);
    fetchAll();
  };

  // Build a time series for the selected metric
  const activeSeries = useMemo(() => {
    if (!activeMetric || !raw) return null;
    const spec = METRIC_SPECS[activeMetric];
    if (!spec) return null;

    const windowDays = spec.windowDays ?? 30;
    const now = Date.now();
    const dayKeys: string[] = [];
    for (let i = windowDays - 1; i >= 0; i--) {
      dayKeys.push(new Date(now - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
    }
    const rows = (raw[spec.source] as any[]).filter((r) => (spec.filter ? spec.filter(r) : true));

    if (spec.mode === "distinct") {
      const byDay: Record<string, Set<string>> = {};
      dayKeys.forEach((k) => (byDay[k] = new Set()));
      rows.forEach((r) => {
        const raw = r[spec.dateField];
        if (!raw) return;
        const k = String(raw).slice(0, 10);
        if (k in byDay) byDay[k].add(r.user_id);
      });
      return dayKeys.map((k) => ({ day: k.slice(5), value: byDay[k].size }));
    }

    if (spec.mode === "avg") {
      const totals: Record<string, { sum: number; n: number }> = {};
      dayKeys.forEach((k) => (totals[k] = { sum: 0, n: 0 }));
      rows.forEach((r) => {
        const rawDate = r[spec.dateField];
        if (!rawDate) return;
        const k = String(rawDate).slice(0, 10);
        if (k in totals && r.total > 0) {
          totals[k].sum += (r.score / r.total) * 100;
          totals[k].n += 1;
        }
      });
      return dayKeys.map((k) => ({
        day: k.slice(5),
        value: totals[k].n > 0 ? Math.round(totals[k].sum / totals[k].n) : 0,
      }));
    }

    // daily / cumulative counts
    const counts: Record<string, number> = {};
    dayKeys.forEach((k) => (counts[k] = 0));
    rows.forEach((r) => {
      const rawDate = r[spec.dateField];
      if (!rawDate) return;
      const k = String(rawDate).slice(0, 10);
      if (k in counts) counts[k] += 1;
    });

    if (spec.mode === "daily") {
      return dayKeys.map((k) => ({ day: k.slice(5), value: counts[k] }));
    }

    // cumulative: baseline = all rows older than window start + running sum
    const windowStart = new Date(now - windowDays * 24 * 60 * 60 * 1000).getTime();
    let baseline = rows.filter((r) => {
      const t = r[spec.dateField] ? new Date(r[spec.dateField]).getTime() : NaN;
      return !isNaN(t) && t < windowStart;
    }).length;
    return dayKeys.map((k) => {
      baseline += counts[k];
      return { day: k.slice(5), value: baseline };
    });
  }, [activeMetric, raw]);

  const activeSpec = activeMetric ? METRIC_SPECS[activeMetric] : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading analytics…
      </div>
    );
  }

  if (!data) return null;

  const open = (key: string) => () => setActiveMetric(key);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">Platform Analytics</h3>
        </div>
        <button
          onClick={refresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-border hover:border-primary/50"
        >
          <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <p className="text-xs text-muted-foreground -mt-3">
        Tap any stat to see how it trends over time.
      </p>

      {/* User Stats */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Users</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard icon={Users} label="Total Users" value={data.totalUsers} sub="All time signups" delay={0} onClick={open("totalUsers")} />
          <StatCard icon={UserPlus} label="New (7d)" value={data.newUsers7d} sub="Last 7 days" accent="bg-green-500/15" delay={0.05} onClick={open("newUsers7d")} />
          <StatCard icon={Clock} label="New (30d)" value={data.newUsers30d} sub="Last 30 days" delay={0.1} onClick={open("newUsers30d")} />
        </div>
      </div>

      {/* Signups Chart */}
      {signups.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-background rounded-xl border border-border p-4"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            New Signups — Last 14 Days
          </p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={signups} barSize={10}>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis hide allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "hsl(var(--foreground))",
                }}
                cursor={{ fill: "hsl(var(--muted)/0.5)" }}
              />
              <Bar dataKey="new_users" name="Signups" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Content */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Content</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard icon={BookOpen} label="Approved KB" value={data.approvedContributions} sub="Knowledge entries" accent="bg-green-500/15" delay={0.2} onClick={open("approvedContributions")} />
          <StatCard icon={Activity} label="Pending Review" value={data.pendingContributions} sub="Awaiting approval" accent="bg-yellow-500/15" delay={0.25} onClick={open("pendingContributions")} />
          <StatCard icon={Newspaper} label="News Articles" value={data.totalNewsArticles} sub="Indexed articles" delay={0.3} onClick={open("totalNewsArticles")} />
        </div>
      </div>

      {/* Topics Chart */}
      {topics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-background rounded-xl border border-border p-4"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Contributions by Topic
          </p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={topics} layout="vertical" barSize={10}>
              <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="topic"
                tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
                axisLine={false}
                tickLine={false}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "hsl(var(--foreground))",
                }}
                cursor={{ fill: "hsl(var(--muted)/0.5)" }}
              />
              <Bar dataKey="count" name="Entries" radius={[0, 4, 4, 0]}>
                {topics.map((_, i) => (
                  <Cell key={i} fill={TOPIC_COLORS[i % TOPIC_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Quiz Stats */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Quizzes</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={Brain} label="Total Attempts" value={data.totalQuizResults} delay={0.4} onClick={open("totalQuizResults")} />
          <StatCard icon={TrendingUp} label="This Week" value={data.quizResults7d} sub="Last 7 days" accent="bg-primary/15" delay={0.45} onClick={open("quizResults7d")} />
          <StatCard icon={Users} label="Active Users" value={data.activeQuizUsers7d} sub="Took quiz this week" delay={0.5} onClick={open("activeQuizUsers7d")} />
          <StatCard
            icon={Award}
            label="Avg Score"
            value={data.avgQuizScore !== null ? `${data.avgQuizScore}%` : "—"}
            sub="All-time average"
            accent="bg-green-500/15"
            delay={0.55}
            onClick={open("avgQuizScore")}
          />
        </div>
      </div>

      {/* Exploration */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Topic Exploration</p>
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={Map} label="Topic Explores" value={data.totalTopicExplores} sub="Total topic visits" delay={0.6} onClick={open("totalTopicExplores")} />
          <StatCard icon={Users} label="Users Exploring" value={data.usersWithProgress} sub="Have visited topics" delay={0.65} onClick={open("usersWithProgress")} />
        </div>
      </div>

      {/* Age Distribution */}
      {ages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-background rounded-xl border border-border p-4"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            User Age Levels
          </p>
          <div className="flex gap-3 flex-wrap">
            {ages.map(({ age_level, count }, i) => {
              const total = ages.reduce((a, b) => a + b.count, 0);
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={age_level} className="flex-1 min-w-[80px]">
                  <div className="text-xs text-muted-foreground mb-1">{AGE_LABELS[age_level] ?? age_level}</div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-1">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.8 + i * 0.1, duration: 0.6 }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-foreground">{count}</span>
                    <span className="text-muted-foreground">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Trend chart modal */}
      <Dialog open={!!activeMetric} onOpenChange={(o) => !o && setActiveMetric(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              {activeSpec?.label} — Trend
            </DialogTitle>
            <DialogDescription>{activeSpec?.description}</DialogDescription>
          </DialogHeader>

          {activeSeries && activeSpec && (
            <div className="mt-2">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={activeSeries} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="metricFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={activeSpec.color} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={activeSpec.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                    width={30}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                      color: "hsl(var(--foreground))",
                    }}
                    cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1, strokeDasharray: "3 3" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={activeSpec.color}
                    strokeWidth={2}
                    fill="url(#metricFill)"
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-3 gap-3 mt-4 text-xs">
                <div className="p-2 rounded-lg bg-muted/50">
                  <div className="text-muted-foreground">Latest</div>
                  <div className="text-foreground font-bold text-sm">
                    {activeSeries[activeSeries.length - 1]?.value ?? 0}
                    {activeSpec.mode === "avg" ? "%" : ""}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-muted/50">
                  <div className="text-muted-foreground">Peak</div>
                  <div className="text-foreground font-bold text-sm">
                    {Math.max(...activeSeries.map((s) => s.value))}
                    {activeSpec.mode === "avg" ? "%" : ""}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-muted/50">
                  <div className="text-muted-foreground">
                    {activeSpec.mode === "cumulative" ? "Growth" : "Window Total"}
                  </div>
                  <div className="text-foreground font-bold text-sm">
                    {activeSpec.mode === "cumulative"
                      ? `+${(activeSeries[activeSeries.length - 1]?.value ?? 0) - (activeSeries[0]?.value ?? 0)}`
                      : activeSeries.reduce((a, s) => a + s.value, 0)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAnalytics;
