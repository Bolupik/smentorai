import { useState, useEffect } from "react";
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
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

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
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay ?? 0, duration: 0.4 }}
    className="bg-background rounded-xl border border-border p-4 flex flex-col gap-2"
  >
    <div className="flex items-center gap-2">
      <div className={`p-1.5 rounded-lg ${accent ?? "bg-primary/15"}`}>
        <Icon className={`w-4 h-4 ${accent ? "text-current" : "text-primary"}`} />
      </div>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
    </div>
    <span className="text-2xl font-black text-foreground tracking-tight">{value}</span>
    {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
  </motion.div>
);

const AdminAnalytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [signups, setSignups] = useState<DailySignup[]>([]);
  const [topics, setTopics] = useState<TopicStat[]>([]);
  const [ages, setAges] = useState<AgeStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = async () => {
    try {
      const [summaryRes, signupsRes, topicsRes, agesRes] = await Promise.all([
        supabase.rpc("has_role", { _user_id: (await supabase.auth.getUser()).data.user!.id, _role: "admin" as any }).then(() =>
          supabase
            .from("profiles")
            .select("created_at, age_level")
        ),
        supabase
          .from("profiles")
          .select("created_at")
          .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        supabase
          .from("knowledge_base")
          .select("topic")
          .eq("approved", true),
        supabase
          .from("profiles")
          .select("age_level")
          .not("age_level", "is", null),
      ]);

      const profileRows = summaryRes.data ?? [];
      const now = Date.now();
      const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
      const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

      const totalUsers = profileRows.length;
      const newUsers7d = profileRows.filter((p) => new Date(p.created_at).getTime() >= sevenDaysAgo).length;
      const newUsers30d = profileRows.filter((p) => new Date(p.created_at).getTime() >= thirtyDaysAgo).length;

      // Knowledge base stats
      const { data: kbAll } = await supabase.from("knowledge_base").select("approved");
      const approvedContributions = kbAll?.filter((k) => k.approved).length ?? 0;
      const pendingContributions = kbAll?.filter((k) => !k.approved).length ?? 0;

      // Quiz stats
      const { data: quizAll } = await supabase.from("daily_quiz_results").select("completed_at, score, total, user_id");
      const totalQuizResults = quizAll?.length ?? 0;
      const quizResults7d = quizAll?.filter((q) => new Date(q.completed_at).getTime() >= sevenDaysAgo).length ?? 0;
      const activeQuizUsers7d = new Set(
        quizAll?.filter((q) => new Date(q.completed_at).getTime() >= sevenDaysAgo).map((q) => q.user_id)
      ).size;
      const validScores = quizAll?.filter((q) => q.total > 0) ?? [];
      const avgQuizScore =
        validScores.length > 0
          ? Math.round(validScores.reduce((acc, q) => acc + (q.score / q.total) * 100, 0) / validScores.length)
          : null;

      // Topic progress
      const { data: progressAll } = await supabase.from("topic_progress").select("user_id");
      const totalTopicExplores = progressAll?.length ?? 0;
      const usersWithProgress = new Set(progressAll?.map((p) => p.user_id)).size;

      // News
      const { count: newsCount } = await supabase.from("stacks_news").select("id", { count: "exact", head: true });

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
        totalNewsArticles: newsCount ?? 0,
      });

      // Build daily signups chart (last 14 days)
      const buckets: Record<string, number> = {};
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now - i * 24 * 60 * 60 * 1000);
        buckets[d.toISOString().slice(0, 10)] = 0;
      }
      (signupsRes.data ?? []).forEach((p) => {
        const key = p.created_at.slice(0, 10);
        if (key in buckets) buckets[key] = (buckets[key] ?? 0) + 1;
      });
      setSignups(
        Object.entries(buckets).map(([day, new_users]) => ({
          day: day.slice(5), // MM-DD
          new_users,
        }))
      );

      // Topics
      const topicMap: Record<string, number> = {};
      (topicsRes.data ?? []).forEach((r) => {
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
      (agesRes.data ?? []).forEach((r) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading analytics…
      </div>
    );
  }

  if (!data) return null;

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

      {/* User Stats */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Users</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard icon={Users} label="Total Users" value={data.totalUsers} sub="All time signups" delay={0} />
          <StatCard icon={UserPlus} label="New (7d)" value={data.newUsers7d} sub="Last 7 days" accent="bg-green-500/15" delay={0.05} />
          <StatCard icon={Clock} label="New (30d)" value={data.newUsers30d} sub="Last 30 days" delay={0.1} />
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
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
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

      {/* Knowledge & Content */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Content</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard icon={BookOpen} label="Approved KB" value={data.approvedContributions} sub="Knowledge entries" accent="bg-green-500/15" delay={0.2} />
          <StatCard icon={Activity} label="Pending Review" value={data.pendingContributions} sub="Awaiting approval" accent="bg-yellow-500/15" delay={0.25} />
          <StatCard icon={Newspaper} label="News Articles" value={data.totalNewsArticles} sub="Indexed articles" delay={0.3} />
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
          <StatCard icon={Brain} label="Total Attempts" value={data.totalQuizResults} delay={0.4} />
          <StatCard icon={TrendingUp} label="This Week" value={data.quizResults7d} sub="Last 7 days" accent="bg-primary/15" delay={0.45} />
          <StatCard icon={Users} label="Active Users" value={data.activeQuizUsers7d} sub="Took quiz this week" delay={0.5} />
          <StatCard
            icon={Award}
            label="Avg Score"
            value={data.avgQuizScore !== null ? `${data.avgQuizScore}%` : "—"}
            sub="All-time average"
            accent="bg-green-500/15"
            delay={0.55}
          />
        </div>
      </div>

      {/* Exploration Stats */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Topic Exploration</p>
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={Map} label="Topic Explores" value={data.totalTopicExplores} sub="Total topic visits" delay={0.6} />
          <StatCard icon={Users} label="Users Exploring" value={data.usersWithProgress} sub="Have visited topics" delay={0.65} />
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
    </div>
  );
};

export default AdminAnalytics;
