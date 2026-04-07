import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";

interface SuggestResult {
  title: string;
  type: string;
  url: string;
  guideid: number | null;
}

interface GuideListItem {
  guideid: number;
  title: string;
  difficulty?: string;
  time_required?: string;
  image?: { thumbnail?: string; standard?: string; medium?: string; original?: string };
  url?: string;
}

interface GuideLine {
  text_raw?: string;
  text?: string;
  bullet?: string;
  level?: number;
}

interface GuideStep {
  orderby: number;
  title?: string;
  lines: GuideLine[];
  media?: { type: string; data: { thumbnail?: string; standard?: string; medium?: string; original?: string }[] };
}

interface FullGuide {
  guideid: number;
  title: string;
  difficulty?: string;
  time_required?: string;
  introduction_raw?: string;
  introduction_rendered?: string;
  image?: { standard?: string; original?: string };
  tools?: { text?: string; name?: string; quantity?: number; url?: string }[];
  parts?: { text?: string; name?: string; quantity?: number }[];
  steps: GuideStep[];
}

type View = "home" | "guides" | "guide";

const DIYRepair = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("home");
  const [activeTab, setActiveTab] = useState<"phones" | "laptops">("phones");

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SuggestResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Guides list
  const [deviceName, setDeviceName] = useState("");
  const [guides, setGuides] = useState<GuideListItem[]>([]);
  const [loadingGuides, setLoadingGuides] = useState(false);

  // Full guide
  const [fullGuide, setFullGuide] = useState<FullGuide | null>(null);
  const [loadingGuide, setLoadingGuide] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [expandAll, setExpandAll] = useState(false);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Autocomplete search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://www.ifixit.com/api/2.0/suggest/${encodeURIComponent(searchQuery)}?doctypes=device,guide`
        );
        if (res.ok) {
          const data = await res.json();
          setSuggestions(Array.isArray(data) ? data : []);
          setShowSuggestions(true);
        }
      } catch (e) {
        console.error("Suggest error:", e);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const loadDeviceGuides = async (device: string) => {
    setLoadingGuides(true);
    setDeviceName(device);
    setView("guides");
    try {
      const res = await fetch(`https://www.ifixit.com/api/2.0/categories/${encodeURIComponent(device.replace(/ /g, "_"))}`);
      if (res.ok) {
        const data = await res.json();
        setGuides(data.guides || []);
      }
    } catch (e) {
      console.error("Guides error:", e);
    } finally {
      setLoadingGuides(false);
    }
  };

  const loadFullGuide = async (guideid: number) => {
    setLoadingGuide(true);
    setView("guide");
    setCurrentStep(0);
    setExpandAll(false);
    try {
      const res = await fetch(`https://www.ifixit.com/api/2.0/guides/${guideid}`);
      if (res.ok) {
        const data = await res.json();
        setFullGuide(data);
      }
    } catch (e) {
      console.error("Guide error:", e);
    } finally {
      setLoadingGuide(false);
    }
  };

  const handleSuggestionClick = (s: SuggestResult) => {
    setShowSuggestions(false);
    setSearchQuery("");
    if (s.type === "guide" && s.guideid) {
      loadFullGuide(s.guideid);
    } else if (s.type === "device") {
      const name = s.url?.replace("/Device/", "").replace(/_/g, " ") || s.title;
      loadDeviceGuides(name);
    }
  };

  const goBack = () => {
    if (view === "guide") {
      if (guides.length > 0) {
        setView("guides");
      } else {
        setView("home");
      }
      setFullGuide(null);
    } else if (view === "guides") {
      setView("home");
      setGuides([]);
    } else {
      navigate("/repair");
    }
  };

  // Popular devices
  const phoneDevices = ["iPhone 16", "iPhone 15", "iPhone 14", "iPhone 13", "Samsung Galaxy S24", "Samsung Galaxy S23", "Google Pixel 8", "Google Pixel 7"];
  const laptopDevices = ["MacBook Pro 14\" 2023", "MacBook Air M2", "MacBook Pro 16\" 2021", "Dell XPS 15", "HP Spectre x360", "Lenovo ThinkPad X1 Carbon", "ASUS ROG Zephyrus", "Surface Laptop"];

  const popularDevices = activeTab === "phones" ? phoneDevices : laptopDevices;

  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const getStepImages = (step: GuideStep): string[] => {
    if (!step.media?.data) return [];
    return step.media.data.map(img => img.standard || img.medium || img.original || img.thumbnail || "").filter(Boolean);
  };

  return (
    <Layout>
      <div className="content-container py-6 lg:py-10">
        {/* Back button */}
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          <span className="text-sm font-medium">
            {view === "guide" ? "Back to Guides" : view === "guides" ? "Back to Search" : "Back to Repair"}
          </span>
        </button>

        {/* ===== HOME VIEW ===== */}
        {view === "home" && (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl text-primary">handyman</span>
              </div>
              <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-2">
                DIY Repair Guides
              </h1>
              <p className="text-muted-foreground">Find step-by-step repair guides for your device</p>
            </div>

            {/* Tabs */}
            <div className="flex justify-center gap-2 mb-6">
              {(["phones", "laptops"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                    activeTab === tab ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-muted"
                  }`}
                >
                  {tab === "phones" ? "📱 Phones" : "💻 Laptops"}
                </button>
              ))}
            </div>

            {/* Search with autocomplete */}
            <div className="max-w-lg mx-auto mb-8 relative" ref={searchRef}>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Search ${activeTab === "phones" ? "phone" : "laptop"} repair guides...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  className="input-field flex-1"
                />
                {searching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <span className="material-symbols-outlined animate-spin text-lg text-muted-foreground">progress_activity</span>
                  </div>
                )}
              </div>

              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-lg max-h-80 overflow-y-auto">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestionClick(s)}
                      className="w-full text-left px-4 py-3 hover:bg-muted transition-colors flex items-center gap-3 border-b border-border/50 last:border-0"
                    >
                      <span className="material-symbols-outlined text-primary text-lg">
                        {s.type === "device" ? (activeTab === "phones" ? "smartphone" : "laptop") : "build"}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-foreground">{s.title}</p>
                        <p className="text-xs text-muted-foreground capitalize">{s.type}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Popular Devices */}
            <h2 className="text-lg font-bold text-foreground mb-4">Popular {activeTab === "phones" ? "Phones" : "Laptops"}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {popularDevices.map((device) => (
                <button
                  key={device}
                  onClick={() => loadDeviceGuides(device)}
                  className="card p-5 text-center hover:border-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-3xl text-primary mb-3">
                    {activeTab === "phones" ? "smartphone" : "laptop"}
                  </span>
                  <p className="text-sm font-medium text-foreground">{device}</p>
                </button>
              ))}
            </div>
          </>
        )}

        {/* ===== GUIDES LIST VIEW ===== */}
        {view === "guides" && (
          <>
            <h1 className="font-display text-xl lg:text-2xl font-bold text-foreground mb-1">
              {deviceName} Repair Guides
            </h1>
            <p className="text-muted-foreground text-sm mb-6">{guides.length} guides available</p>

            {loadingGuides ? (
              <div className="flex justify-center py-12">
                <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
              </div>
            ) : guides.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-4xl text-muted-foreground mb-3">search_off</span>
                <p className="text-muted-foreground">No repair guides found for this device.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {guides.map((g) => (
                  <button
                    key={g.guideid}
                    onClick={() => loadFullGuide(g.guideid)}
                    className="card p-4 text-left hover:border-primary transition-colors"
                  >
                    {g.image?.standard && (
                      <img src={g.image.standard} alt={g.title} className="w-full h-36 object-cover rounded-lg mb-3" />
                    )}
                    <h3 className="font-medium text-foreground text-sm line-clamp-2 mb-2">{g.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      {g.difficulty && (
                        <span className="text-xs px-2 py-1 rounded-md bg-secondary text-foreground">{g.difficulty}</span>
                      )}
                      {g.time_required && (
                        <span className="text-xs px-2 py-1 rounded-md bg-secondary text-foreground">⏱ {g.time_required}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* ===== FULL GUIDE VIEW ===== */}
        {view === "guide" && (
          <>
            {loadingGuide ? (
              <div className="flex justify-center py-12">
                <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
              </div>
            ) : fullGuide ? (
              <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  {fullGuide.image?.standard && (
                    <img src={fullGuide.image.standard} alt={fullGuide.title} className="w-full sm:w-40 h-40 object-cover rounded-xl" />
                  )}
                  <div className="flex-1">
                    <h1 className="font-display text-xl lg:text-2xl font-bold text-foreground mb-2">{fullGuide.title}</h1>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {fullGuide.difficulty && (
                        <span className="text-xs px-2.5 py-1 rounded-md bg-secondary text-foreground font-medium">
                          {fullGuide.difficulty}
                        </span>
                      )}
                      {fullGuide.time_required && (
                        <span className="text-xs px-2.5 py-1 rounded-md bg-secondary text-foreground font-medium">
                          ⏱ {fullGuide.time_required}
                        </span>
                      )}
                      <span className="text-xs px-2.5 py-1 rounded-md bg-secondary text-foreground font-medium">
                        {fullGuide.steps.length} steps
                      </span>
                    </div>
                    {fullGuide.introduction_raw && (
                      <p className="text-sm text-muted-foreground line-clamp-3">{stripHtml(fullGuide.introduction_raw)}</p>
                    )}
                  </div>
                </div>

                {/* Tools */}
                {fullGuide.tools && fullGuide.tools.length > 0 && (
                  <div className="card p-4 mb-6">
                    <h2 className="font-bold text-foreground text-sm mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-lg">construction</span>
                      Tools Needed
                    </h2>
                    <ul className="space-y-1.5">
                      {fullGuide.tools.map((tool, i) => (
                        <li key={i} className="text-sm text-foreground flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          {tool.text || tool.name}{tool.quantity && tool.quantity > 1 ? ` (×${tool.quantity})` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Parts */}
                {fullGuide.parts && fullGuide.parts.length > 0 && (
                  <div className="card p-4 mb-6">
                    <h2 className="font-bold text-foreground text-sm mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-lg">category</span>
                      Parts Needed
                    </h2>
                    <ul className="space-y-1.5">
                      {fullGuide.parts.map((part, i) => (
                        <li key={i} className="text-sm text-foreground flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          {part.text || part.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Steps toggle */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-foreground">Repair Steps</h2>
                  <button
                    onClick={() => setExpandAll(!expandAll)}
                    className="text-xs text-primary font-medium hover:underline"
                  >
                    {expandAll ? "Step-by-Step View" : "Expand All Steps"}
                  </button>
                </div>

                {expandAll ? (
                  /* All steps expanded */
                  <div className="space-y-6">
                    {fullGuide.steps.map((step, idx) => (
                      <StepCard key={idx} step={step} index={idx} getImages={getStepImages} stripHtml={stripHtml} />
                    ))}
                  </div>
                ) : (
                  /* Step-by-step navigation */
                  <div>
                    {fullGuide.steps[currentStep] && (
                      <StepCard
                        step={fullGuide.steps[currentStep]}
                        index={currentStep}
                        getImages={getStepImages}
                        stripHtml={stripHtml}
                      />
                    )}
                    <div className="flex items-center justify-between mt-4">
                      <button
                        onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                        disabled={currentStep === 0}
                        className="px-4 py-2 rounded-lg bg-secondary text-foreground text-sm font-medium disabled:opacity-40"
                      >
                        ← Previous
                      </button>
                      <span className="text-sm text-muted-foreground font-medium">
                        Step {currentStep + 1} of {fullGuide.steps.length}
                      </span>
                      <button
                        onClick={() => setCurrentStep(Math.min(fullGuide.steps.length - 1, currentStep + 1))}
                        disabled={currentStep === fullGuide.steps.length - 1}
                        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Guide not found.</p>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

/* Step Card component */
const StepCard = ({
  step,
  index,
  getImages,
  stripHtml,
}: {
  step: GuideStep;
  index: number;
  getImages: (s: GuideStep) => string[];
  stripHtml: (html: string) => string;
}) => {
  const images = getImages(step);

  return (
    <div className="card p-4">
      <h3 className="font-bold text-foreground text-sm mb-3">
        Step {index + 1}{step.title ? `: ${step.title}` : ""}
      </h3>

      {/* Images */}
      {images.length > 0 && (
        <div className={`grid gap-2 mb-3 ${images.length === 1 ? "grid-cols-1" : images.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
          {images.map((src, i) => (
            <img key={i} src={src} alt={`Step ${index + 1} image ${i + 1}`} className="w-full rounded-lg object-cover aspect-square" />
          ))}
        </div>
      )}

      {/* Instructions */}
      <ul className="space-y-2">
        {step.lines.map((line, i) => {
          const text = line.text_raw || line.text || "";
          if (!text.trim()) return null;
          const bulletColor = line.bullet === "red" ? "text-red-500" : line.bullet === "orange" ? "text-orange-500" : line.bullet === "yellow" ? "text-yellow-500" : "text-primary";
          return (
            <li key={i} className="text-sm text-foreground flex items-start gap-2">
              <span className={`mt-0.5 ${bulletColor}`}>•</span>
              <span>{stripHtml(text)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default DIYRepair;
