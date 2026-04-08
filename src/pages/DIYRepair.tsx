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

type View = "home" | "pickDevice" | "guides" | "guide";

const phoneDevices = [
  "iPhone 16", "iPhone 15", "iPhone 14", "iPhone 13", "iPhone 12", "iPhone 11",
  "Samsung Galaxy S24", "Samsung Galaxy S23", "Samsung Galaxy S22", "Samsung Galaxy A54",
  "Google Pixel 8", "Google Pixel 7",
  "OnePlus 12", "Xiaomi 14",
];

const laptopDevices = [
  "MacBook Pro 14\" 2023", "MacBook Air M2", "MacBook Pro 16\" 2021", "MacBook Pro 13\" 2020",
  "Dell XPS 15", "Dell XPS 13", "HP Spectre x360", "HP Pavilion",
  "Lenovo ThinkPad X1 Carbon", "ASUS ROG Zephyrus", "Surface Laptop", "Acer Swift 3",
];

const DIYRepair = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("home");

  // Problem description
  const [problemDesc, setProblemDesc] = useState("");
  const [selectedDevice, setSelectedDevice] = useState("");
  const [deviceCategory, setDeviceCategory] = useState<"phones" | "laptops">("phones");

  // Search results (guides from search)
  const [searchResults, setSearchResults] = useState<SuggestResult[]>([]);
  const [searching, setSearching] = useState(false);

  // Guides list
  const [deviceName, setDeviceName] = useState("");
  const [guides, setGuides] = useState<GuideListItem[]>([]);
  const [loadingGuides, setLoadingGuides] = useState(false);

  // Full guide
  const [fullGuide, setFullGuide] = useState<FullGuide | null>(null);
  const [loadingGuide, setLoadingGuide] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [expandAll, setExpandAll] = useState(false);

  const handleSearch = async () => {
    if (!problemDesc.trim() || !selectedDevice.trim()) return;
    setSearching(true);
    setView("guides");
    setDeviceName(selectedDevice);
    try {
      const query = `${selectedDevice} ${problemDesc}`;
      const res = await fetch(
        `https://www.ifixit.com/api/2.0/suggest/${encodeURIComponent(query)}?doctypes=guide`
      );
      if (res.ok) {
        const data = await res.json();
        const guideResults = (Array.isArray(data) ? data : []).filter(
          (s: SuggestResult) => s.type === "guide" && s.guideid
        );
        setSearchResults(guideResults);

        // Also try loading device-specific guides
        const deviceSlug = selectedDevice.replace(/ /g, "_");
        const catRes = await fetch(`https://www.ifixit.com/api/2.0/categories/${encodeURIComponent(deviceSlug)}`);
        if (catRes.ok) {
          const catData = await catRes.json();
          setGuides(catData.guides || []);
        } else {
          setGuides([]);
        }
      }
    } catch (e) {
      console.error("Search error:", e);
    } finally {
      setSearching(false);
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

  const goBack = () => {
    if (view === "guide") {
      setView("guides");
      setFullGuide(null);
    } else if (view === "guides") {
      setView("home");
      setGuides([]);
      setSearchResults([]);
    } else if (view === "pickDevice") {
      setView("home");
    } else {
      navigate("/repair");
    }
  };

  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const getStepImages = (step: GuideStep): string[] => {
    if (!step.media?.data) return [];
    return step.media.data.map(img => img.standard || img.medium || img.original || img.thumbnail || "").filter(Boolean);
  };

  // Combine search results + device guides, dedup by guideid
  const allGuides = (() => {
    const map = new Map<number, GuideListItem | SuggestResult>();
    searchResults.forEach(s => {
      if (s.guideid) map.set(s.guideid, s);
    });
    guides.forEach(g => {
      if (!map.has(g.guideid)) map.set(g.guideid, g);
    });
    return Array.from(map.values());
  })();

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
            {view === "guide" ? "Back to Guides" : view === "guides" ? "Back to Search" : view === "pickDevice" ? "Back" : "Back to Repair"}
          </span>
        </button>

        {/* ===== HOME VIEW ===== */}
        {view === "home" && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl text-primary">handyman</span>
              </div>
              <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-2">
                DIY Repair Guides
              </h1>
              <p className="text-muted-foreground">Describe your problem and pick your device to find repair guides</p>
            </div>

            {/* Device Category */}
            <div className="flex justify-center gap-2 mb-6">
              {(["phones", "laptops"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => { setDeviceCategory(tab); setSelectedDevice(""); }}
                  className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                    deviceCategory === tab ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-muted"
                  }`}
                >
                  {tab === "phones" ? "📱 Phones" : "💻 Laptops"}
                </button>
              ))}
            </div>

            {/* Device picker */}
            <div className="mb-4">
              <label className="text-sm font-medium text-foreground mb-2 block">Select your device</label>
              <button
                onClick={() => setView("pickDevice")}
                className="input-field w-full text-left flex items-center justify-between"
              >
                <span className={selectedDevice ? "text-foreground" : "text-muted-foreground"}>
                  {selectedDevice || "Tap to pick your device..."}
                </span>
                <span className="material-symbols-outlined text-muted-foreground text-lg">expand_more</span>
              </button>
            </div>

            {/* Problem description */}
            <div className="mb-6">
              <label className="text-sm font-medium text-foreground mb-2 block">Describe your problem</label>
              <textarea
                placeholder="e.g. My screen is cracked, battery drains fast, speaker not working..."
                value={problemDesc}
                onChange={(e) => setProblemDesc(e.target.value)}
                className="input-field w-full min-h-[100px] resize-none"
              />
            </div>

            {/* Search button */}
            <button
              onClick={handleSearch}
              disabled={!problemDesc.trim() || !selectedDevice.trim()}
              className="btn-primary w-full py-4 text-base font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">search</span>
              Find Repair Guides
            </button>
          </div>
        )}

        {/* ===== DEVICE PICKER VIEW ===== */}
        {view === "pickDevice" && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-lg font-bold text-foreground mb-4">
              Select your {deviceCategory === "phones" ? "Phone" : "Laptop"}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(deviceCategory === "phones" ? phoneDevices : laptopDevices).map((device) => (
                <button
                  key={device}
                  onClick={() => { setSelectedDevice(device); setView("home"); }}
                  className={`card p-4 text-center hover:border-primary transition-colors ${
                    selectedDevice === device ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl text-primary mb-2">
                    {deviceCategory === "phones" ? "smartphone" : "laptop"}
                  </span>
                  <p className="text-sm font-medium text-foreground">{device}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ===== GUIDES LIST VIEW ===== */}
        {view === "guides" && (
          <>
            <h1 className="font-display text-xl lg:text-2xl font-bold text-foreground mb-1">
              Repair Guides for {deviceName}
            </h1>
            <p className="text-muted-foreground text-sm mb-2">Problem: "{problemDesc}"</p>
            <p className="text-muted-foreground text-xs mb-6">{allGuides.length} results found</p>

            {searching || loadingGuides ? (
              <div className="flex justify-center py-12">
                <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
              </div>
            ) : allGuides.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-4xl text-muted-foreground mb-3">search_off</span>
                <p className="text-muted-foreground">No repair guides found. Try a different description or device.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allGuides.map((g) => {
                  const guideid = "guideid" in g ? g.guideid : null;
                  const title = g.title;
                  const image = "image" in g && g.image ? (g.image as any).standard : undefined;
                  const difficulty = "difficulty" in g ? (g as GuideListItem).difficulty : undefined;
                  const timeReq = "time_required" in g ? (g as GuideListItem).time_required : undefined;

                  if (!guideid) return null;
                  return (
                    <button
                      key={guideid}
                      onClick={() => loadFullGuide(guideid)}
                      className="card p-4 text-left hover:border-primary transition-colors"
                    >
                      {image && (
                        <img src={image} alt={title} className="w-full h-36 object-cover rounded-lg mb-3" />
                      )}
                      <h3 className="font-medium text-foreground text-sm line-clamp-2 mb-2">{title}</h3>
                      <div className="flex flex-wrap gap-2">
                        {difficulty && (
                          <span className="text-xs px-2 py-1 rounded-md bg-secondary text-foreground">{difficulty}</span>
                        )}
                        {timeReq && (
                          <span className="text-xs px-2 py-1 rounded-md bg-secondary text-foreground">⏱ {timeReq}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
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
                        <span className="text-xs px-2.5 py-1 rounded-md bg-secondary text-foreground font-medium">{fullGuide.difficulty}</span>
                      )}
                      {fullGuide.time_required && (
                        <span className="text-xs px-2.5 py-1 rounded-md bg-secondary text-foreground font-medium">⏱ {fullGuide.time_required}</span>
                      )}
                      <span className="text-xs px-2.5 py-1 rounded-md bg-secondary text-foreground font-medium">{fullGuide.steps.length} steps</span>
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
                  <div className="space-y-6">
                    {fullGuide.steps.map((step, idx) => (
                      <StepCard key={idx} step={step} index={idx} getImages={getStepImages} stripHtml={stripHtml} />
                    ))}
                  </div>
                ) : (
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

      {images.length > 0 && (
        <div className={`grid gap-2 mb-3 ${images.length === 1 ? "grid-cols-1" : images.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
          {images.map((src, i) => (
            <img key={i} src={src} alt={`Step ${index + 1} image ${i + 1}`} className="w-full rounded-lg object-cover aspect-square" />
          ))}
        </div>
      )}

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
