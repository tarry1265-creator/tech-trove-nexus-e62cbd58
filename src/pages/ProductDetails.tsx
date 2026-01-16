import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import { useProduct, formatPrice } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading, error } = useProduct(slug);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Combine main image with additional images
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
            <div className="aspect-square rounded-3xl bg-surface animate-pulse" />
            <div className="space-y-4">
              <div className="h-6 w-24 bg-surface rounded animate-pulse" />
              <div className="h-10 w-3/4 bg-surface rounded animate-pulse" />
              <div className="h-20 w-full bg-surface rounded animate-pulse" />
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
          <button onClick={() => navigate("/products")} className="btn-premium px-8 py-3">
            Browse Products
          </button>
        </div>
      </Layout>
    );
  }

  const hasMultipleImages = allImages.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <Layout>
      <div className="content-container py-6 lg:py-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <span className="material-symbols-outlined">arrow_back</span>
          <span>Back</span>
        </button>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-surface">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={allImages[currentImageIndex]}
                  alt={`${product.name} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              </AnimatePresence>

              {/* Navigation Arrows */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background transition-colors"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background transition-colors"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </>
              )}

              {/* Image Counter */}
              {hasMultipleImages && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-background/80 backdrop-blur-sm text-sm font-medium">
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
                    className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${currentImageIndex === index
                      ? 'border-primary ring-2 ring-primary/20'
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
              {product.brand || "Roothub"}
            </span>
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4">{product.name}</h1>

            {product.rating && (
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-primary filled">star</span>
                  <span className="font-semibold">{product.rating}</span>
                </div>
                <span className="text-muted-foreground">• {product.category?.name}</span>
              </div>
            )}

            <p className="text-muted-foreground mb-8">{product.description}</p>

            {/* Stock Status */}
            <div className="mb-6">
              {product.stock_quantity && product.stock_quantity > 0 ? (
                <span className="inline-flex items-center gap-2 text-green-500">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  In Stock ({product.stock_quantity} available)
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 text-destructive">
                  <span className="material-symbols-outlined text-[18px]">cancel</span>
                  Out of Stock
                </span>
              )}
            </div>

            {/* Price & Add to Cart */}
            <div className="flex items-center gap-4 mb-8">
              <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
            </div>

            <div className="flex gap-4">
              <div className="flex items-center border border-border rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 hover:bg-accent">-</button>
                <span className="px-4 py-3 font-medium">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-3 hover:bg-accent">+</button>
              </div>
              <button
                onClick={() => addToCart(product, quantity)}
                className="flex-1 btn-premium py-4 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">shopping_bag</span>
                Add to Cart
              </button>
            </div>

            {/* Category Info */}
            {product.category && (
              <div className="mt-10 pt-8 border-t border-border">
                <h3 className="font-display text-lg font-semibold mb-4">Category</h3>
                <button
                  onClick={() => navigate(`/products?category=${product.category?.slug}`)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-surface rounded-lg hover:bg-accent transition-colors"
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