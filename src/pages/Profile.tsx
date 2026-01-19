import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, loading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const menuItems = [
    { icon: "shopping_bag", label: "My Orders", path: "/orders" },
    { icon: "favorite", label: "Wishlist", path: "/wishlist" },
    { icon: "location_on", label: "Addresses", path: "/addresses" },
    { icon: "credit_card", label: "Payment Methods", path: "/payment" },
    { icon: "settings", label: "Settings", path: "/settings" },
    { icon: "help", label: "Help & Support", path: "/help" },
  ];

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
    navigate("/login");
  };

  if (loading) {
    return (
      <Layout>
        <div className="content-container py-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  const displayName = profile?.username || user.email?.split("@")[0] || "User";
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url;

  return (
    <Layout>
      <div className="content-container py-6 lg:py-10">
        <div className="glass-card rounded-3xl p-6 mb-10 flex items-center gap-6">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-20 h-20 rounded-2xl object-cover border border-border/50"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center border border-border/50">
              <span className="material-symbols-outlined text-4xl text-primary">
                person
              </span>
            </div>
          )}
          <div>
            <h1 className="font-display text-2xl font-bold">{displayName}</h1>
            <p className="text-muted-foreground">{user.email}</p>
            {profile?.username && (
              <p className="text-sm text-primary mt-1">@{profile.username}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="glass-card rounded-3xl p-4 text-center">
            <p className="text-2xl font-bold text-foreground">0</p>
            <p className="text-sm text-muted-foreground">Orders</p>
          </div>
          <div className="glass-card rounded-3xl p-4 text-center">
            <p className="text-2xl font-bold text-foreground">0</p>
            <p className="text-sm text-muted-foreground">Wishlist</p>
          </div>
          <div className="glass-card rounded-3xl p-4 text-center">
            <p className="text-2xl font-bold brain-gradient-text">New</p>
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
          onClick={handleSignOut}
          className="w-full mt-6 p-4 border border-destructive/70 text-destructive rounded-2xl hover:bg-destructive/10 transition-colors font-medium"
        >
          Log Out
        </button>
      </div>
    </Layout>
  );
};

export default Profile;
