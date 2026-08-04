import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Plus, ArrowBigUp, ArrowBigDown, Loader2, Send,
  Trash2, Reply, Flame, Clock, X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ContributorBadge from "@/components/ContributorBadge";
import { toast } from "sonner";

interface ForumPost {
  id: string; user_id: string; title: string; content: string;
  category: string; score: number; comment_count: number; created_at: string;
}

interface ForumComment {
  id: string; post_id: string; parent_id: string | null; user_id: string;
  content: string; score: number; created_at: string;
}

type VoteMap = Record<string, 1 | -1>;

const CATEGORIES = ["general", "DeFi", "sBTC", "Development", "NFT", "Security", "Markets"];

const categoryCls: Record<string, string> = {
  general: "bg-muted/50 text-muted-foreground border-border/50",
  DeFi: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  sBTC: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Development: "bg-green-500/20 text-green-400 border-green-500/30",
  NFT: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  Security: "bg-red-500/20 text-red-400 border-red-500/30",
  Markets: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const VoteButtons = ({
  score, vote, onVote, size = "md",
}: { score: number; vote?: 1 | -1; onVote: (v: 1 | -1) => void; size?: "sm" | "md" }) => {
  const icon = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={(e) => { e.stopPropagation(); onVote(1); }}
        aria-label="Like"
        className={`transition-colors ${vote === 1 ? "text-green-500" : "text-muted-foreground hover:text-green-500"}`}
      >
        <ArrowBigUp className={`${icon} ${vote === 1 ? "fill-current" : ""}`} />
      </button>
      <span className={`text-xs font-semibold tabular-nums ${
        score > 0 ? "text-green-500" : score < 0 ? "text-red-500" : "text-muted-foreground"}`}>
        {score}
      </span>
      <button
        onClick={(e) => { e.stopPropagation(); onVote(-1); }}
        aria-label="Dislike"
        className={`transition-colors ${vote === -1 ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}
      >
        <ArrowBigDown className={`${icon} ${vote === -1 ? "fill-current" : ""}`} />
      </button>
    </div>
  );
};

const ForumPanel = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [votes, setVotes] = useState<VoteMap>({});
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<"hot" | "new">("hot");
  const [filter, setFilter] = useState<string>("all");
  const [composing, setComposing] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("general");
  const [posting, setPosting] = useState(false);
  const [openPost, setOpenPost] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const query = supabase.from("forum_posts").select("*").limit(50);
      const { data, error } = sort === "hot"
        ? await query.order("score", { ascending: false }).order("created_at", { ascending: false })
        : await query.order("created_at", { ascending: false });
      if (error) throw error;
      setPosts((data || []) as ForumPost[]);
    } catch (e) {
      console.error("Failed to load forum posts:", e);
    } finally {
      setLoading(false);
    }
  }, [sort]);

  const fetchVotes = useCallback(async () => {
    if (!user) { setVotes({}); return; }
    try {
      const { data, error } = await supabase
        .from("forum_votes")
        .select("target_type, target_id, value")
        .eq("user_id", user.id);
      if (error) throw error;
      const map: VoteMap = {};
      (data || []).forEach((v: any) => { map[`${v.target_type}:${v.target_id}`] = v.value; });
      setVotes(map);
    } catch (e) {
      console.error("Failed to load votes:", e);
    }
  }, [user]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);
  useEffect(() => { fetchVotes(); }, [fetchVotes]);

  const castVote = async (
    targetType: "post" | "comment",
    targetId: string,
    value: 1 | -1,
    applyDelta: (delta: number) => void,
  ) => {
    if (!user) { toast.error("Sign in to vote"); return; }
    const key = `${targetType}:${targetId}`;
    const current = votes[key];
    const next = current === value ? undefined : value;
    const delta = (next ?? 0) - (current ?? 0);

    setVotes((prev) => {
      const copy = { ...prev };
      if (next) copy[key] = next; else delete copy[key];
      return copy;
    });
    applyDelta(delta);

    try {
      if (!next) {
        const { error } = await supabase.from("forum_votes").delete()
          .eq("user_id", user.id).eq("target_type", targetType).eq("target_id", targetId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("forum_votes")
          .upsert({ user_id: user.id, target_type: targetType, target_id: targetId, value: next },
            { onConflict: "user_id,target_type,target_id" });
        if (error) throw error;
      }
    } catch (e) {
      console.error("Vote failed:", e);
      toast.error("Vote failed");
      applyDelta(-delta);
      setVotes((prev) => {
        const copy = { ...prev };
        if (current) copy[key] = current; else delete copy[key];
        return copy;
      });
    }
  };

  const submitPost = async () => {
    if (!user) { toast.error("Sign in to post"); return; }
    if (!title.trim() || !body.trim()) return;
    setPosting(true);
    try {
      const { error } = await supabase.from("forum_posts").insert({
        user_id: user.id, title: title.trim(), content: body.trim(), category,
      });
      if (error) throw error;
      setTitle(""); setBody(""); setCategory("general"); setComposing(false);
      toast.success("Post published");
      fetchPosts();
    } catch (e) {
      console.error("Failed to create post:", e);
      toast.error("Could not publish post");
    } finally {
      setPosting(false);
    }
  };

  const deletePost = async (id: string) => {
    try {
      const { error } = await supabase.from("forum_posts").delete().eq("id", id);
      if (error) throw error;
      setPosts((p) => p.filter((x) => x.id !== id));
      toast.success("Post deleted");
    } catch (e) {
      console.error("Delete failed:", e);
      toast.error("Could not delete post");
    }
  };

  const visible = posts.filter((p) => filter === "all" || p.category === filter);

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex gap-1">
          {(["hot", "new"] as const).map((s) => (
            <Button key={s} size="sm" variant={sort === s ? "default" : "outline"}
              className="h-7 px-3 text-xs capitalize" onClick={() => setSort(s)}>
              {s === "hot" ? <Flame className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
              {s}
            </Button>
          ))}
        </div>
        <Button size="sm" className="h-7 px-3 text-xs ml-auto"
          onClick={() => (user ? setComposing((c) => !c) : toast.error("Sign in to create a post"))}>
          {composing ? <X className="h-3 w-3 mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
          {composing ? "Cancel" : "New post"}
        </Button>
      </div>

      {/* Category chips */}
      <div className="flex gap-1.5 flex-wrap">
        {["all", ...CATEGORIES].map((c) => (
          <button key={c} onClick={() => setFilter(c)}
            className={`text-[11px] px-2 py-0.5 rounded-full border transition-colors ${
              filter === c ? "bg-primary text-primary-foreground border-primary"
                : categoryCls[c] ?? "bg-muted/50 text-muted-foreground border-border/50"}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Composer */}
      <AnimatePresence>
        {composing && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <Card>
              <CardContent className="py-4 space-y-3">
                <Input placeholder="Post title" value={title} maxLength={140}
                  onChange={(e) => setTitle(e.target.value)} />
                <Textarea placeholder="Share your thoughts with the community…" value={body}
                  onChange={(e) => setBody(e.target.value)} className="min-h-[90px]" />
                <div className="flex gap-1.5 flex-wrap">
                  {CATEGORIES.map((c) => (
                    <button key={c} onClick={() => setCategory(c)}
                      className={`text-[11px] px-2 py-0.5 rounded-full border transition-colors ${
                        category === c ? "bg-primary text-primary-foreground border-primary"
                          : categoryCls[c]}`}>
                      {c}
                    </button>
                  ))}
                </div>
                <Button size="sm" onClick={submitPost} disabled={posting || !title.trim() || !body.trim()}>
                  {posting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
                  Publish
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Posts */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : visible.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
            <h3 className="font-semibold mb-1">No posts yet</h3>
            <p className="text-sm text-muted-foreground">Start the first conversation in the community forum.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {visible.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}>
              <Card className="hover:bg-accent/40 transition-colors">
                <CardContent className="py-4">
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center pt-0.5">
                      <VoteButtons
                        score={post.score}
                        vote={votes[`post:${post.id}`]}
                        onVote={(v) => castVote("post", post.id, v, (d) =>
                          setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, score: p.score + d } : p)))}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <button onClick={() => setOpenPost(openPost === post.id ? null : post.id)}
                          className="text-left font-semibold leading-snug hover:text-primary transition-colors">
                          {post.title}
                        </button>
                        {user?.id === post.user_id && (
                          <button onClick={() => deletePost(post.id)} aria-label="Delete post"
                            className="text-muted-foreground hover:text-destructive transition-colors shrink-0">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap line-clamp-3">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${categoryCls[post.category] ?? ""}`}>
                          {post.category}
                        </Badge>
                        <ContributorBadge userId={post.user_id} />
                        <span className="text-[11px] text-muted-foreground">{timeAgo(post.created_at)}</span>
                        <button onClick={() => setOpenPost(openPost === post.id ? null : post.id)}
                          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                          <MessageSquare className="h-3 w-3" />
                          {post.comment_count} {post.comment_count === 1 ? "comment" : "comments"}
                        </button>
                      </div>

                      {openPost === post.id && (
                        <PostThread
                          postId={post.id}
                          votes={votes}
                          onVote={castVote}
                          onCountChange={(d) => setPosts((prev) => prev.map((p) =>
                            p.id === post.id ? { ...p, comment_count: Math.max(0, p.comment_count + d) } : p))}
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Thread ────────────────────────────────────────────────────────────────────

interface PostThreadProps {
  postId: string;
  votes: VoteMap;
  onVote: (t: "post" | "comment", id: string, v: 1 | -1, apply: (d: number) => void) => void;
  onCountChange: (delta: number) => void;
}

const PostThread = ({ postId, votes, onVote, onCountChange }: PostThreadProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [busy, setBusy] = useState(false);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("forum_comments").select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setComments((data || []) as ForumComment[]);
    } catch (e) {
      console.error("Failed to load comments:", e);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const addComment = async (content: string, parentId: string | null) => {
    if (!user) { toast.error("Sign in to comment"); return false; }
    if (!content.trim()) return false;
    setBusy(true);
    try {
      const { error } = await supabase.from("forum_comments").insert({
        post_id: postId, parent_id: parentId, user_id: user.id, content: content.trim(),
      });
      if (error) throw error;
      onCountChange(1);
      await fetchComments();
      return true;
    } catch (e) {
      console.error("Comment failed:", e);
      toast.error("Could not post comment");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const removeComment = async (id: string) => {
    try {
      const { error } = await supabase.from("forum_comments").delete().eq("id", id);
      if (error) throw error;
      const removed = comments.filter((c) => c.id === id || c.parent_id === id).length;
      setComments((prev) => prev.filter((c) => c.id !== id && c.parent_id !== id));
      onCountChange(-removed);
    } catch (e) {
      console.error("Delete comment failed:", e);
      toast.error("Could not delete comment");
    }
  };

  const applyScore = (id: string) => (d: number) =>
    setComments((prev) => prev.map((c) => (c.id === id ? { ...c, score: c.score + d } : c)));

  const top = comments.filter((c) => !c.parent_id);
  const repliesOf = (id: string) => comments.filter((c) => c.parent_id === id);

  const render = (c: ForumComment, isReply = false) => (
    <div key={c.id} className={`rounded-lg bg-muted/40 p-2.5 ${isReply ? "ml-5 border-l-2 border-border/60" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm whitespace-pre-wrap flex-1">{c.content}</p>
        {user?.id === c.user_id && (
          <button onClick={() => removeComment(c.id)} aria-label="Delete comment"
            className="text-muted-foreground hover:text-destructive transition-colors">
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
        <VoteButtons size="sm" score={c.score} vote={votes[`comment:${c.id}`]}
          onVote={(v) => onVote("comment", c.id, v, applyScore(c.id))} />
        <ContributorBadge userId={c.user_id} />
        <span className="text-[11px] text-muted-foreground">{timeAgo(c.created_at)}</span>
        {!isReply && user && (
          <button onClick={() => { setReplyTo(replyTo === c.id ? null : c.id); setReplyText(""); }}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
            <Reply className="h-3 w-3" /> Reply
          </button>
        )}
      </div>
      {replyTo === c.id && !isReply && (
        <div className="flex gap-2 mt-2">
          <Textarea autoFocus value={replyText} onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply…" className="min-h-[48px] text-sm bg-background" />
          <Button size="sm" className="self-end" disabled={busy || !replyText.trim()}
            onClick={async () => {
              const ok = await addComment(replyText, c.id);
              if (ok) { setReplyText(""); setReplyTo(null); }
            }}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
      {loading ? (
        <div className="flex justify-center py-3"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          {top.length === 0 && <p className="text-xs text-muted-foreground">No comments yet — start the discussion.</p>}
          {top.map((c) => (
            <div key={c.id} className="space-y-2">
              {render(c)}
              {repliesOf(c.id).map((r) => render(r, true))}
            </div>
          ))}
          {user ? (
            <div className="flex gap-2 pt-1">
              <Textarea value={text} onChange={(e) => setText(e.target.value)}
                placeholder="Add a comment…" className="min-h-[52px] text-sm bg-background" />
              <Button size="sm" className="self-end" disabled={busy || !text.trim()}
                onClick={async () => { const ok = await addComment(text, null); if (ok) setText(""); }}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Sign in to join the discussion.</p>
          )}
        </>
      )}
    </div>
  );
};

export default ForumPanel;
