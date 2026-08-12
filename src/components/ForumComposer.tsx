import { useRef, useState } from "react";
import {
  Bold, Italic, Code, Link2, Image as ImageIcon, List, ListOrdered,
  Quote, Heading2, Eye, Pencil, Send, Loader2, Sparkles, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import MarkdownContent from "@/components/MarkdownContent";

export interface ComposerCategory { id: string; label: string; cls: string }

interface Props {
  categories: ComposerCategory[];
  category: string;
  onCategoryChange: (c: string) => void;
  title: string;
  onTitleChange: (t: string) => void;
  body: string;
  onBodyChange: (b: string) => void;
  posting: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

const MAX_TITLE = 140;
const MAX_BODY = 5000;

const ForumComposer = ({
  categories, category, onCategoryChange, title, onTitleChange,
  body, onBodyChange, posting, onSubmit, onCancel,
}: Props) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [tab, setTab] = useState("write");
  const [linkOpen, setLinkOpen] = useState<null | "link" | "image">(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");

  const surround = (before: string, after = before, placeholder = "text") => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart ?? body.length;
    const end = el.selectionEnd ?? body.length;
    const sel = body.slice(start, end) || placeholder;
    const next = body.slice(0, start) + before + sel + after + body.slice(end);
    onBodyChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + sel.length);
    });
  };

  const prefixLine = (prefix: string) => {
    const el = ref.current;
    const start = el?.selectionStart ?? body.length;
    const lineStart = body.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
    onBodyChange(body.slice(0, lineStart) + prefix + body.slice(lineStart));
    requestAnimationFrame(() => el?.focus());
  };

  const insertEmbed = () => {
    if (!linkUrl.trim()) return;
    const md = linkOpen === "image"
      ? `\n![${linkText.trim() || "image"}](${linkUrl.trim()})\n`
      : `[${linkText.trim() || linkUrl.trim()}](${linkUrl.trim()})`;
    onBodyChange(body + (body && !body.endsWith("\n") && linkOpen === "image" ? "\n" : "") + md);
    setLinkUrl(""); setLinkText(""); setLinkOpen(null);
    requestAnimationFrame(() => ref.current?.focus());
  };

  const tools: { icon: typeof Bold; label: string; run: () => void }[] = [
    { icon: Bold, label: "Bold", run: () => surround("**", "**", "bold") },
    { icon: Italic, label: "Italic", run: () => surround("*", "*", "italic") },
    { icon: Heading2, label: "Heading", run: () => prefixLine("## ") },
    { icon: Code, label: "Code", run: () => surround("`", "`", "code") },
    { icon: List, label: "Bullet list", run: () => prefixLine("- ") },
    { icon: ListOrdered, label: "Numbered list", run: () => prefixLine("1. ") },
    { icon: Quote, label: "Quote", run: () => prefixLine("> ") },
    { icon: Link2, label: "Insert link", run: () => setLinkOpen("link") },
    { icon: ImageIcon, label: "Embed image", run: () => setLinkOpen("image") },
  ];

  const canPost = !!title.trim() && !!body.trim() && !posting;

  return (
    <Card className="border-primary/30 shadow-lg shadow-primary/5 overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/40 to-transparent" />
      <CardContent className="py-4 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Create a post</span>
          <Button variant="ghost" size="sm" className="ml-auto h-7 px-2 text-xs" onClick={onCancel}>
            <X className="h-3.5 w-3.5 mr-1" /> Close
          </Button>
        </div>

        <div className="space-y-1">
          <Input
            placeholder="Give your post a clear title…"
            value={title}
            maxLength={MAX_TITLE}
            onChange={(e) => onTitleChange(e.target.value)}
            className="text-base font-medium h-11"
          />
          <div className="text-[10px] text-muted-foreground text-right">{title.length}/{MAX_TITLE}</div>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <div className="flex items-center gap-2 flex-wrap">
            <TabsList className="h-8">
              <TabsTrigger value="write" className="h-6 text-xs px-3"><Pencil className="h-3 w-3 mr-1" />Write</TabsTrigger>
              <TabsTrigger value="preview" className="h-6 text-xs px-3"><Eye className="h-3 w-3 mr-1" />Preview</TabsTrigger>
            </TabsList>
            {tab === "write" && (
              <TooltipProvider delayDuration={200}>
                <div className="flex items-center gap-0.5 flex-wrap rounded-lg border border-border/60 bg-muted/40 p-0.5">
                  {tools.map(({ icon: Icon, label, run }) => (
                    <Tooltip key={label}>
                      <TooltipTrigger asChild>
                        <button
                          type="button" onClick={run} aria-label={label}
                          className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">{label}</TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </TooltipProvider>
            )}
          </div>

          <TabsContent value="write" className="mt-2 space-y-2">
            <Textarea
              ref={ref}
              placeholder={"Share your thoughts…\n\n**bold**, *italic*, `code`, > quote\n- lists\n[link](https://stacks.co) and ![image](https://…)"}
              value={body}
              maxLength={MAX_BODY}
              onChange={(e) => onBodyChange(e.target.value)}
              className="min-h-[160px] text-sm leading-relaxed font-mono"
            />
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>Markdown supported</span>
              <span>{body.length}/{MAX_BODY}</span>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-2">
            <div className="min-h-[160px] rounded-lg border border-border/60 bg-muted/20 p-3 text-sm">
              {body.trim()
                ? <MarkdownContent content={body} />
                : <p className="text-muted-foreground text-xs">Nothing to preview yet.</p>}
            </div>
          </TabsContent>
        </Tabs>

        {linkOpen && (
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3 space-y-2">
            <div className="text-xs font-medium">
              {linkOpen === "image" ? "Embed an image" : "Insert a link"}
            </div>
            <Input
              autoFocus placeholder="https://…" value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)} className="h-9 text-sm"
            />
            <Input
              placeholder={linkOpen === "image" ? "Alt text (optional)" : "Link text (optional)"}
              value={linkText} onChange={(e) => setLinkText(e.target.value)} className="h-9 text-sm"
            />
            <div className="flex gap-2">
              <Button size="sm" className="h-8 text-xs" onClick={insertEmbed} disabled={!linkUrl.trim()}>Insert</Button>
              <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setLinkOpen(null)}>Cancel</Button>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <div className="text-[11px] font-medium text-muted-foreground">Category</div>
          <div className="flex gap-1.5 flex-wrap">
            {categories.map((c) => (
              <button
                key={c.id} type="button" onClick={() => onCategoryChange(c.id)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                  category === c.id
                    ? "bg-primary text-primary-foreground border-primary scale-105 shadow-sm"
                    : `${c.cls} hover:opacity-80`
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Button size="sm" onClick={onSubmit} disabled={!canPost} className="h-9 px-4">
            {posting ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Send className="h-4 w-4 mr-1.5" />}
            Publish post
          </Button>
          <Button size="sm" variant="ghost" onClick={onCancel} className="h-9">Discard</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ForumComposer;
