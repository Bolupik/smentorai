import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  Save
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

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

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      const { error } = await supabase
        .from('knowledge_base')
        .update({ approved: true })
        .eq('id', id);

      if (error) throw error;
      
      toast.success("Entry approved");
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
      
      toast.success("Entry updated");
      cancelEditing();
      fetchEntries();
    } catch (error) {
      console.error('Error updating entry:', error);
      toast.error("Failed to update entry");
    } finally {
      setProcessingId(null);
    }
  };

  const renderEntry = (entry: KnowledgeEntry, showApproveButton: boolean) => {
    const isEditing = editingId === entry.id;

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
            <p className="text-sm text-muted-foreground mb-3">{entry.content}</p>
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
        
        <div className="flex gap-2 flex-wrap">
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
                <Button
                  size="sm"
                  onClick={() => handleApprove(entry.id)}
                  disabled={processingId === entry.id}
                  className="gap-1"
                >
                  {processingId === entry.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3" />
                  )}
                  Approve
                </Button>
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
            Manage knowledge base content
          </p>
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
