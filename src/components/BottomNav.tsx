import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface NavItem {
  icon: string;
  filledIcon?: string;
  label: string;
  path: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { icon: "home", filledIcon: "home", label: "Home", path: "/home" },
  { icon: "search", label: "Search", path: "/search" },
  { icon: "shopping_bag", label: "Cart", path: "/cart", badge: 3 },
  { icon: "favorite_border", filledIcon: "favorite", label: "Wishlist", path: "/wishlist" },
  { icon: "person_outline", filledIcon: "person", label: "Profile", path: "/profile" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="lg:hidden fixed bottom-0 z-50 w-full bg-card/95 backdrop-blur-xl border-t border-border/50 pb-safe">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === "/products" && location.pathname.startsWith("/products"));
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center justify-center w-full h-full gap-0.5 transition-all ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div className="relative">
                {isActive && (
                  <motion.div
                    layoutId="bottomNavActive"
                    className="absolute -inset-2 bg-primary/10 rounded-xl"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className={`relative material-symbols-outlined text-[24px] ${isActive ? "filled" : ""}`}>
                  {isActive && item.filledIcon ? item.filledIcon : item.icon}
                </span>
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? "text-primary" : ""}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
