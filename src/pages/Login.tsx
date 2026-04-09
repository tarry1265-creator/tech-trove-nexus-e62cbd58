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

  const [isSignUpMode, setIsSignUpMode] = useState(initialTab === "signup");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
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
  }, [user, loading, navigate, isBanned, signOut]);

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
      const { data: profileData } = await supabase
        .from("profiles")
        .select("is_banned")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id || "")
        .single();

      if (profileData?.is_banned) {
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
    const { error } = await signUp(email, password, {
      username: username.trim() || undefined,
      phone_number: phone.trim() || undefined,
    });
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
      setIsSignUpMode(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUpMode) {
      handleSignUp();
    } else {
      handleSignIn();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className={`login-container ${isSignUpMode ? "sign-up-mode" : ""}`}>
      {/* Forms */}
      <div className="login-forms-container">
        <div className="login-signin-signup">
          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className={`login-form ${isSignUpMode ? "login-form-hidden" : "login-form-visible"}`}>
            <h2 className="text-2xl font-bold text-foreground mb-2">Sign in</h2>
            <div className="login-input-field">
              <span className="material-symbols-outlined text-muted-foreground">mail</span>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="login-input-field">
              <span className="material-symbols-outlined text-muted-foreground">lock</span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-muted-foreground hover:text-foreground"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? "visibility" : "visibility_off"}
                </span>
              </button>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="login-btn login-btn-solid"
            >
              {isSubmitting ? "Please wait..." : "Login"}
            </button>
          </form>

          {/* Sign Up Form */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSignUp(); }}
            className={`login-form ${isSignUpMode ? "login-form-visible" : "login-form-hidden"}`}
          >
            <h2 className="text-2xl font-bold text-foreground mb-2">Sign up</h2>
            <div className="login-input-field">
              <span className="material-symbols-outlined text-muted-foreground">person</span>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="login-input-field">
              <span className="material-symbols-outlined text-muted-foreground">mail</span>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="login-input-field">
              <span className="material-symbols-outlined text-muted-foreground">phone</span>
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="login-input-field">
              <span className="material-symbols-outlined text-muted-foreground">lock</span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="login-btn login-btn-solid"
            >
              {isSubmitting ? "Please wait..." : "Sign up"}
            </button>
          </form>
        </div>
      </div>

      {/* Panels */}
      <div className="login-panels-container">
        <div className="login-panel login-left-panel">
          <div className="login-panel-content">
            <h3 className="text-xl font-semibold text-primary-foreground">New here?</h3>
            <p className="text-primary-foreground/80 text-sm my-3">
              Create an account to start shopping and enjoy exclusive benefits!
            </p>
            <button
              type="button"
              onClick={() => setIsSignUpMode(true)}
              className="login-btn login-btn-transparent"
            >
              Sign up
            </button>
          </div>
        </div>
        <div className="login-panel login-right-panel">
          <div className="login-panel-content">
            <h3 className="text-xl font-semibold text-primary-foreground">One of us?</h3>
            <p className="text-primary-foreground/80 text-sm my-3">
              We respect your privacy. Log in to access your account.
            </p>
            <button
              type="button"
              onClick={() => setIsSignUpMode(false)}
              className="login-btn login-btn-transparent"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>

      {/* Banned Modal */}
      {showBannedModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center px-4">
          <div className="bg-background rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-destructive text-3xl">block</span>
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Account Banned</h2>
              <p className="text-muted-foreground text-sm mb-4">
                Your account has been suspended. If you believe this is an error, please send an appeal email to:
              </p>
              <a href="mailto:Brainhubtek@gmail.com" className="text-primary font-semibold hover:underline">
                Brainhubtek@gmail.com
              </a>
              <button onClick={() => setShowBannedModal(false)} className="btn-primary w-full mt-6 py-3">
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .login-container {
          position: relative;
          width: 100%;
          background-color: hsl(var(--background));
          min-height: 100vh;
          overflow: hidden;
        }

        .login-forms-container {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }

        .login-signin-signup {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          left: 75%;
          width: 50%;
          transition: 1s 0.7s ease-in-out;
          display: grid;
          grid-template-columns: 1fr;
          z-index: 5;
        }

        .login-form {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0 3rem;
          transition: all 0.2s 0.7s;
          overflow: hidden;
          grid-column: 1 / 2;
          grid-row: 1 / 2;
        }

        .login-form-hidden {
          opacity: 0;
          z-index: 1;
        }

        .login-form-visible {
          opacity: 1;
          z-index: 2;
        }

        .login-input-field {
          max-width: 380px;
          width: 100%;
          background-color: hsl(var(--muted));
          margin: 8px 0;
          height: 55px;
          border-radius: 55px;
          display: grid;
          grid-template-columns: 15% 85%;
          padding: 0 0.4rem;
          position: relative;
          align-items: center;
        }

        .login-input-field span {
          text-align: center;
          line-height: 55px;
        }

        .login-input-field input {
          background: none;
          outline: none;
          border: none;
          line-height: 1;
          font-weight: 500;
          font-size: 0.95rem;
          color: hsl(var(--foreground));
          font-family: 'Poppins', sans-serif;
        }

        .login-input-field input::placeholder {
          color: hsl(var(--muted-foreground));
          font-weight: 400;
        }

        .login-btn {
          width: 150px;
          border: none;
          outline: none;
          height: 49px;
          border-radius: 49px;
          color: #fff;
          text-transform: uppercase;
          font-weight: 600;
          margin: 10px 0;
          cursor: pointer;
          transition: 0.5s;
          text-align: center;
          padding: 12px;
          font-family: 'Poppins', sans-serif;
          font-size: 0.85rem;
        }

        .login-btn-solid {
          background-color: hsl(var(--primary));
        }

        .login-btn-solid:hover {
          opacity: 0.9;
        }

        .login-btn-solid:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .login-btn-transparent {
          background: none;
          border: 2px solid #fff;
          width: 130px;
          height: 41px;
          font-size: 0.8rem;
          color: #fff;
        }

        .login-panels-container {
          position: absolute;
          height: 100%;
          width: 100%;
          top: 0;
          left: 0;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
        }

        .login-container::before {
          content: "";
          position: absolute;
          height: 2000px;
          width: 2000px;
          top: -10%;
          right: 48%;
          transform: translateY(-50%);
          background-image: linear-gradient(-45deg, #285A48 0%, #408A71 100%);
          transition: 1.8s ease-in-out;
          border-radius: 50%;
          z-index: 6;
        }

        .login-panel {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: space-around;
          text-align: center;
          z-index: 6;
        }

        .login-left-panel {
          pointer-events: all;
          padding: 3rem 17% 2rem 12%;
        }

        .login-right-panel {
          pointer-events: none;
          padding: 3rem 12% 2rem 17%;
        }

        .login-panel-content {
          color: #fff;
          transition: transform 0.9s ease-in-out;
          transition-delay: 0.6s;
        }

        .login-right-panel .login-panel-content {
          transform: translateX(800px);
        }

        /* SIGN UP MODE ANIMATIONS */
        .login-container.sign-up-mode::before {
          transform: translate(100%, -50%);
          right: 52%;
        }

        .login-container.sign-up-mode .login-left-panel .login-panel-content {
          transform: translateX(-800px);
        }

        .login-container.sign-up-mode .login-signin-signup {
          left: 25%;
        }

        .login-container.sign-up-mode .login-right-panel .login-panel-content {
          transform: translateX(0%);
        }

        .login-container.sign-up-mode .login-left-panel {
          pointer-events: none;
        }

        .login-container.sign-up-mode .login-right-panel {
          pointer-events: all;
        }

        /* MOBILE RESPONSIVE */
        @media (max-width: 870px) {
          .login-container {
            min-height: 800px;
            height: 100vh;
          }

          .login-signin-signup {
            width: 100%;
            top: 95%;
            transform: translate(-50%, -100%);
            transition: 1s 0.8s ease-in-out;
          }

          .login-signin-signup,
          .login-container.sign-up-mode .login-signin-signup {
            left: 50%;
          }

          .login-panels-container {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr 2fr 1fr;
          }

          .login-panel {
            flex-direction: row;
            justify-content: space-around;
            align-items: center;
            padding: 2.5rem 8%;
            grid-column: 1 / 2;
          }

          .login-right-panel {
            grid-row: 3 / 4;
          }

          .login-left-panel {
            grid-row: 1 / 2;
          }

          .login-panel-content {
            padding-right: 15%;
            transition: transform 0.9s ease-in-out;
            transition-delay: 0.8s;
          }

          .login-container::before {
            width: 1500px;
            height: 1500px;
            transform: translateX(-50%);
            left: 30%;
            bottom: 68%;
            right: initial;
            top: initial;
            transition: 2s ease-in-out;
          }

          .login-container.sign-up-mode::before {
            transform: translate(-50%, 100%);
            bottom: 32%;
            right: initial;
          }

          .login-container.sign-up-mode .login-left-panel .login-panel-content {
            transform: translateY(-300px);
          }

          .login-container.sign-up-mode .login-right-panel .login-panel-content {
            transform: translateY(0px);
          }

          .login-right-panel .login-panel-content {
            transform: translateY(300px);
          }

          .login-container.sign-up-mode .login-signin-signup {
            top: 5%;
            transform: translate(-50%, 0);
          }
        }

        @media (max-width: 570px) {
          .login-form {
            padding: 0 1.5rem;
          }

          .login-panel-content {
            padding: 0.5rem 1rem;
          }

          .login-container {
            padding: 1.5rem;
          }

          .login-container::before {
            bottom: 72%;
            left: 50%;
          }

          .login-container.sign-up-mode::before {
            bottom: 28%;
            left: 50%;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
