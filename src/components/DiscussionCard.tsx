import { useEffect, useState } from "react";
import { ArrowBigUp, ArrowBigDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import KnowledgeComments from "@/components/KnowledgeComments";
import { toast } from "sonner";

interface DiscussionCardProps {
  id: string;
  topic: string;
  content: string;
  category: string;
  upvotes: number;
  createdAt: string;
  categoryCls: string;
  timeAgo: (iso: string) => string;
}

const DiscussionCard = ({
  id, topic, content, category, upvotes, createdAt, categoryCls, timeAgo,
}: DiscussionCardProps) => {
  const { user } = useAuth();
  const [score, setScore] = useState(upvotes);
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => { setScore(upvotes); }, [upvotes]);

  useEffect(() => {
    if (!user) { setVote(null); return; }
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("knowledge_votes")
        .select("vote_type")
        .eq("user_id", user.id)
        .eq("entry_id", id)
        .maybeSingle();
      if (active) setVote((data?.vote_type as "up" | "down") ?? null);
    })();
    return () => { active = false; };
  }, [user, id]);

  const castVote = async (next: "up" | "down") => {
    if (!user) { toast.error("Sign in to vote"); return; }
    const prevVote = vote;
    const prevScore = score;
    const value = (v: "up" | "down" | null) => (v === "up" ? 1 : v === "down" ? -1 : 0);
    const newVote = prevVote === next ? null : next;
    setVote(newVote);
    setScore(prevScore + value(newVote) - value(prevVote));

    try {
      if (!newVote) {
        const { error } = await supabase.from("knowledge_votes").delete()
          .eq("user_id", user.id).eq("entry_id", id);
        if (error) throw error;
      } else if (prevVote) {
        const { error } = await supabase.from("knowledge_votes")
          .update({ vote_type: newVote }).eq("user_id", user.id).eq("entry_id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("knowledge_votes")
          .insert({ user_id: user.id, entry_id: id, vote_type: newVote });
        if (error) throw error;
      }
    } catch (e) {
      console.error("Vote failed:", e);
      toast.error("Vote failed");
      setVote(prevVote);
      setScore(prevScore);
    }
  };

  return (
    <Card className="hover:bg-accent/40 transition-colors">
      <CardContent className="py-4">
        <div className="flex gap-3">
          <div className="flex flex-col items-center pt-0.5">
            <button onClick={() => castVote("up")} aria-label="Like"
              className={`transition-colors ${vote === "up" ? "text-green-500" : "text-muted-foreground hover:text-green-500"}`}>
              <ArrowBigUp className={`h-5 w-5 ${vote === "up" ? "fill-current" : ""}`} />
            </button>
            <span className={`text-xs font-semibold tabular-nums ${
              score > 0 ? "text-green-500" : score < 0 ? "text-red-500" : "text-muted-foreground"}`}>
              {score}
            </span>
            <button onClick={() => castVote("down")} aria-label="Dislike"
              className={`transition-colors ${vote === "down" ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}>
              <ArrowBigDown className={`h-5 w-5 ${vote === "down" ? "fill-current" : ""}`} />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <button onClick={() => setExpanded((e) => !e)}
              className="text-left font-semibold leading-snug hover:text-primary transition-colors">
              {topic}
            </button>
            <p className={`text-sm text-muted-foreground mt-1 ${expanded ? "" : "line-clamp-3"}`}>{content}</p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${categoryCls}`}>{category}</Badge>
              <span className="text-[11px] text-muted-foreground">{timeAgo(createdAt)}</span>
            </div>
            <div className="mt-2">
              <KnowledgeComments entryId={id} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiscussionCard;
