import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { 
  BookPlus, 
  Lightbulb, 
  Send, 
  ThumbsUp,
  ThumbsDown,
  Clock, 
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronUp,
  Link2,
  Image as ImageIcon,
  X,
  ExternalLink
} from "lucide-react";
import KnowledgeComments from "./KnowledgeComments";
import ContributorBadge from "./ContributorBadge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface KnowledgeEntry {
  id: string;
  topic: string;
  content: string;
  approved: boolean;
  upvotes: number;
  downvotes: number;
  link_url: string | null;
  image_url: string | null;
  category: string;
  created_at: string;
  user_id: string;
}

interface UserVote {
  entry_id: string;
  vote_type: 'up' | 'down';
}

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'nft', label: 'NFTs' },
  { value: 'defi', label: 'DeFi' },
  { value: 'stacking', label: 'Stacking' },
  { value: 'clarity', label: 'Clarity' },
  { value: 'sbtc', label: 'sBTC' },
  { value: 'security', label: 'Security' },
  { value: 'architecture', label: 'Architecture' },
];

const KnowledgeBase = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [myEntries, setMyEntries] = useState<KnowledgeEntry[]>([]);
  const [userVotes, setUserVotes] = useState<UserVote[]>([]);
  const [newTopic, setNewTopic] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newCategory, setNewCategory] = useState("general");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showMyEntries, setShowMyEntries] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchEntries();
    if (user) {
      fetchUserVotes();
    }
  }, [user]);

  const fetchEntries = async () => {
    try {
      const { data: approvedData, error: approvedError } = await supabase
        .from('knowledge_base')
        .select('*')
        .eq('approved', true)
        .order('upvotes', { ascending: false })
        .limit(20);

      if (approvedError) throw approvedError;
      setEntries((approvedData || []) as KnowledgeEntry[]);

      if (user) {
        const { data: myData, error: myError } = await supabase
          .from('knowledge_base')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (myError) throw myError;
        setMyEntries((myData || []) as KnowledgeEntry[]);
      }
    } catch (error) {
      console.error('Error fetching knowledge:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserVotes = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('knowledge_votes')
        .select('entry_id, vote_type')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserVotes((data || []) as UserVote[]);
    } catch (error) {
      console.error('Error fetching votes:', error);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedImage || !user) return null;

    const fileExt = selectedImage.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('knowledge-images')
      .upload(fileName, selectedImage);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('knowledge-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
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

    // Validate URL if provided
    if (newLinkUrl.trim()) {
      try {
        new URL(newLinkUrl);
      } catch {
        toast.error("Please enter a valid URL");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      let imageUrl: string | null = null;
      if (selectedImage) {
        imageUrl = await uploadImage();
      }

      const { error } = await supabase
        .from('knowledge_base')
        .insert({
          user_id: user.id,
          topic: newTopic.trim(),
          content: newContent.trim(),
          link_url: newLinkUrl.trim() || null,
          image_url: imageUrl,
          category: newCategory,
          approved: false
        });

      if (error) throw error;

      toast.success("Knowledge submitted for review");
      setNewTopic("");
      setNewContent("");
      setNewLinkUrl("");
      setNewCategory("general");
      clearImage();
      setShowForm(false);
      fetchEntries();
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error("Failed to submit knowledge. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (entryId: string, voteType: 'up' | 'down') => {
    if (!user) {
      toast.error("Sign in to vote on contributions");
      return;
    }

    const existingVote = userVotes.find(v => v.entry_id === entryId);
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;

    try {
      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Remove vote
          await supabase
            .from('knowledge_votes')
            .delete()
            .eq('user_id', user.id)
            .eq('entry_id', entryId);

          // Update counts - uses atomic RPC when types are available
          const updateField = voteType === 'up' ? 'upvotes' : 'downvotes';
          await supabase
            .from('knowledge_base')
            .update({ [updateField]: Math.max(0, entry[updateField] - 1) })
            .eq('id', entryId);

          setUserVotes(prev => prev.filter(v => v.entry_id !== entryId));
          setEntries(prev => 
            prev.map(e => e.id === entryId 
              ? { ...e, [updateField]: Math.max(0, e[updateField] - 1) } 
              : e
            )
          );
        } else {
          // Change vote
          await supabase
            .from('knowledge_votes')
            .update({ vote_type: voteType })
            .eq('user_id', user.id)
            .eq('entry_id', entryId);

          // Update both counts
          const incField = voteType === 'up' ? 'upvotes' : 'downvotes';
          const decField = voteType === 'up' ? 'downvotes' : 'upvotes';
          
          await supabase
            .from('knowledge_base')
            .update({ 
              [incField]: entry[incField] + 1,
              [decField]: Math.max(0, entry[decField] - 1)
            })
            .eq('id', entryId);

          setUserVotes(prev => 
            prev.map(v => v.entry_id === entryId ? { ...v, vote_type: voteType } : v)
          );
          setEntries(prev => 
            prev.map(e => e.id === entryId 
              ? { 
                  ...e, 
                  [incField]: e[incField] + 1,
                  [decField]: Math.max(0, e[decField] - 1)
                } 
              : e
            )
          );
        }
      } else {
        // New vote
        await supabase
          .from('knowledge_votes')
          .insert({
            user_id: user.id,
            entry_id: entryId,
            vote_type: voteType
          });

        const updateField = voteType === 'up' ? 'upvotes' : 'downvotes';
        await supabase
          .from('knowledge_base')
          .update({ [updateField]: entry[updateField] + 1 })
          .eq('id', entryId);

        setUserVotes(prev => [...prev, { entry_id: entryId, vote_type: voteType }]);
        setEntries(prev => 
          prev.map(e => e.id === entryId 
            ? { ...e, [updateField]: e[updateField] + 1 } 
            : e
          )
        );
      }
    } catch (error) {
      console.error('Vote error:', error);
      toast.error("Failed to register vote. Please try again.");
    }
  };

  const getVoteScore = (entry: KnowledgeEntry) => entry.upvotes - entry.downvotes;

  const getUserVote = (entryId: string) => {
    return userVotes.find(v => v.entry_id === entryId)?.vote_type;
  };

  const filteredEntries = filterCategory === "all" 
    ? entries 
    : entries.filter(e => e.category === filterCategory);

  const getCategoryLabel = (value: string) => {
    return CATEGORIES.find(c => c.value === value)?.label || value;
  };

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
                {/* Category Selection */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Category
                  </label>
                  <Select value={newCategory} onValueChange={setNewCategory}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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

                {/* Link URL Input */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
                    <Link2 className="w-4 h-4" />
                    Reference Link (optional)
                  </label>
                  <Input
                    placeholder="https://example.com/article"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    className="bg-background"
                    type="url"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Attach Image (optional)
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  
                  {imagePreview ? (
                    <div className="relative rounded-lg overflow-hidden border border-border">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full max-h-48 object-cover"
                      />
                      <button
                        onClick={clearImage}
                        className="absolute top-2 right-2 p-1 bg-background/80 rounded-full hover:bg-background transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Choose Image
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Max 5MB. JPG, PNG, GIF, or WebP.</p>
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
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                              {getCategoryLabel(entry.category)}
                            </span>
                          </div>
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

      {/* Category Filter */}
      <div className="mb-4">
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookPlus className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No approved entries yet. Be the first to contribute.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEntries.map(entry => {
              const userVote = getUserVote(entry.id);
              const score = getVoteScore(entry);
              
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg bg-background border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex gap-3">
                    {/* Vote Controls - Reddit Style */}
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => handleVote(entry.id, 'up')}
                        className={`p-1 rounded transition-colors ${
                          userVote === 'up' 
                            ? 'text-primary bg-primary/20' 
                            : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                        }`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <span className={`text-sm font-medium ${
                        score > 0 ? 'text-primary' : score < 0 ? 'text-destructive' : 'text-muted-foreground'
                      }`}>
                        {score}
                      </span>
                      <button
                        onClick={() => handleVote(entry.id, 'down')}
                        className={`p-1 rounded transition-colors ${
                          userVote === 'down' 
                            ? 'text-destructive bg-destructive/20' 
                            : 'text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                        }`}
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                          {getCategoryLabel(entry.category)}
                        </span>
                        <ContributorBadge userId={entry.user_id} />
                      </div>
                      <h4 className="font-medium text-foreground">{entry.topic}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {entry.content}
                      </p>
                      
                      {/* Image */}
                      {entry.image_url && (
                        <div className="mt-3 rounded-lg overflow-hidden border border-border">
                          <img 
                            src={entry.image_url} 
                            alt={entry.topic}
                            className="w-full max-h-64 object-cover"
                          />
                        </div>
                      )}
                      
                      {/* Link */}
                      {entry.link_url && (
                        <a
                          href={entry.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-2 text-sm text-primary hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View Reference
                        </a>
                      )}

                      {/* Comments */}
                      <KnowledgeComments entryId={entry.id} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBase;