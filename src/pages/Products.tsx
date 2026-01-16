import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { useProducts, useCategories } from "@/hooks/useProducts";

const Products = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const brandFilter = searchParams.get("brand");

  const [activeCategory, setActiveCategory] = useState("all");

  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  const filteredProducts = products.filter(p => {
    // Filter by Brand if present in URL
    if (brandFilter && p.brand !== brandFilter) return false;

    // Filter by Category
    if (activeCategory !== "all" && p.category?.slug !== activeCategory) return false;

    return true;
  });

  const allCategories = [
    { id: "all", name: "All", slug: "all" },
    ...categories
  ];

  return (
    <Layout>
      <div className="content-container py-6 lg:py-10">
        <div className="glass-card rounded-3xl p-6 mb-8">
          <div className="flex items-start justify-between gap-6">
            <div className="flex flex-col">
              <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
              {brandFilter ? `${brandFilter} Products` : "All Products"}
            </h1>
            {brandFilter && (
              <button
                onClick={() => navigate("/products")}
                className="text-sm text-muted-foreground hover:text-foreground self-start transition-colors mt-1"
              >
                Clear Brand Filter
              </button>
            )}
              <div className="mt-5 flex flex-wrap gap-2">
                {allCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.slug)}
                    className={`px-4 py-2 rounded-full transition-all whitespace-nowrap text-sm border ${activeCategory === category.slug
                      ? "bg-white/10 border-white/10 text-foreground"
                      : "bg-card/30 border-border/60 text-muted-foreground hover:text-foreground hover:bg-white/5"
                      }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Showing</div>
              <div className="text-2xl font-bold text-foreground">{filteredProducts.length}</div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {productsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-surface animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-muted-foreground mb-4">inventory_2</span>
            <p className="text-muted-foreground">No products found for this selection</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Products;
