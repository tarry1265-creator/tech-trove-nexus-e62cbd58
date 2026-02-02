import { useNavigate } from "react-router-dom";
import { Product, formatPrice, getStockStatus } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";

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
    }
  };


  return (
    <div
      className="group flex flex-col cursor-pointer card overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/30"
      onClick={() => navigate(`/product/${product.slug}`)}
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {product.is_new_arrival && (
            <span className="px-2 py-1 bg-primary text-primary-foreground text-[10px] font-semibold uppercase tracking-wider rounded">
              New
            </span>
          )}
          {stockStatus.type === 'low' && (
            <span className="px-2 py-1 bg-destructive text-destructive-foreground text-[10px] font-semibold rounded">
              {stockStatus.message}
            </span>
          )}
          {isOutOfStock && (
            <span className="px-2 py-1 bg-muted-foreground text-background text-[10px] font-semibold rounded">
              Out of stock
            </span>
          )}
        </div>


        {/* Product Image */}
        <div
          className={`w-full h-full bg-center bg-cover transition-transform duration-300 group-hover:scale-105 ${isOutOfStock ? 'opacity-50' : ''}`}
          style={{ backgroundImage: `url('${product.image_url}')` }}
        />

        {/* Quick Add Button - Always visible on mobile, hover on desktop */}
        {!isOutOfStock && (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-3 right-3 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity hover:opacity-90"
          >
            <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
            <span className="hidden sm:inline">Add</span>
          </button>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col gap-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {product.brand || "Brainhub"}
        </p>
        <h3 className="font-display text-base font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-primary filled">star</span>
            <span className="text-xs font-medium text-foreground">{product.rating}</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-lg font-bold text-foreground">{formatPrice(product.price)}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
