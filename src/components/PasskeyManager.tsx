import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Fingerprint, Loader2, Trash2, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { registerPasskey, isPasskeySupported, isPasskeyCancellation } from "@/lib/passkey";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Passkey {
  id: string;
  label: string | null;
  created_at: string;
  last_used_at: string | null;
}

const PasskeyManager = () => {
  const { user } = useAuth();
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("passkey_credentials")
      .select("id, label, created_at, last_used_at")
      .order("created_at", { ascending: false });
    setPasskeys(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleRegister = async () => {
    if (!isPasskeySupported()) {
      toast.error("Passkeys aren't supported on this device/browser.");
      return;
    }
    setRegistering(true);
    try {
      const label = `Passkey · ${new Date().toLocaleDateString()}`;
      await registerPasskey(label);
      toast.success("Passkey added — use it to sign in next time.");
      await load();
    } catch (err) {
      const msg = (err as Error).message;
      if (!msg.toLowerCase().includes("cancel")) {
        toast.error(msg || "Could not register passkey");
      }
    } finally {
      setRegistering(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("passkey_credentials").delete().eq("id", id);
    if (error) {
      toast.error("Could not remove passkey");
      return;
    }
    toast.success("Passkey removed");
    setPasskeys((p) => p.filter((k) => k.id !== id));
  };

  if (!user) return null;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border/50 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <KeyRound className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground text-sm">Passkeys</h3>
          <p className="text-xs text-muted-foreground">
            Sign in with Face ID, Touch ID, or your device PIN.
          </p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        ) : passkeys.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-2">
            No passkeys yet. Add one to skip your password next time.
          </p>
        ) : (
          <ul className="space-y-2">
            {passkeys.map((k) => (
              <li
                key={k.id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border/60 bg-background/40"
              >
                <Fingerprint className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {k.label ?? "Passkey"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Added {formatDistanceToNow(new Date(k.created_at), { addSuffix: true })}
                    {k.last_used_at
                      ? ` · used ${formatDistanceToNow(new Date(k.last_used_at), { addSuffix: true })}`
                      : ""}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(k.id)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  aria-label="Remove passkey"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}

        <Button
          onClick={handleRegister}
          disabled={registering}
          size="sm"
          className="w-full gap-2 h-9"
        >
          {registering ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Fingerprint className="w-4 h-4" />
          )}
          Add a passkey
        </Button>
      </div>
    </div>
  );
};

export default PasskeyManager;
