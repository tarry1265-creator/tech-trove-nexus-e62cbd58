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
        <h1 className="font-display text-2xl lg:text-3xl font-bold mb-8">Wishlist</h1>

        {wishlist.length === 0 ? (
          <div className="text-center py-20">
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
              // isFavorited implicitly handled by context in ProductCard
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Wishlist;
