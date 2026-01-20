import { useState, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { useProducts, useFeaturedProducts, useNewArrivals, useCategories, useProductsByCategory } from "@/hooks/useProducts";

const Home = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: featuredProducts = [], isLoading: featuredLoading } = useFeaturedProducts();
  const { data: newProducts = [], isLoading: newLoading } = useNewArrivals();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: filteredProducts = [], isLoading: filteredLoading } = useProductsByCategory(activeCategory);

  const allCategories = useMemo(() => [
    { id: "all", name: "All", slug: "all", icon: "apps" },
    ...categories.map(cat => ({ ...cat, icon: cat.icon || "category" }))
  ], [categories]);

  const scrollCategories = useCallback((direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = 200;
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  }, []);

  const handleCategoryClick = useCallback((slug: string) => {
    setActiveCategory(slug);
  }, []);

  // Display filtered products when a category is selected
  const displayProducts = activeCategory === "all" ? featuredProducts : filteredProducts;
  const isDisplayLoading = activeCategory === "all" ? featuredLoading : filteredLoading;

  return (
    <Layout>
      <div className="content-container py-6 lg:py-10">
        {/* Hero Section */}
        <motion.section
          className="relative overflow-hidden rounded-[2rem] bg-card/40 border border-border/50 shadow-premium backdrop-blur-xl mb-10 min-h-[520px] flex items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="absolute inset-0 z-0">
            <div className="absolute -top-32 -left-40 w-[44rem] h-[44rem] bg-primary/20 rounded-full blur-3xl opacity-60" />
            <div className="absolute -bottom-40 -right-40 w-[40rem] h-[40rem] bg-secondary/15 rounded-full blur-3xl opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] via-transparent to-black/20" />
          </div>

          <div className="grid lg:grid-cols-2 gap-8 p-8 lg:p-16 z-10 w-full">
            <div className="flex flex-col justify-center">
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 w-fit px-4 py-1.5 mb-6 bg-white/5 border border-white/10 text-foreground text-xs font-semibold uppercase tracking-[0.2em] rounded-full backdrop-blur-md"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Neural Collection
              </motion.span>
              <h1 className="font-display text-5xl lg:text-7xl font-bold text-foreground leading-[1.05] mb-6">
                Upgrade your <span className="brain-gradient-text">everyday</span>
              </h1>
              <p className="text-muted-foreground text-lg lg:text-xl mb-8 max-w-lg leading-relaxed">
                Premium tech, clean design, and smarter shopping. Curated gadgets that feel as good as they look.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate("/products")}
                  className="btn-premium px-8 py-4 text-lg"
                >
                  Shop Collection
                </button>
                <button
                  onClick={() => navigate("/products")}
                  className="px-8 py-4 border border-border/60 bg-card/30 backdrop-blur-sm rounded-xl font-medium hover:bg-white/5 transition-colors text-lg"
                >
                  Explore
                </button>
              </div>
            </div>
            <div className="relative hidden lg:block perspective-1000">
              {products[0] ? (
                <motion.div
                  animate={{ rotateY: [-5, 5, -5], rotateX: [2, -2, 2] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10 rounded-3xl overflow-hidden border border-border/50 glass-card p-2"
                >
                  <img
                    src={products[0].image_url}
                    alt="Featured Product"
                    className="w-full h-auto object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-white font-bold text-xl">{products[0].name}</p>
                    <p className="text-white/80 text-sm">{products[0].category?.name}</p>
                  </div>
                </motion.div>
              ) : (
                <div className="w-full h-80 rounded-3xl bg-white/5 animate-pulse border border-white/10" />
              )}
            </div>
          </div>
        </motion.section>

        {/* Categories with Navigation Arrows */}
        <section className="mb-10">
          <div className="flex items-center gap-2">
            {/* Left Arrow */}
            <button
              onClick={() => scrollCategories('left')}
              className="flex-shrink-0 w-10 h-10 rounded-full bg-card/50 border border-border/60 flex items-center justify-center hover:bg-white/10 transition-colors"
              aria-label="Scroll categories left"
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>

            {/* Scrollable Categories */}
            <div 
              ref={categoryScrollRef}
              className="flex gap-3 overflow-x-auto no-scrollbar pb-2 flex-1"
            >
              {allCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.slug)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all whitespace-nowrap ${activeCategory === category.slug
                    ? "bg-primary text-primary-foreground border border-primary"
                    : "bg-card/30 border border-border/60 text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{category.icon}</span>
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
              ))}
            </div>

            {/* Right Arrow */}
            <button
              onClick={() => scrollCategories('right')}
              className="flex-shrink-0 w-10 h-10 rounded-full bg-card/50 border border-border/60 flex items-center justify-center hover:bg-white/10 transition-colors"
              aria-label="Scroll categories right"
            >
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </section>

        {/* Featured/Filtered Products */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold text-foreground">
              {activeCategory === "all" ? "Featured" : allCategories.find(c => c.slug === activeCategory)?.name || "Products"}
            </h2>
            <button onClick={() => navigate("/products")} className="text-foreground/80 text-sm font-medium hover:text-foreground transition-colors">
              View All
            </button>
          </div>
          {isDisplayLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square rounded-2xl bg-surface animate-pulse" />
              ))}
            </div>
          ) : displayProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {displayProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  {...product}
                  onAddToCart={() => { }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <span className="material-symbols-outlined text-4xl mb-2">inventory_2</span>
              <p>No products found in this category</p>
            </div>
          )}
        </section>

        {/* New Arrivals */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold text-foreground">New Arrivals</h2>
            <button onClick={() => navigate("/products")} className="text-foreground/80 text-sm font-medium hover:text-foreground transition-colors">
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
                  onAddToCart={() => { }}
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
