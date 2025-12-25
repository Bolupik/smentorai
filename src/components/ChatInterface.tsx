import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Send, Loader2, Sparkles } from "lucide-react";
import { useToast } from "./ui/use-toast";
import ChatMessage from "./ChatMessage";
import TopicCards, { topicsList } from "./TopicCards";
import AchievementBadges from "./AchievementBadges";
import GetStartedCTA from "./GetStartedCTA";
import NFTExplorer from "./NFTExplorer";
import aiCharacter from "@/assets/ai-character.png";
import { useTopicProgressDB } from "@/hooks/useTopicProgressDB";
import { useAchievements } from "@/hooks/useAchievements";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showNFTExplorer, setShowNFTExplorer] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { progress, markExplored, isExplored, exploredCount } = useTopicProgressDB();
  const { achievements, unlockedCount, totalAchievements, allCompleted } = useAchievements(progress);

  const isUserScrolledUp = useRef(false);

  const scrollToBottom = () => {
    if (!isUserScrolledUp.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100;
    isUserScrolledUp.current = !isAtBottom;
  };

  useEffect(() => {
    // Only auto-scroll when not loading (i.e., when a complete message is added)
    if (!isLoading) {
      scrollToBottom();
    }
  }, [messages, isLoading]);

  const streamChat = async (userMessage: Message) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/defi-chat`;
    
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!resp.ok) {
        if (resp.status === 429) {
          toast({
            title: "Rate Limit",
            description: "Too many requests. Please wait a moment.",
            variant: "destructive",
          });
          return;
        }
        if (resp.status === 402) {
          toast({
            title: "Credits Depleted",
            description: "AI credits have run out. Please add more credits.",
            variant: "destructive",
          });
          return;
        }
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
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
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
    // Show NFT Explorer when NFT topic is clicked
    if (title === "NFTs & Collections") {
      setShowNFTExplorer(true);
    }
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
    <div className="flex flex-col h-full bg-gradient-to-b from-background to-card/30">
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4" onScroll={handleScroll}>
        {messages.length === 0 && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center py-12"
            >
              {/* AI Character avatar */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden border-2 border-primary shadow-lg shadow-primary/20"
              >
                <img src={aiCharacter} alt="Stacks AI" className="w-full h-full object-cover" />
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl md:text-4xl font-black tracking-tight text-foreground mb-3"
              >
                What would you like to learn?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground mb-2 max-w-md mx-auto"
              >
                Select a topic below or ask me anything about the Stacks ecosystem
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xs text-primary/70 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3 h-3" />
                Voice narration available on all responses
              </motion.p>
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
            <GetStartedCTA 
              allCompleted={allCompleted}
              exploredCount={exploredCount}
            />
          </>
        )}
        {/* NFT Explorer - shown when NFT topic is selected */}
        {showNFTExplorer && messages.length > 0 && (
          <NFTExplorer 
            isVisible={showNFTExplorer} 
            onClose={() => setShowNFTExplorer(false)} 
          />
        )}
        {messages.map((msg, idx) => (
          <ChatMessage key={idx} role={msg.role} content={msg.content} />
        ))}
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4 mb-6"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary flex-shrink-0">
              <img src={aiCharacter} alt="AI" className="w-full h-full object-cover" />
            </div>
            <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl px-5 py-4 shadow-lg">
              <div className="flex items-center gap-3">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area - Netflix style */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-t border-border/30 bg-background/95 backdrop-blur-md p-4 md:p-6"
      >
        <div className="max-w-4xl mx-auto flex gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about DeFi, NFTs, STX Stacking, sBTC..."
            className="resize-none bg-muted/50 border border-border/50 focus:border-primary/50 text-foreground placeholder:text-muted-foreground rounded-xl text-base min-h-[56px] py-4"
            rows={1}
          />
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            size="lg"
            className="h-auto px-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-primary/20"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatInterface;