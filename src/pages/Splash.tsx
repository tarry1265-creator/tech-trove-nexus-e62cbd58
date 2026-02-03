import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/home"), 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-5">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
          <span className="material-symbols-outlined text-primary-foreground text-4xl">memory</span>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground tracking-tight mb-1">BRAINHUB</h1>
          <p className="text-muted-foreground text-sm">Tech & Gadgets</p>
        </div>
      </div>

      <div className="absolute bottom-24 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0ms" }} />
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "150ms" }} />
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
};

export default Splash;
