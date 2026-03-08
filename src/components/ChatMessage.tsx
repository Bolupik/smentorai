import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Image, Loader2, X, Laugh, User, Sparkles, Wand2, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
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

const MODE_META: Record<ImageMode, {
  label: string;
  icon: React.ReactNode;
  emoji: string;
  description: string;
  placeholder: string;
  gradient: string;
}> = {
  infographic: {
    label: "Infographic",
    icon: <Image className="w-4 h-4" />,
    emoji: "📊",
    description: "A professional visual breakdown of any concept",
    placeholder: "e.g. Show how Proof of Transfer works step by step, with a flow diagram and key stats…",
    gradient: "from-blue-500/10 to-cyan-500/10 border-blue-500/20",
  },
  meme: {
    label: "Meme",
    icon: <Laugh className="w-4 h-4" />,
    emoji: "😂",
    description: "A shareable, funny crypto meme",
    placeholder: "e.g. Make a meme about diamond hands during a Bitcoin crash, featuring a bear looking terrified…",
    gradient: "from-yellow-500/10 to-orange-500/10 border-yellow-500/20",
  },
  character: {
    label: "Character",
    icon: <User className="w-4 h-4" />,
    emoji: "🎨",
    description: "An anime-style mascot for any Stacks concept",
    placeholder: "e.g. A warrior character representing sBTC with a glowing Bitcoin shield and Stacks armor…",
    gradient: "from-purple-500/10 to-pink-500/10 border-purple-500/20",
  },
};

const ChatMessage = ({ role, content, images = [] }: ChatMessageProps) => {
  const isAssistant = role === "assistant";

  // Image prompt dialog state
  const [dialogMode, setDialogMode] = useState<ImageMode | null>(null);
  const [userPrompt, setUserPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Generated images
  const [generatedImages, setGeneratedImages] = useState<{ url: string; mode: ImageMode; prompt: string }[]>([]);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const { toast } = useToast();

  const openDialog = (mode: ImageMode) => {
    setUserPrompt("");
    setDialogMode(mode);
  };

  const closeDialog = () => {
    if (!isGenerating) setDialogMode(null);
  };

  const handleGenerate = async () => {
    if (!dialogMode || !userPrompt.trim()) return;
    setIsGenerating(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) {
        toast({ title: "Login Required", description: "Please log in to generate images.", variant: "destructive" });
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-infographic`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({
            topic: userPrompt.slice(0, 150),
            context: `${userPrompt}\n\nRelated AI response context: ${content.slice(0, 400)}`,
            mode: dialogMode,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) { toast({ title: "Rate Limited", description: "Please wait a moment.", variant: "destructive" }); return; }
        if (response.status === 402) { toast({ title: "Credits Depleted", description: "AI credits exhausted.", variant: "destructive" }); return; }
        throw new Error("Failed");
      }

      const data = await response.json();
      if (data.imageUrl) {
        setGeneratedImages((prev) => [
          ...prev,
          { url: data.imageUrl, mode: dialogMode, prompt: userPrompt },
        ]);
        toast({ title: `${MODE_META[dialogMode].emoji} ${MODE_META[dialogMode].label} Created!`, description: "Your image is ready." });
        setDialogMode(null);
      } else {
        toast({ title: "Couldn't generate", description: "Try rephrasing your description.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to generate image.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const allImages = [...images, ...generatedImages.map((i) => i.url)];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`flex gap-3 ${isAssistant ? "justify-start" : "justify-end"} mb-8`}
      >
        {/* AI Avatar */}
        {isAssistant && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.08, type: "spring", stiffness: 260, damping: 20 }}
            className="w-9 h-9 rounded-full overflow-hidden border border-primary/40 flex-shrink-0 shadow-md shadow-primary/10 mt-6"
          >
            <img src={aiCharacter} alt="Sammy" className="w-full h-full object-cover" />
          </motion.div>
        )}

        <div className={`flex flex-col gap-1 ${isAssistant ? "items-start" : "items-end"} min-w-0 flex-1 max-w-[78%] md:max-w-[68%]`}>
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
                {/* Markdown */}
                <div className="prose max-w-none text-foreground prose-headings:text-foreground prose-headings:font-bold prose-headings:tracking-tight prose-strong:text-foreground prose-strong:font-semibold prose-em:text-foreground/80 prose-code:text-primary">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => <h1 className="text-[1.2rem] font-bold mt-7 mb-3 pb-2 border-b border-border/30 leading-snug">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-[1.05rem] font-bold mt-6 mb-2.5 leading-snug">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-[0.95rem] font-semibold mt-5 mb-2 leading-snug text-foreground/90">{children}</h3>,
                      p: ({ children }) => <p className="text-[15px] leading-[1.85] mb-4 text-foreground/90 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="my-4 space-y-2 pl-1 list-none">{children}</ul>,
                      ol: ({ children }) => <ol className="my-4 space-y-2 pl-5 list-decimal marker:text-primary/60 marker:font-medium">{children}</ol>,
                      li: ({ children }) => (
                        <li className="text-[15px] leading-[1.78] text-foreground/90 flex gap-2 items-start">
                          <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-primary/60 flex-shrink-0" />
                          <span>{children}</span>
                        </li>
                      ),
                      code({ className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || "");
                        return !match ? (
                          <code className="bg-primary/10 text-primary px-1.5 py-[2px] rounded-md text-[13px] font-mono" {...props}>{children}</code>
                        ) : (
                          <pre className="bg-muted/70 rounded-xl px-5 py-4 overflow-x-auto my-5 text-[13px] border border-border/40 leading-relaxed font-mono">
                            <code className={className} {...props}>{children}</code>
                          </pre>
                        );
                      },
                      blockquote: ({ children }) => <blockquote className="border-l-[3px] border-primary/50 pl-4 my-5 text-[14.5px] italic text-muted-foreground leading-[1.8] bg-muted/20 rounded-r-lg py-2 pr-3">{children}</blockquote>,
                      hr: () => <hr className="my-6 border-border/30" />,
                      a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary border-b border-primary/40 hover:border-primary transition-colors duration-150 no-underline">{children}</a>,
                      strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                      em: ({ children }) => <em className="italic text-foreground/80">{children}</em>,
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                </div>

                {/* Generated images */}
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
                          onClick={() => setLightboxSrc(img)}
                        />
                        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="secondary" className="h-7 px-3 text-xs shadow"
                            onClick={() => { const a = document.createElement("a"); a.href = img; a.download = "smentor-visual.png"; a.click(); }}>
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
                    <div className="flex gap-1.5 flex-wrap items-center">
                      <span className="text-[11px] text-muted-foreground/50 mr-1">Create visual:</span>
                      {(["infographic", "meme", "character"] as ImageMode[]).map((mode) => (
                        <Button
                          key={mode}
                          size="sm"
                          variant="ghost"
                          onClick={() => openDialog(mode)}
                          className="h-7 px-2.5 text-[11px] text-muted-foreground hover:text-foreground gap-1.5 border border-border/40 hover:border-primary/40 hover:bg-primary/5 rounded-lg transition-all duration-150"
                        >
                          <span>{MODE_META[mode].emoji}</span>
                          {MODE_META[mode].label}
                        </Button>
                      ))}
                    </div>
                    <VoiceControls text={content} />
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="px-5 py-4">
                <p className="text-[15px] leading-[1.75] whitespace-pre-wrap break-words">{content}</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* User avatar */}
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
      </motion.div>

      {/* ── Image Prompt Dialog ───────────────────────────────────────────── */}
      <AnimatePresence>
        {dialogMode && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={closeDialog}
            />

            {/* Dialog */}
            <motion.div
              key="dialog"
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="fixed bottom-0 left-0 right-0 md:inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6 pointer-events-none"
            >
              <div className={`w-full max-w-lg pointer-events-auto bg-card border rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden border-border/50 bg-gradient-to-b ${MODE_META[dialogMode].gradient}`}>
                {/* Header */}
                <div className="px-6 pt-6 pb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-xl">
                      {MODE_META[dialogMode].emoji}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground leading-tight">
                        Create {MODE_META[dialogMode].label}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {MODE_META[dialogMode].description}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={closeDialog}
                    disabled={isGenerating}
                    className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground -mt-1 -mr-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Prompt input */}
                <div className="px-6 pb-3">
                  <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                    Describe your image
                  </label>
                  <Textarea
                    autoFocus
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey && userPrompt.trim()) {
                        e.preventDefault();
                        handleGenerate();
                      }
                    }}
                    placeholder={MODE_META[dialogMode].placeholder}
                    rows={3}
                    disabled={isGenerating}
                    className="resize-none bg-background/60 border-border/50 focus:border-primary/60 focus:ring-0 rounded-xl text-[14px] leading-[1.7] placeholder:text-muted-foreground/50 transition-colors"
                  />
                  <p className="text-[11px] text-muted-foreground/40 mt-1.5">
                    Be descriptive — the more detail, the better the result. Enter to generate.
                  </p>
                </div>

                {/* Quick suggestion chips */}
                {!userPrompt && (
                  <div className="px-6 pb-4">
                    <p className="text-[11px] text-muted-foreground/50 mb-2">Quick starts:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {dialogMode === "infographic" && [
                        "How sBTC bridges Bitcoin to Stacks",
                        "Proof of Transfer consensus mechanism",
                        "Clarity smart contract security model",
                      ].map((s) => (
                        <button key={s} onClick={() => setUserPrompt(s)}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-muted/60 border border-border/40 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all">
                          {s}
                        </button>
                      ))}
                      {dialogMode === "meme" && [
                        "Bitcoin maximalists discovering Stacks",
                        "Waiting for the next Stacks bull run",
                        "Clarity devs vs Solidity devs",
                      ].map((s) => (
                        <button key={s} onClick={() => setUserPrompt(s)}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-muted/60 border border-border/40 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all">
                          {s}
                        </button>
                      ))}
                      {dialogMode === "character" && [
                        "Bitcoin guardian warrior with STX shield",
                        "DeFi wizard casting liquidity spells",
                        "sBTC samurai bridging two worlds",
                      ].map((s) => (
                        <button key={s} onClick={() => setUserPrompt(s)}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-muted/60 border border-border/40 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all">
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Generate button */}
                <div className="px-6 pb-6">
                  <Button
                    onClick={handleGenerate}
                    disabled={!userPrompt.trim() || isGenerating}
                    className="w-full h-12 text-base font-semibold rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
                  >
                    {isGenerating ? (
                      <span className="flex items-center gap-2.5">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating your {MODE_META[dialogMode].label.toLowerCase()}…
                      </span>
                    ) : (
                      <span className="flex items-center gap-2.5">
                        <Wand2 className="w-4 h-4" />
                        Generate {MODE_META[dialogMode].label}
                        <ArrowRight className="w-4 h-4 ml-auto" />
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Lightbox ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxSrc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-6"
            onClick={() => setLightboxSrc(null)}
          >
            <Button size="icon" variant="ghost"
              className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10 rounded-full"
              onClick={() => setLightboxSrc(null)}>
              <X className="w-5 h-5" />
            </Button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={lightboxSrc}
              alt="Visual"
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatMessage;
