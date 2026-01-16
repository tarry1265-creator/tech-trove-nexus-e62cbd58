import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Login = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);

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
          <div className="space-y-4">
            {activeTab === "signup" && (
              <input type="text" placeholder="Full Name" className="input-premium" />
            )}
            <input type="email" placeholder="Email Address" className="input-premium" />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="input-premium pr-12"
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
                <button className="text-sm text-primary hover:underline">Forgot Password?</button>
              </div>
            )}

            <button
              onClick={() => navigate("/home")}
              className="w-full btn-premium py-4 mt-4"
            >
              {activeTab === "signin" ? "Sign In" : "Create Account"}
            </button>
          </div>

          {/* Social */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-4 text-sm text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-3 border border-border rounded-lg hover:bg-accent transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M23.7663 12.2764C23.7663 11.4607 23.7 10.6406 23.559 9.83807H12.2402V14.4591H18.722C18.453 15.9494 17.5887 17.2678 16.3233 18.1056V21.1039H20.1903C22.4611 19.0139 23.7663 15.9273 23.7663 12.2764Z" fill="#4285F4" /><path d="M12.2399 24.0008C15.4764 24.0008 18.2057 22.9382 20.1943 21.1039L16.3273 18.1055C15.2515 18.8375 13.8625 19.252 12.2443 19.252C9.11366 19.252 6.45924 17.1399 5.50683 14.3003H1.51636V17.3912C3.55349 21.4434 7.70268 24.0008 12.2399 24.0008Z" fill="#34A853" /><path d="M5.50277 14.3003C5.00209 12.8099 5.00209 11.1961 5.50277 9.70575V6.61481H1.51677C-0.185632 10.0056 -0.185632 14.0004 1.51677 17.3912L5.50277 14.3003Z" fill="#FBBC05" /><path d="M12.2399 4.74966C13.9507 4.7232 15.6042 5.36697 16.8437 6.54867L20.2693 3.12262C18.0998 1.0855 15.2206 -0.0344664 12.2399 0.000808666C7.70268 0.000808666 3.55349 2.55822 1.51636 6.61039L5.50236 9.70132C6.45042 6.86173 9.10924 4.74966 12.2399 4.74966Z" fill="#EA4335" /></svg>
              <span className="font-medium">Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 py-3 border border-border rounded-lg hover:bg-accent transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.05 20.28C15.93 21.91 14.67 23.95 12.83 23.95C11.05 23.95 10.5 22.88 8.44 22.88C6.38 22.88 5.75 23.92 4.09 23.95C2.18 23.95 0.73 21.78 0.08 18.52C-0.62 14.88 1.95 9.4 5.35 9.4C7.03 9.4 8.28 10.54 9.38 10.54C10.42 10.54 11.83 9.25 13.58 9.25C14.33 9.25 16.5 9.32 17.88 11.33C17.75 11.41 15.65 12.65 15.65 15.35C15.65 18.56 18.23 19.64 18.3 19.67C18.25 19.82 17.89 21.05 17.05 20.28ZM12.03 6.67C12.89 5.61 13.48 4.14 13.31 2.67C12.06 2.73 10.53 3.51 9.63 4.56C8.82 5.48 8.1 6.99 8.29 8.46C9.68 8.57 11.16 7.72 12.03 6.67Z" /></svg>
              <span className="font-medium">Apple</span>
            </button>
          </div>
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
