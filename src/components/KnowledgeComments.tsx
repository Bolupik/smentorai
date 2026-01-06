import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { MessageCircle, Send, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
}

interface KnowledgeCommentsProps {
  entryId: string;
}

const KnowledgeComments = ({ entryId }: KnowledgeCommentsProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments, entryId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('knowledge_comments')
        .select('*')
        .eq('entry_id', entryId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Sign in to comment");
      return;
    }

    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('knowledge_comments')
        .insert({
          entry_id: entryId,
          user_id: user.id,
          content: newComment.trim()
        });

      if (error) throw error;

      setNewComment("");
      fetchComments();
      toast.success("Comment added");
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('knowledge_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      setComments(prev => prev.filter(c => c.id !== commentId));
      toast.success("Comment deleted");
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error("Failed to delete comment");
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-border/50">
      <button
        onClick={() => setShowComments(!showComments)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <MessageCircle className="w-4 h-4" />
        {comments.length > 0 ? `${comments.length} comments` : "Comments"}
      </button>

      {showComments && (
        <div className="mt-3 space-y-3">
          {loading ? (
            <div className="text-center py-2">
              <Loader2 className="w-4 h-4 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : (
            <>
              {comments.length === 0 ? (
                <p className="text-xs text-muted-foreground">No comments yet. Be the first!</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {comments.map(comment => (
                    <div key={comment.id} className="p-2 rounded bg-muted/50 text-sm">
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-foreground flex-1">{comment.content}</p>
                        {user?.id === comment.user_id && (
                          <button
                            onClick={() => handleDelete(comment.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {user && (
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
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default KnowledgeComments;
