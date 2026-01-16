import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/hooks/useProducts";
import { useState } from "react";

const DesktopNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();
  const { data: products = [] } = useProducts();
  const [showBrands, setShowBrands] = useState(false);

  // Extract unique brands
  const brands = Array.from(new Set(products
    .map(p => p.brand)
    .filter((b): b is string => !!b)
  )).sort();

  const navLinks = [
    { label: "Home", path: "/home" },
    { label: "Shop", path: "/products" },
    { label: "New Arrivals", path: "/products?filter=new" },
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
              <span className="material-symbols-outlined brain-gradient-text text-3xl">bolt</span>
            </div>
            <span className="font-display text-2xl font-bold tracking-tight text-foreground group-hover:brain-gradient-text transition-all">
              BRAINHUB
            </span>
          </button>

          {/* Nav Links */}
          <nav className="flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`relative font-sans text-sm font-medium transition-colors ${isActive(link.path)
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

            {/* Brands Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setShowBrands(true)}
              onMouseLeave={() => setShowBrands(false)}
            >
              <button
                className={`relative font-sans text-sm font-medium transition-colors flex items-center gap-1 ${location.search.includes("brand") ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Brands
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </button>

              <AnimatePresence>
                {showBrands && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 pt-4 w-48"
                  >
                    <div className="bg-card border border-border rounded-xl shadow-xl overflow-hidden p-2">
                      {brands.length > 0 ? (
                        <div className="flex flex-col gap-1 max-h-64 overflow-y-auto no-scrollbar">
                          {brands.map(brand => (
                            <button
                              key={brand}
                              onClick={() => {
                                navigate(`/products?brand=${encodeURIComponent(brand)}`);
                                setShowBrands(false);
                              }}
                              className="text-left px-3 py-2 rounded-lg hover:bg-surface text-sm text-foreground/80 hover:text-primary transition-colors"
                            >
                              {brand}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 text-xs text-muted-foreground">No brands found</div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {cartCount}
                </span>
              )}
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
