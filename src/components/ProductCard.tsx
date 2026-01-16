import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Product, formatPrice } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

interface ProductCardProps extends Product {
  // Keeping optional props for flexibility, but main logic uses context
  onAddToCart?: () => void;
  onFavorite?: () => void;
}

const ProductCard = (product: ProductCardProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isFavorited = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    product.onAddToCart?.();
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
    product.onFavorite?.();
  };

  return (
    <motion.div
      className="group flex flex-col cursor-pointer glass-card rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-premium hover:border-primary/30"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onClick={() => navigate(`/product/${product.slug}`)}
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-surface/40">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {product.is_new_arrival && (
            <span className="px-2.5 py-1 bg-white/10 border border-white/10 text-foreground text-[10px] font-semibold uppercase tracking-wider rounded-full backdrop-blur-md">
              New
            </span>
          )}
          {/* We don't have originalPrice in the Product interface currently, 
              but if we did, we'd render the sale badge here */}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          className={`absolute top-3 right-3 z-10 p-2 rounded-xl border border-white/10 backdrop-blur-md transition-all ${isFavorited
              ? "bg-primary text-primary-foreground"
              : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
            }`}
        >
          <span className={`material-symbols-outlined text-[20px] ${isFavorited ? "filled" : ""}`}>
            favorite
          </span>
        </button>

        {/* Product Image */}
        <div
          className="w-full h-full bg-center bg-cover transition-transform duration-700 group-hover:scale-110"
          style={{ backgroundImage: `url('${product.image_url}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Quick Add Button */}
        <motion.button
          onClick={handleAddToCart}
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ scale: 1.05 }}
          className="absolute bottom-3 right-3 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: "linear-gradient(135deg, hsl(var(--brain-gradient-start)), hsl(var(--brain-gradient-end)))" }}
        >
          <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
          <span className="hidden sm:inline">Add</span>
        </motion.button>
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col gap-1.5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {product.brand || "Brainhub"}
        </p>
        <h3 className="font-display text-lg font-bold text-foreground line-clamp-1 group-hover:brain-gradient-text transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[14px] text-primary filled">star</span>
              <span className="text-xs font-semibold text-foreground">{product.rating}</span>
            </div>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-lg font-bold">{formatPrice(product.price)}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
