import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

const Wishlist = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) navigate("/login", { replace: true });
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="content-container py-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="content-container py-6 lg:py-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
          <span className="text-sm font-medium">Back</span>
        </button>

        <h1 className="font-display text-2xl font-bold mb-6">My Wishlist</h1>

        <div className="card p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
          <span className="material-symbols-outlined text-5xl text-muted-foreground/40 mb-4">favorite</span>
          <h2 className="text-lg font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-xs">
            Tap the heart icon on any product to save it here for later.
          </p>
          <button onClick={() => navigate("/home")} className="btn-primary px-6 py-2.5 text-sm">
            Browse Products
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Wishlist;
