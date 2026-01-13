import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import ProductCard from "@/components/ProductCard";
import { products, categories } from "@/data/products";

const Home = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("Headphones");
  const trendingProducts = products.slice(0, 4);

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden max-w-md mx-auto border-x border-border shadow-2xl bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/90 backdrop-blur-md px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="flex-1 flex items-center h-12 bg-card rounded-lg px-4 shadow-sm border border-border group focus-within:ring-2 focus-within:ring-primary/50 transition-all">
            <span className="material-symbols-outlined text-muted-foreground">search</span>
            <input
              type="text"
              placeholder="Search gadgets..."
              className="flex-1 bg-transparent border-none text-base text-foreground placeholder-muted-foreground focus:ring-0 focus:outline-none px-3"
            />
            <button className="text-primary hover:text-primary/80 transition-colors flex items-center justify-center p-1 rounded-full hover:bg-primary/10">
              <span className="material-symbols-outlined">mic</span>
            </button>
          </div>
          
          {/* Notification */}
          <button className="flex items-center justify-center w-12 h-12 rounded-lg bg-card text-foreground shadow-sm border border-border relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-3 right-3 w-2 h-2 bg-destructive rounded-full" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 space-y-6">
        {/* Category Scroll */}
        <section className="w-full">
          <div className="flex gap-3 px-4 overflow-x-auto no-scrollbar pb-1 pt-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`flex-shrink-0 flex items-center justify-center px-5 h-9 rounded-full transition-all active:scale-95 ${
                  activeCategory === category
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-card border border-border text-muted-foreground hover:bg-accent"
                }`}
              >
                <span className="text-sm font-medium">{category}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Hero Banner */}
        <section className="px-4">
          <motion.div 
            className="relative w-full aspect-[4/3] sm:aspect-[16/9] rounded-2xl overflow-hidden shadow-xl group cursor-pointer"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            onClick={() => navigate("/products")}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBc9dH0rDzJkBIo_shBBEViujLoaPUVNtssGF7b_id1_3yGoip-9UMNEZdMXKxALiDxlg2BaKry29kdGs_g3MbJXLhpACvSMp6mQ3mdrDXZQqCIMSzy_-v2BpWtDdBxU4Jksdi6k2MN6jHUvXz1VDGuwQE49QCALTlajr1d9gUVsHqvM5vhZ8AJWzYA1g6ViCqPjLdi43UItnt9yxIqpHRSVt1L56klvZwH2oOHaF9bXNooepw6CC2M5ZFHCQGCrNgich4t9hJoEA')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            
            <div className="absolute bottom-0 left-0 w-full p-5 sm:p-6 flex flex-col items-start gap-2">
              <span className="inline-block px-2.5 py-1 rounded bg-white/20 backdrop-blur-sm text-xs font-semibold text-white uppercase tracking-wider border border-white/10">
                New Arrival
              </span>
              <h2 className="text-3xl font-bold text-white leading-tight mt-1">The Future of Sound</h2>
              <p className="text-gray-300 text-sm sm:text-base font-normal max-w-[80%] mb-2">
                Experience the next generation of active noise-canceling technology.
              </p>
              <button className="mt-2 h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-lg transition-all shadow-primary-glow flex items-center gap-2">
                <span>Shop Now</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </motion.div>
        </section>

        {/* Trending Grid */}
        <section className="px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground tracking-tight">Trending Gadgets</h2>
            <button 
              onClick={() => navigate("/products")}
              className="text-primary text-sm font-medium hover:underline"
            >
              See All
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {trendingProducts.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                onAddToCart={() => console.log("Added to cart:", product.name)}
              />
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default Home;
