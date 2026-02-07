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

  const trustBadges = [
    { icon: "local_shipping", label: "Free Delivery", sub: "On orders above ₦50k" },
    { icon: "verified_user", label: "Genuine Products", sub: "100% authentic" },
    { icon: "build", label: "Repair Services", sub: "Expert technicians" },
    { icon: "support_agent", label: "24/7 Support", sub: "Always here to help" },
  ];

  return (
    <Layout>
      <div className="content-container py-6 lg:py-10">
        {/* Hero Section - Clean & Minimal */}
        <section className="mb-10">
          {/* Search Bar */}
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">
              What are you looking for?
            </h1>
            <p className="text-muted-foreground text-sm mb-4">
              Browse gadgets, accessories & more
            </p>
            <button
              onClick={() => navigate("/search")}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-muted border border-border text-muted-foreground hover:border-primary/30 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">search</span>
              <span className="text-sm">Search products, brands...</span>
            </button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {trustBadges.map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-xl">{badge.icon}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{badge.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{badge.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className="mb-10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollCategories('left')}
              className="hidden lg:flex flex-shrink-0 w-10 h-10 rounded-full border border-border bg-card items-center justify-center hover:bg-muted transition-colors"
              aria-label="Scroll categories left"
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>

            <div
              ref={categoryScrollRef}
              className="flex gap-2 overflow-x-auto pb-2 flex-1"
            >
              {allCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.slug)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all whitespace-nowrap text-sm font-medium ${activeCategory === category.slug
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{category.icon}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>

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
            <h2 className="section-title">
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
            <h2 className="section-title">New Arrivals</h2>
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
