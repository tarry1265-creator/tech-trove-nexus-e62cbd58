import { forwardRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";

interface NavItem {
  icon: string;
  filledIcon?: string;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: "home", filledIcon: "home", label: "Home", path: "/home" },
  { icon: "search", label: "Search", path: "/search" },
  { icon: "shopping_bag", label: "Cart", path: "/cart" },
  { icon: "favorite_border", filledIcon: "favorite", label: "Wishlist", path: "/wishlist" },
  { icon: "person_outline", filledIcon: "person", label: "Profile", path: "/profile" },
];

const BottomNav = forwardRef<HTMLElement, object>((_, ref) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart();

  return (
    <nav ref={ref} className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md pb-safe">
      <div className="flex justify-around items-center h-16 rounded-2xl bg-card/70 border border-border/50 backdrop-blur-xl shadow-soft">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === "/products" && location.pathname.startsWith("/products"));
          const badgeCount = item.path === "/cart" ? cartCount : 0;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center justify-center w-full h-full gap-0.5 transition-all ${
                isActive ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <div className="relative">
                {isActive && (
                  <motion.div
                    layoutId="bottomNavActive"
                    className="absolute -inset-2 bg-white/5 border border-border/40 rounded-xl"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className={`relative material-symbols-outlined text-[24px] ${isActive ? "filled" : ""}`}>
                  {isActive && item.filledIcon ? item.filledIcon : item.icon}
                </span>
                {badgeCount > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {badgeCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? "text-foreground" : ""}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
});

BottomNav.displayName = "BottomNav";

export default BottomNav;
