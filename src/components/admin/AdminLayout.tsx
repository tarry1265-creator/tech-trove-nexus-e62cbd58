import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const AdminLayout = ({ children, title, subtitle }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: "dashboard", label: "Dashboard", path: "/admin" },
    { icon: "inventory_2", label: "Products", path: "/admin/products" },
    { icon: "shopping_bag", label: "Orders", path: "/admin/orders" },
    { icon: "group", label: "Users", path: "/admin/users" },
    { icon: "local_offer", label: "Promotions", path: "/admin/promotions" },
    { icon: "smart_toy", label: "AI Assistant", path: "/admin/ai" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between h-14 px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/home")}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-primary-foreground text-lg">memory</span>
              </div>
              <span className="font-bold text-foreground hidden sm:inline">BRAINHUB</span>
            </button>
            <div className="w-px h-6 bg-border hidden sm:block" />
            <span className="text-sm font-medium text-muted-foreground hidden sm:inline">Admin Panel</span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate("/home")}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <span className="material-symbols-outlined text-xl">storefront</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-56 border-r border-border min-h-[calc(100vh-56px)] sticky top-14">
          <nav className="p-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="p-4 lg:p-6">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-xl lg:text-2xl font-bold text-foreground">{title}</h1>
              {subtitle && <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>}
            </div>
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
        <div className="flex items-center justify-around h-14 px-2">
          {navItems.slice(0, 5).map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors ${
                isActive(item.path) ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <span className={`material-symbols-outlined text-xl ${isActive(item.path) ? "filled" : ""}`}>
                {item.icon}
              </span>
              <span className="text-[9px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default AdminLayout;
