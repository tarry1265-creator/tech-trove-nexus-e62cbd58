import { forwardRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "@/context/CartContext";

const BottomNav = forwardRef<HTMLElement>((_, ref) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();

  const navItems = [
    { icon: "home", label: "Home", path: "/home" },
    { icon: "search", label: "Search", path: "/search" },
    { icon: "build", label: "Repair", path: "/repair" },
    { icon: "shopping_bag", label: "Cart", path: "/cart", badge: cartCount },
    { icon: "person", label: "Profile", path: "/profile" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      ref={ref}
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`relative flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors min-w-[60px] ${
              isActive(item.path) 
                ? "text-primary" 
                : "text-muted-foreground"
            }`}
          >
            <span className={`material-symbols-outlined text-[22px] ${isActive(item.path) ? "filled" : ""}`}>
              {item.icon}
            </span>
            <span className="text-[10px] font-medium">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="absolute top-1 right-2 min-w-[16px] h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
});

BottomNav.displayName = "BottomNav";

export default BottomNav;
