import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";

interface DeviceOption {
  title: string;
  slug: string;
  category: "phones" | "laptops";
}

interface GuideImage {
  thumbnail?: string;
  standard?: string;
  medium?: string;
  original?: string;
  thumbnail_url?: string;
}

interface GuideListItem {
  guideid: number;
  title: string;
  difficulty?: string;
  time_required?: string;
  image?: GuideImage | string;
}

interface GuideLine {
  text_raw?: string;
  text?: string;
  bullet?: string;
}

interface GuideStep {
  number?: number;
  orderby?: number;
  title?: string;
  lines: GuideLine[];
  images?: GuideImage[];
  media?: { data: GuideImage[] };
}

interface FullGuide {
  guideid: number;
  title: string;
  difficulty?: string;
  time_required?: string;
  introduction_raw?: string;
  image?: GuideImage;
  tools?: { text?: string; name?: string; quantity?: number }[];
  parts?: { text?: string; name?: string; quantity?: number }[];
  steps: GuideStep[];
}

type View = "home" | "guides" | "guide";

const devices: DeviceOption[] = [
  { title: "iPhone 14", slug: "iPhone_14", category: "phones" },
  { title: "iPhone 13", slug: "iPhone_13", category: "phones" },
  { title: "Samsung Galaxy S23", slug: "Samsung_Galaxy_S23", category: "phones" },
  { title: "Google Pixel 8", slug: "Google_Pixel_8", category: "phones" },
  { title: "MacBook Pro 14\"", slug: "MacBook_Pro_14%22_2023", category: "laptops" },
  { title: "MacBook Air M2", slug: "MacBook_Air_13%22_M2_2022", category: "laptops" },
  { title: "Dell XPS 13", slug: "Dell_XPS_13", category: "laptops" },
  { title: "HP Spectre x360", slug: "HP_Spectre_x360_14-ea0023dx", category: "laptops" },
];

const DIYRepair = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("home");
  const [activeCategory, setActiveCategory] = useState<"phones" | "laptops">("phones");
  const [guides, setGuides] = useState<GuideListItem[]>([]);
  const [fullGuide, setFullGuide] = useState<FullGuide | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<DeviceOption | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingGuide, setLoadingGuide] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [expandAll, setExpandAll] = useState(false);

  const goBack = () => {
    if (view === "guide") {
      setView("guides");
      setFullGuide(null);
      return;
    }
    if (view === "guides") {
      setView("home");
      setGuides([]);
      setSelectedDevice(null);
      return;
    }
    navigate("/repair");
  };

  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const getGuideImage = (image?: GuideImage | string) => {
    if (!image) return "";
    if (typeof image === "string") return image;
    return image.standard || image.medium || image.original || image.thumbnail || image.thumbnail_url || "";
  };

  const getStepImages = (step: GuideStep): string[] => {
    const direct = (step.images || []).map((img) => getGuideImage(img)).filter(Boolean);
    if (direct.length > 0) return direct;
    return (step.media?.data || []).map((img) => getGuideImage(img)).filter(Boolean);
  };

  const loadDeviceGuides = async (device: DeviceOption) => {
    setLoading(true);
    setSelectedDevice(device);
    setView("guides");
    setGuides([]);
    try {
      const res = await fetch(`https://www.ifixit.com/api/2.0/categories/${device.slug}`);
      if (!res.ok) throw new Error("Failed to fetch guides");
      const data = await res.json();
      setGuides(Array.isArray(data.guides) ? data.guides : []);
    } catch (error) {
      console.error("Category guides fetch error:", error);
      setGuides([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFullGuide = async (guideid: number) => {
    setLoadingGuide(true);
    setView("guide");
    setCurrentStep(0);
    setExpandAll(false);
    try {
      const res = await fetch(`https://www.ifixit.com/api/2.0/guides/${guideid}`);
      if (!res.ok) throw new Error("Failed to fetch guide");
      setFullGuide(await res.json());
    } catch (error) {
      console.error("Guide fetch error:", error);
      setFullGuide(null);
    } finally {
      setLoadingGuide(false);
    }
  };

  const visibleDevices = devices.filter((device) => device.category === activeCategory);

  return (
    <Layout>
      <div className="content-container py-6 lg:py-10">
        <button onClick={goBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          <span className="text-sm font-medium">
            {view === "guide" ? "Back to Guides" : view === "guides" ? "Back to Devices" : "Back to Repair"}
          </span>
        </button>

        {view === "home" && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl text-primary">handyman</span>
              </div>
              <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-2">DIY Repair Guides</h1>
              <p className="text-muted-foreground">Choose a device category, then pick your exact model</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => setActiveCategory("phones")}
                className={`card p-4 text-left transition-colors ${activeCategory === "phones" ? "border-primary ring-1 ring-primary" : "hover:border-primary/40"}`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-2xl">smartphone</span>
                  <div>
                    <p className="font-semibold text-foreground">Mobile Phones</p>
                    <p className="text-xs text-muted-foreground">iPhone, Samsung, Pixel</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setActiveCategory("laptops")}
                className={`card p-4 text-left transition-colors ${activeCategory === "laptops" ? "border-primary ring-1 ring-primary" : "hover:border-primary/40"}`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-2xl">laptop_mac</span>
                  <div>
                    <p className="font-semibold text-foreground">Laptops</p>
                    <p className="text-xs text-muted-foreground">MacBook, Dell, HP</p>
                  </div>
                </div>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {visibleDevices.map((device) => (
                <button
                  key={device.slug}
                  onClick={() => loadDeviceGuides(device)}
                  className="card p-4 text-left hover:border-primary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">
                        {device.category === "phones" ? "smartphone" : "laptop_mac"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{device.title}</p>
                      <p className="text-xs text-muted-foreground">View repair guides</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {view === "guides" && (
          <>
            <h1 className="font-display text-xl lg:text-2xl font-bold text-foreground mb-1">Repair Guides</h1>
            <p className="text-muted-foreground text-sm mb-6">
              {selectedDevice?.title || "Device"} — {guides.length} guide{guides.length !== 1 ? "s" : ""}
            </p>

            {loading ? (
              <div className="flex justify-center py-12">
                <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
              </div>
            ) : guides.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-4xl text-muted-foreground mb-3">search_off</span>
                <p className="text-muted-foreground">No guides found for this device.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {guides.map((guide) => (
                  <button key={guide.guideid} onClick={() => loadFullGuide(guide.guideid)} className="card p-4 text-left hover:border-primary transition-colors">
                    {getGuideImage(guide.image) && (
                      <img src={getGuideImage(guide.image)} alt={guide.title} className="w-full h-36 object-cover rounded-lg mb-3" />
                    )}
                    <h3 className="font-medium text-foreground text-sm line-clamp-2 mb-2">{guide.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      {guide.difficulty && <span className="text-xs px-2 py-1 rounded-md bg-secondary text-foreground">{guide.difficulty}</span>}
                      {guide.time_required && <span className="text-xs px-2 py-1 rounded-md bg-secondary text-foreground">⏱ {guide.time_required}</span>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {view === "guide" && (
          <>
            {loadingGuide ? (
              <div className="flex justify-center py-12">
                <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
              </div>
            ) : fullGuide ? (
              <div className="max-w-3xl mx-auto">
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  {getGuideImage(fullGuide.image) && (
                    <img src={getGuideImage(fullGuide.image)} alt={fullGuide.title} className="w-full sm:w-40 h-40 object-cover rounded-xl" />
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
                    <div className="flex items-center justify-between mt-4 gap-3">
                      <button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0} className="px-4 py-2 rounded-lg bg-secondary text-foreground text-sm font-medium disabled:opacity-40">
                        ← Previous
                      </button>
                      <span className="text-sm text-muted-foreground font-medium text-center">Step {currentStep + 1} of {fullGuide.steps.length}</span>
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
      <h3 className="font-bold text-foreground text-sm mb-3">Step {step.number || step.orderby || index + 1}{step.title ? `: ${step.title}` : ""}</h3>
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
