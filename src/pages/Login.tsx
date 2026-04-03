import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "signup" ? "signup" : "signin";
  const { signIn, signUp, user, loading, isBanned, signOut } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"signin" | "signup">(initialTab as any);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBannedModal, setShowBannedModal] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (isBanned) {
        setShowBannedModal(true);
        signOut();
      } else {
        navigate("/home");
      }
    }
  }, [user, loading, navigate, isBanned]);

  const validateInputs = () => {
    try { emailSchema.parse(email); } catch {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return false;
    }
    try { passwordSchema.parse(password); } catch {
      toast({ title: "Invalid password", description: "Password must be at least 6 characters.", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSignIn = async () => {
    if (!validateInputs()) return;
    setIsSubmitting(true);
    const { error } = await signIn(email, password);
    setIsSubmitting(false);
    if (error) {
      toast({
        title: "Login failed",
        description: error.message.includes("Invalid login credentials")
          ? "Invalid email or password."
          : error.message.includes("Email not confirmed")
          ? "Please verify your email first."
          : error.message,
        variant: "destructive",
      });
    } else {
      // Check ban status after login
      const { data: profileData } = await supabase
        .from("profiles")
        .select("is_banned")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id || "")
        .single();

      if (profileData && (profileData as any).is_banned) {
        setShowBannedModal(true);
        await signOut();
        return;
      }
      navigate("/home");
    }
  };

  const handleSignUp = async () => {
    if (!validateInputs()) return;
    setIsSubmitting(true);
    const { error } = await signUp(email, password);
    setIsSubmitting(false);
    if (error) {
      toast({
        title: error.message.includes("already registered") ? "Account exists" : "Sign up failed",
        description: error.message.includes("already registered")
          ? "This email is already registered. Please sign in."
          : error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Check your email!", description: "We've sent you a verification link." });
      setActiveTab("signin");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    activeTab === "signin" ? handleSignIn() : handleSignUp();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-md">
        {/* Greeting */}
        <div className="mb-8">
          <p className="text-muted-foreground text-sm font-medium mb-1">
            HI FELLA 👋
          </p>
          {activeTab === "signin" ? (
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Welcome Back</h1>
          ) : (
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Welcome to <span className="text-primary">BRAINHUB</span>
            </h1>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email</label>
            <input
              type="email"
              placeholder="Eg. jamesburnes@gmail.com"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Phone - signup only */}
          {activeTab === "signup" && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Phone number</label>
              <div className="flex gap-2">
                <div className="flex items-center px-3 rounded-xl border border-input bg-muted text-sm text-muted-foreground min-w-[60px] justify-center">
                  +234
                </div>
                <input
                  type="tel"
                  placeholder=""
                  className="input-field flex-1"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder=""
                className="input-field pr-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? "visibility" : "visibility_off"}
                </span>
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary py-3.5 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {isSubmitting ? "Please wait..." : activeTab === "signin" ? "Login" : "Sign Up"}
          </button>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between mt-8">
          {activeTab === "signin" ? (
            <>
              <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Forgot password?
              </button>
              <button
                onClick={() => setActiveTab("signup")}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              <span className="text-sm text-muted-foreground">Don't have an account?</span>
              <button
                onClick={() => setActiveTab("signin")}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>

      {/* Banned Modal */}
      {showBannedModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-background rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-destructive text-3xl">block</span>
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Account Banned</h2>
              <p className="text-muted-foreground text-sm mb-4">
                Your account has been suspended. If you believe this is an error, please send an appeal email to:
              </p>
              <a
                href="mailto:Brainhubtek@gmail.com"
                className="text-primary font-semibold hover:underline"
              >
                Brainhubtek@gmail.com
              </a>
              <button
                onClick={() => setShowBannedModal(false)}
                className="btn-primary w-full mt-6 py-3"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
