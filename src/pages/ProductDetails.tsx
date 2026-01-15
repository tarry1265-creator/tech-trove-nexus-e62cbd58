import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { useProduct, formatPrice } from "@/hooks/useProducts";

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading, error } = useProduct(slug);
  const [quantity, setQuantity] = useState(1);

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

  return (
    <Layout>
      <div className="content-container py-6 lg:py-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <span className="material-symbols-outlined">arrow_back</span>
          <span>Back</span>
        </button>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <motion.div 
            className="aspect-square rounded-3xl overflow-hidden bg-surface"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          </motion.div>

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
              <button className="flex-1 btn-premium py-4 flex items-center justify-center gap-2">
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
