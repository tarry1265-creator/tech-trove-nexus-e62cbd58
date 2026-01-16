import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { mockUser } from "@/data/products";

const Profile = () => {
  const navigate = useNavigate();
  const user = mockUser;

  const menuItems = [
    { icon: "shopping_bag", label: "My Orders", path: "/orders" },
    { icon: "favorite", label: "Wishlist", path: "/wishlist" },
    { icon: "location_on", label: "Addresses", path: "/addresses" },
    { icon: "credit_card", label: "Payment Methods", path: "/payment" },
    { icon: "settings", label: "Settings", path: "/settings" },
    { icon: "help", label: "Help & Support", path: "/help" },
  ];

  return (
    <Layout>
      <div className="content-container py-6 lg:py-10">
        <div className="glass-card rounded-3xl p-6 mb-10 flex items-center gap-6">
          <img 
            src={user.avatar} 
            alt={user.name}
            className="w-20 h-20 rounded-2xl object-cover border border-border/50"
          />
          <div>
            <h1 className="font-display text-2xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">{user.email}</p>
            <p className="text-sm text-muted-foreground mt-1">Member since {user.memberSince}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="glass-card rounded-3xl p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{user.orders}</p>
            <p className="text-sm text-muted-foreground">Orders</p>
          </div>
          <div className="glass-card rounded-3xl p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{user.wishlistCount}</p>
            <p className="text-sm text-muted-foreground">Wishlist</p>
          </div>
          <div className="glass-card rounded-3xl p-4 text-center">
            <p className="text-2xl font-bold brain-gradient-text">Gold</p>
            <p className="text-sm text-muted-foreground">Member</p>
          </div>
        </div>

        <div className="glass-card rounded-3xl overflow-hidden">
          {menuItems.map((item, index) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors ${
                index !== menuItems.length - 1 ? "border-b border-border/60" : ""
              }`}
            >
              <span className="material-symbols-outlined text-primary">{item.icon}</span>
              <span className="flex-1 text-left font-medium">{item.label}</span>
              <span className="material-symbols-outlined text-muted-foreground">chevron_right</span>
            </button>
          ))}
        </div>

        <button 
          onClick={() => navigate("/login")}
          className="w-full mt-6 p-4 border border-destructive/70 text-destructive rounded-2xl hover:bg-destructive/10 transition-colors font-medium"
        >
          Log Out
        </button>
      </div>
    </Layout>
  );
};

export default Profile;
