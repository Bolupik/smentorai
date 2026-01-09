import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, 
  MessageCircle, 
  BarChart3, 
  Flame, 
  Users, 
  Zap,
  ExternalLink,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Bitcoin,
  Layers,
  Shield,
  Code2,
  Rocket
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

interface TrendingTopic {
  id: string;
  topic: string;
  sentiment: "bullish" | "neutral" | "bearish";
  mentions: number;
  trend: "up" | "down" | "stable";
  trendPercent: number;
  category: string;
  hotness: number;
}

interface EcosystemMetric {
  label: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
}

interface CommunityDiscussion {
  id: string;
  topic: string;
  content: string;
  category: string;
  upvotes: number;
  created_at: string;
}

const trendingTopics: TrendingTopic[] = [
  {
    id: "1",
    topic: "Dual Stacking Launch",
    sentiment: "bullish",
    mentions: 2847,
    trend: "up",
    trendPercent: 156,
    category: "DeFi",
    hotness: 98
  },
  {
    id: "2",
    topic: "sBTC 3000+ BTC Milestone",
    sentiment: "bullish",
    mentions: 2134,
    trend: "up",
    trendPercent: 89,
    category: "sBTC",
    hotness: 95
  },
  {
    id: "3",
    topic: "BitGo Integration",
    sentiment: "bullish",
    mentions: 1892,
    trend: "up",
    trendPercent: 234,
    category: "Institutional",
    hotness: 92
  },
  {
    id: "4",
    topic: "Clarity 4 WASM",
    sentiment: "bullish",
    mentions: 1456,
    trend: "up",
    trendPercent: 67,
    category: "Development",
    hotness: 88
  },
  {
    id: "5",
    topic: "stSTXbtc Liquid Stacking",
    sentiment: "bullish",
    mentions: 1234,
    trend: "up",
    trendPercent: 145,
    category: "DeFi",
    hotness: 85
  },
  {
    id: "6",
    topic: "DeFAI - AI on Bitcoin",
    sentiment: "bullish",
    mentions: 987,
    trend: "up",
    trendPercent: 312,
    category: "Innovation",
    hotness: 82
  },
  {
    id: "7",
    topic: "WalletConnect Support",
    sentiment: "bullish",
    mentions: 876,
    trend: "up",
    trendPercent: 78,
    category: "Infrastructure",
    hotness: 78
  },
  {
    id: "8",
    topic: "USDCx Anticipation",
    sentiment: "bullish",
    mentions: 654,
    trend: "stable",
    trendPercent: 12,
    category: "Stablecoins",
    hotness: 72
  }
];

const ecosystemMetrics: EcosystemMetric[] = [
  {
    label: "DeFi TVL",
    value: "$1.2B+",
    change: "+97.6% Q1",
    changeType: "positive",
    icon: <BarChart3 className="h-4 w-4" />
  },
  {
    label: "sBTC Deployed",
    value: "3,000+ BTC",
    change: "+2000 BTC",
    changeType: "positive",
    icon: <Bitcoin className="h-4 w-4" />
  },
  {
    label: "Active Developers",
    value: "1,000+",
    change: "#7 Fastest",
    changeType: "positive",
    icon: <Code2 className="h-4 w-4" />
  },
  {
    label: "Q2 Transactions",
    value: "+68.4%",
    change: "vs Q1 2025",
    changeType: "positive",
    icon: <Activity className="h-4 w-4" />
  },
  {
    label: "Signers Network",
    value: "Top Tier",
    change: "#1 Bitcoin L2",
    changeType: "positive",
    icon: <Shield className="h-4 w-4" />
  },
  {
    label: "STX Stacked",
    value: "Growing",
    change: "Each Cycle",
    changeType: "positive",
    icon: <Layers className="h-4 w-4" />
  }
];

const communityHotTakes = [
  { text: "sBTC filled the cap in 2.5 hours... bullish AF 🟧", likes: 1247 },
  { text: "Nakamoto upgrade = Stacks finally production-ready", likes: 892 },
  { text: "Other L2s talk about Bitcoin security, Stacks HAS it", likes: 756 },
  { text: "Clarity is the most underrated smart contract language", likes: 634 },
  { text: "Stack sats, stack STX, earn both 💎", likes: 589 },
  { text: "Show us your Nakamojo 🟧", likes: 478 }
];

export function CommunitySentiment() {
  const [discussions, setDiscussions] = useState<CommunityDiscussion[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activeTab, setActiveTab] = useState("trending");

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const fetchDiscussions = async () => {
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('id, topic, content, category, upvotes, created_at')
        .eq('approved', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setDiscussions(data);
      }
      setLastUpdated(new Date());
    } catch (e) {
      console.error("Failed to fetch discussions:", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "bullish": return "text-green-500 bg-green-500/10";
      case "bearish": return "text-red-500 bg-red-500/10";
      default: return "text-yellow-500 bg-yellow-500/10";
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "DeFi": "bg-purple-500/20 text-purple-400 border-purple-500/30",
      "sBTC": "bg-orange-500/20 text-orange-400 border-orange-500/30",
      "Institutional": "bg-blue-500/20 text-blue-400 border-blue-500/30",
      "Development": "bg-green-500/20 text-green-400 border-green-500/30",
      "Innovation": "bg-pink-500/20 text-pink-400 border-pink-500/30",
      "Infrastructure": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      "Stablecoins": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    };
    return colors[category] || "bg-muted text-muted-foreground";
  };

  const overallSentiment = 87; // Calculated bullish sentiment percentage

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Community Pulse</h2>
            <p className="text-sm text-muted-foreground">
              Live sentiment & trending topics from the Stacks community
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDiscussions}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Sentiment Meter */}
      <Card className="bg-gradient-to-r from-green-500/10 via-transparent to-orange-500/10 border-green-500/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-green-500" />
              <span className="font-semibold">Overall Community Sentiment</span>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              BULLISH
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-red-400">Bearish</span>
              <span className="text-green-400 font-bold">{overallSentiment}% Bullish</span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overallSentiment}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-yellow-500 via-green-500 to-emerald-500 rounded-full"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Based on community discussions, social mentions, and ecosystem growth metrics
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trending" className="flex items-center gap-1">
            <Flame className="h-4 w-4" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" />
            Metrics
          </TabsTrigger>
          <TabsTrigger value="discussions" className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            Discussions
          </TabsTrigger>
          <TabsTrigger value="hottakes" className="flex items-center gap-1">
            <Zap className="h-4 w-4" />
            Hot Takes
          </TabsTrigger>
        </TabsList>

        {/* Trending Topics */}
        <TabsContent value="trending" className="mt-4">
          <div className="grid gap-3">
            <AnimatePresence>
              {trendingTopics.map((topic, index) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 font-bold text-sm">
                            #{index + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{topic.topic}</span>
                              <Badge variant="outline" className={getCategoryColor(topic.category)}>
                                {topic.category}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {topic.mentions.toLocaleString()} mentions
                              </span>
                              <span className={`flex items-center gap-1 ${
                                topic.trend === "up" ? "text-green-500" : 
                                topic.trend === "down" ? "text-red-500" : "text-yellow-500"
                              }`}>
                                {topic.trend === "up" ? (
                                  <ArrowUpRight className="h-3 w-3" />
                                ) : topic.trend === "down" ? (
                                  <ArrowDownRight className="h-3 w-3" />
                                ) : null}
                                {topic.trendPercent}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <Flame className={`h-4 w-4 ${topic.hotness > 90 ? 'text-orange-500' : 'text-muted-foreground'}`} />
                              <span className="text-sm font-medium">{topic.hotness}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">Hotness</span>
                          </div>
                          <Badge className={getSentimentColor(topic.sentiment)}>
                            {topic.sentiment.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      {/* Hotness bar */}
                      <div className="mt-3">
                        <Progress value={topic.hotness} className="h-1" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </TabsContent>

        {/* Ecosystem Metrics */}
        <TabsContent value="metrics" className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {ecosystemMetrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                      {metric.icon}
                      <span className="text-sm">{metric.label}</span>
                    </div>
                    <div className="text-2xl font-bold">{metric.value}</div>
                    <div className={`text-sm mt-1 flex items-center gap-1 ${
                      metric.changeType === "positive" ? "text-green-500" :
                      metric.changeType === "negative" ? "text-red-500" : "text-muted-foreground"
                    }`}>
                      {metric.changeType === "positive" && <ArrowUpRight className="h-3 w-3" />}
                      {metric.changeType === "negative" && <ArrowDownRight className="h-3 w-3" />}
                      {metric.change}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Additional Stats */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Growth Highlights (2025)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">DeFi TVL Q1</span>
                    <span className="font-semibold text-green-500">+97.6%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">DeFi TVL Q2</span>
                    <span className="font-semibold text-green-500">+9.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Transactions Q2</span>
                    <span className="font-semibold text-green-500">+68.4%</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">STX Locked Q1</span>
                    <span className="font-semibold text-green-500">+3.3%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">STX Locked Q2</span>
                    <span className="font-semibold text-green-500">+2.4%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Developer Rank</span>
                    <span className="font-semibold text-green-500">#7 Fastest</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Community Discussions */}
        <TabsContent value="discussions" className="mt-4">
          {discussions.length > 0 ? (
            <div className="space-y-3">
              {discussions.map((discussion, index) => (
                <motion.div
                  key={discussion.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:bg-accent/50 transition-colors">
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{discussion.topic}</span>
                            {discussion.category && (
                              <Badge variant="outline" className="text-xs">
                                {discussion.category}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {discussion.content}
                          </p>
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
                <p className="text-sm text-muted-foreground">
                  Be the first to contribute knowledge to the community!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Community Hot Takes */}
        <TabsContent value="hottakes" className="mt-4">
          <div className="space-y-3">
            {communityHotTakes.map((take, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <Card className="bg-gradient-to-r from-orange-500/5 to-transparent border-orange-500/20 hover:border-orange-500/40 transition-colors">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">🟧</div>
                        <p className="text-sm font-medium">{take.text}</p>
                      </div>
                      <div className="flex items-center gap-1 text-orange-400">
                        <Flame className="h-4 w-4" />
                        <span className="text-sm font-medium">{take.likes}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Source link */}
          <Card className="mt-4 bg-muted/50">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Hot takes sourced from Stacks community on</span>
                  <Badge variant="outline" className="text-xs">X / Twitter</Badge>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <a 
                    href="https://x.com/Stacks" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1"
                  >
                    Follow @Stacks
                    <ExternalLink className="h-3 w-3" />
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
