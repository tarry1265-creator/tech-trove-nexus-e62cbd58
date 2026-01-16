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
        {/* Profile Header */}
        <div className="flex items-center gap-6 mb-10 p-6 bg-card rounded-2xl border border-border">
          <img 
            src={user.avatar} 
            alt={user.name}
            className="w-20 h-20 rounded-full object-cover ring-4 ring-primary/20"
          />
          <div>
            <h1 className="font-display text-2xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">{user.email}</p>
            <p className="text-sm text-muted-foreground mt-1">Member since {user.memberSince}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-2xl font-bold text-primary">{user.orders}</p>
            <p className="text-sm text-muted-foreground">Orders</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-2xl font-bold text-primary">{user.wishlistCount}</p>
            <p className="text-sm text-muted-foreground">Wishlist</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-2xl font-bold text-primary">Gold</p>
            <p className="text-sm text-muted-foreground">Member</p>
          </div>
        </div>

        {/* Menu */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {menuItems.map((item, index) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-4 p-4 hover:bg-accent transition-colors ${
                index !== menuItems.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <span className="material-symbols-outlined text-primary">{item.icon}</span>
              <span className="flex-1 text-left font-medium">{item.label}</span>
              <span className="material-symbols-outlined text-muted-foreground">chevron_right</span>
            </button>
          ))}
        </div>

        {/* Logout */}
        <button 
          onClick={() => navigate("/login")}
          className="w-full mt-6 p-4 border border-destructive text-destructive rounded-xl hover:bg-destructive/10 transition-colors font-medium"
        >
          Log Out
        </button>
      </div>
    </Layout>
  );
};

export default Profile;
