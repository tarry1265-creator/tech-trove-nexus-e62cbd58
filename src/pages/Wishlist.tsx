import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/context/WishlistContext";

const Wishlist = () => {
  const navigate = useNavigate();
  const { wishlist } = useWishlist();

  return (
    <Layout>
      <div className="content-container py-6 lg:py-10">
        <div className="glass-card rounded-3xl p-6 mb-8 flex items-start justify-between gap-6">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold">Wishlist</h1>
            <p className="text-muted-foreground mt-1">Saved for later.</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Items</div>
            <div className="text-2xl font-bold text-foreground">{wishlist.length}</div>
          </div>
        </div>

        {wishlist.length === 0 ? (
          <div className="glass-card rounded-3xl p-10 text-center">
            <span className="material-symbols-outlined text-6xl text-muted-foreground mb-4">favorite_border</span>
            <p className="text-muted-foreground mb-6">Your wishlist is empty</p>
            <button onClick={() => navigate("/products")} className="btn-premium px-8 py-3">
              Explore Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {wishlist.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Wishlist;
