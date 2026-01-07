import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { 
  Shield, 
  CheckCircle2, 
  Trash2,
  Loader2,
  ExternalLink,
  Image as ImageIcon,
  Pencil,
  X,
  Save,
  Bot,
  AlertTriangle,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";

interface KnowledgeEntry {
  id: string;
  topic: string;
  content: string;
  category: string;
  link_url: string | null;
  image_url: string | null;
  created_at: string;
  user_id: string;
  approved: boolean;
}

interface AIReview {
  approved: boolean;
  score: number;
  summary: string;
  issues: string[];
  suggestions: string[];
  category_match: boolean;
  factual_accuracy: "verified" | "unverified" | "incorrect";
}

const CATEGORIES: Record<string, string> = {
  'general': 'General',
  'nft': 'NFTs',
  'defi': 'DeFi',
  'stacking': 'Stacking',
  'clarity': 'Clarity',
  'sbtc': 'sBTC',
  'security': 'Security',
  'architecture': 'Architecture',
};

const AdminPanel = () => {
  const [pendingEntries, setPendingEntries] = useState<KnowledgeEntry[]>([]);
  const [approvedEntries, setApprovedEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Record<string, AIReview>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTopic, setEditTopic] = useState("");
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const { data: pending, error: pendingError } = await supabase
        .from('knowledge_base')
        .select('*')
        .eq('approved', false)
        .order('created_at', { ascending: true });

      if (pendingError) throw pendingError;

      const { data: approved, error: approvedError } = await supabase
        .from('knowledge_base')
        .select('*')
        .eq('approved', true)
        .order('created_at', { ascending: false });

      if (approvedError) throw approvedError;

      setPendingEntries((pending || []) as KnowledgeEntry[]);
      setApprovedEntries((approved || []) as KnowledgeEntry[]);
    } catch (error) {
      console.error('Error fetching entries:', error);
      toast.error("Failed to load entries");
    } finally {
      setLoading(false);
    }
  };

  const handleAIReview = async (entry: KnowledgeEntry) => {
    setReviewingId(entry.id);
    
    try {
      const { data, error } = await supabase.functions.invoke('review-contribution', {
        body: {
          entryId: entry.id,
          topic: entry.topic,
          content: entry.content,
          category: entry.category,
          linkUrl: entry.link_url
        }
      });

      if (error) throw error;

      if (data.success && data.review) {
        setReviews(prev => ({ ...prev, [entry.id]: data.review }));
        
        if (data.review.approved) {
          toast.success(`AI approved: Score ${data.review.score}/100`);
        } else {
          toast.warning(`AI flagged issues: Score ${data.review.score}/100`);
        }
      } else {
        throw new Error(data.error || "Review failed");
      }
    } catch (error: any) {
      console.error('Review error:', error);
      toast.error("Failed to review with AI. Please try again.");
    } finally {
      setReviewingId(null);
    }
  };

  const handleApprove = async (id: string) => {
    const review = reviews[id];
    
    // Warn if approving without AI review or with poor score
    if (!review) {
      const confirmed = window.confirm("This entry hasn't been AI reviewed. Approve anyway?");
      if (!confirmed) return;
    } else if (!review.approved || review.score < 60) {
      const confirmed = window.confirm(`AI gave this a score of ${review.score}/100 with issues. Approve anyway?`);
      if (!confirmed) return;
    }

    setProcessingId(id);
    try {
      const { error } = await supabase
        .from('knowledge_base')
        .update({ approved: true })
        .eq('id', id);

      if (error) throw error;
      
      toast.success("Entry approved and added to AI knowledge base");
      setReviews(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
      fetchEntries();
    } catch (error) {
      console.error('Error approving entry:', error);
      toast.error("Failed to approve entry");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setProcessingId(id);
    try {
      const { error } = await supabase
        .from('knowledge_base')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success("Entry deleted");
      setReviews(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
      fetchEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error("Failed to delete entry");
    } finally {
      setProcessingId(null);
    }
  };

  const startEditing = (entry: KnowledgeEntry) => {
    setEditingId(entry.id);
    setEditTopic(entry.topic);
    setEditContent(entry.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTopic("");
    setEditContent("");
  };

  const saveEdit = async (id: string) => {
    if (!editTopic.trim() || !editContent.trim()) {
      toast.error("Topic and content are required");
      return;
    }

    setProcessingId(id);
    try {
      const { error } = await supabase
        .from('knowledge_base')
        .update({ topic: editTopic.trim(), content: editContent.trim() })
        .eq('id', id);

      if (error) throw error;
      
      toast.success("Entry updated - re-review recommended");
      // Clear the old review since content changed
      setReviews(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
      cancelEditing();
      fetchEntries();
    } catch (error) {
      console.error('Error updating entry:', error);
      toast.error("Failed to update entry");
    } finally {
      setProcessingId(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getAccuracyBadge = (accuracy: string) => {
    switch (accuracy) {
      case "verified":
        return <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">✓ Verified</span>;
      case "unverified":
        return <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">? Unverified</span>;
      case "incorrect":
        return <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">✗ Incorrect</span>;
      default:
        return null;
    }
  };

  const renderReview = (entryId: string) => {
    const review = reviews[entryId];
    if (!review) return null;

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        className="mt-3 p-3 rounded-lg bg-muted/50 border border-border/50 space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">AI Review</span>
          </div>
          <div className="flex items-center gap-3">
            {getAccuracyBadge(review.factual_accuracy)}
            <span className={`text-lg font-bold ${getScoreColor(review.score)}`}>
              {review.score}/100
            </span>
            {review.approved ? (
              <ThumbsUp className="w-4 h-4 text-green-500" />
            ) : (
              <ThumbsDown className="w-4 h-4 text-red-500" />
            )}
          </div>
        </div>

        <Progress value={review.score} className="h-2" />

        <p className="text-sm text-muted-foreground">{review.summary}</p>

        {review.issues.length > 0 && (
          <div className="space-y-1">
            <span className="text-xs font-medium text-red-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Issues Found
            </span>
            <ul className="text-xs text-muted-foreground space-y-1">
              {review.issues.map((issue, i) => (
                <li key={i} className="flex items-start gap-1">
                  <span className="text-red-400">•</span> {issue}
                </li>
              ))}
            </ul>
          </div>
        )}

        {review.suggestions.length > 0 && (
          <div className="space-y-1">
            <span className="text-xs font-medium text-primary flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Suggestions
            </span>
            <ul className="text-xs text-muted-foreground space-y-1">
              {review.suggestions.map((suggestion, i) => (
                <li key={i} className="flex items-start gap-1">
                  <span className="text-primary">•</span> {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!review.category_match && (
          <div className="text-xs text-yellow-400 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Category may not match content
          </div>
        )}
      </motion.div>
    );
  };

  const renderEntry = (entry: KnowledgeEntry, showApproveButton: boolean) => {
    const isEditing = editingId === entry.id;
    const isReviewing = reviewingId === entry.id;
    const hasReview = !!reviews[entry.id];

    return (
      <motion.div
        key={entry.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="p-4 rounded-lg bg-background border border-border"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
            {CATEGORIES[entry.category] || entry.category}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(entry.created_at).toLocaleDateString()}
          </span>
          {hasReview && (
            <span className={`text-xs font-medium ${reviews[entry.id].approved ? 'text-green-500' : 'text-red-500'}`}>
              {reviews[entry.id].approved ? '✓ AI Approved' : '⚠ Needs Review'}
            </span>
          )}
        </div>
        
        {isEditing ? (
          <div className="space-y-2 mb-3">
            <Input
              value={editTopic}
              onChange={(e) => setEditTopic(e.target.value)}
              className="bg-muted"
              placeholder="Topic"
            />
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="bg-muted min-h-[80px]"
              placeholder="Content"
            />
          </div>
        ) : (
          <>
            <h4 className="font-medium text-foreground mb-1">{entry.topic}</h4>
            <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap">{entry.content}</p>
          </>
        )}
        
        {entry.image_url && (
          <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
            <ImageIcon className="w-4 h-4" />
            <a 
              href={entry.image_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-primary"
            >
              View attached image
            </a>
          </div>
        )}
        
        {entry.link_url && (
          <div className="mb-3">
            <a
              href={entry.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              {entry.link_url}
            </a>
          </div>
        )}

        {/* AI Review Section */}
        <AnimatePresence>
          {renderReview(entry.id)}
        </AnimatePresence>
        
        <div className="flex gap-2 flex-wrap mt-3">
          {isEditing ? (
            <>
              <Button
                size="sm"
                onClick={() => saveEdit(entry.id)}
                disabled={processingId === entry.id}
                className="gap-1"
              >
                {processingId === entry.id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Save className="w-3 h-3" />
                )}
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={cancelEditing}
                className="gap-1"
              >
                <X className="w-3 h-3" />
                Cancel
              </Button>
            </>
          ) : (
            <>
              {showApproveButton && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAIReview(entry)}
                    disabled={isReviewing || processingId === entry.id}
                    className="gap-1"
                  >
                    {isReviewing ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : hasReview ? (
                      <RefreshCw className="w-3 h-3" />
                    ) : (
                      <Bot className="w-3 h-3" />
                    )}
                    {hasReview ? "Re-review" : "AI Review"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(entry.id)}
                    disabled={processingId === entry.id || isReviewing}
                    className={`gap-1 ${hasReview && reviews[entry.id].approved ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  >
                    {processingId === entry.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3" />
                    )}
                    {hasReview && reviews[entry.id].approved ? "Approve ✓" : "Approve"}
                  </Button>
                </>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => startEditing(entry)}
                className="gap-1"
              >
                <Pencil className="w-3 h-3" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(entry.id)}
                disabled={processingId === entry.id}
                className="gap-1"
              >
                {processingId === entry.id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Trash2 className="w-3 h-3" />
                )}
                Delete
              </Button>
            </>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-destructive/20 rounded-lg">
          <Shield className="w-5 h-5 text-destructive" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Admin Panel</h2>
          <p className="text-sm text-muted-foreground">
            AI-assisted knowledge base review
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
        <div className="flex items-start gap-2">
          <Bot className="w-4 h-4 text-primary mt-0.5" />
          <div className="text-sm">
            <span className="font-medium text-primary">AI Review Workflow:</span>
            <span className="text-muted-foreground"> Click "AI Review" to analyze contributions for accuracy and quality. Approved content is added to The Architect's knowledge base.</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          Loading entries...
        </div>
      ) : (
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="pending" className="flex-1">
              Pending ({pendingEntries.length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex-1">
              Approved ({approvedEntries.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {pendingEntries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No pending submissions.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingEntries.map(entry => renderEntry(entry, true))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved">
            {approvedEntries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No approved entries yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {approvedEntries.map(entry => renderEntry(entry, false))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default AdminPanel;
