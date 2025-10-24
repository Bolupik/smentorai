import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`flex gap-4 mb-6 ${isAssistant ? "justify-start" : "justify-end"}`}
    >
      {isAssistant && (
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary animate-pulse-glow flex-shrink-0">
          <img src={aiCharacter} alt="AI Guide" className="w-full h-full object-cover" />
        </div>
      )}
      <div
        className={`max-w-[70%] rounded-2xl px-6 py-4 ${
          isAssistant
            ? "bg-card border border-primary/30 text-card-foreground"
            : "bg-primary text-primary-foreground"
        }`}
      >
        {isAssistant ? (
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              components={{
                code({ className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || "");
                  const isInline = !match;
                  
                  return !isInline ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus as any}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
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
          <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
        )}
        {isAssistant && content.length > 20 && (
          <div className="mt-3 pt-3 border-t border-primary/20 flex justify-end">
            <VoiceControls text={content} />
          </div>
        )}
      </div>
      {!isAssistant && (
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 border-2 border-accent">
          <span className="text-lg font-bold">U</span>
        </div>
      )}
    </motion.div>
  );
};

export default ChatMessage;
