import { useState } from "react";
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
  const { data: categories = [] } = useCategories();

  const filteredProducts = products.filter(p => {
    if (brandFilter && p.brand !== brandFilter) return false;
    if (activeCategory !== "all" && p.category?.slug !== activeCategory) return false;
    return true;
  });

  const allCategories = [
    { id: "all", name: "All", slug: "all" },
    ...categories
  ];

  return (
    <Layout>
      <div className="content-container py-4 lg:py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="text-foreground">
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">
              {brandFilter ? `${brandFilter}` : "Shop"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            </p>
          </div>
          {brandFilter && (
            <button onClick={() => navigate("/products")} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">close</span>
              Clear
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {allCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.slug)}
              className={`px-4 py-2 rounded-xl transition-all text-sm font-medium whitespace-nowrap ${activeCategory === category.slug
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {productsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-5xl text-muted-foreground mb-4">inventory_2</span>
            <h2 className="text-lg font-semibold text-foreground mb-2">No products found</h2>
            <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
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
