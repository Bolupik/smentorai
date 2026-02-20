import { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Image, Loader2, X, Laugh, User } from "lucide-react";
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
  const [showFullImage, setShowFullImage] = useState(false);
  const { toast } = useToast();

  const generateImage = async (mode: ImageMode) => {
    setGeneratingMode(mode);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      if (!accessToken) {
        toast({
          title: "Login Required",
          description: "Please log in to generate images.",
          variant: "destructive",
        });
        return;
      }

      const topic = content.split('.')[0].slice(0, 150);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-infographic`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ 
            topic,
            context: content.slice(0, 500),
            mode
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          toast({ title: "Rate Limited", description: "Too many requests. Please wait a moment.", variant: "destructive" });
          return;
        }
        if (response.status === 402) {
          toast({ title: "Credits Depleted", description: "AI credits have run out.", variant: "destructive" });
          return;
        }
        throw new Error("Failed to generate image");
      }

      const data = await response.json();
      if (data.imageUrl) {
        setGeneratedImages(prev => [...prev, { url: data.imageUrl, mode }]);
        const labels: Record<ImageMode, string> = { infographic: "Infographic", meme: "Meme", character: "Character" };
        toast({ title: `${labels[mode]} Generated!`, description: "Image created successfully." });
      } else if (data.fallback) {
        toast({ title: "Generation Unavailable", description: "Could not generate image for this content.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Image generation error:", error);
      toast({ title: "Error", description: "Failed to generate image.", variant: "destructive" });
    } finally {
      setGeneratingMode(null);
    }
  };

  const allImages = [...images, ...generatedImages.map(i => i.url)];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, type: "spring" }}
      className={`flex gap-4 mb-6 ${isAssistant ? "justify-start" : "justify-end"}`}
    >
      {isAssistant && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring" }}
          className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary flex-shrink-0 shadow-lg shadow-primary/20"
        >
          <img src={aiCharacter} alt="Stacks AI Guide" className="w-full h-full object-cover" />
        </motion.div>
      )}
      <motion.div
        initial={{ opacity: 0, x: isAssistant ? -10 : 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className={`max-w-[80%] md:max-w-[70%] ${
          isAssistant
            ? "bg-card/80 backdrop-blur-sm border border-border/50 text-card-foreground rounded-2xl rounded-tl-sm shadow-lg"
            : "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm shadow-lg shadow-primary/20"
        } px-5 py-4`}
      >
        {isAssistant ? (
          <div className="prose prose-base max-w-none text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-code:text-primary prose-p:text-[15px] prose-li:text-[15px]">
            <ReactMarkdown
              components={{
                code({ className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || "");
                  const isInline = !match;
                  
                  return !isInline ? (
                    <pre className="bg-muted/80 rounded-lg p-4 overflow-x-auto my-4 text-sm border border-border/50">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  ) : (
                    <code className="bg-muted/80 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                      {children}
                    </code>
                  );
                },
                h1: ({ children }) => <h1 className="text-xl font-bold mb-4 mt-6">{children}</h1>,
                h2: ({ children }) => <h2 className="text-lg font-semibold mb-3 mt-5">{children}</h2>,
                h3: ({ children }) => <h3 className="text-base font-semibold mb-2 mt-4">{children}</h3>,
                p: ({ children }) => <p className="mb-5 leading-[1.8] text-[15px]">{children}</p>,
                ul: ({ children }) => <ul className="mb-4 space-y-2 list-disc pl-5">{children}</ul>,
                ol: ({ children }) => <ol className="mb-4 space-y-2 list-decimal pl-5">{children}</ol>,
                li: ({ children }) => <li className="leading-[1.7] text-[15px] pl-1">{children}</li>,
                hr: () => <hr className="my-5 border-border/40" />,
                blockquote: ({ children }) => <blockquote className="border-l-2 border-primary/50 pl-4 my-4 italic text-muted-foreground">{children}</blockquote>,
                a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80">{children}</a>,
              }}
            >
              {content}
            </ReactMarkdown>
            
            {/* Display images/infographics */}
            {allImages.length > 0 && (
              <div className="mt-4 space-y-3">
                {allImages.map((img, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative group"
                  >
                    <img
                      src={img}
                      alt="Infographic"
                      className="rounded-lg border border-border/50 w-full cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setShowFullImage(true)}
                    />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 px-2"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = img;
                          link.download = 'stacks-infographic.png';
                          link.click();
                        }}
                      >
                        Download
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
        )}
        
        {isAssistant && content.length > 20 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 pt-3 border-t border-border/30 flex justify-between items-center gap-2 flex-wrap"
          >
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => generateImage("infographic")}
                disabled={generatingMode !== null}
                className="text-xs gap-1.5"
              >
                {generatingMode === "infographic" ? (
                  <><Loader2 className="w-3 h-3 animate-spin" />Creating...</>
                ) : (
                  <><Image className="w-3 h-3" />Infographic</>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => generateImage("meme")}
                disabled={generatingMode !== null}
                className="text-xs gap-1.5"
              >
                {generatingMode === "meme" ? (
                  <><Loader2 className="w-3 h-3 animate-spin" />Creating...</>
                ) : (
                  <><Laugh className="w-3 h-3" />Meme</>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => generateImage("character")}
                disabled={generatingMode !== null}
                className="text-xs gap-1.5"
              >
                {generatingMode === "character" ? (
                  <><Loader2 className="w-3 h-3 animate-spin" />Creating...</>
                ) : (
                  <><User className="w-3 h-3" />Character</>
                )}
              </Button>
            </div>
            <VoiceControls text={content} />
          </motion.div>
        )}
      </motion.div>
      
      {!isAssistant && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring" }}
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0 border border-border/50"
        >
          <span className="text-xs font-bold text-foreground">YOU</span>
        </motion.div>
      )}

      {/* Full-screen image modal */}
      {showFullImage && allImages.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowFullImage(false)}
        >
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={() => setShowFullImage(false)}
          >
            <X className="w-6 h-6" />
          </Button>
          <img
            src={allImages[0]}
            alt="Infographic"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </motion.div>
      )}
    </motion.div>
  );
};

export default ChatMessage;
