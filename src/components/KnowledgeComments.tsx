import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { MessageCircle, Send, Loader2, Trash2, Reply, ArrowBigUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  parent_id: string | null;
  upvotes: number;
}

interface KnowledgeCommentsProps {
  entryId: string;
}

const KnowledgeComments = ({ entryId }: KnowledgeCommentsProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (showComments) {
      fetchComments();
      if (user) fetchVotes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showComments, entryId, user?.id]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('knowledge_comments')
        .select('*')
        .eq('entry_id', entryId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setComments((data || []) as Comment[]);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVotes = async () => {
    if (!user) return;
    try {
      const { data, error } = await (supabase as any)
        .from('knowledge_comment_votes')
        .select('comment_id')
        .eq('user_id', user.id);
      if (error) throw error;
      setVotedIds(new Set((data || []).map((v: any) => v.comment_id)));
    } catch (error) {
      console.error('Error fetching comment votes:', error);
    }
  };

  const postComment = async (content: string, parentId: string | null) => {
    if (!user) {
      toast.error("Sign in to comment");
      return false;
    }
    if (!content.trim()) return false;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('knowledge_comments')
        .insert({
          entry_id: entryId,
          user_id: user.id,
          content: content.trim(),
          parent_id: parentId,
        } as any);
      if (error) throw error;
      await fetchComments();
      toast.success(parentId ? "Reply posted" : "Comment added");
      return true;
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error("Failed to post");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    const ok = await postComment(newComment, null);
    if (ok) setNewComment("");
  };

  const handleReplySubmit = async (parentId: string) => {
    const ok = await postComment(replyText, parentId);
    if (ok) {
      setReplyText("");
      setReplyTo(null);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('knowledge_comments')
        .delete()
        .eq('id', commentId);
      if (error) throw error;
      setComments(prev => prev.filter(c => c.id !== commentId && c.parent_id !== commentId));
      toast.success("Comment deleted");
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error("Failed to delete comment");
    }
  };

  const toggleUpvote = async (commentId: string) => {
    if (!user) {
      toast.error("Sign in to upvote");
      return;
    }
    const hasVoted = votedIds.has(commentId);
    const next = new Set(votedIds);
    // optimistic
    setComments(prev => prev.map(c =>
      c.id === commentId ? { ...c, upvotes: Math.max(0, c.upvotes + (hasVoted ? -1 : 1)) } : c
    ));
    if (hasVoted) next.delete(commentId); else next.add(commentId);
    setVotedIds(next);

    try {
      const current = comments.find(c => c.id === commentId);
      if (!current) return;
      if (hasVoted) {
        await (supabase as any)
          .from('knowledge_comment_votes')
          .delete()
          .eq('user_id', user.id)
          .eq('comment_id', commentId);
        await supabase
          .from('knowledge_comments')
          .update({ upvotes: Math.max(0, current.upvotes - 1) } as any)
          .eq('id', commentId);
      } else {
        await (supabase as any)
          .from('knowledge_comment_votes')
          .insert({ user_id: user.id, comment_id: commentId });
        await supabase
          .from('knowledge_comments')
          .update({ upvotes: current.upvotes + 1 } as any)
          .eq('id', commentId);
      }
    } catch (error) {
      console.error('Vote error:', error);
      toast.error("Failed to update vote");
      // revert
      setComments(prev => prev.map(c =>
        c.id === commentId ? { ...c, upvotes: Math.max(0, c.upvotes + (hasVoted ? 1 : -1)) } : c
      ));
      setVotedIds(votedIds);
    }
  };

  const topLevel = comments.filter(c => !c.parent_id);
  const repliesOf = (id: string) => comments.filter(c => c.parent_id === id);

  const renderComment = (comment: Comment, isReply = false) => {
    const voted = votedIds.has(comment.id);
    return (
      <div
        key={comment.id}
        className={`p-2 rounded bg-muted/50 text-sm ${isReply ? "ml-6 border-l-2 border-border/60" : ""}`}
      >
        <div className="flex justify-between items-start gap-2">
          <p className="text-foreground flex-1 whitespace-pre-wrap">{comment.content}</p>
          {user?.id === comment.user_id && (
            <button
              onClick={() => handleDelete(comment.id)}
              className="text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Delete comment"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1.5">
          <button
            onClick={() => toggleUpvote(comment.id)}
            className={`flex items-center gap-1 text-xs transition-colors ${
              voted ? "text-primary" : "text-muted-foreground hover:text-primary"
            }`}
            aria-label="Upvote comment"
          >
            <ArrowBigUp className={`w-3.5 h-3.5 ${voted ? "fill-current" : ""}`} />
            {comment.upvotes || 0}
          </button>
          {!isReply && user && (
            <button
              onClick={() => {
                setReplyTo(replyTo === comment.id ? null : comment.id);
                setReplyText("");
              }}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Reply className="w-3.5 h-3.5" />
              Reply
            </button>
          )}
          <span className="text-xs text-muted-foreground ml-auto">
            {new Date(comment.created_at).toLocaleDateString()}
          </span>
        </div>

        {replyTo === comment.id && !isReply && (
          <div className="flex gap-2 mt-2">
            <Textarea
              placeholder="Write a reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="bg-background min-h-[50px] text-sm"
              autoFocus
            />
            <Button
              size="sm"
              onClick={() => handleReplySubmit(comment.id)}
              disabled={submitting || !replyText.trim()}
              className="self-end"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mt-3 pt-3 border-t border-border/50">
      <button
        onClick={() => setShowComments(!showComments)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <MessageCircle className="w-4 h-4" />
        {comments.length > 0 ? `Discuss (${comments.length})` : "Discuss"}
      </button>

      {showComments && (
        <div className="mt-3 space-y-3">
          {loading ? (
            <div className="text-center py-2">
              <Loader2 className="w-4 h-4 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : (
            <>
              {topLevel.length === 0 ? (
                <p className="text-xs text-muted-foreground">No comments yet. Start the discussion!</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {topLevel.map(c => (
                    <div key={c.id} className="space-y-2">
                      {renderComment(c)}
                      {repliesOf(c.id).map(r => renderComment(r, true))}
                    </div>
                  ))}
                </div>
              )}

              {user ? (
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="bg-background min-h-[60px] text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={submitting || !newComment.trim()}
                    className="self-end"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Sign in to join the discussion.</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default KnowledgeComments;
