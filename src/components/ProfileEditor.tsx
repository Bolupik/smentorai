import { useState, useRef, useEffect } from "react";
import ProfileAchievements from "./ProfileAchievements";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import {
  User, Camera, Loader2, Save, Wallet, Mail, Trophy,
  TrendingUp, Star, Crown, Medal, ChevronRight, CheckCircle2,
  Link2, KeyRound, Eye, EyeOff,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useStacksAuth } from "@/hooks/useStacksAuth";
import { useIsGuest } from "@/hooks/useIsGuest";
import GuestGate from "@/components/GuestGate";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Profile {
  display_name: string | null;
  avatar_url: string | null;
  username: string | null;
  stacks_address: string | null;
  bns_name: string | null;
}

// ─── Daily Ranking Placeholder ───────────────────────────────────────────────
const RankingPlaceholder = () => {
  const tiers = [
    { label: "Bronze", icon: Medal, color: "text-orange-600", bg: "bg-orange-600/10 border-orange-600/20", points: "0–499 pts" },
    { label: "Silver", icon: Star, color: "text-slate-300", bg: "bg-slate-300/10 border-slate-300/20", points: "500–1999 pts" },
    { label: "Gold", icon: Crown, color: "text-accent", bg: "bg-accent/10 border-accent/20", points: "2000+ pts" },
  ];
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border/50 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
          <Trophy className="w-4 h-4 text-accent" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-sm">Daily Rankings</h3>
          <p className="text-xs text-muted-foreground">Coming soon</p>
        </div>
        <Badge variant="outline" className="ml-auto text-[10px] border-accent/40 text-accent px-2 py-0.5">SOON</Badge>
      </div>
      <div className="p-4 space-y-2.5">
        {tiers.map((tier, i) => {
          const Icon = tier.icon;
          return (
            <motion.div key={tier.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              className={cn("flex items-center gap-3 px-4 py-3 rounded-lg border", tier.bg)}>
              <Icon className={cn("w-4 h-4", tier.color)} />
              <span className="text-sm font-medium text-foreground">{tier.label}</span>
              <span className="text-xs text-muted-foreground ml-auto">{tier.points}</span>
            </motion.div>
          );
        })}
      </div>
      <div className="px-4 pb-4">
        <div className="rounded-lg bg-muted/30 border border-border/50 p-3 flex items-center gap-3">
          <TrendingUp className="w-4 h-4 text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Earn points by exploring topics, completing quizzes, and contributing to the knowledge base. Weekly BTC yield rewards for top contributors.
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Link Email Panel (for wallet-only users) ────────────────────────────────
const LinkEmailPanel = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [linked, setLinked] = useState(false);

  const handleLink = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter both email and password");
      return;
    }
    setLoading(true);
    try {
      // Upgrade anonymous session to email/password account
      const { error } = await supabase.auth.updateUser({ email: email.trim(), password });
      if (error) throw error;
      setLinked(true);
      toast.success("Email linked! Check your inbox to confirm.", { duration: 5000 });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to link email";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (linked) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/20">
        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
        <p className="text-sm text-foreground">Email linked — confirm it in your inbox to activate.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground px-1">
        Add an email &amp; password so you can sign in without your wallet.
      </p>
      <Input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="bg-background h-9 text-sm"
      />
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-background h-9 text-sm pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      <Button size="sm" onClick={handleLink} disabled={loading} className="w-full h-9 gap-2">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
        Link Email Account
      </Button>
    </div>
  );
};

// ─── Linked Accounts ──────────────────────────────────────────────────────────
interface LinkedAccountsProps {
  email: string | null;
  walletAddress: string | null;
  walletBnsName?: string;
  profileStacksAddress: string | null;
  profileBnsName: string | null;
  onLinkWallet: () => void;
  isWalletConnected: boolean;
  isWalletOnly: boolean;
  truncateAddress: (addr: string) => string;
}

const LinkedAccounts = ({
  email,
  walletAddress,
  walletBnsName,
  profileStacksAddress,
  profileBnsName,
  onLinkWallet,
  isWalletConnected,
  isWalletOnly,
  truncateAddress,
}: LinkedAccountsProps) => {
  // Effective wallet info: prefer live wallet data, fall back to profile DB record
  const effectiveAddress = walletAddress || profileStacksAddress;
  const effectiveBns = walletBnsName || profileBnsName || undefined;
  const walletLinkedInProfile = !!profileStacksAddress;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border/50 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Link2 className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground text-sm">Linked Accounts</h3>
      </div>

      <div className="p-4 space-y-3">
        {/* Email row */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-muted/30 border border-border/50">
          <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-muted-foreground mb-0.5">Email</p>
            {email ? (
              <p className="text-sm font-medium text-foreground truncate">{email}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">Not linked</p>
            )}
          </div>
          {email && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
        </div>

        {/* Stacks Wallet row */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-muted/30 border border-border/50">
          <Wallet className="w-4 h-4 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-muted-foreground mb-0.5">Stacks Wallet</p>
            {effectiveAddress ? (
              <div>
                {effectiveBns && <p className="text-sm font-medium text-foreground">{effectiveBns}</p>}
                <p className="text-xs text-muted-foreground font-mono">{truncateAddress(effectiveAddress)}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Not connected</p>
            )}
          </div>
          {effectiveAddress ? (
            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
          ) : (
            <Button size="sm" variant="outline" onClick={onLinkWallet}
              className="h-7 text-xs px-3 border-primary/40 text-primary hover:bg-primary/10 shrink-0">
              Connect<ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          )}
        </div>

        {/* Link email section for wallet-only users */}
        {isWalletOnly && !email && (
          <div className="pt-1">
            <LinkEmailPanel />
          </div>
        )}

        {/* Prompt email users to connect wallet if not yet linked */}
        {!isWalletOnly && !effectiveAddress && (
          <p className="text-xs text-muted-foreground px-1 pt-1">
            Connect your Stacks wallet to link it to your account.
          </p>
        )}

        {/* Status badge when wallet linked via profile (email user who connected wallet) */}
        {!isWalletOnly && walletLinkedInProfile && (
          <div className="flex items-center gap-2 px-2 py-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
            <span className="text-xs text-muted-foreground">Wallet saved to your profile</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ProfileEditor = () => {
  const { user } = useAuth();
  const { isAuthenticated: isWalletConnected, userData: walletData, signIn: connectWallet, truncateAddress } = useStacksAuth();
  const isGuest = useIsGuest();

  const [profile, setProfile] = useState<Profile>({
    display_name: null, avatar_url: null, username: null, stacks_address: null, bns_name: null,
  });
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // A user is "wallet-only" if they have no real email: either no Supabase
  // session at all, or they have an anonymous session (wallet-created).
  const email = (user?.email && !user.is_anonymous) ? user.email : null;
  const walletOnlyUser = !user || !!user.is_anonymous;

  useEffect(() => {
    if (user) fetchProfile();
    else if (isWalletConnected) setLoading(false);
  }, [user, isWalletConnected]);

  // When an email user connects their wallet, save the address to DB
  useEffect(() => {
    if (!user || !walletData?.address) return;
    // Only save if not already saved (avoid redundant writes)
    if (profile.stacks_address === walletData.address) return;
    saveWalletToProfile(walletData.address, walletData.bnsName);
  }, [user, walletData?.address]);

  const saveWalletToProfile = async (address: string, bnsName?: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from("profiles")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update({ stacks_address: address, bns_name: bnsName || null } as any)
        .eq("user_id", user.id);
      if (!error) {
        setProfile((prev) => ({ ...prev, stacks_address: address, bns_name: bnsName || null }));
        toast.success("Wallet linked to your profile");
      }
    } catch {
      // silent — non-critical
    }
  };

  const fetchProfile = async () => {
    if (!user) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("profiles")
        .select("display_name, avatar_url, username, stacks_address, bns_name")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      if (data) {
        setProfile({
          display_name: data.display_name,
          avatar_url: data.avatar_url,
          username: data.username,
          stacks_address: data.stacks_address ?? null,
          bns_name: data.bns_name ?? null,
        });
        setDisplayName(data.display_name || "");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be less than 2MB"); return; }
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/avatar.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
      const avatarUrl = `${data.publicUrl}?t=${Date.now()}`;
      const { error: updateError } = await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("user_id", user.id);
      if (updateError) throw updateError;
      setProfile((prev) => ({ ...prev, avatar_url: avatarUrl }));
      toast.success("Profile picture updated");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload picture");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName.trim() || null })
        .eq("user_id", user.id);
      if (error) throw error;
      setProfile((prev) => ({ ...prev, display_name: displayName.trim() || null }));
      toast.success("Profile saved");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const avatarInitial = profile.display_name?.[0]?.toUpperCase()
    ?? walletData?.bnsName?.[0]?.toUpperCase()
    ?? "?";

  if (!user && !isWalletConnected) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isGuest) return <GuestGate feature="profile editing" />;

  return (
    <div className="space-y-4">
      {/* ── Identity Card ── */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/10 relative">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: "radial-gradient(circle at 30% 50%, hsl(var(--primary)) 0%, transparent 60%), radial-gradient(circle at 80% 30%, hsl(var(--accent)) 0%, transparent 50%)" }}
          />
        </div>

        <div className="px-5 pb-5">
          <div className="flex items-end gap-4 -mt-8 mb-4">
            <div className="relative">
              <Avatar className="w-16 h-16 border-4 border-card shadow-lg">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary font-bold text-xl">
                  {avatarInitial === "?" ? <User className="w-7 h-7" /> : avatarInitial}
                </AvatarFallback>
              </Avatar>
              {user && (
                <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center shadow-md">
                  {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarUpload} className="hidden" />
            </div>

            <div className="flex-1 min-w-0 pt-8">
              {walletData?.bnsName ? (
                <p className="text-sm font-semibold text-foreground truncate">{walletData.bnsName}</p>
              ) : profile.display_name ? (
                <p className="text-sm font-semibold text-foreground truncate">{profile.display_name}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">No display name</p>
              )}
              {email && <p className="text-xs text-muted-foreground truncate">{email}</p>}
              {walletData?.address && (
                <p className="text-xs text-muted-foreground font-mono">{truncateAddress(walletData.address)}</p>
              )}
            </div>
          </div>

          {/* Edit display name — email users */}
          {user && !walletOnlyUser && (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Display Name</label>
                <Input placeholder="Enter your display name" value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)} className="bg-background h-9 text-sm" maxLength={50} />
              </div>
              <Button size="sm" onClick={handleSave} disabled={saving} className="w-full gap-2 h-9">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </Button>
            </div>
          )}

          {walletOnlyUser && (
            <p className="text-xs text-muted-foreground text-center py-1">
              Link an email below to edit your display name &amp; upload a photo.
            </p>
          )}
        </div>
      </div>

      {/* ── Linked Accounts ── */}
      <LinkedAccounts
        email={email}
        walletAddress={walletData?.address ?? null}
        walletBnsName={walletData?.bnsName}
        profileStacksAddress={profile.stacks_address}
        profileBnsName={profile.bns_name}
        onLinkWallet={connectWallet}
        isWalletConnected={isWalletConnected}
        isWalletOnly={walletOnlyUser}
        truncateAddress={truncateAddress}
      />

      {/* ── Daily Rankings ── */}
      <RankingPlaceholder />

      {/* ── Achievement Wall ── */}
      <ProfileAchievements />
    </div>
  );
};

export default ProfileEditor;
