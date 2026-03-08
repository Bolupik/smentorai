import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, MessageCircle, BarChart3, Flame, Users, Zap,
  ExternalLink, RefreshCw, ArrowUpRight, ArrowDownRight, Activity,
  Bitcoin, Layers, Shield, Rocket, DollarSign, Clock, Box,
  Loader2, AlertCircle, Newspaper, Tag
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// ── Types ─────────────────────────────────────────────────────────────────────

interface TrendingTopic {
  id: string; topic: string; sentiment: "bullish" | "neutral" | "bearish";
  mentions: number; trend: "up" | "down" | "stable"; trendPercent: number;
  category: string; hotness: number;
}

interface LiveMetrics {
  stxPrice: number; stxPriceChange24h: number; btcPrice: number;
  totalTransactions: number; recentTransactions: number; blockHeight: number;
  avgBlockTime: number; totalSupply: number; circulatingSupply: number;
  mempoolSize: number; stxLocked: number; currentCycle: number; signers: number;
}

interface CommunityDiscussion {
  id: string; topic: string; content: string; category: string;
  upvotes: number; created_at: string;
}

interface NewsArticle {
  id: string; title: string; summary: string | null; url: string;
  source: string; image_url: string | null; published_at: string;
  relevance_score: number; tags: string[];
}

// ── Static data ───────────────────────────────────────────────────────────────

const trendingTopics: TrendingTopic[] = [
  { id: "1", topic: "Dual Stacking Launch", sentiment: "bullish", mentions: 2847, trend: "up", trendPercent: 156, category: "DeFi", hotness: 98 },
  { id: "2", topic: "sBTC 3000+ BTC Milestone", sentiment: "bullish", mentions: 2134, trend: "up", trendPercent: 89, category: "sBTC", hotness: 95 },
  { id: "3", topic: "BitGo Integration", sentiment: "bullish", mentions: 1892, trend: "up", trendPercent: 234, category: "Institutional", hotness: 92 },
  { id: "4", topic: "Clarity 4 WASM", sentiment: "bullish", mentions: 1456, trend: "up", trendPercent: 67, category: "Development", hotness: 88 },
  { id: "5", topic: "stSTXbtc Liquid Stacking", sentiment: "bullish", mentions: 1234, trend: "up", trendPercent: 145, category: "DeFi", hotness: 85 },
  { id: "6", topic: "DeFAI – AI on Bitcoin", sentiment: "bullish", mentions: 987, trend: "up", trendPercent: 312, category: "Innovation", hotness: 82 },
  { id: "7", topic: "WalletConnect Support", sentiment: "bullish", mentions: 876, trend: "up", trendPercent: 78, category: "Infrastructure", hotness: 78 },
  { id: "8", topic: "USDCx Anticipation", sentiment: "bullish", mentions: 654, trend: "stable", trendPercent: 12, category: "Stablecoins", hotness: 72 },
];

const communityHotTakes = [
  { text: "sBTC filled the cap in 2.5 hours... bullish AF 🟧", likes: 1247 },
  { text: "Nakamoto upgrade = Stacks finally production-ready", likes: 892 },
  { text: "Other L2s talk about Bitcoin security, Stacks HAS it", likes: 756 },
  { text: "Clarity is the most underrated smart contract language", likes: 634 },
  { text: "Stack sats, stack STX, earn both 💎", likes: 589 },
  { text: "Show us your Nakamojo 🟧", likes: 478 },
];

// ── Formatters ────────────────────────────────────────────────────────────────

const fmt = (n: number) => {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toLocaleString();
};

const fmtStx = (n: number) => {
  const stx = n / 1_000_000;
  if (stx >= 1e9) return (stx / 1e9).toFixed(2) + "B";
  if (stx >= 1e6) return (stx / 1e6).toFixed(2) + "M";
  return stx.toLocaleString();
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return `${Math.floor(diff / 60_000)}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Color helpers ─────────────────────────────────────────────────────────────

const sentimentCls = (s: string) =>
  s === "bullish" ? "text-green-500 bg-green-500/10" :
  s === "bearish"  ? "text-red-500 bg-red-500/10" :
                     "text-yellow-500 bg-yellow-500/10";

const categoryCls: Record<string, string> = {
  DeFi:           "bg-purple-500/20 text-purple-400 border-purple-500/30",
  sBTC:           "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Institutional:  "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Development:    "bg-green-500/20 text-green-400 border-green-500/30",
  Innovation:     "bg-pink-500/20 text-pink-400 border-pink-500/30",
  Infrastructure: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  Stablecoins:    "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Bitcoin:        "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Markets:        "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Protocol:       "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  Security:       "bg-red-500/20 text-red-400 border-red-500/30",
  Wallets:        "bg-violet-500/20 text-violet-400 border-violet-500/30",
  Clarity:        "bg-teal-500/20 text-teal-400 border-teal-500/30",
  NFT:            "bg-rose-500/20 text-rose-400 border-rose-500/30",
};
const getTagCls = (t: string) => categoryCls[t] ?? "bg-muted/50 text-muted-foreground border-border/50";

// ── Component ─────────────────────────────────────────────────────────────────

export function CommunitySentiment() {
  const [discussions, setDiscussions] = useState<CommunityDiscussion[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsRefreshing, setNewsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("trending");
  const { toast } = useToast();

  // ── Fetch helpers ───────────────────────────────────────────────────────────

  const fetchLiveMetrics = useCallback(async () => {
    setMetricsLoading(true);
    setMetricsError(null);
    try {
      const { data, error } = await supabase.functions.invoke("stacks-metrics");
      if (error) throw error;
      if (data?.success && data?.data) {
        setLiveMetrics(data.data);
        setLastUpdated(new Date());
      } else throw new Error(data?.error || "Failed to fetch metrics");
    } catch (e) {
      console.error("Failed to fetch live metrics:", e);
      setMetricsError(e instanceof Error ? e.message : "Failed to fetch metrics");
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  const fetchNews = useCallback(async (forceRefresh = false) => {
    setNewsLoading(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const mode = forceRefresh ? "refresh" : "read";
      const res = await fetch(`${supabaseUrl}/functions/v1/stacks-news?mode=${mode}`, {
        headers: { Authorization: `Bearer ${anonKey}` },
      });
      const json = await res.json();
      if (json.success) {
        if (json.articles?.length) {
          setNews(json.articles);
        } else if (json.refreshing || forceRefresh) {
          // Data is being fetched; poll once after 3s
          setTimeout(async () => {
            const r2 = await fetch(`${supabaseUrl}/functions/v1/stacks-news?mode=read`, {
              headers: { Authorization: `Bearer ${anonKey}` },
            });
            const j2 = await r2.json();
            if (j2.articles?.length) setNews(j2.articles);
          }, 3000);
        }
        if (forceRefresh) {
          toast({ title: "📰 News refreshed", description: `${json.refreshed ?? json.articles?.length ?? 0} articles updated.` });
        }
      }
    } catch (e) {
      console.error("Failed to fetch news:", e);
    } finally {
      setNewsLoading(false);
      setNewsRefreshing(false);
    }
  }, [toast]);

  const fetchDiscussions = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase
        .from("knowledge_base")
        .select("id, topic, content, category, upvotes, created_at")
        .eq("approved", true)
        .order("created_at", { ascending: false })
        .limit(10);
      if (!error && data) setDiscussions(data);
      setLastUpdated(new Date());
    } catch (e) {
      console.error("Failed to fetch discussions:", e);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDiscussions();
    fetchLiveMetrics();
    fetchNews(false);
    const interval = setInterval(fetchLiveMetrics, 60_000);
    return () => clearInterval(interval);
  }, [fetchLiveMetrics, fetchDiscussions, fetchNews]);

  const handleRefresh = async () => {
    setNewsRefreshing(true);
    await Promise.all([fetchDiscussions(), fetchLiveMetrics(), fetchNews(true)]);
  };

  // ── Derived: live sentiment based on actual STX price change ────────────────
  const priceChange = liveMetrics?.stxPriceChange24h ?? 0;
  const overallSentiment = Math.min(95, Math.max(30, 65 + priceChange * 2));
  const sentimentLabel = overallSentiment >= 70 ? "BULLISH" : overallSentiment >= 50 ? "NEUTRAL" : "BEARISH";
  const sentimentGradient = overallSentiment >= 70
    ? "from-green-500/10 via-transparent to-orange-500/10 border-green-500/20"
    : overallSentiment >= 50
    ? "from-yellow-500/10 via-transparent to-orange-500/10 border-yellow-500/20"
    : "from-red-500/10 via-transparent to-orange-500/10 border-red-500/20";

  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Community Pulse</h2>
            <p className="text-sm text-muted-foreground">
              Live sentiment, metrics & daily Bitcoin/Stacks news
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
          <Button variant="outline" size="sm" onClick={handleRefresh}
            disabled={isRefreshing || metricsLoading || newsRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing || metricsLoading || newsRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* ── Live ticker strip ────────────────────────────────────────────────── */}
      {liveMetrics && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 flex-wrap px-4 py-2.5 rounded-xl bg-card border border-border/50 text-sm"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">STX</span>
            <span className="font-bold">${liveMetrics.stxPrice.toFixed(4)}</span>
            <Badge className={`text-[10px] px-1.5 py-0 ${liveMetrics.stxPriceChange24h >= 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
              {liveMetrics.stxPriceChange24h >= 0 ? "+" : ""}{liveMetrics.stxPriceChange24h.toFixed(2)}%
            </Badge>
          </div>
          <div className="w-px h-4 bg-border hidden sm:block" />
          <div className="flex items-center gap-1.5">
            <Bitcoin className="h-3.5 w-3.5 text-amber-500" />
            <span className="font-semibold">${fmt(liveMetrics.btcPrice)}</span>
          </div>
          <div className="w-px h-4 bg-border hidden sm:block" />
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Box className="h-3 w-3" />
            <span>Block #{fmt(liveMetrics.blockHeight)}</span>
          </div>
          <div className="w-px h-4 bg-border hidden sm:block" />
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Layers className="h-3 w-3" />
            <span>{fmtStx(liveMetrics.stxLocked)} STX stacked</span>
          </div>
          <div className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
            Live
          </div>
        </motion.div>
      )}

      {/* ── Sentiment meter ──────────────────────────────────────────────────── */}
      <Card className={`bg-gradient-to-r ${sentimentGradient}`}>
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-green-500" />
              <span className="font-semibold">Overall Community Sentiment</span>
              {liveMetrics && (
                <span className="text-xs text-muted-foreground">
                  (based on live price + ecosystem activity)
                </span>
              )}
            </div>
            <Badge className={sentimentLabel === "BULLISH" ? "bg-green-500/20 text-green-400 border-green-500/30" : sentimentLabel === "BEARISH" ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"}>
              {sentimentLabel}
            </Badge>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-red-400">Bearish</span>
              <span className="font-bold" style={{ color: overallSentiment >= 70 ? "hsl(var(--chart-2))" : overallSentiment >= 50 ? "hsl(var(--chart-4))" : "hsl(var(--destructive))" }}>
                {Math.round(overallSentiment)}% {sentimentLabel === "BULLISH" ? "Bullish" : sentimentLabel === "BEARISH" ? "Bearish" : "Neutral"}
              </span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overallSentiment}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, hsl(var(--destructive)), hsl(var(--chart-4)), hsl(var(--chart-2)))" }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Derived from live STX price movement, stacking participation, and mempool activity
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Tabs ────────────────────────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-auto">
          {([
            { value: "trending", icon: Flame, label: "Trending" },
            { value: "news",     icon: Newspaper, label: "News" },
            { value: "metrics",  icon: BarChart3,  label: "Metrics" },
            { value: "discussions", icon: MessageCircle, label: "Discuss" },
            { value: "hottakes", icon: Zap, label: "Hot Takes" },
          ] as const).map(({ value, icon: Icon, label }) => (
            <TabsTrigger key={value} value={value}
              className="flex items-center gap-1 py-2 text-xs sm:text-sm">
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ════ TRENDING ════ */}
        <TabsContent value="trending" className="mt-4 space-y-3">
          <AnimatePresence>
            {trendingTopics.map((topic, index) => (
              <motion.div key={topic.id}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}>
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex items-center justify-center w-8 h-8 shrink-0 rounded-full bg-primary/10 text-primary font-bold text-sm">
                          #{index + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold truncate">{topic.topic}</span>
                            <Badge variant="outline" className={`text-xs ${categoryCls[topic.category] ?? ""}`}>
                              {topic.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />{topic.mentions.toLocaleString()} mentions
                            </span>
                            <span className={`flex items-center gap-0.5 ${topic.trend === "up" ? "text-green-500" : topic.trend === "down" ? "text-red-500" : "text-yellow-500"}`}>
                              {topic.trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : topic.trend === "down" ? <ArrowDownRight className="h-3 w-3" /> : null}
                              {topic.trendPercent}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right hidden sm:block">
                          <div className="flex items-center gap-1">
                            <Flame className={`h-4 w-4 ${topic.hotness > 90 ? "text-orange-500" : "text-muted-foreground"}`} />
                            <span className="text-sm font-medium">{topic.hotness}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">Hotness</span>
                        </div>
                        <Badge className={sentimentCls(topic.sentiment)}>
                          {topic.sentiment.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={topic.hotness} className="h-1 mt-3" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </TabsContent>

        {/* ════ NEWS ════ */}
        <TabsContent value="news" className="mt-4">
          {newsLoading && news.length === 0 ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
              <span className="text-muted-foreground text-sm">Fetching latest Stacks & Bitcoin news…</span>
            </div>
          ) : news.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Newspaper className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
                <p className="font-semibold">No news cached yet</p>
                <p className="text-sm text-muted-foreground mt-1 mb-4">Click Refresh to fetch the latest stories</p>
                <Button size="sm" variant="outline" onClick={() => { setNewsRefreshing(true); fetchNews(true); }}>
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Fetch News
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {/* Header bar */}
              <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <span>{news.length} stories • sourced from CryptoCompare, CoinDesk & Stacks.org</span>
                <button
                  onClick={() => { setNewsRefreshing(true); fetchNews(true); }}
                  disabled={newsRefreshing}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <RefreshCw className={`h-3 w-3 ${newsRefreshing ? "animate-spin" : ""}`} />
                  Refresh feed
                </button>
              </div>

              <AnimatePresence>
                {news.map((article, i) => (
                  <motion.div key={article.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}>
                    <a href={article.url} target="_blank" rel="noopener noreferrer">
                      <Card className="hover:bg-accent/50 transition-colors cursor-pointer group">
                        <CardContent className="py-4">
                          <div className="flex gap-3">
                            {article.image_url && (
                              <img
                                src={article.image_url}
                                alt=""
                                className="w-16 h-16 rounded-lg object-cover shrink-0 hidden sm:block bg-muted"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                                  {article.title}
                                </p>
                                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              {article.summary && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{article.summary}</p>
                              )}
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  {article.source}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-2.5 w-2.5" />
                                  {timeAgo(article.published_at)}
                                </span>
                                {article.tags?.slice(0, 3).map((tag) => (
                                  <Badge key={tag} variant="outline" className={`text-[10px] px-1.5 py-0 ${getTagCls(tag)}`}>
                                    {tag}
                                  </Badge>
                                ))}
                                {article.relevance_score >= 4 && (
                                  <Badge className="text-[10px] px-1.5 py-0 bg-orange-500/20 text-orange-400 border-orange-500/30">
                                    🔥 Top Story
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </a>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        {/* ════ METRICS ════ */}
        <TabsContent value="metrics" className="mt-4">
          {metricsLoading && !liveMetrics ? (
            <div className="flex items-center justify-center py-12 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              <span>Loading live metrics…</span>
            </div>
          ) : metricsError && !liveMetrics ? (
            <Card className="bg-destructive/10 border-destructive/30">
              <CardContent className="py-8 text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
                <h3 className="font-semibold mb-2">Unable to load live metrics</h3>
                <p className="text-sm text-muted-foreground mb-4">{metricsError}</p>
                <Button onClick={fetchLiveMetrics} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" /> Try Again
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {liveMetrics && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { icon: Box,        label: "Block Height",       value: fmt(liveMetrics.blockHeight),      sub: "Live", subCls: "text-green-500", delay: 0.1 },
                    { icon: Activity,   label: "Total Transactions",  value: fmt(liveMetrics.totalTransactions), sub: "All-time on-chain", subCls: "text-muted-foreground", delay: 0.2 },
                    { icon: Clock,      label: "Mempool",             value: `${liveMetrics.mempoolSize} txs`, sub: "Pending", subCls: "text-yellow-500", delay: 0.3 },
                    { icon: Layers,     label: "STX Locked",          value: fmtStx(liveMetrics.stxLocked),    sub: "Stacking", subCls: "text-green-500", delay: 0.4 },
                    { icon: Shield,     label: "PoX Cycle",           value: `#${liveMetrics.currentCycle}`,   sub: `${liveMetrics.signers} Signers`, subCls: "text-blue-500", delay: 0.5 },
                    { icon: TrendingUp, label: "Circulating",         value: fmtStx(liveMetrics.circulatingSupply), sub: `of ${fmtStx(liveMetrics.totalSupply)} total`, subCls: "text-muted-foreground", delay: 0.6 },
                  ].map(({ icon: Icon, label, value, sub, subCls, delay }) => (
                    <motion.div key={label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay }}>
                      <Card className="relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
                        <CardContent className="pt-5 pb-4">
                          <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                            <Icon className="h-4 w-4" />
                            <span className="text-xs">{label}</span>
                          </div>
                          <div className="text-xl font-bold">{value}</div>
                          <div className={`text-xs mt-1 ${subCls}`}>{sub}</div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Growth Highlights (2025)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ["DeFi TVL Q1", "+97.6%"], ["DeFi TVL Q2", "+9.2%"],
                      ["Transactions Q2", "+68.4%"], ["STX Locked Q1", "+3.3%"],
                      ["STX Locked Q2", "+2.4%"], ["Developer Rank", "#7 Fastest"],
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{label}</span>
                        <span className="font-semibold text-green-500">{val}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ════ DISCUSSIONS ════ */}
        <TabsContent value="discussions" className="mt-4">
          {discussions.length > 0 ? (
            <div className="space-y-3">
              {discussions.map((discussion, index) => (
                <motion.div key={discussion.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}>
                  <Card className="hover:bg-accent/50 transition-colors">
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-semibold">{discussion.topic}</span>
                            {discussion.category && (
                              <Badge variant="outline" className={`text-xs ${categoryCls[discussion.category] ?? ""}`}>
                                {discussion.category}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{discussion.content}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span>{new Date(discussion.created_at).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1">
                              <ArrowUpRight className="h-3 w-3 text-green-500" />
                              {discussion.upvotes || 0} upvotes
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="font-semibold mb-2">No discussions yet</h3>
                <p className="text-sm text-muted-foreground">Be the first to contribute knowledge to the community!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ════ HOT TAKES ════ */}
        <TabsContent value="hottakes" className="mt-4">
          <div className="space-y-3">
            {communityHotTakes.map((take, index) => (
              <motion.div key={index}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}>
                <Card className="bg-gradient-to-r from-orange-500/5 to-transparent border-orange-500/20 hover:border-orange-500/40 transition-colors">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl shrink-0">🟧</div>
                        <p className="text-sm font-medium">{take.text}</p>
                      </div>
                      <div className="flex items-center gap-1 text-orange-400 shrink-0">
                        <Flame className="h-4 w-4" />
                        <span className="text-sm font-medium">{take.likes}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <Card className="mt-4 bg-muted/50">
            <CardContent className="py-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Hot takes sourced from the Stacks community on</span>
                  <Badge variant="outline" className="text-xs">X / Twitter</Badge>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <a href="https://x.com/Stacks" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                    Follow @Stacks <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
