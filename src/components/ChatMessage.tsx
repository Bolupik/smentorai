import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Image, Loader2, X, Laugh, User, Volume2 } from "lucide-react";
import { Button } from "./ui/button";
import aiCharacter from "@/assets/ai-character.png";
import VoiceControls from "./VoiceControls";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";

type ImageMode = "infographic" | "meme" | "character";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  images?: string[];
}

const ChatMessage = ({ role, content, images = [] }: ChatMessageProps) => {
  const isAssistant = role === "assistant";
  const [generatingMode, setGeneratingMode] = useState<ImageMode | null>(null);
  const [generatedImages, setGeneratedImages] = useState<{ url: string; mode: ImageMode }[]>([]);
  const [showFullImage, setShowFullImage] = useState<string | null>(null);
  const { toast } = useToast();

  const generateImage = async (mode: ImageMode) => {
    setGeneratingMode(mode);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) {
        toast({ title: "Login Required", description: "Please log in to generate images.", variant: "destructive" });
        return;
      }
      const topic = content.split(".")[0].slice(0, 150);
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-infographic`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({ topic, context: content.slice(0, 500), mode }),
        }
      );
      if (!response.ok) {
        if (response.status === 429) { toast({ title: "Rate Limited", description: "Too many requests. Please wait.", variant: "destructive" }); return; }
        if (response.status === 402) { toast({ title: "Credits Depleted", description: "AI credits exhausted.", variant: "destructive" }); return; }
        throw new Error("Failed");
      }
      const data = await response.json();
      if (data.imageUrl) {
        setGeneratedImages((prev) => [...prev, { url: data.imageUrl, mode }]);
        const labels: Record<ImageMode, string> = { infographic: "Infographic", meme: "Meme", character: "Character" };
        toast({ title: `${labels[mode]} Generated!`, description: "Image created successfully." });
      }
    } catch {
      toast({ title: "Error", description: "Failed to generate image.", variant: "destructive" });
    } finally {
      setGeneratingMode(null);
    }
  };

  const allImages = [...images, ...generatedImages.map((i) => i.url)];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`flex gap-3 ${isAssistant ? "justify-start" : "justify-end"} mb-8`}
    >
      {/* Avatar — AI */}
      {isAssistant && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.08, type: "spring", stiffness: 260, damping: 20 }}
          className="w-9 h-9 rounded-full overflow-hidden border border-primary/40 flex-shrink-0 shadow-md shadow-primary/10 mt-1"
        >
          <img src={aiCharacter} alt="Sammy" className="w-full h-full object-cover" />
        </motion.div>
      )}

      <div className={`flex flex-col gap-1 ${isAssistant ? "items-start" : "items-end"} min-w-0 flex-1 max-w-[78%] md:max-w-[68%]`}>
        {/* Label */}
        <span className="text-[11px] font-medium tracking-wide text-muted-foreground/60 px-1">
          {isAssistant ? "Sammy" : "You"}
        </span>

        {/* Bubble */}
        <motion.div
          initial={{ opacity: 0, x: isAssistant ? -8 : 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.08, duration: 0.3 }}
          className={
            isAssistant
              ? "w-full bg-card border border-border/40 text-card-foreground rounded-2xl rounded-tl-md shadow-sm"
              : "bg-primary text-primary-foreground rounded-2xl rounded-tr-md shadow-md shadow-primary/25"
          }
        >
          {isAssistant ? (
            <div className="px-5 py-5">
              {/* Markdown content with rich typography */}
              <div
                className="prose max-w-none
                  text-foreground
                  prose-headings:text-foreground
                  prose-headings:font-bold
                  prose-headings:tracking-tight
                  prose-strong:text-foreground
                  prose-strong:font-semibold
                  prose-em:text-foreground/80
                  prose-code:text-primary
                  prose-a:text-primary
                  prose-a:no-underline
                  prose-a:border-b
                  prose-a:border-primary/40
                  hover:prose-a:border-primary"
              >
                <ReactMarkdown
                  components={{
                    // ── Headings ────────────────────────────────────────────
                    h1: ({ children }) => (
                      <h1 className="text-[1.2rem] font-bold mt-7 mb-3 pb-2 border-b border-border/30 leading-snug">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-[1.05rem] font-bold mt-6 mb-2.5 leading-snug">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-[0.95rem] font-semibold mt-5 mb-2 leading-snug text-foreground/90">
                        {children}
                      </h3>
                    ),

                    // ── Paragraph ────────────────────────────────────────────
                    p: ({ children }) => (
                      <p className="text-[15px] leading-[1.85] mb-4 text-foreground/90 last:mb-0">
                        {children}
                      </p>
                    ),

                    // ── Lists ───────────────────────────────────────────────
                    ul: ({ children }) => (
                      <ul className="my-4 space-y-2 pl-5 list-none">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="my-4 space-y-2 pl-5 list-decimal marker:text-primary/60 marker:font-medium">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-[15px] leading-[1.78] text-foreground/90 flex gap-2 items-start">
                        <span className="mt-[6px] w-[5px] h-[5px] rounded-full bg-primary/60 flex-shrink-0" />
                        <span>{children}</span>
                      </li>
                    ),

                    // ── Code ────────────────────────────────────────────────
                    code({ className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || "");
                      const isInline = !match;
                      return !isInline ? (
                        <pre className="bg-muted/70 rounded-xl px-5 py-4 overflow-x-auto my-5 text-[13px] border border-border/40 leading-relaxed font-mono">
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                      ) : (
                        <code
                          className="bg-primary/10 text-primary px-1.5 py-[2px] rounded-md text-[13px] font-mono"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },

                    // ── Blockquote ──────────────────────────────────────────
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-[3px] border-primary/50 pl-4 my-5 text-[14.5px] italic text-muted-foreground leading-[1.8] bg-muted/20 rounded-r-lg py-2 pr-3">
                        {children}
                      </blockquote>
                    ),

                    // ── HR ──────────────────────────────────────────────────
                    hr: () => <hr className="my-6 border-border/30" />,

                    // ── Links ───────────────────────────────────────────────
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary border-b border-primary/40 hover:border-primary transition-colors duration-150 no-underline"
                      >
                        {children}
                      </a>
                    ),

                    // ── Strong / Em ─────────────────────────────────────────
                    strong: ({ children }) => (
                      <strong className="font-semibold text-foreground">{children}</strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic text-foreground/80">{children}</em>
                    ),
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>

              {/* Images */}
              {allImages.length > 0 && (
                <div className="mt-5 space-y-3">
                  {allImages.map((img, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group rounded-xl overflow-hidden border border-border/40"
                    >
                      <img
                        src={img}
                        alt="Visual"
                        className="w-full cursor-zoom-in hover:opacity-95 transition-opacity"
                        onClick={() => setShowFullImage(img)}
                      />
                      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="secondary" className="h-7 px-3 text-xs shadow"
                          onClick={() => {
                            const a = document.createElement("a");
                            a.href = img; a.download = "stacks-visual.png"; a.click();
                          }}
                        >
                          Download
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Action toolbar */}
              {content.length > 20 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-5 pt-3.5 border-t border-border/25 flex items-center justify-between gap-2 flex-wrap"
                >
                  <div className="flex gap-1.5 flex-wrap">
                    {(["infographic", "meme", "character"] as ImageMode[]).map((mode) => {
                      const icons: Record<ImageMode, React.ReactNode> = {
                        infographic: <Image className="w-3 h-3" />,
                        meme: <Laugh className="w-3 h-3" />,
                        character: <User className="w-3 h-3" />,
                      };
                      const labels: Record<ImageMode, string> = {
                        infographic: "Infographic",
                        meme: "Meme",
                        character: "Character",
                      };
                      return (
                        <Button
                          key={mode}
                          size="sm"
                          variant="ghost"
                          onClick={() => generateImage(mode)}
                          disabled={generatingMode !== null}
                          className="h-7 px-2.5 text-[11px] text-muted-foreground hover:text-foreground gap-1.5 border border-border/40 hover:border-border/70 rounded-lg"
                        >
                          {generatingMode === mode ? (
                            <><Loader2 className="w-3 h-3 animate-spin" />Generating…</>
                          ) : (
                            <>{icons[mode]}{labels[mode]}</>
                          )}
                        </Button>
                      );
                    })}
                  </div>
                  <VoiceControls text={content} />
                </motion.div>
              )}
            </div>
          ) : (
            /* User bubble */
            <div className="px-5 py-4">
              <p className="text-[15px] leading-[1.75] whitespace-pre-wrap break-words">
                {content}
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Avatar — User */}
      {!isAssistant && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.08, type: "spring", stiffness: 260, damping: 20 }}
          className="w-9 h-9 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0 mt-5"
        >
          <span className="text-[10px] font-bold text-primary tracking-wider">YOU</span>
        </motion.div>
      )}

      {/* Full-screen image lightbox */}
      <AnimatePresence>
        {showFullImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-6"
            onClick={() => setShowFullImage(null)}
          >
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10 rounded-full"
              onClick={() => setShowFullImage(null)}
            >
              <X className="w-5 h-5" />
            </Button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={showFullImage}
              alt="Visual"
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ChatMessage;
