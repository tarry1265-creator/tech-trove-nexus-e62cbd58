import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/hooks/useProducts";
import { useState } from "react";
import logo from "@/assets/logo.png";

const DesktopNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();
  const { user, profile } = useAuth();
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
    { label: "Repair", path: "/repair" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="hidden lg:block sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="content-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => navigate("/home")}
            className="flex items-center"
          >
            <img src={logo} alt="BrainHub Tech" className="h-10 w-auto" />
          </button>

          {/* Nav Links */}
          <nav className="flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(link.path)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
              >
                {link.label}
              </button>
            ))}

            {/* Brands Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setShowBrands(true)}
              onMouseLeave={() => setShowBrands(false)}
            >
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${location.search.includes("brand") 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                Brands
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </button>

              {showBrands && (
                <div className="absolute top-full left-0 pt-2 w-48">
                  <div className="bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                    {brands.length > 0 ? (
                      <div className="flex flex-col max-h-64 overflow-y-auto py-1">
                        {brands.map(brand => (
                          <button
                            key={brand}
                            onClick={() => {
                              navigate(`/products?brand=${encodeURIComponent(brand)}`);
                              setShowBrands(false);
                            }}
                            className="text-left px-4 py-2 hover:bg-muted text-sm text-foreground transition-colors"
                          >
                            {brand}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 text-sm text-muted-foreground">No brands found</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <button
              onClick={() => navigate("/search")}
              className="p-2.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <span className="material-symbols-outlined text-[22px]">search</span>
            </button>

            {/* Cart */}
            <button
              onClick={() => navigate("/cart")}
              className="relative p-2.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            {/* Profile */}
            <button
              onClick={() => navigate("/profile")}
              className="ml-1 w-9 h-9 rounded-full overflow-hidden border-2 border-transparent hover:border-primary transition-colors"
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="material-symbols-outlined text-muted-foreground text-lg">person</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DesktopNav;
