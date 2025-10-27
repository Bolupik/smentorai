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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`flex gap-4 mb-6 ${isAssistant ? "justify-start" : "justify-end"}`}
    >
      {isAssistant && (
        <div className="w-12 h-12 rounded-full overflow-hidden border-3 border-primary toxic-glow flex-shrink-0">
          <img src={aiCharacter} alt="Cyberpunk AI Guide" className="w-full h-full object-cover" />
        </div>
      )}
      <div
        className={`max-w-[70%] rounded-2xl px-6 py-4 ${
          isAssistant
            ? "bg-card/80 border-2 border-primary/40 text-card-foreground backdrop-blur-sm"
            : "bg-primary text-primary-foreground border-2 border-primary-foreground/20"
        }`}
        style={isAssistant ? { boxShadow: "0 4px 15px hsl(25 100% 50% / 0.2)" } : {}}
      >
        {isAssistant ? (
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              components={{
                code({ className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || "");
                  const isInline = !match;
                  
                  return !isInline ? (
                    <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto my-2">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  ) : (
                    <code className="bg-gray-800 px-1.5 py-0.5 rounded text-sm" {...props}>
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
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 border-3 border-accent/50 toxic-glow">
          <span className="text-xl font-bold">🧙</span>
        </div>
      )}
    </motion.div>
  );
};

export default ChatMessage;
