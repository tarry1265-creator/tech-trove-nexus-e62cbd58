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
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
          <span className="material-symbols-outlined text-primary-foreground text-4xl">memory</span>
        </div>

        <div className="text-center">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">BRAINHUB</h1>
          <p className="text-muted-foreground text-sm tracking-wider uppercase">Tech & Gadgets</p>
        </div>
      </div>

      <div className="absolute bottom-20 w-32 h-1 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full animate-pulse"
          style={{ width: "100%", animation: "pulse 1s ease-in-out infinite" }}
        />
      </div>
    </div>
  );
};

export default Splash;
