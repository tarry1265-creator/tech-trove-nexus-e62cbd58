import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import HeroSlider from "@/components/HeroSlider";
import { useProducts, useFeaturedProducts, useNewArrivals, useCategories, useProductsByCategory, formatPrice } from "@/hooks/useProducts";
import { useAuth } from "@/context/AuthContext";

const Home = () => {
  const navigate = useNavigate();
  const { user, loading, profile } = useAuth();

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

  const handleCategoryClick = useCallback((slug: string) => {
    setActiveCategory(slug);
  }, []);

  // Hero slider: specific products with transparent PNG hero images
  const heroSliderSlugs = [
    "jbl-live-770nc-wireless-over-ear-headphones",
    "air-f9-max-buds-plus",
    "hottu-30000mah-22-5w-power-bank",
    "xbox-360-usb-wired-controller",
  ];
  const heroImageMap: Record<string, string> = {
    "jbl-live-770nc-wireless-over-ear-headphones": "/products/jbl-live-770nc-headphones-hero.png",
    "air-f9-max-buds-plus": "/products/air-f9-max-buds-hero.png",
    "hottu-30000mah-22-5w-power-bank": "/products/hottu-power-bank-hero.png",
    "xbox-360-usb-wired-controller": "/products/xbox-360-controller-hero.png",
  };
  const heroSliderProducts = useMemo(() => {
    return heroSliderSlugs
      .map(slug => {
        const p = products.find(pr => pr.slug === slug);
        if (!p) return null;
        return { ...p, image_url: heroImageMap[slug] || p.image_url };
      })
      .filter(Boolean) as typeof products;
  }, [products]);

  const displayProducts = activeCategory === "all" ? featuredProducts : filteredProducts;
  const isDisplayLoading = activeCategory === "all" ? featuredLoading : filteredLoading;

  return (
    <Layout>
      <div className="content-container py-4 lg:py-8">
        {/* Mobile Header: Avatar + Search + Cart */}
        <div className="flex items-center justify-between mb-5 lg:hidden">
          <button onClick={() => navigate("/profile")} className="w-10 h-10 rounded-full overflow-hidden border-2 border-border">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="material-symbols-outlined text-muted-foreground text-lg">person</span>
              </div>
            )}
          </button>
          <div className="flex items-center gap-1">
            <button onClick={() => navigate("/search")} className="p-2.5 rounded-xl hover:bg-muted transition-colors text-foreground">
              <span className="material-symbols-outlined text-[22px]">search</span>
            </button>
            <button onClick={() => navigate("/cart")} className="p-2.5 rounded-xl hover:bg-muted transition-colors text-foreground">
              <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
            </button>
          </div>
        </div>

        {/* Desktop Search Bar */}
        <button
          onClick={() => navigate("/search")}
          className="hidden lg:flex w-full items-center gap-3 px-4 py-3 rounded-xl bg-muted border border-border text-muted-foreground hover:border-primary/30 transition-colors mb-6"
        >
          <span className="material-symbols-outlined text-xl">search</span>
          <span className="text-sm">Search products, brands...</span>
        </button>

        {/* Hero - "Popular now" */}
        <section className="mb-8">
          <h2 className="section-title mb-4">Popular now</h2>
          <HeroSlider products={heroSliderProducts} isLoading={productsLoading} />
        </section>

        {/* Categories - Horizontal scroll */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Categories</h2>
            <button onClick={() => navigate("/products")} className="text-muted-foreground text-sm font-medium flex items-center gap-0.5 hover:text-foreground transition-colors">
              See more <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
          <div
            ref={categoryScrollRef}
            className="flex gap-3 overflow-x-auto pb-2"
          >
            {allCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.slug)}
                className={`flex flex-col items-center gap-2 min-w-[100px] p-3 rounded-2xl transition-all ${activeCategory === category.slug
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">{category.icon}</span>
                <span className="text-xs font-medium whitespace-nowrap">{category.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Featured/Filtered Products */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">
              {activeCategory === "all" ? "Featured" : allCategories.find(c => c.slug === activeCategory)?.name || "Products"}
            </h2>
            <button onClick={() => navigate("/products")} className="text-muted-foreground text-sm font-medium flex items-center gap-0.5 hover:text-foreground transition-colors">
              See more <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
          {isDisplayLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square rounded-2xl bg-muted animate-pulse" />
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

        {/* New Arrivals - List style */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">New arrivals</h2>
            <button onClick={() => navigate("/products")} className="text-muted-foreground text-sm font-medium flex items-center gap-0.5 hover:text-foreground transition-colors">
              See more <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
          {newLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {newProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => navigate(`/product/${product.slug}`)}
                  className="w-full flex items-center gap-4 p-3 rounded-2xl border border-border bg-card hover:bg-muted/50 transition-colors text-left"
                >
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-16 h-16 rounded-xl object-cover bg-muted flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground line-clamp-1">{product.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{product.brand || "BRAINHUB"} • {product.rating || "4.5"} <span className="text-warning">★</span></p>
                    <p className="text-sm font-bold text-price mt-1">{formatPrice(product.price)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Home;
