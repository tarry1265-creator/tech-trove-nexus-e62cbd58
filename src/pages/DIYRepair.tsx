import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";

interface CategoryInfo {
  name: string;
  children?: string[];
  image?: { original?: string };
  description?: string;
}

const PHONE_CATEGORIES = ["Phone", "iPhone", "Android_Phone", "Samsung_Galaxy_Phone"];
const LAPTOP_CATEGORIES = ["Mac", "MacBook", "PC", "Laptop"];

const DIYRepair = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"phones" | "laptops">("phones");
  const [categories, setCategories] = useState<Record<string, CategoryInfo>>({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [subDevices, setSubDevices] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const currentCategories = activeTab === "phones" ? PHONE_CATEGORIES : LAPTOP_CATEGORIES;

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      const all = [...PHONE_CATEGORIES, ...LAPTOP_CATEGORIES];
      const results: Record<string, CategoryInfo> = {};
      await Promise.all(
        all.map(async (cat) => {
          try {
            const res = await fetch(`https://www.ifixit.com/api/2.0/categories/${cat}`);
            if (res.ok) {
              const data = await res.json();
              results[cat] = {
                name: data.display_title || cat.replace(/_/g, " "),
                children: data.children ? Object.keys(data.children) : [],
                image: data.image,
                description: data.description,
              };
            }
          } catch (e) {
            console.error(`Failed to fetch ${cat}:`, e);
          }
        })
      );
      setCategories(results);
      setLoading(false);
    };
    fetchCategories();
  }, []);

  const handleCategoryClick = (cat: string) => {
    const info = categories[cat];
    if (info?.children && info.children.length > 0) {
      setSelectedCategory(cat);
      setSubDevices(info.children);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const catFilter = activeTab === "phones" ? "Phone" : "Laptop";
      const res = await fetch(
        `https://www.ifixit.com/api/2.0/search/${encodeURIComponent(searchQuery)}?filter=category:${catFilter}&limit=12`
      );
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
      }
    } catch (e) {
      console.error("Search error:", e);
    } finally {
      setSearching(false);
    }
  };

  return (
    <Layout>
      <div className="content-container py-6 lg:py-10">
        <button
          onClick={() => navigate("/repair")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          <span className="text-sm font-medium">Back to Repair</span>
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl text-primary">handyman</span>
          </div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-2">
            DIY Repair Guides
          </h1>
          <p className="text-muted-foreground">
            Find step-by-step repair guides for your device
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-6">
          <button
            onClick={() => { setActiveTab("phones"); setSelectedCategory(null); setSearchResults([]); }}
            className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-colors ${
              activeTab === "phones" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-muted"
            }`}
          >
            📱 Phones
          </button>
          <button
            onClick={() => { setActiveTab("laptops"); setSelectedCategory(null); setSearchResults([]); }}
            className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-colors ${
              activeTab === "laptops" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-muted"
            }`}
          >
            💻 Laptops
          </button>
        </div>

        {/* Search */}
        <div className="max-w-lg mx-auto mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={`Search ${activeTab === "phones" ? "phone" : "laptop"} repair guides...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="input-field flex-1"
            />
            <button onClick={handleSearch} disabled={searching} className="btn-primary px-4">
              {searching ? (
                <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-lg">search</span>
              )}
            </button>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-foreground mb-4">Search Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((result: any, i: number) => (
                <a
                  key={i}
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card p-4 hover:border-primary transition-colors"
                >
                  {result.image?.standard && (
                    <img src={result.image.standard} alt={result.title} className="w-full h-32 object-cover rounded-lg mb-3" />
                  )}
                  <h3 className="font-medium text-foreground text-sm line-clamp-2">{result.title}</h3>
                  {result.summary && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{result.summary}</p>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        {loading ? (
          <div className="flex justify-center py-12">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
          </div>
        ) : selectedCategory ? (
          <div>
            <button
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-2 text-primary hover:text-primary/80 mb-4"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              <span className="text-sm font-medium">Back to Categories</span>
            </button>
            <h2 className="text-lg font-bold text-foreground mb-4">
              {categories[selectedCategory]?.name || selectedCategory}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {subDevices.map((device) => (
                <a
                  key={device}
                  href={`https://www.ifixit.com/Device/${device.replace(/ /g, "_")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card p-4 text-center hover:border-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-2xl text-primary mb-2">
                    {activeTab === "phones" ? "smartphone" : "laptop"}
                  </span>
                  <p className="text-sm font-medium text-foreground">{device.replace(/_/g, " ")}</p>
                </a>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {currentCategories.map((cat) => {
              const info = categories[cat];
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className="card p-6 text-center hover:border-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-3xl text-primary mb-3">
                    {activeTab === "phones" ? "smartphone" : "laptop"}
                  </span>
                  <h3 className="font-medium text-foreground">{info?.name || cat.replace(/_/g, " ")}</h3>
                  {info?.children && (
                    <p className="text-xs text-muted-foreground mt-1">{info.children.length} devices</p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DIYRepair;
