import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useSearchProducts, useFeaturedProducts, formatPrice } from "@/hooks/useProducts";

const Search = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const { data: results = [], isLoading } = useSearchProducts(query);
  const { data: popularProducts = [] } = useFeaturedProducts();

  return (
    <Layout>
      <div className="content-container py-4 lg:py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="text-foreground">
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </button>
          <h1 className="text-lg font-bold text-foreground flex-1 text-center">Search</h1>
          <div className="w-[22px]" />
        </div>

        {/* Search Input */}
        <div className="relative mb-8">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search product name"
            className="input-field pr-12"
            autoFocus
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <span className="material-symbols-outlined text-[20px]">tune</span>
          </button>
        </div>

        {query.length >= 2 ? (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {isLoading ? "Searching..." : `${results.length} results for "${query}"`}
            </p>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-3">
                {results.map((product) => (
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
                      <p className="text-xs text-muted-foreground mt-0.5">{product.brand} • {product.rating || "4.0"} <span className="text-warning">★</span></p>
                      <p className="text-sm font-bold text-price mt-1">{formatPrice(product.price)}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <span className="material-symbols-outlined text-5xl text-muted-foreground mb-3">search_off</span>
                <p className="text-muted-foreground">No products found</p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Popular products section */}
            {popularProducts.length > 0 && (
              <section>
                <h2 className="section-title mb-4">What people are searching for</h2>
                <div className="space-y-3">
                  {popularProducts.slice(0, 5).map((product) => (
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
                        <p className="text-xs text-muted-foreground mt-0.5">{product.brand} • {product.rating || "4.3"} <span className="text-warning">★</span></p>
                        <p className="text-sm font-bold text-price mt-1">{formatPrice(product.price)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Search;
