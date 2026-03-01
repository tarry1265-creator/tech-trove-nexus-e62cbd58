import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { useProduct, useProducts, formatPrice, getStockStatus } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading, error } = useProduct(slug);
  const { data: allProducts = [] } = useProducts();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const allImages = useMemo(() => {
    if (!product) return [];
    const images = [product.image_url];
    if (product.additional_images && product.additional_images.length > 0) {
      images.push(...product.additional_images);
    }
    return images;
  }, [product]);

  // Related products from same category
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter(p => p.category_id === product.category_id && p.id !== product.id)
      .slice(0, 4);
  }, [allProducts, product]);

  if (isLoading) {
    return (
      <Layout>
        <div className="content-container py-4 lg:py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="aspect-square rounded-2xl bg-muted animate-pulse" />
            <div className="space-y-4">
              <div className="h-6 w-24 bg-muted rounded animate-pulse" />
              <div className="h-10 w-3/4 bg-muted rounded animate-pulse" />
              <div className="h-20 w-full bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="content-container py-20 text-center">
          <span className="material-symbols-outlined text-5xl text-muted-foreground mb-4">error</span>
          <p className="text-muted-foreground mb-6">Product not found</p>
          <button onClick={() => navigate("/products")} className="btn-primary">Browse Products</button>
        </div>
      </Layout>
    );
  }

  const hasMultipleImages = allImages.length > 1;
  const stockStatus = getStockStatus(product.stock_quantity);
  const isOutOfStock = stockStatus.type === 'out';

  const handleAddToCart = () => {
    if (!isOutOfStock) {
      addToCart(product, quantity);
      toast.success(`Added ${quantity} × ${product.name} to cart`);
    }
  };

  return (
    <Layout>
      <div className="content-container py-4 lg:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="text-foreground">
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </button>
          <button className="text-foreground">
            <span className="material-symbols-outlined text-[22px]">share</span>
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted border border-border">
              <img
                src={allImages[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-contain p-4"
              />
              {/* Dots */}
              {hasMultipleImages && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                  {allImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`rounded-full transition-all ${
                        index === currentImageIndex ? "w-5 h-1.5 bg-primary" : "w-1.5 h-1.5 bg-muted-foreground/40"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {hasMultipleImages && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      currentImageIndex === index ? "border-primary" : "border-border"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-xl lg:text-2xl font-bold text-foreground leading-tight">{product.name}</h1>
              <div className="text-right flex-shrink-0">
                <p className="text-xl lg:text-2xl font-bold text-price">{formatPrice(product.price)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-muted-foreground">{product.brand || "BRAINHUB"}</span>
              {product.rating && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-sm text-foreground font-medium">{product.rating}</span>
                  <span className="text-warning text-sm">★★★★★</span>
                </>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{product.description}</p>

            {/* Stock */}
            <div className="mb-6">
              {isOutOfStock ? (
                <span className="badge badge-destructive">Out of Stock</span>
              ) : stockStatus.type === 'low' ? (
                <span className="badge badge-warning">{stockStatus.message}</span>
              ) : (
                <span className="badge badge-success">In Stock</span>
              )}
            </div>

            {/* Add to Cart - sticky on mobile */}
            <div className="flex items-center gap-3 mt-auto">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                  isOutOfStock
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]"
                }`}
              >
                {isOutOfStock ? "Out of Stock" : "Add to cart"}
              </button>
              <button className="w-12 h-12 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors">
                <span className="material-symbols-outlined text-foreground">favorite</span>
              </button>
            </div>

            {/* Category */}
            {product.category && (
              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Category</p>
                <button
                  onClick={() => navigate(`/products?category=${product.category?.slug}`)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-xl hover:bg-muted/80 transition-colors text-sm"
                >
                  <span className="material-symbols-outlined text-primary text-lg">{product.category.icon || "category"}</span>
                  <span className="text-foreground font-medium">{product.category.name}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Related Items */}
        {relatedProducts.length > 0 && (
          <section className="mt-12">
            <h2 className="section-title mb-4">Related items</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetails;
