import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useProduct, formatPrice, getStockStatus } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading, error } = useProduct(slug);
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

  if (isLoading) {
    return (
      <Layout>
        <div className="content-container py-6 lg:py-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="aspect-square rounded-xl bg-muted animate-pulse" />
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
          <span className="material-symbols-outlined text-6xl text-muted-foreground mb-4">error</span>
          <p className="text-muted-foreground mb-6">Product not found</p>
          <button onClick={() => navigate("/products")} className="btn-primary">
            Browse Products
          </button>
        </div>
      </Layout>
    );
  }

  const hasMultipleImages = allImages.length > 1;
  const stockStatus = getStockStatus(product.stock_quantity);
  const isOutOfStock = stockStatus.type === 'out';

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleAddToCart = () => {
    if (!isOutOfStock) {
      addToCart(product, quantity);
    }
  };

  return (
    <Layout>
      <div className="content-container py-6 lg:py-10">
        <button onClick={() => navigate("/home")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
          <span className="material-symbols-outlined text-xl">arrow_back</span>
          <span className="text-sm font-medium">Back to Home</span>
        </button>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-muted border border-border">
              <img
                src={allImages[currentImageIndex]}
                alt={`${product.name} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Navigation Arrows */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </>
              )}

              {/* Image Counter */}
              {hasMultipleImages && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-background border border-border text-sm font-medium">
                  {currentImageIndex + 1} / {allImages.length}
                </div>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {hasMultipleImages && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${currentImageIndex === index
                      ? 'border-primary'
                      : 'border-border hover:border-primary/50'
                      }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-2">
              {product.brand || "Brainhub"}
            </span>
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-4">{product.name}</h1>

            {product.rating && (
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-primary filled">star</span>
                  <span className="font-semibold">{product.rating}</span>
                </div>
                <span className="text-muted-foreground">• {product.category?.name}</span>
              </div>
            )}

            <p className="text-muted-foreground mb-6">{product.description}</p>

            {/* Stock Status */}
            <div className="mb-6">
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">
                  <span className="material-symbols-outlined text-[18px]">cancel</span>
                  Out of Stock
                </span>
              ) : stockStatus.type === 'low' ? (
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-orange-100 text-orange-700 text-sm font-medium">
                  <span className="material-symbols-outlined text-[18px]">warning</span>
                  {stockStatus.message}
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-green-100 text-green-700 text-sm font-medium">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  In Stock
                </span>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center gap-4 mb-8">
              <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
            </div>

            <div className="flex gap-4">
              <div className="flex items-center border border-border rounded-lg">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                  className="px-4 py-3 hover:bg-muted rounded-l-lg transition-colors"
                  disabled={isOutOfStock}
                >
                  -
                </button>
                <span className="px-4 py-3 font-medium">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)} 
                  className="px-4 py-3 hover:bg-muted rounded-r-lg transition-colors"
                  disabled={isOutOfStock}
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-4 flex items-center justify-center gap-2 rounded-lg font-semibold transition-all ${
                  isOutOfStock 
                    ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                    : 'btn-primary'
                }`}
              >
                <span className="material-symbols-outlined">shopping_bag</span>
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>

            {/* Category Info */}
            {product.category && (
              <div className="mt-10 pt-8 border-t border-border">
                <h3 className="font-display text-lg font-semibold mb-4">Category</h3>
                <button
                  onClick={() => navigate(`/products?category=${product.category?.slug}`)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg hover:bg-muted transition-colors"
                >
                  <span className="material-symbols-outlined text-primary">{product.category.icon || "category"}</span>
                  <span>{product.category.name}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetails;
