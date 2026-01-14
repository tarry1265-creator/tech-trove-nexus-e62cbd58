import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const DesktopNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { label: "Home", path: "/home" },
    { label: "Shop", path: "/products" },
    { label: "New Arrivals", path: "/products?filter=new" },
    { label: "Brands", path: "/products?filter=brands" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="hidden lg:block sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="content-container">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <button 
            onClick={() => navigate("/home")}
            className="flex items-center gap-3 group"
          >
            <div className="relative">
              <span className="material-symbols-outlined text-primary text-3xl">hub</span>
            </div>
            <span className="font-display text-2xl font-bold tracking-tight text-foreground">
              ROOTHUB
            </span>
          </button>

          {/* Nav Links */}
          <nav className="flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`relative font-sans text-sm font-medium transition-colors ${
                  isActive(link.path) 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
                {isActive(link.path) && (
                  <motion.div 
                    layoutId="activeNav"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <button 
              onClick={() => navigate("/search")}
              className="p-2.5 rounded-full hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            >
              <span className="material-symbols-outlined text-[22px]">search</span>
            </button>

            {/* Wishlist */}
            <button 
              onClick={() => navigate("/wishlist")}
              className="p-2.5 rounded-full hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            >
              <span className="material-symbols-outlined text-[22px]">favorite_border</span>
            </button>

            {/* Cart */}
            <button 
              onClick={() => navigate("/cart")}
              className="relative p-2.5 rounded-full hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            >
              <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
              <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {/* Profile */}
            <button 
              onClick={() => navigate("/profile")}
              className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-border hover:ring-primary transition-all"
            >
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face" 
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DesktopNav;
