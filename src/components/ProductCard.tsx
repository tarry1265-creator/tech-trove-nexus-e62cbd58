import { motion } from "framer-motion";

interface ProductCardProps {
  id: string;
  name: string;
  brand: string;
  price: number;
  rating: number;
  image: string;
  description?: string;
  onAddToCart?: () => void;
  onFavorite?: () => void;
}

const ProductCard = ({ 
  name, 
  brand, 
  price, 
  rating, 
  image, 
  description,
  onAddToCart 
}: ProductCardProps) => {
  return (
    <motion.div 
      className="group flex flex-col gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-card shadow-sm">
        <button className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-foreground/10 backdrop-blur-md text-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
          <span className="material-symbols-outlined text-[18px] block">favorite</span>
        </button>
        <div 
          className="w-full h-full bg-center bg-cover transition-transform duration-500 group-hover:scale-110"
          style={{ backgroundImage: `url('${image}')` }}
        />
        {onAddToCart && (
          <button 
            onClick={onAddToCart}
            className="absolute bottom-3 right-3 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform active:scale-90 hover:bg-primary/90"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
          </button>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            {brand && (
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{brand}</p>
            )}
            <h3 className="text-base font-bold text-foreground line-clamp-1">{name}</h3>
          </div>
          <div className="flex items-center gap-1 text-yellow-400 ml-2">
            <span className="material-symbols-outlined text-[16px] filled">star</span>
            <span className="text-xs font-bold text-muted-foreground">{rating}</span>
          </div>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-1">{description}</p>
        )}
        <p className="text-lg font-bold text-primary">${price}</p>
      </div>
    </motion.div>
  );
};

export default ProductCard;
