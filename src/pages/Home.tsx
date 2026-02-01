import { useState, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  const { data: categories = [] } = useCategories();
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

  const displayProducts = activeCategory === "all" ? featuredProducts : filteredProducts;
  const isDisplayLoading = activeCategory === "all" ? featuredLoading : filteredLoading;

  return (
    <Layout>
      <div className="content-container py-6 lg:py-10">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-2xl bg-primary mb-10">
          <div className="grid lg:grid-cols-2 gap-8 p-8 lg:p-12">
            <div className="flex flex-col justify-center">
              <span className="inline-flex items-center gap-2 w-fit px-3 py-1 mb-4 bg-primary-foreground/10 text-primary-foreground text-xs font-semibold uppercase tracking-wider rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                New Collection
              </span>
              <h1 className="font-display text-4xl lg:text-5xl font-bold text-primary-foreground leading-tight mb-4">
                Premium Tech & Gadgets
              </h1>
              <p className="text-primary-foreground/80 text-lg mb-6 max-w-lg">
                Quality gadgets, trusted repairs, and unbeatable prices. Your one-stop tech destination.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate("/products")}
                  className="px-6 py-3 bg-primary-foreground text-primary font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  Shop Now
                </button>
                <button
                  onClick={() => navigate("/repair")}
                  className="px-6 py-3 border border-primary-foreground/30 text-primary-foreground font-medium rounded-lg hover:bg-primary-foreground/10 transition-colors"
                >
                  Repair Services
                </button>
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-center">
              {products[0] ? (
                <div className="relative rounded-xl overflow-hidden border border-primary-foreground/20 bg-primary-foreground/10 p-4">
                  <img
                    src={products[0].image_url}
                    alt="Featured Product"
                    className="w-full max-w-sm h-auto object-cover rounded-lg"
                  />
                </div>
              ) : (
                <div className="w-full max-w-sm h-64 rounded-xl bg-primary-foreground/10 animate-pulse" />
              )}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="mb-10">
          <div className="flex items-center gap-2">
            {/* Left Arrow - Desktop only */}
            <button
              onClick={() => scrollCategories('left')}
              className="hidden lg:flex flex-shrink-0 w-10 h-10 rounded-full border border-border bg-card items-center justify-center hover:bg-muted transition-colors"
              aria-label="Scroll categories left"
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>

            {/* Scrollable Categories */}
            <div 
              ref={categoryScrollRef}
              className="flex gap-2 overflow-x-auto pb-2 flex-1"
            >
              {allCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.slug)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap text-sm font-medium ${activeCategory === category.slug
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{category.icon}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>

            {/* Right Arrow - Desktop only */}
            <button
              onClick={() => scrollCategories('right')}
              className="hidden lg:flex flex-shrink-0 w-10 h-10 rounded-full border border-border bg-card items-center justify-center hover:bg-muted transition-colors"
              aria-label="Scroll categories right"
            >
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </section>

        {/* Featured/Filtered Products */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl lg:text-2xl font-bold text-foreground">
              {activeCategory === "all" ? "Featured Products" : allCategories.find(c => c.slug === activeCategory)?.name || "Products"}
            </h2>
            <button onClick={() => navigate("/products")} className="text-primary text-sm font-medium hover:underline">
              View All
            </button>
          </div>
          {isDisplayLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : displayProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {displayProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground card p-8">
              <span className="material-symbols-outlined text-4xl mb-2">inventory_2</span>
              <p>No products found in this category</p>
            </div>
          )}
        </section>

        {/* New Arrivals */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl lg:text-2xl font-bold text-foreground">New Arrivals</h2>
            <button onClick={() => navigate("/products")} className="text-primary text-sm font-medium hover:underline">
              View All
            </button>
          </div>
          {newLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {newProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Home;
