import { useState } from "react";
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
  image?: { standard?: string; original?: string };
  tools?: { text?: string; name?: string; quantity?: number }[];
  parts?: { text?: string; name?: string; quantity?: number }[];
  steps: GuideStep[];
}

type View = "home" | "guides" | "guide";

const DIYRepair = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [guides, setGuides] = useState<(SuggestResult | GuideListItem)[]>([]);
  const [fullGuide, setFullGuide] = useState<FullGuide | null>(null);
  const [loadingGuide, setLoadingGuide] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [expandAll, setExpandAll] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setView("guides");
    try {
      const res = await fetch(
        `https://www.ifixit.com/api/2.0/suggest/${encodeURIComponent(searchQuery)}?doctypes=guide`
      );
      if (res.ok) {
        const data = await res.json();
        const results = (Array.isArray(data) ? data : []).filter(
          (s: SuggestResult) => s.type === "guide" && s.guideid
        );
        setGuides(results);
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
        setFullGuide(await res.json());
      }
    } catch (e) {
      console.error("Guide error:", e);
    } finally {
      setLoadingGuide(false);
    }
  };

  const goBack = () => {
    if (view === "guide") { setView("guides"); setFullGuide(null); }
    else if (view === "guides") { setView("home"); setGuides([]); }
    else navigate("/repair");
  };

  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const getStepImages = (step: GuideStep): string[] => {
    if (!step.media?.data) return [];
    return step.media.data.map(img => img.standard || img.medium || img.original || img.thumbnail || "").filter(Boolean);
  };

  const popularSearches = [
    "iPhone screen replacement", "iPhone battery replacement", "Samsung screen repair",
    "Samsung battery replacement", "iPhone charging port", "Samsung Galaxy screen",
    "iPhone speaker repair", "Google Pixel screen", "OnePlus battery", "iPhone camera repair",
  ];

  return (
    <Layout>
      <div className="content-container py-6 lg:py-10">
        <button onClick={goBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          <span className="text-sm font-medium">
            {view === "guide" ? "Back to Guides" : view === "guides" ? "Back to Search" : "Back to Repair"}
          </span>
        </button>

        {/* HOME */}
        {view === "home" && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl text-primary">handyman</span>
              </div>
              <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-2">DIY Repair Guides</h1>
              <p className="text-muted-foreground">Search for phone repair guides</p>
            </div>

            <div className="flex gap-2 mb-6">
              <input
                type="text"
                placeholder="e.g. iPhone 14 screen replacement..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="input-field flex-1"
              />
              <button
                onClick={handleSearch}
                disabled={!searchQuery.trim()}
                className="btn-primary px-5 disabled:opacity-50 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">search</span>
                Search
              </button>
            </div>

            <div>
              <p className="text-sm font-medium text-foreground mb-3">Popular Searches</p>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((q) => (
                  <button
                    key={q}
                    onClick={() => { setSearchQuery(q); }}
                    className="px-3 py-1.5 rounded-lg bg-secondary text-foreground text-xs font-medium hover:bg-muted transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* GUIDES LIST */}
        {view === "guides" && (
          <>
            <h1 className="font-display text-xl lg:text-2xl font-bold text-foreground mb-1">Repair Guides</h1>
            <p className="text-muted-foreground text-sm mb-6">Results for "{searchQuery}" — {guides.length} found</p>

            {searching ? (
              <div className="flex justify-center py-12">
                <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
              </div>
            ) : guides.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-4xl text-muted-foreground mb-3">search_off</span>
                <p className="text-muted-foreground">No guides found. Try a different search term.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {guides.map((g) => {
                  const guideid = "guideid" in g ? g.guideid : null;
                  if (!guideid) return null;
                  const title = g.title;
                  const image = "image" in g && g.image ? (g.image as any).standard : undefined;
                  const difficulty = "difficulty" in g ? (g as GuideListItem).difficulty : undefined;
                  const timeReq = "time_required" in g ? (g as GuideListItem).time_required : undefined;

                  return (
                    <button key={guideid} onClick={() => loadFullGuide(guideid)} className="card p-4 text-left hover:border-primary transition-colors">
                      {image && <img src={image} alt={title} className="w-full h-36 object-cover rounded-lg mb-3" />}
                      <h3 className="font-medium text-foreground text-sm line-clamp-2 mb-2">{title}</h3>
                      <div className="flex flex-wrap gap-2">
                        {difficulty && <span className="text-xs px-2 py-1 rounded-md bg-secondary text-foreground">{difficulty}</span>}
                        {timeReq && <span className="text-xs px-2 py-1 rounded-md bg-secondary text-foreground">⏱ {timeReq}</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* FULL GUIDE */}
        {view === "guide" && (
          <>
            {loadingGuide ? (
              <div className="flex justify-center py-12">
                <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
              </div>
            ) : fullGuide ? (
              <div className="max-w-3xl mx-auto">
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  {fullGuide.image?.standard && (
                    <img src={fullGuide.image.standard} alt={fullGuide.title} className="w-full sm:w-40 h-40 object-cover rounded-xl" />
                  )}
                  <div className="flex-1">
                    <h1 className="font-display text-xl lg:text-2xl font-bold text-foreground mb-2">{fullGuide.title}</h1>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {fullGuide.difficulty && <span className="text-xs px-2.5 py-1 rounded-md bg-secondary text-foreground font-medium">{fullGuide.difficulty}</span>}
                      {fullGuide.time_required && <span className="text-xs px-2.5 py-1 rounded-md bg-secondary text-foreground font-medium">⏱ {fullGuide.time_required}</span>}
                      <span className="text-xs px-2.5 py-1 rounded-md bg-secondary text-foreground font-medium">{fullGuide.steps.length} steps</span>
                    </div>
                    {fullGuide.introduction_raw && <p className="text-sm text-muted-foreground line-clamp-3">{stripHtml(fullGuide.introduction_raw)}</p>}
                  </div>
                </div>

                {fullGuide.tools && fullGuide.tools.length > 0 && (
                  <div className="card p-4 mb-6">
                    <h2 className="font-bold text-foreground text-sm mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-lg">construction</span>Tools Needed
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

                {fullGuide.parts && fullGuide.parts.length > 0 && (
                  <div className="card p-4 mb-6">
                    <h2 className="font-bold text-foreground text-sm mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-lg">category</span>Parts Needed
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

                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-foreground">Repair Steps</h2>
                  <button onClick={() => setExpandAll(!expandAll)} className="text-xs text-primary font-medium hover:underline">
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
                      <StepCard step={fullGuide.steps[currentStep]} index={currentStep} getImages={getStepImages} stripHtml={stripHtml} />
                    )}
                    <div className="flex items-center justify-between mt-4">
                      <button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0} className="px-4 py-2 rounded-lg bg-secondary text-foreground text-sm font-medium disabled:opacity-40">
                        ← Previous
                      </button>
                      <span className="text-sm text-muted-foreground font-medium">Step {currentStep + 1} of {fullGuide.steps.length}</span>
                      <button onClick={() => setCurrentStep(Math.min(fullGuide.steps.length - 1, currentStep + 1))} disabled={currentStep === fullGuide.steps.length - 1} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40">
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12"><p className="text-muted-foreground">Guide not found.</p></div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

const StepCard = ({ step, index, getImages, stripHtml }: { step: GuideStep; index: number; getImages: (s: GuideStep) => string[]; stripHtml: (html: string) => string }) => {
  const images = getImages(step);
  return (
    <div className="card p-4">
      <h3 className="font-bold text-foreground text-sm mb-3">Step {index + 1}{step.title ? `: ${step.title}` : ""}</h3>
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
