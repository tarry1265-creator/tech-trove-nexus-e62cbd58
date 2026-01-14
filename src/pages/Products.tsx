import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { products, categories } from "@/data/products";

const Products = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  
  const filteredProducts = activeCategory === "all" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <Layout>
      <div className="content-container py-6 lg:py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl lg:text-3xl font-bold">All Products</h1>
          <span className="text-muted-foreground">{filteredProducts.length} products</span>
        </div>

        {/* Filters */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4 mb-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all whitespace-nowrap text-sm ${
                activeCategory === category.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface border border-border text-muted-foreground hover:border-primary"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} {...product} onAddToCart={() => {}} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Products;
