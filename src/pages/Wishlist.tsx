import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useProducts } from "@/hooks/useProducts";
import { useEffect, useMemo } from "react";

const Wishlist = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { wishlistIds } = useWishlist();
  const { data: allProducts = [], isLoading: productsLoading } = useProducts();

  useEffect(() => {
    if (!loading && !user) navigate("/login", { replace: true });
  }, [user, loading, navigate]);

  const wishlistProducts = useMemo(() => {
    return wishlistIds
      .map(id => allProducts.find(p => p.id === id))
      .filter(Boolean) as typeof allProducts;
  }, [wishlistIds, allProducts]);

  if (loading || productsLoading) {
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

        <h1 className="font-display text-2xl font-bold mb-6">
          My Wishlist {wishlistProducts.length > 0 && <span className="text-muted-foreground text-lg font-normal">({wishlistProducts.length})</span>}
        </h1>

        {wishlistProducts.length === 0 ? (
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
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {wishlistProducts.map(product => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Wishlist;
