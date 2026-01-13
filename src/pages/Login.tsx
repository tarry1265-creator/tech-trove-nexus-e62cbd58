import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Login = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="bg-background font-display min-h-screen flex flex-col justify-between items-center text-foreground">
      {/* Top Bar */}
      <div className="w-full flex items-center justify-between p-4 pb-2">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 text-foreground hover:opacity-75 transition-opacity"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex-1 text-center">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary">
            <span className="material-symbols-outlined text-lg">devices</span>
          </div>
        </div>
        <div className="w-10" />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 w-full max-w-md px-6 pb-8 flex flex-col overflow-y-auto no-scrollbar">
        {/* Header */}
        <motion.div 
          className="pt-6 pb-6 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold leading-tight tracking-tight mb-2">Welcome Back</h1>
          <p className="text-muted-foreground text-base font-normal">Your gateway to premium gadgets.</p>
        </motion.div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex border-b border-border relative">
            <button 
              onClick={() => setActiveTab("signin")}
              className="flex-1 pb-3 pt-2 text-center relative group"
            >
              <span className={`text-sm font-bold tracking-wide ${activeTab === "signin" ? "text-primary" : "text-muted-foreground hover:text-foreground"} transition-colors`}>
                Sign In
              </span>
              <div className={`absolute bottom-0 left-0 w-full h-[3px] rounded-t-sm transition-colors ${activeTab === "signin" ? "bg-primary" : "bg-transparent group-hover:bg-muted"}`} />
            </button>
            <button 
              onClick={() => setActiveTab("signup")}
              className="flex-1 pb-3 pt-2 text-center relative group"
            >
              <span className={`text-sm font-bold tracking-wide ${activeTab === "signup" ? "text-primary" : "text-muted-foreground hover:text-foreground"} transition-colors`}>
                Create Account
              </span>
              <div className={`absolute bottom-0 left-0 w-full h-[3px] rounded-t-sm transition-colors ${activeTab === "signup" ? "bg-primary" : "bg-transparent group-hover:bg-muted"}`} />
            </button>
          </div>
        </div>

        {/* Form */}
        <motion.div 
          className="flex flex-col gap-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {activeTab === "signup" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-muted-foreground" htmlFor="name">Full Name</label>
              <div className="relative">
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full h-12 px-4 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-muted-foreground transition-all text-base"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-muted-foreground" htmlFor="email">Email</label>
            <div className="relative">
              <input
                id="email"
                type="email"
                placeholder="enter your email address"
                className="w-full h-12 px-4 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-muted-foreground transition-all text-base"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                <span className="material-symbols-outlined text-[20px]">mail</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-muted-foreground" htmlFor="password">Password</label>
              {activeTab === "signin" && (
                <a className="text-xs font-medium text-primary hover:text-primary/80 transition-colors" href="#">
                  Forgot Password?
                </a>
              )}
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full h-12 px-4 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-muted-foreground transition-all text-base"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? "visibility" : "visibility_off"}
                </span>
              </button>
            </div>
          </div>

          <button 
            onClick={() => navigate("/home")}
            className="w-full h-14 mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span>{activeTab === "signin" ? "Sign In" : "Create Account"}</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>

          {activeTab === "signin" && (
            <div className="flex justify-center mt-2">
              <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                <span className="material-symbols-outlined">face</span>
                <span>Use Face ID</span>
              </button>
            </div>
          )}
        </motion.div>

        {/* Social Divider */}
        <div className="relative py-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Or continue with
            </span>
          </div>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2 h-12 px-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors group">
            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M23.7663 12.2764C23.7663 11.4607 23.7 10.6406 23.559 9.83807H12.2402V14.4591H18.722C18.453 15.9494 17.5887 17.2678 16.3233 18.1056V21.1039H20.1903C22.4611 19.0139 23.7663 15.9273 23.7663 12.2764Z" fill="#4285F4"/>
              <path d="M12.2399 24.0008C15.4764 24.0008 18.2057 22.9382 20.1943 21.1039L16.3273 18.1055C15.2515 18.8375 13.8625 19.252 12.2443 19.252C9.11366 19.252 6.45924 17.1399 5.50683 14.3003H1.51636V17.3912C3.55349 21.4434 7.70268 24.0008 12.2399 24.0008Z" fill="#34A853"/>
              <path d="M5.50277 14.3003C5.00209 12.8099 5.00209 11.1961 5.50277 9.70575V6.61481H1.51677C-0.185632 10.0056 -0.185632 14.0004 1.51677 17.3912L5.50277 14.3003Z" fill="#FBBC05"/>
              <path d="M12.2399 4.74966C13.9507 4.7232 15.6042 5.36697 16.8437 6.54867L20.2693 3.12262C18.0998 1.0855 15.2206 -0.0344664 12.2399 0.000808666C7.70268 0.000808666 3.55349 2.55822 1.51636 6.61039L5.50236 9.70132C6.45042 6.86173 9.10924 4.74966 12.2399 4.74966Z" fill="#EA4335"/>
            </svg>
            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">Google</span>
          </button>
          <button className="flex items-center justify-center gap-2 h-12 px-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors group">
            <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.05 20.28C15.93 21.91 14.67 23.95 12.83 23.95C11.05 23.95 10.5 22.88 8.44 22.88C6.38 22.88 5.75 23.92 4.09 23.95C2.18 23.95 0.73 21.78 0.08 18.52C-0.62 14.88 1.95 9.4 5.35 9.4C7.03 9.4 8.28 10.54 9.38 10.54C10.42 10.54 11.83 9.25 13.58 9.25C14.33 9.25 16.5 9.32 17.88 11.33C17.75 11.41 15.65 12.65 15.65 15.35C15.65 18.56 18.23 19.64 18.3 19.67C18.25 19.82 17.89 21.05 17.05 20.28ZM12.03 6.67C12.89 5.61 13.48 4.14 13.31 2.67C12.06 2.73 10.53 3.51 9.63 4.56C8.82 5.48 8.1 6.99 8.29 8.46C9.68 8.57 11.16 7.72 12.03 6.67Z"/>
            </svg>
            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">Apple</span>
          </button>
        </div>

        <div className="mt-auto pt-8 text-center text-xs text-muted-foreground">
          <p>
            By continuing, you agree to our{" "}
            <a className="underline hover:text-primary" href="#">Terms of Service</a> and{" "}
            <a className="underline hover:text-primary" href="#">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
