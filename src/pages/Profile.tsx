import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, updateAvatar, removeAvatar, loading } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const menuItems = [
    { icon: "shopping_bag", label: "My Orders", path: "/orders" },
    { icon: "favorite", label: "Wishlist", path: "/wishlist" },
    { icon: "location_on", label: "Addresses", path: "/addresses" },
  ];

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
    navigate("/login");
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const { error } = await updateAvatar(file);
    setIsUploading(false);

    if (error) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated.",
      });
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    setIsUploading(true);
    const { error } = await removeAvatar();
    setIsUploading(false);

    if (error) {
      toast({
        title: "Remove failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Avatar removed",
        description: "Your profile picture has been removed.",
      });
    }
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
        {/* Back to Home Button */}
        <button
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
          <span className="text-sm font-medium">Back to Home</span>
        </button>

        <div className="glass-card rounded-3xl p-4 sm:p-6 mb-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="relative group flex-shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
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
            {/* Overlay on hover */}
            <div
              onClick={isUploading ? undefined : handleAvatarClick}
              className={`absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${
                isUploading ? "cursor-wait" : "cursor-pointer"
              }`}
            >
              {isUploading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <span className="material-symbols-outlined text-white text-2xl">
                  photo_camera
                </span>
              )}
            </div>
            {/* Remove button */}
            {avatarUrl && !isUploading && (
              <button
                onClick={handleRemoveAvatar}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove avatar"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>
          <div className="text-center sm:text-left min-w-0 w-full">
            <h1 className="font-display text-2xl font-bold truncate">{displayName}</h1>
            <p className="text-muted-foreground text-sm sm:text-base truncate max-w-full">{user.email}</p>
            {profile?.username && (
              <p className="text-sm text-primary mt-1 truncate">@{profile.username}</p>
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
