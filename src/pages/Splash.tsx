import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import onboardHero from "@/assets/onboard-hero.jpg";

const Splash = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate("/home", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-full flex-col">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={onboardHero}
          alt="Tech workspace"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
      </div>

      {/* Content at bottom */}
      <div className="relative mt-auto px-6 pb-12 sm:px-10 sm:pb-16 lg:flex lg:items-end lg:justify-between lg:px-20 lg:pb-20 max-w-5xl lg:mx-auto lg:w-full">
        <div className="mb-8 lg:mb-0">
          <p className="text-primary text-xs font-semibold uppercase tracking-widest mb-3">
            WELCOME
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-2">
            BRAINHUB
          </h1>
          <p className="text-white/70 text-sm sm:text-base max-w-xs">
            We serve you with the best tech gadgets and accessories
          </p>
        </div>

        <div className="flex flex-col gap-3 lg:items-end lg:min-w-[280px]">
          <button
            onClick={() => navigate("/home")}
            className="w-full lg:w-72 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
          >
            Browse Shop
          </button>
          <button
            onClick={() => navigate("/login")}
            className="w-full lg:w-72 py-3 rounded-xl text-white font-semibold text-sm hover:bg-white/10 transition-all"
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
};

export default Splash;
