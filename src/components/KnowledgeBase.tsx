import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { 
  BookPlus, 
  Lightbulb, 
  Send, 
  ThumbsUp, 
  Clock, 
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface KnowledgeEntry {
  id: string;
  topic: string;
  content: string;
  approved: boolean;
  upvotes: number;
  created_at: string;
  user_id: string;
}

const KnowledgeBase = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [myEntries, setMyEntries] = useState<KnowledgeEntry[]>([]);
  const [newTopic, setNewTopic] = useState("");
  const [newContent, setNewContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showMyEntries, setShowMyEntries] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntries();
  }, [user]);

  const fetchEntries = async () => {
    try {
      // Fetch approved entries
      const { data: approvedData, error: approvedError } = await supabase
        .from('knowledge_base')
        .select('*')
        .eq('approved', true)
        .order('upvotes', { ascending: false })
        .limit(10);

      if (approvedError) throw approvedError;
      setEntries(approvedData || []);

      // Fetch user's own entries if logged in
      if (user) {
        const { data: myData, error: myError } = await supabase
          .from('knowledge_base')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (myError) throw myError;
        setMyEntries(myData || []);
      }
    } catch (error) {
      console.error('Error fetching knowledge:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Authentication required to contribute knowledge");
      return;
    }

    if (!newTopic.trim() || !newContent.trim()) {
      toast.error("Both topic and content are required");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('knowledge_base')
        .insert({
          user_id: user.id,
          topic: newTopic.trim(),
          content: newContent.trim(),
          approved: false
        });

      if (error) throw error;

      toast.success("Knowledge submitted for review");
      setNewTopic("");
      setNewContent("");
      setShowForm(false);
      fetchEntries();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit knowledge");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (entryId: string) => {
    if (!user) {
      toast.error("Sign in to upvote contributions");
      return;
    }

    try {
      const entry = entries.find(e => e.id === entryId);
      if (!entry) return;

      const { error } = await supabase
        .from('knowledge_base')
        .update({ upvotes: entry.upvotes + 1 })
        .eq('id', entryId);

      if (error) throw error;
      
      setEntries(prev => 
        prev.map(e => e.id === entryId ? { ...e, upvotes: e.upvotes + 1 } : e)
      );
    } catch (error) {
      console.error('Error upvoting:', error);
    }
  };

  const topicSuggestions = [
    "Clarity Contract Patterns",
    "sBTC Integration Guide",
    "Stacking Strategies",
    "NFT Development Tips",
    "DeFi Protocol Analysis",
    "Security Best Practices"
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/20 rounded-lg">
          <BookPlus className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Knowledge Repository</h2>
          <p className="text-sm text-muted-foreground">
            Contribute to The Architect's growing wisdom
          </p>
        </div>
      </div>

      {/* Contribution Form Toggle */}
      <motion.div className="mb-6">
        <Button
          variant="outline"
          className="w-full justify-between"
          onClick={() => setShowForm(!showForm)}
        >
          <span className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Share Your Knowledge
          </span>
          {showForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Topic
                  </label>
                  <Input
                    placeholder="e.g., Clarity Best Practices, sBTC Integration..."
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    className="bg-background"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {topicSuggestions.slice(0, 3).map(suggestion => (
                      <button
                        key={suggestion}
                        onClick={() => setNewTopic(suggestion)}
                        className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Knowledge Content
                  </label>
                  <Textarea
                    placeholder="Share your insights, explanations, or discoveries about the Stacks ecosystem..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="bg-background min-h-[120px]"
                  />
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !newTopic.trim() || !newContent.trim()}
                  className="w-full gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Submit for Review
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Submissions are reviewed before being added to The Architect's knowledge base
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* My Submissions */}
      {user && myEntries.length > 0 && (
        <div className="mb-6">
          <Button
            variant="ghost"
            className="w-full justify-between text-sm"
            onClick={() => setShowMyEntries(!showMyEntries)}
          >
            <span>Your Contributions ({myEntries.length})</span>
            {showMyEntries ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>

          <AnimatePresence>
            {showMyEntries && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-3 pt-3">
                  {myEntries.map(entry => (
                    <div
                      key={entry.id}
                      className="p-3 rounded-lg bg-muted/50 border border-border/50"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm text-foreground">{entry.topic}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {entry.content}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          {entry.approved ? (
                            <span className="flex items-center gap-1 text-xs text-green-500">
                              <CheckCircle2 className="w-3 h-3" />
                              Approved
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              Pending
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Approved Entries */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          Community Wisdom
        </h3>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            Loading knowledge...
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookPlus className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No approved entries yet. Be the first to contribute.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map(entry => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-background border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground">{entry.topic}</h4>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                      {entry.content}
                    </p>
                  </div>
                  <button
                    onClick={() => handleUpvote(entry.id)}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    {entry.upvotes}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBase;