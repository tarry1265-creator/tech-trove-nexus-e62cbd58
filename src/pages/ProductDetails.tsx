import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { products } from "@/data/products";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find(p => p.id === id);
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || "");
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return <Layout><div className="content-container py-20 text-center">Product not found</div></Layout>;
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
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </motion.div>

          {/* Details */}
          <div className="flex flex-col">
            <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-2">{product.brand}</span>
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-primary filled">star</span>
                <span className="font-semibold">{product.rating}</span>
              </div>
              <span className="text-muted-foreground">({product.reviewCount?.toLocaleString()} reviews)</span>
            </div>

            <p className="text-muted-foreground mb-8">{product.description}</p>

            {/* Colors */}
            {product.colors && (
              <div className="mb-6">
                <span className="text-sm font-medium text-foreground mb-3 block">Color: {selectedColor}</span>
                <div className="flex gap-3">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                        selectedColor === color ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-foreground"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price & Add to Cart */}
            <div className="flex items-center gap-4 mb-8">
              <span className="text-3xl font-bold">${product.price}</span>
              {product.originalPrice && <span className="text-xl text-muted-foreground line-through">${product.originalPrice}</span>}
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

            {/* Features */}
            {product.features && (
              <div className="mt-10 pt-8 border-t border-border">
                <h3 className="font-display text-lg font-semibold mb-4">Features</h3>
                <ul className="grid grid-cols-2 gap-3">
                  {product.features.map(feature => (
                    <li key={feature} className="flex items-center gap-2 text-muted-foreground">
                      <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetails;
