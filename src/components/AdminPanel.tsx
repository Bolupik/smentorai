import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { 
  Shield, 
  CheckCircle2, 
  XCircle, 
  Trash2,
  Loader2,
  ExternalLink,
  Image as ImageIcon
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PendingEntry {
  id: string;
  topic: string;
  content: string;
  category: string;
  link_url: string | null;
  image_url: string | null;
  created_at: string;
  user_id: string;
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
  const [pendingEntries, setPendingEntries] = useState<PendingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingEntries();
  }, []);

  const fetchPendingEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .eq('approved', false)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPendingEntries((data || []) as PendingEntry[]);
    } catch (error) {
      console.error('Error fetching pending entries:', error);
      toast.error("Failed to load pending entries");
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
      setPendingEntries(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error approving entry:', error);
      toast.error("Failed to approve entry");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      const { error } = await supabase
        .from('knowledge_base')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success("Entry rejected and removed");
      setPendingEntries(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error rejecting entry:', error);
      toast.error("Failed to reject entry");
    } finally {
      setProcessingId(null);
    }
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
            Review and approve community submissions
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          Loading pending entries...
        </div>
      ) : pendingEntries.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No pending submissions to review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {pendingEntries.length} pending submission{pendingEntries.length !== 1 ? 's' : ''}
          </p>
          
          {pendingEntries.map(entry => (
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
              
              <h4 className="font-medium text-foreground mb-1">{entry.topic}</h4>
              <p className="text-sm text-muted-foreground mb-3">{entry.content}</p>
              
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
              
              <div className="flex gap-2">
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
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleReject(entry.id)}
                  disabled={processingId === entry.id}
                  className="gap-1"
                >
                  {processingId === entry.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Trash2 className="w-3 h-3" />
                  )}
                  Reject
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
