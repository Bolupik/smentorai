import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, LogIn, UserPlus, ArrowLeft, User, Mail, CheckCircle, Wallet, ExternalLink, Smartphone } from "lucide-react";
import aiCharacter from "@/assets/ai-character.png";
import { z } from "zod";
import { useStacksAuth } from "@/hooks/useStacksAuth";
import { useAuth } from "@/contexts/AuthContext";

/** Returns true when running on a mobile/tablet device */
const isMobileDevice = () =>
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  username: z.string().min(2, "Username must be at least 2 characters").optional(),
});

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
  const { signIn: stacksSignIn, isAuthenticated: isWalletAuthenticated } = useStacksAuth();
  const { user } = useAuth();
  const isAuthenticated = !!user || isWalletAuthenticated;

  // If already authenticated, redirect to home
  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);
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
        const redirectUrl = `${window.location.origin}/`;

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

        // Create profile row (age_level will be set during onboarding)
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
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
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
          <p className="text-muted-foreground mb-2">
            We sent a verification link to
          </p>
          <p className="text-primary font-semibold text-lg mb-6">{signupEmail}</p>
          <div className="bg-card border border-border rounded-xl p-6 mb-6 text-left space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">Click the link in the email to verify your account.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">After verifying, you'll be asked to set your learning level.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">Check your spam folder if you don't see it.</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => { setSignupComplete(false); setIsLogin(true); }} className="w-full">
            Back to Sign In
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left side - Hero image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img src={aiCharacter} alt="Sammy" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="absolute bottom-12 left-12 max-w-md z-10">
          <h2 className="text-4xl font-black text-foreground mb-4">
            Track Your <span className="text-primary">Stacks</span> Journey
          </h2>
          <p className="text-muted-foreground text-lg">
            Sign in to save your progress, earn achievements, and continue learning where you left off.
          </p>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {isAuthenticated && (
            <Button variant="ghost" onClick={() => navigate("/")} className="mb-8 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          )}

          <div className="mb-8">
            <h1 className="text-3xl font-black text-primary mb-2">SAMMY THE AI</h1>
            <p className="text-muted-foreground">
              {isLogin ? "Welcome back! Sign in to continue." : "Create an account to get started."}
            </p>
          </div>

          {/* Toggle */}
          <div className="flex gap-2 mb-8 p-1 bg-muted/50 rounded-lg">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
                isLogin ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LogIn className="w-4 h-4 inline mr-2" />Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
                !isLogin ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserPlus className="w-4 h-4 inline mr-2" />Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`bg-card border-border ${errors.username ? "border-destructive" : ""}`}
                />
                {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`bg-card border-border ${errors.email ? "border-destructive" : ""}`}
                required
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`bg-card border-border pr-10 ${errors.password ? "border-destructive" : ""}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <Button type="submit" className="w-full py-6 text-lg font-bold" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                  />
                  {isLogin ? "Signing in..." : "Creating account..."}
                </span>
              ) : (
                <span>{isLogin ? "Sign In" : "Create Account"}</span>
              )}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* Stacks Wallet Connect */}
          <Button
            type="button"
            onClick={handleWalletConnect}
            disabled={isWalletLoading}
            className="w-full py-6 text-base font-semibold mb-3 bg-[hsl(var(--primary))] hover:bg-primary/90 text-primary-foreground rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.02]"
          >
            {isWalletLoading ? (
              <span className="flex items-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                />
                Connecting Wallet…
              </span>
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                Connect Stacks Wallet
              </>
            )}
          </Button>
          <p className="text-center text-xs text-muted-foreground mb-6">
            Xverse · Leather · Asigna supported
          </p>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGuestLogin}
            disabled={isGuestLoading}
            className="w-full py-6 text-lg font-medium border-border hover:bg-muted/50"
          >
            {isGuestLoading ? (
              <span className="flex items-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-foreground border-t-transparent rounded-full"
                />
                Entering as Guest...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Continue as Guest
              </span>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Guest progress is temporary. Create an account to persist your journey.
          </p>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline font-medium">
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
