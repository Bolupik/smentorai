import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, LogIn, UserPlus, ArrowLeft, User, Mail, CheckCircle, Wallet } from "lucide-react";
import sammyBear from "@/assets/sammy-bear.png";
import { z } from "zod";
import { useStacksAuth } from "@/hooks/useStacksAuth";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  username: z.string().min(2, "Username must be at least 2 characters").optional(),
});

// Each hanging bear: position (left %), delay, size, swing amplitude, duration
const HANGING_BEARS = [
  { left: 4,   delay: 0,    size: 64,  amp: 18, dur: 3.2 },
  { left: 14,  delay: 0.7,  size: 48,  amp: 12, dur: 4.1 },
  { left: 25,  delay: 1.4,  size: 80,  amp: 22, dur: 3.6 },
  { left: 36,  delay: 0.3,  size: 44,  amp: 14, dur: 4.8 },
  { left: 47,  delay: 1.1,  size: 72,  amp: 20, dur: 3.4 },
  { left: 57,  delay: 0.5,  size: 52,  amp: 16, dur: 4.3 },
  { left: 67,  delay: 1.8,  size: 88,  amp: 24, dur: 3.8 },
  { left: 77,  delay: 0.9,  size: 56,  amp: 15, dur: 4.6 },
  { left: 87,  delay: 0.2,  size: 68,  amp: 19, dur: 3.1 },
  { left: 94,  delay: 1.5,  size: 42,  amp: 11, dur: 4.9 },
];

const HangingBear = ({ left, delay, size, amp, dur }: typeof HANGING_BEARS[0]) => (
  <motion.div
    className="absolute top-0 flex flex-col items-center pointer-events-none select-none"
    style={{ left: `${left}%` }}
    animate={{ rotate: [amp / 2, -amp / 2, amp / 2] }}
    transition={{ duration: dur, delay, repeat: Infinity, ease: "easeInOut" }}
    style={{ left: `${left}%`, transformOrigin: "top center" }}
  >
    {/* Rope */}
    <motion.div
      className="w-px bg-gradient-to-b from-muted-foreground/60 to-muted-foreground/20"
      style={{ height: size * 1.4 }}
    />
    {/* Bear */}
    <motion.img
      src={sammyBear}
      alt=""
      className="drop-shadow-lg"
      style={{ width: size, height: size, objectFit: "contain" }}
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: dur * 0.8, delay: delay + 0.3, repeat: Infinity, ease: "easeInOut" }}
    />
  </motion.div>
);

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; username?: string }>({});
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [signupComplete, setSignupComplete] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const [isWalletLoading, setIsWalletLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn: stacksSignIn } = useStacksAuth();

  const handleWalletConnect = async () => {
    setIsWalletLoading(true);
    try {
      await stacksSignIn();
    } catch {
      toast({ title: "Wallet connection failed", description: "Could not connect wallet. Please try again.", variant: "destructive" });
    } finally {
      setIsWalletLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsGuestLoading(true);
    try {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) {
        toast({ title: "Guest access failed", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Welcome, Guest", description: "You may explore freely. Create an account to preserve your progress." });
      navigate("/");
    } catch {
      toast({ title: "Error", description: "An unexpected error occurred. Please try again.", variant: "destructive" });
    } finally {
      setIsGuestLoading(false);
    }
  };

  const validateForm = () => {
    try {
      if (isLogin) {
        authSchema.pick({ email: true, password: true }).parse({ email, password });
      } else {
        authSchema.parse({ email, password, username: username || undefined });
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { email?: string; password?: string; username?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0]) fieldErrors[err.path[0] as keyof typeof fieldErrors] = err.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          toast({
            title: "Login failed",
            description: error.message.includes("Invalid login credentials")
              ? "Invalid email or password. Please try again."
              : error.message,
            variant: "destructive",
          });
          return;
        }
        toast({ title: "Welcome back!", description: "You've successfully logged in." });
        navigate("/");
      } else {
        const redirectUrl = `${window.location.origin}/onboarding`;
        const { data: signUpData, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: { username: username || email.split("@")[0] },
          },
        });

        if (error) {
          if (error.message.includes("already registered")) {
            toast({ title: "Account exists", description: "This email is already registered. Please log in instead.", variant: "destructive" });
            setIsLogin(true);
          } else {
            toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
          }
          return;
        }

        if (signUpData.user) {
          await supabase.from("profiles").upsert({
            user_id: signUpData.user.id,
            username: username || email.split("@")[0],
          }, { onConflict: "user_id" });
        }

        setSignupEmail(email);
        setSignupComplete(true);
      }
    } catch {
      toast({ title: "Error", description: "An unexpected error occurred. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Email verification pending screen ──────────────────────────────────────
  if (signupComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8 overflow-hidden relative">
        {/* Hanging bears in background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {HANGING_BEARS.map((bear, i) => (
            <HangingBear key={i} {...bear} />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6"
          >
            <Mail className="w-10 h-10 text-primary" />
          </motion.div>
          <h1 className="text-3xl font-black text-foreground mb-3">Check Your Email</h1>
          <p className="text-muted-foreground mb-2">We sent a verification link to</p>
          <p className="text-primary font-semibold text-lg mb-6">{signupEmail}</p>
          <div className="bg-card border border-border rounded-xl p-6 mb-6 text-left space-y-3">
            {[
              "Click the link in the email to verify your account.",
              "After verifying, you'll be asked to set your learning level.",
              "Check your spam folder if you don't see it.",
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
          <Button variant="outline" onClick={() => { setSignupComplete(false); setIsLogin(true); }} className="w-full">
            Back to Sign In
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background overflow-hidden relative">

      {/* ── Animated hanging bears background ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {HANGING_BEARS.map((bear, i) => (
          <HangingBear key={i} {...bear} />
        ))}
        {/* Vignette overlay so bears fade into the dark background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background/90" />
        {/* Subtle radial orange glow from top */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-20"
          style={{ background: "radial-gradient(ellipse, hsl(var(--primary) / 0.5) 0%, transparent 70%)" }}
        />
      </div>

      {/* ── Left side hero panel (lg+) ── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col items-center justify-center relative z-10 px-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          {/* Big bouncy mascot */}
          <motion.img
            src={sammyBear}
            alt="Sammy the AI"
            className="w-72 h-72 object-contain mx-auto drop-shadow-2xl"
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-5xl font-black mt-6 mb-3 leading-tight"
          >
            <span className="text-shimmer">SMENTOR</span>
            <span className="text-primary">AI</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-muted-foreground text-lg max-w-xs mx-auto"
          >
            Your AI-powered guide to mastering the{" "}
            <span className="text-primary font-semibold">Stacks</span> ecosystem.
          </motion.p>

          {/* Floating stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="flex gap-6 justify-center mt-8"
          >
            {[
              { value: "10+", label: "Topics" },
              { value: "∞", label: "Learning" },
              { value: "🏆", label: "Badges" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-black text-primary">{stat.value}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* ── Right side auth form ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Back button */}
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6 text-muted-foreground hover:text-foreground -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          {/* Card */}
          <div className="bg-card/80 backdrop-blur-xl border border-border/60 rounded-2xl p-8 shadow-2xl"
               style={{ boxShadow: "0 24px 60px -12px hsl(var(--primary) / 0.15), 0 8px 20px -6px hsl(0 0% 0% / 0.6)" }}>

            {/* Header */}
            <div className="mb-7 flex items-center gap-4">
              <img src={sammyBear} alt="Sammy" className="w-12 h-12 object-contain lg:hidden" />
              <div>
                <h1 className="text-2xl font-black text-primary tracking-tight">SAMMY THE AI</h1>
                <p className="text-muted-foreground text-sm">
                  {isLogin ? "Welcome back! Sign in to continue." : "Create an account to get started."}
                </p>
              </div>
            </div>

            {/* Tab toggle */}
            <div className="flex gap-1 mb-7 p-1 bg-muted/50 rounded-xl border border-border/40">
              {[
                { label: "Sign In", value: true, Icon: LogIn },
                { label: "Sign Up", value: false, Icon: UserPlus },
              ].map(({ label, value, Icon }) => (
                <button
                  key={label}
                  onClick={() => setIsLogin(value)}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                    isLogin === value
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-1.5">
                  <Label htmlFor="username" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`bg-background/60 border-border/60 focus:border-primary/60 ${errors.username ? "border-destructive" : ""}`}
                  />
                  {errors.username && <p className="text-xs text-destructive">{errors.username}</p>}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`bg-background/60 border-border/60 focus:border-primary/60 ${errors.email ? "border-destructive" : ""}`}
                  required
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`bg-background/60 border-border/60 focus:border-primary/60 pr-10 ${errors.password ? "border-destructive" : ""}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full inline-block"
                    />
                    {isLogin ? "Signing in…" : "Creating account…"}
                  </span>
                ) : (
                  isLogin ? "Sign In" : "Create Account"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {/* Stacks Wallet */}
            <Button
              type="button"
              onClick={handleWalletConnect}
              disabled={isWalletLoading}
              className="w-full h-12 text-sm font-semibold mb-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
            >
              {isWalletLoading ? (
                <span className="flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full inline-block"
                  />
                  Connecting Wallet…
                </span>
              ) : (
                <>
                  <Wallet className="w-4 h-4" />
                  Connect Stacks Wallet
                </>
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground mb-5">Xverse · Leather · Asigna supported</p>

            {/* Divider */}
            <div className="relative mb-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/30" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground">Or</span>
              </div>
            </div>

            {/* Guest */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGuestLogin}
              disabled={isGuestLoading}
              className="w-full h-11 text-sm font-medium rounded-xl border-border/60 hover:bg-muted/50 hover:scale-[1.01] transition-all"
            >
              {isGuestLoading ? (
                <span className="flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full inline-block"
                  />
                  Entering as Guest…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Continue as Guest
                </span>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground mt-3">
              Guest progress is temporary.{" "}
              <button onClick={() => setIsLogin(false)} className="text-primary hover:underline">
                Create an account
              </button>{" "}
              to persist your journey.
            </p>

            {/* Toggle sign in / sign up */}
            <p className="text-center text-sm text-muted-foreground mt-5 pt-5 border-t border-border/30">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline font-semibold">
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
