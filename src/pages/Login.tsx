import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user, loading } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate("/home");
    }
  }, [user, loading, navigate]);

  const validateInputs = () => {
    try {
      emailSchema.parse(email);
    } catch {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return false;
    }

    try {
      passwordSchema.parse(password);
    } catch {
      toast({
        title: "Invalid password",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
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
      if (error.message.includes("Invalid login credentials")) {
        toast({
          title: "Login failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      } else if (error.message.includes("Email not confirmed")) {
        toast({
          title: "Email not verified",
          description: "Please check your email and click the verification link before logging in.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } else {
      navigate("/home");
    }
  };

  const handleSignUp = async () => {
    if (!validateInputs()) return;

    if (activeTab === "signup" && !fullName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your full name.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const { error } = await signUp(email, password);
    setIsSubmitting(false);

    if (error) {
      if (error.message.includes("already registered")) {
        toast({
          title: "Account exists",
          description: "This email is already registered. Please sign in instead.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Check your email!",
        description: "We've sent you a verification link. Please click it to activate your account.",
      });
      setActiveTab("signin");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "signin") {
      handleSignIn();
    } else {
      handleSignUp();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24">
        <div className="max-w-md mx-auto w-full">
          {/* Logo */}
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5 mb-10">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-primary-foreground text-xl">memory</span>
            </div>
            <span className="text-2xl font-bold text-foreground">BRAINHUB</span>
          </button>

          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
            {activeTab === "signin" ? "Welcome back" : "Create account"}
          </h1>
          <p className="text-muted-foreground mb-8">
            {activeTab === "signin" ? "Sign in to continue shopping" : "Join us for exclusive offers"}
          </p>

          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg mb-8">
            <button
              onClick={() => setActiveTab("signin")}
              className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all ${activeTab === "signin" 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab("signup")}
              className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all ${activeTab === "signup" 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === "signup" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="input-field"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
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

            {activeTab === "signin" && (
              <div className="flex justify-end">
                <button type="button" className="text-sm text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary py-3 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? "Please wait..."
                : activeTab === "signin"
                ? "Sign In"
                : "Create Account"}
            </button>
          </form>

          {activeTab === "signup" && (
            <p className="text-xs text-muted-foreground text-center mt-6">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>
          )}
        </div>
      </div>

      {/* Right Panel - Visual (Desktop only) */}
      <div className="hidden lg:flex flex-1 bg-primary p-8">
        <div className="w-full h-full rounded-2xl overflow-hidden relative flex items-center justify-center">
          <img
            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=1200&fit=crop"
            alt="Premium Headphones"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/60" />
          <div className="absolute bottom-10 left-10 right-10">
            <h2 className="text-3xl font-bold text-primary-foreground mb-2">Premium Tech Experience</h2>
            <p className="text-primary-foreground/80">Discover the best gadgets for your lifestyle.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
