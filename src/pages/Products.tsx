import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";

const filters = ["Filter", "Brand", "Price Range", "Wireless", "Noise Cancelling"];

const Products = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("Filter");

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden pb-20 max-w-md mx-auto border-x border-border shadow-2xl bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-border transition-colors duration-300">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-3">
          <button 
            onClick={() => navigate(-1)}
            className="flex size-10 items-center justify-center rounded-full hover:bg-accent transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
          </button>
          <h1 className="text-lg font-bold tracking-tight">Audio & Headphones</h1>
          <button className="flex size-10 items-center justify-center rounded-full hover:bg-accent transition-colors relative">
            <span className="material-symbols-outlined text-2xl">shopping_bag</span>
            <span className="absolute top-2 right-2 flex size-2 rounded-full bg-primary ring-2 ring-background" />
          </button>
        </div>

        {/* Filter Chips */}
        <div className="flex w-full overflow-x-auto no-scrollbar gap-3 px-4 py-3 pb-4">
          {filters.map((filter, index) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`flex h-9 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium transition-all active:scale-95 ${
                index === 0 || activeFilter === filter
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "border border-border bg-transparent text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {index === 0 && <span className="material-symbols-outlined text-lg">tune</span>}
              <span>{filter}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Product Grid */}
      <main className="flex-1 px-4 py-6">
        <motion.div 
          className="grid grid-cols-2 gap-x-4 gap-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <ProductCard
                {...product}
                onAddToCart={() => console.log("Added to cart:", product.name)}
              />
            </motion.div>
          ))}
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Products;
