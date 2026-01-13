import { useLocation, useNavigate } from "react-router-dom";

interface NavItem {
  icon: string;
  filledIcon?: string;
  label: string;
  path: string;
  badge?: boolean;
}

const navItems: NavItem[] = [
  { icon: "home", filledIcon: "home", label: "Home", path: "/home" },
  { icon: "grid_view", label: "Catalog", path: "/products" },
  { icon: "shopping_bag", label: "Cart", path: "/cart", badge: true },
  { icon: "person", label: "Profile", path: "/profile" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 z-30 w-full max-w-md left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-lg border-t border-border pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === "/products" && location.pathname.startsWith("/products"));
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="relative">
                <span className={`material-symbols-outlined text-[26px] ${isActive ? "filled" : ""}`}>
                  {isActive && item.filledIcon ? item.filledIcon : item.icon}
                </span>
                {item.badge && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-card" />
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
