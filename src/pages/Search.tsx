import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { useSearchProducts } from "@/hooks/useProducts";

const Search = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  
  const { data: results = [], isLoading } = useSearchProducts(query);

  return (
    <Layout>
      <div className="content-container py-6 lg:py-10">
        <div className="glass-card rounded-3xl p-6 mb-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">Search</h1>
              <p className="text-muted-foreground mt-1">Find products, brands, and more.</p>
            </div>
            <button
              onClick={() => navigate("/products")}
              className="px-4 py-2 rounded-xl border border-border/60 bg-card/30 hover:bg-white/5 transition-colors text-sm font-medium text-foreground/80 hover:text-foreground"
            >
              Browse all
            </button>
          </div>
          <div className="relative mt-6">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-muted-foreground">search</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, brands..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-surface/40 border border-border/60 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/35 text-lg backdrop-blur-md"
              autoFocus
            />
          </div>
        </div>

        {query.length >= 2 ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
              {isLoading ? "Searching..." : `${results.length} results for "${query}"`}
              </p>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-square rounded-3xl bg-surface/40 border border-border/60 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                {results.map((product) => (
                  <ProductCard key={product.id} {...product} onAddToCart={() => {}} />
                ))}
              </div>
            )}
            {!isLoading && results.length === 0 && (
              <div className="glass-card rounded-3xl p-10 text-center mt-8">
                <span className="material-symbols-outlined text-6xl text-muted-foreground mb-4">search_off</span>
                <p className="text-muted-foreground">No products found</p>
              </div>
            )}
          </>
        ) : (
          <div className="glass-card rounded-3xl p-10 text-center">
            <span className="material-symbols-outlined text-6xl text-muted-foreground mb-4">search</span>
            <p className="text-muted-foreground">Start typing to search products</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Search;
