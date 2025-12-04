import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import aiCharacter from "@/assets/ai-character.jpg";
import VoiceControls from "./VoiceControls";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

const ChatMessage = ({ role, content }: ChatMessageProps) => {
  const isAssistant = role === "assistant";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 mb-4 ${isAssistant ? "justify-start" : "justify-end"}`}
    >
      {isAssistant && (
        <div className="w-8 h-8 rounded-full overflow-hidden border border-border flex-shrink-0">
          <img src={aiCharacter} alt="Stacks AI Guide" className="w-full h-full object-cover" />
        </div>
      )}
      <div
        className={`max-w-[75%] px-4 py-3 ${
          isAssistant
            ? "bg-card border border-border text-card-foreground"
            : "bg-foreground text-background"
        }`}
      >
        {isAssistant ? (
          <div className="prose prose-sm max-w-none text-foreground">
            <ReactMarkdown
              components={{
                code({ className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || "");
                  const isInline = !match;
                  
                  return !isInline ? (
                    <pre className="bg-muted rounded p-3 overflow-x-auto my-2 text-xs">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  ) : (
                    <code className="bg-muted px-1 py-0.5 rounded text-xs" {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="whitespace-pre-wrap leading-relaxed text-sm">{content}</p>
        )}
        {isAssistant && content.length > 20 && (
          <div className="mt-2 pt-2 border-t border-border flex justify-end">
            <VoiceControls text={content} />
          </div>
        )}
      </div>
      {!isAssistant && (
        <div className="w-8 h-8 border border-foreground/20 flex items-center justify-center flex-shrink-0 bg-background">
          <span className="text-sm">👤</span>
        </div>
      )}
    </motion.div>
  );
};

export default ChatMessage;
