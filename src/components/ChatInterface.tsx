import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Send, Loader2, Sparkles, ChevronDown } from "lucide-react";
import { useToast } from "./ui/use-toast";
import ChatMessage from "./ChatMessage";
import TopicCards, { topicsList } from "./TopicCards";
import AchievementBadges from "./AchievementBadges";
import GetStartedCTA from "./GetStartedCTA";
import NFTExplorer from "./NFTExplorer";
import AgeSelector, { type AgeLevel } from "./AgeSelector";
import aiCharacter from "@/assets/ai-character.png";
import { useTopicProgressDB } from "@/hooks/useTopicProgressDB";
import { useAchievements } from "@/hooks/useAchievements";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
  images?: string[];
}

const THINKING_PHRASES = [
  "Thinking…",
  "Searching the Stacks…",
  "Connecting the blocks…",
  "Consulting Clarity…",
];

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [ageLevel, setAgeLevel] = useState<AgeLevel>("adult");
  const [showNFTExplorer, setShowNFTExplorer] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [thinkingPhrase] = useState(
    () => THINKING_PHRASES[Math.floor(Math.random() * THINKING_PHRASES.length)]
  );

  // Fetch age_level from profile on mount
  useEffect(() => {
    const fetchAgeLevel = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data } = await supabase
        .from("profiles")
        .select("age_level")
        .eq("user_id", session.user.id)
        .single();
      if (data?.age_level) setAgeLevel(data.age_level as AgeLevel);
    };
    fetchAgeLevel();
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { progress, markExplored, isExplored, exploredCount } = useTopicProgressDB();
  const { achievements, unlockedCount, totalAchievements, allCompleted } = useAchievements(progress);
  const isUserScrolledUp = useRef(false);

  const scrollToBottom = (force = false) => {
    if (!isUserScrolledUp.current || force) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setShowScrollDown(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const distFromBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
    const isAtBottom = distFromBottom < 120;
    isUserScrolledUp.current = !isAtBottom;
    setShowScrollDown(!isAtBottom && messages.length > 0);
  };

  useEffect(() => {
    if (!isLoading) scrollToBottom();
  }, [messages, isLoading]);

  const shouldAutoGenerateInfographic = (content: string, userQuery: string): boolean => {
    const complexKeywords = [
      "proof of transfer","stacking","mining","consensus","architecture",
      "how does","how it works","explain","what is","difference between",
      "clarity","smart contract","defi","yield","liquidity","amm",
      "sbtc","nakamoto","bitcoin finality","microblocks","pox",
      "rls","security","transaction","block","layer",
    ];
    const queryLower = userQuery.toLowerCase();
    const hasComplexKeyword = complexKeywords.some((kw) => queryLower.includes(kw));
    const isLongResponse = content.length > 800;
    const hasMultipleSections = (content.match(/#{1,3}\s/g) || []).length >= 2;
    return hasComplexKeyword && (isLongResponse || hasMultipleSections) && !content.includes("```");
  };

  const generateInfographicForMessage = async (content: string, messageIndex: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) return;
      const topic = content.split(".")[0].slice(0, 150);
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-infographic`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({ topic, context: content.slice(0, 500) }),
        }
      );
      if (!response.ok) return;
      const data = await response.json();
      if (data.imageUrl) {
        setMessages((prev) =>
          prev.map((m, i) =>
            i === messageIndex ? { ...m, images: [...(m.images || []), data.imageUrl] } : m
          )
        );
        toast({ title: "📊 Infographic Generated", description: "Visual added to this response." });
      }
    } catch (error) {
      console.error("Auto-infographic error:", error);
    }
  };

  const streamChat = async (userMessage: Message) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/defi-chat`;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ messages: [...messages, userMessage], ageLevel }),
      });

      if (!resp.ok) {
        if (resp.status === 429) { toast({ title: "Rate Limit", description: "Too many requests.", variant: "destructive" }); return; }
        if (resp.status === 402) { toast({ title: "Credits Depleted", description: "AI credits exhausted.", variant: "destructive" }); return; }
        throw new Error("Failed to start stream");
      }
      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const lastMsg = prev[prev.length - 1];
                if (lastMsg?.role === "assistant") {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return [...prev, { role: "assistant", content: assistantContent }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      if (assistantContent && shouldAutoGenerateInfographic(assistantContent, userMessage.content)) {
        const messageIndex = messages.length + 1;
        setTimeout(() => generateInfographicForMessage(assistantContent, messageIndex), 500);
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({ title: "Error", description: "Failed to send message. Please try again.", variant: "destructive" });
    }
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;
    const userMessage: Message = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    await streamChat(userMessage);
    setIsLoading(false);
  };

  const handleTopicClick = (prompt: string, title: string) => {
    markExplored(title);
    if (title === "NFTs & Collections") setShowNFTExplorer(true);
    handleSend(prompt);
  };

  const exploredTopics = new Set(
    topicsList.filter((t) => isExplored(t.title)).map((t) => t.title)
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">

      {/* ── Message list ────────────────────────────────────────────────── */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto"
        onScroll={handleScroll}
        style={{ scrollbarWidth: "thin", scrollbarColor: "hsl(var(--border)) transparent" }}
      >
        {/* Empty state */}
        {messages.length === 0 && (
          <div className="px-4 md:px-10 pt-10 pb-4">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-10"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
                className="w-20 h-20 mx-auto mb-5 rounded-full overflow-hidden border border-primary/30 shadow-lg shadow-primary/15"
              >
                <img src={aiCharacter} alt="Sammy" className="w-full h-full object-cover" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-2.5"
              >
                What knowledge do you seek?
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="text-[15px] text-muted-foreground max-w-md mx-auto leading-[1.75] mb-1.5"
              >
                Select a topic below or ask anything about the Stacks ecosystem.
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="text-[12px] text-primary/60 flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3 h-3" />
                Voice narration available on all responses
              </motion.p>
            </motion.div>

            {/* Inline quick-ask */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="max-w-2xl mx-auto mb-8 px-1"
            >
              <div className="flex gap-2.5">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about sBTC, Proof of Transfer, Clarity smart contracts…"
                  className="resize-none bg-muted/40 border border-border/50 focus:border-primary/60 focus:ring-0 rounded-xl text-[15px] leading-[1.6] min-h-[54px] py-3.5 px-4 placeholder:text-muted-foreground/60"
                  rows={1}
                />
                <Button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="h-auto px-5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md shadow-primary/20 transition-all duration-200 hover:scale-105"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </Button>
              </div>
              <div className="mt-2.5 pl-1">
                <AgeSelector value={ageLevel} onChange={setAgeLevel} />
              </div>
            </motion.div>

            <TopicCards
              onTopicClick={handleTopicClick}
              exploredTopics={exploredTopics}
              totalTopics={topicsList.length}
              exploredCount={exploredCount}
            />
            <AchievementBadges
              achievements={achievements}
              unlockedCount={unlockedCount}
              totalAchievements={totalAchievements}
              exploredCount={exploredCount}
              totalTopics={topicsList.length}
              allCompleted={allCompleted}
            />
            <GetStartedCTA allCompleted={allCompleted} exploredCount={exploredCount} />
          </div>
        )}

        {/* NFT Explorer panel */}
        {showNFTExplorer && messages.length > 0 && (
          <div className="px-4 md:px-10 pt-6">
            <NFTExplorer isVisible={showNFTExplorer} onClose={() => setShowNFTExplorer(false)} />
          </div>
        )}

        {/* Messages */}
        {messages.length > 0 && (
          <div className="px-4 md:px-10 pt-8 pb-4 max-w-4xl mx-auto w-full">
            {messages.map((msg, idx) => (
              <ChatMessage key={idx} role={msg.role} content={msg.content} images={msg.images} />
            ))}

            {/* Thinking indicator */}
            <AnimatePresence>
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <motion.div
                  key="thinking"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex gap-3 mb-8"
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-primary/40 flex-shrink-0 mt-1">
                    <img src={aiCharacter} alt="Sammy" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col gap-1 items-start">
                    <span className="text-[11px] font-medium tracking-wide text-muted-foreground/60 px-1">Sammy</span>
                    <div className="bg-card border border-border/40 rounded-2xl rounded-tl-md px-5 py-4 shadow-sm">
                      <div className="flex items-center gap-2.5">
                        {/* Animated dots */}
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 rounded-full bg-primary/60"
                              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
                            />
                          ))}
                        </div>
                        <span className="text-[13px] text-muted-foreground">{thinkingPhrase}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* ── Scroll-to-bottom pill ────────────────────────────────────────── */}
      <AnimatePresence>
        {showScrollDown && (
          <motion.button
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            onClick={() => scrollToBottom(true)}
            className="absolute bottom-28 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-card border border-border/60 text-foreground/70 hover:text-foreground text-xs font-medium px-3.5 py-1.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-20"
          >
            <ChevronDown className="w-3.5 h-3.5" />
            Scroll to latest
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Input bar (active state) ─────────────────────────────────────── */}
      {messages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-border/25 bg-background/98 backdrop-blur-lg"
        >
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-4">
            {/* Age selector row */}
            <div className="mb-3">
              <AgeSelector value={ageLevel} onChange={setAgeLevel} />
            </div>

            {/* Input row */}
            <div className="flex gap-2.5 items-end">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Continue the conversation…"
                className="flex-1 resize-none bg-muted/40 border border-border/50 focus:border-primary/60 focus:ring-0 rounded-xl text-[15px] leading-[1.65] min-h-[52px] max-h-40 py-3.5 px-4 placeholder:text-muted-foreground/55 transition-colors duration-150"
                rows={1}
                style={{ fieldSizing: "content" } as React.CSSProperties}
              />
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="h-[52px] w-[52px] p-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md shadow-primary/20 transition-all duration-200 hover:scale-105 flex-shrink-0"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </div>

            <p className="text-[11px] text-muted-foreground/40 mt-2 text-center">
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ChatInterface;
