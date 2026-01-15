import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { useProducts, useFeaturedProducts, useNewArrivals, useCategories } from "@/hooks/useProducts";

const Home = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: featuredProducts = [], isLoading: featuredLoading } = useFeaturedProducts();
  const { data: newProducts = [], isLoading: newLoading } = useNewArrivals();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  const allCategories = [
    { id: "all", name: "All", slug: "all", icon: "apps" },
    ...categories.map(cat => ({ ...cat, icon: cat.icon || "category" }))
  ];

  return (
    <Layout>
      <div className="content-container py-6 lg:py-10">
        {/* Hero Section */}
        <motion.section 
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card to-surface mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="grid lg:grid-cols-2 gap-8 p-8 lg:p-12">
            <div className="flex flex-col justify-center">
              <span className="inline-block w-fit px-4 py-1.5 mb-4 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest rounded-full">
                Premium Collection
              </span>
              <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4">
                Experience Sound <span className="text-primary">Perfection</span>
              </h1>
              <p className="text-muted-foreground text-lg mb-8 max-w-md">
                Discover our curated collection of premium audio devices and accessories.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => navigate("/products")}
                  className="btn-premium px-8 py-4"
                >
                  Shop Now
                </button>
                <button 
                  onClick={() => navigate("/products")}
                  className="px-8 py-4 border border-border rounded-lg font-medium hover:bg-accent transition-colors"
                >
                  Explore
                </button>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-r from-card to-transparent z-10" />
              {products[0] && (
                <img 
                  src={products[0].image_url}
                  alt="Featured Product"
                  className="w-full h-80 object-cover rounded-2xl"
                />
              )}
            </div>
          </div>
        </motion.section>

        {/* Categories */}
        <section className="mb-10">
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {allCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.slug)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all whitespace-nowrap ${
                  activeCategory === category.slug
                    ? "bg-primary text-primary-foreground shadow-gold-md"
                    : "bg-surface border border-border text-muted-foreground hover:text-foreground hover:border-primary"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{category.icon}</span>
                <span className="text-sm font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold text-foreground">Featured</h2>
            <button onClick={() => navigate("/products")} className="text-primary text-sm font-medium hover:underline">
              View All
            </button>
          </div>
          {featuredLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square rounded-2xl bg-surface animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  {...product} 
                  onAddToCart={() => {}} 
                />
              ))}
            </div>
          )}
        </section>

        {/* New Arrivals */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold text-foreground">New Arrivals</h2>
            <button onClick={() => navigate("/products")} className="text-primary text-sm font-medium hover:underline">
              View All
            </button>
          </div>
          {newLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square rounded-2xl bg-surface animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {newProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  {...product} 
                  onAddToCart={() => {}} 
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Home;
