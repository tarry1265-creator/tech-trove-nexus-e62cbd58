import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="page-container flex min-h-screen items-center justify-center">
      <div className="glass-card rounded-3xl p-10 text-center max-w-md w-full">
        <h1 className="mb-3 text-5xl font-bold brain-gradient-text">404</h1>
        <p className="mb-6 text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="inline-flex btn-premium px-6 py-3">
          Return home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
