import { useNavigate } from "react-router-dom";
import { Product, formatPrice, getStockStatus } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

interface ProductCardProps extends Product {
  onAddToCart?: () => void;
}

const ProductCard = (product: ProductCardProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const stockStatus = getStockStatus(product.stock_quantity);
  const isOutOfStock = stockStatus.type === 'out';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOutOfStock) {
      addToCart(product);
      product.onAddToCart?.();
      toast.success(`${product.name} added to cart`);
    }
  };

  return (
    <div
      className="group flex flex-col cursor-pointer card overflow-hidden transition-all duration-200 hover:shadow-soft"
      onClick={() => navigate(`/product/${product.slug}`)}
    >
      {/* Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5">
          {product.is_new_arrival && (
            <span className="px-2 py-1 bg-primary text-primary-foreground text-[10px] font-semibold uppercase tracking-wider rounded-lg">
              New
            </span>
          )}
          {isOutOfStock && (
            <span className="px-2 py-1 bg-muted-foreground text-background text-[10px] font-semibold rounded-lg">
              Out of stock
            </span>
          )}
        </div>

        {/* Favorite button */}
        <button
          onClick={(e) => e.stopPropagation()}
          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-primary/80 flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-primary-foreground text-[16px]">favorite</span>
        </button>

        <div
          className={`w-full h-full bg-center bg-cover transition-transform duration-300 group-hover:scale-105 ${isOutOfStock ? 'opacity-50' : ''}`}
          style={{ backgroundImage: `url('${product.image_url}')` }}
        />

        {/* Quick Add */}
        {!isOutOfStock && (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
            <span className="hidden sm:inline">Add</span>
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-3 lg:p-4 flex flex-col gap-0.5">
        <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
          {product.name}
        </h3>
        <p className="text-[11px] text-muted-foreground">
          {product.brand || "BRAINHUB"} • {product.rating || "4.0"} <span className="text-warning">★</span>
        </p>
        <p className="text-sm font-bold text-price mt-1">{formatPrice(product.price)}</p>
      </div>
    </div>
  );
};

export default ProductCard;
