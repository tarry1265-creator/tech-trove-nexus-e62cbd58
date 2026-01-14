import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount?: number;
  image: string;
  description?: string;
  isNew?: boolean;
  onAddToCart?: () => void;
  onFavorite?: () => void;
  isFavorited?: boolean;
}

const ProductCard = ({ 
  id,
  name, 
  brand, 
  price,
  originalPrice,
  rating, 
  reviewCount,
  image, 
  isNew,
  onAddToCart,
  onFavorite,
  isFavorited = false,
}: ProductCardProps) => {
  const navigate = useNavigate();
  
  return (
    <motion.div 
      className="group flex flex-col cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      onClick={() => navigate(`/product/${id}`)}
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-surface mb-3">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {isNew && (
            <span className="px-2.5 py-1 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider rounded-full">
              New
            </span>
          )}
          {originalPrice && (
            <span className="px-2.5 py-1 bg-destructive text-destructive-foreground text-[10px] font-bold uppercase tracking-wider rounded-full">
              Sale
            </span>
          )}
        </div>
        
        {/* Favorite Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onFavorite?.();
          }}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all ${
            isFavorited 
              ? "bg-primary/20 text-primary" 
              : "bg-foreground/5 text-muted-foreground hover:bg-primary/10 hover:text-primary"
          }`}
        >
          <span className={`material-symbols-outlined text-[20px] ${isFavorited ? "filled" : ""}`}>
            favorite
          </span>
        </button>
        
        {/* Product Image */}
        <div 
          className="w-full h-full bg-center bg-cover transition-transform duration-500 group-hover:scale-110"
          style={{ backgroundImage: `url('${image}')` }}
        />
        
        {/* Quick Add Button */}
        {onAddToCart && (
          <motion.button 
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart();
            }}
            initial={{ opacity: 0, y: 10 }}
            whileHover={{ scale: 1.05 }}
            className="absolute bottom-3 right-3 flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-gold-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
            <span className="hidden sm:inline">Add</span>
          </motion.button>
        )}
      </div>
      
      {/* Product Info */}
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {brand}
        </p>
        <h3 className="font-display text-base font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {name}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[14px] text-primary filled">star</span>
            <span className="text-xs font-semibold text-foreground">{rating}</span>
          </div>
          {reviewCount && (
            <span className="text-xs text-muted-foreground">({reviewCount.toLocaleString()})</span>
          )}
        </div>
        
        {/* Price */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-lg font-bold text-foreground">${price}</span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">${originalPrice}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
