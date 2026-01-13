import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/home");
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-between bg-background overflow-hidden p-6">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="flex-1" />
      
      {/* Logo section */}
      <motion.div 
        className="relative z-10 flex flex-col items-center justify-center space-y-8 flex-[1.5]"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative group">
          <div className="absolute inset-0 rounded-full border border-primary/20 scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse-glow" />
          <div className="relative flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[96px] logo-glow">
              hub
            </span>
          </div>
        </div>
        
        <div className="text-center">
          <h1 className="text-foreground tracking-[0.2em] text-4xl font-bold leading-tight">
            ROOTHUB
          </h1>
          <div className="h-1 w-8 bg-primary mx-auto mt-4 rounded-full" />
        </div>
      </motion.div>
      
      {/* Bottom section */}
      <motion.div 
        className="flex flex-col items-center justify-end pb-8 flex-1 w-full z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="h-1 w-32 bg-muted rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.5, ease: "easeInOut" }}
            />
          </div>
          <p className="text-muted-foreground text-xs font-medium tracking-wide text-center px-4">
            Home of gadgets and all things accessories
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Splash;
