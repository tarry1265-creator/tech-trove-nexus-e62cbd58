import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-20">
        <motion.div
          className="max-w-md mx-auto w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Logo */}
          <button onClick={() => navigate("/")} className="flex items-center gap-2 mb-10">
            <span className="material-symbols-outlined brain-gradient-text text-3xl">bolt</span>
            <span className="font-display text-2xl font-bold brain-gradient-text">BRAINHUB</span>
          </button>

          <h1 className="font-display text-3xl font-bold mb-2">
            {activeTab === "signin" ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-muted-foreground mb-8">
            {activeTab === "signin" ? "Sign in to continue shopping" : "Join us for exclusive offers"}
          </p>

          {/* Tabs */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab("signin")}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${activeTab === "signin" ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground"
                }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab("signup")}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${activeTab === "signup" ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground"
                }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === "signup" && (
              <input
                type="text"
                placeholder="Full Name"
                className="input-premium"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            )}
            <input
              type="email"
              placeholder="Email Address"
              className="input-premium"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="input-premium pr-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? "visibility" : "visibility_off"}
                </span>
              </button>
            </div>

            {activeTab === "signin" && (
              <div className="flex justify-end">
                <button type="button" className="text-sm text-primary hover:underline">
                  Forgot Password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-premium py-4 mt-4 disabled:opacity-50"
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
        </motion.div>
      </div>

      {/* Right Panel - Image (Desktop only) */}
      <div className="hidden lg:block flex-1 bg-gradient-to-br from-surface to-card p-12">
        <div className="h-full rounded-3xl overflow-hidden relative">
          <img
            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=1200&fit=crop"
            alt="Premium Headphones"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          <div className="absolute bottom-10 left-10 right-10">
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">Intelligent Audio Experience</h2>
            <p className="text-muted-foreground">Discover the smartest audio gear for your mind.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
