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
        {/* Search Input */}
        <div className="relative mb-8">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-muted-foreground">search</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, brands..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg"
            autoFocus
          />
        </div>

        {/* Results */}
        {query.length >= 2 ? (
          <>
            <p className="text-muted-foreground mb-6">
              {isLoading ? "Searching..." : `${results.length} results for "${query}"`}
            </p>
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-square rounded-2xl bg-surface animate-pulse" />
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
              <div className="text-center py-20">
                <span className="material-symbols-outlined text-6xl text-muted-foreground mb-4">search_off</span>
                <p className="text-muted-foreground">No products found</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-muted-foreground mb-4">search</span>
            <p className="text-muted-foreground">Start typing to search products</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Search;
