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
      <div className="content-container py-6 lg:py-10">
        {/* Back Button */}
        <button
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
          <span className="text-sm font-medium">Back to Home</span>
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                {brandFilter ? `${brandFilter} Products` : "Shop All Products"}
              </h1>
              <p className="text-muted-foreground mt-1">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} available
              </p>
            </div>
            {brandFilter && (
              <button
                onClick={() => navigate("/products")}
                className="btn-secondary text-sm"
              >
                <span className="material-symbols-outlined text-lg">close</span>
                Clear Filter
              </button>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {allCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.slug)}
              className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${activeCategory === category.slug
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
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
              <div key={i} className="aspect-square rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 card p-8">
            <span className="material-symbols-outlined text-6xl text-muted-foreground mb-4">inventory_2</span>
            <h2 className="text-xl font-semibold text-foreground mb-2">No products found</h2>
            <p className="text-muted-foreground">Try adjusting your filters</p>
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
