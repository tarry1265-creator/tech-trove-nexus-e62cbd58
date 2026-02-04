import { useState, useRef, useEffect, useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCategories } from "@/hooks/useProducts";
import { Camera, Upload, X, Check, Loader2, Image, RotateCcw, Plus, Sparkles } from "lucide-react";

interface ScanProductModalProps {
  open: boolean;
  onClose: () => void;
  onProductAdded: () => void;
}

interface OfficialImage {
  url: string;
  source: string;
  confidence: "high" | "medium" | "low";
}

interface ProductData {
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string | null;
  isNewCategory: boolean;
  officialImageUrl: string | null;
  officialImages?: OfficialImage[];
}

const ScanProductModal = ({ open, onClose, onProductAdded }: ScanProductModalProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [productPreview, setProductPreview] = useState<ProductData | null>(null);
  const [officialImages, setOfficialImages] = useState<OfficialImage[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string>("all");
  
  // Editable fields
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editBrand, setEditBrand] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [useNewCategory, setUseNewCategory] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const { data: categories } = useCategories();

  // Get unique sources from images
  const uniqueSources = useMemo(() => {
    const sources = new Set(officialImages.map(img => img.source));
    return ["all", ...Array.from(sources)];
  }, [officialImages]);

  // Filter images by selected source
  const filteredImages = useMemo(() => {
    if (selectedSource === "all") return officialImages;
    return officialImages.filter(img => img.source === selectedSource);
  }, [officialImages, selectedSource]);

  // Update editable fields when product preview changes
  useEffect(() => {
    if (productPreview) {
      setEditName(productPreview.name);
      setEditDescription(productPreview.description);
      setEditPrice(String(productPreview.price));
      setEditBrand(productPreview.brand || "");
      setEditCategory(productPreview.category);
      setUseNewCategory(productPreview.isNewCategory);
      
      if (categories && !productPreview.isNewCategory) {
        const found = categories.find(c => 
          c.name.toLowerCase() === productPreview.category.toLowerCase()
        );
        if (found) {
          setSelectedCategoryId(found.id);
          setUseNewCategory(false);
        } else {
          setUseNewCategory(true);
        }
      }
    }
  }, [productPreview, categories]);

  // Reset selected index when source changes
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [selectedSource]);

  const resetState = () => {
    setIsScanning(false);
    setShowCamera(false);
    setProductPreview(null);
    setImagePreview(null);
    setEditName("");
    setEditDescription("");
    setEditPrice("");
    setEditBrand("");
    setEditCategory("");
    setUseNewCategory(false);
    setSelectedCategoryId("");
    setOfficialImages([]);
    setSelectedImageIndex(0);
    setSelectedSource("all");
    stopCamera();
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const processImage = async (imageBase64: string) => {
    setIsScanning(true);
    setImagePreview(imageBase64);
    
    try {
      const { data, error } = await supabase.functions.invoke('scan-product', {
        body: { imageBase64 }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setProductPreview(data);
      
      if (data.officialImages && data.officialImages.length > 0) {
        setOfficialImages(data.officialImages);
        setSelectedImageIndex(0);
        setSelectedSource("all");
        toast.success(`Found ${data.officialImages.length} official image(s)`);
      } else {
        setOfficialImages([]);
        toast.success("Product identified!");
      }
    } catch (error) {
      console.error("Error scanning product:", error);
      toast.error(error instanceof Error ? error.message : "Failed to scan product");
      setImagePreview(null);
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      processImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Could not access camera");
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const imageBase64 = canvas.toDataURL('image/jpeg', 0.8);
      stopCamera();
      setShowCamera(false);
      processImage(imageBase64);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const getSelectedImageUrl = (): string => {
    if (filteredImages.length > 0 && filteredImages[selectedImageIndex]) {
      return filteredImages[selectedImageIndex].url;
    }
    if (officialImages.length > 0 && officialImages[0]) {
      return officialImages[0].url;
    }
    return productPreview?.officialImageUrl || imagePreview || "";
  };

  const addProduct = async () => {
    if (!imagePreview || !editName.trim()) {
      toast.error("Product name is required");
      return;
    }

    setIsScanning(true);
    try {
      let categoryId: string | null = null;

      if (useNewCategory && editCategory.trim()) {
        const { data: existingCategory } = await supabase
          .from('categories')
          .select('id')
          .eq('name', editCategory.trim())
          .maybeSingle();

        if (existingCategory) {
          categoryId = existingCategory.id;
        } else {
          const { data: newCategory, error: categoryError } = await supabase
            .from('categories')
            .insert({
              name: editCategory.trim(),
              slug: generateSlug(editCategory.trim()),
              description: `${editCategory.trim()} products`,
              icon: 'category'
            })
            .select('id')
            .single();

          if (categoryError) throw categoryError;
          categoryId = newCategory.id;
          toast.success(`Created new category: ${editCategory.trim()}`);
        }
      } else if (selectedCategoryId) {
        categoryId = selectedCategoryId;
      }

      let finalImageUrl: string;
      
      if (filteredImages.length > 0 && filteredImages[selectedImageIndex]) {
        finalImageUrl = filteredImages[selectedImageIndex].url;
      } else if (officialImages.length > 0 && officialImages[0]) {
        finalImageUrl = officialImages[0].url;
      } else if (productPreview?.officialImageUrl) {
        finalImageUrl = productPreview.officialImageUrl;
      } else if (imagePreview) {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const base64Data = imagePreview.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });

        const { error: uploadError } = await supabase.storage
          .from('repair-images')
          .upload(`products/${fileName}`, blob);

        if (uploadError) throw uploadError;

        const { data: publicUrl } = supabase.storage
          .from('repair-images')
          .getPublicUrl(`products/${fileName}`);
        
        finalImageUrl = publicUrl.publicUrl;
      } else {
        throw new Error("No image available");
      }

      const { error: productError } = await supabase
        .from('products')
        .insert({
          name: editName.trim(),
          slug: generateSlug(editName.trim()),
          description: editDescription.trim() || null,
          price: Number(editPrice) || 0,
          category_id: categoryId,
          brand: editBrand.trim() || null,
          image_url: finalImageUrl,
          stock_quantity: 10,
          is_new_arrival: true,
          currency: 'NGN'
        });

      if (productError) throw productError;

      toast.success("Product added successfully!");
      onProductAdded();
      handleClose();
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product");
    } finally {
      setIsScanning(false);
    }
  };

  // Scan & Capture View
  const renderCaptureView = () => (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">AI Product Scanner</h2>
            <p className="text-sm text-muted-foreground">Upload or capture a product image</p>
          </div>
        </div>
        <button onClick={handleClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Upload Options */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="group relative h-40 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/30 hover:bg-primary/5 transition-all duration-200 flex flex-col items-center justify-center gap-3"
        >
          <div className="w-14 h-14 rounded-xl bg-background shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform">
            <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <div className="text-center">
            <p className="font-medium text-foreground">Upload Image</p>
            <p className="text-xs text-muted-foreground">JPG, PNG, WebP</p>
          </div>
        </button>
        
        <button
          onClick={startCamera}
          className="group relative h-40 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/30 hover:bg-primary/5 transition-all duration-200 flex flex-col items-center justify-center gap-3"
        >
          <div className="w-14 h-14 rounded-xl bg-background shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform">
            <Camera className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <div className="text-center">
            <p className="font-medium text-foreground">Take Photo</p>
            <p className="text-xs text-muted-foreground">Use camera</p>
          </div>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Info */}
      <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">AI-Powered Detection</p>
            <p className="text-xs text-muted-foreground mt-1">
              Our AI will identify the product, suggest pricing, and find official images from trusted sources.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Camera View
  const renderCameraView = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Capture Product</h2>
        <button onClick={() => { stopCamera(); setShowCamera(false); }} className="p-2 hover:bg-muted rounded-lg transition-colors">
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      <div className="relative rounded-2xl overflow-hidden bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full aspect-square object-cover"
        />
        {/* Camera overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-8 border-2 border-white/30 rounded-2xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-white/50 rounded-full" />
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <Button variant="outline" className="flex-1" onClick={() => { stopCamera(); setShowCamera(false); }}>
          Cancel
        </Button>
        <Button className="flex-1" onClick={capturePhoto}>
          <Camera className="w-4 h-4 mr-2" />
          Capture
        </Button>
      </div>
    </div>
  );

  // Scanning View
  const renderScanningView = () => (
    <div className="p-8 flex flex-col items-center justify-center min-h-[300px]">
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
        <div className="absolute -inset-2 rounded-3xl border-2 border-primary/20 animate-pulse" />
      </div>
      <h3 className="mt-6 text-lg font-semibold text-foreground">Analyzing Product</h3>
      <p className="mt-2 text-sm text-muted-foreground text-center max-w-xs">
        AI is identifying the product and searching for official images...
      </p>
      <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span>This may take a few seconds</span>
      </div>
    </div>
  );

  // Product Found View
  const renderProductView = () => (
    <div className="flex flex-col max-h-[85vh]">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
            <Check className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Product Found</h2>
            <p className="text-xs text-muted-foreground">Review and confirm details</p>
          </div>
        </div>
        <button onClick={handleClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Main Image Display */}
        <div className="relative aspect-square w-full max-w-[280px] mx-auto rounded-2xl overflow-hidden bg-muted">
          <img 
            src={getSelectedImageUrl()}
            alt="Product preview" 
            className="w-full h-full object-contain"
            onError={(e) => {
              if (imagePreview && e.currentTarget.src !== imagePreview) {
                e.currentTarget.src = imagePreview;
              }
            }}
          />
          {filteredImages.length > 0 && filteredImages[selectedImageIndex] && (
            <div className="absolute top-3 right-3 px-2.5 py-1 bg-foreground/90 text-background text-xs font-medium rounded-full">
              {filteredImages[selectedImageIndex].source}
            </div>
          )}
        </div>

        {/* Source Filter Buttons */}
        {officialImages.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Image Sources</Label>
              <span className="text-xs text-muted-foreground">{officialImages.length} found</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {uniqueSources.map((source) => {
                const count = source === "all" 
                  ? officialImages.length 
                  : officialImages.filter(img => img.source === source).length;
                
                return (
                  <button
                    key={source}
                    onClick={() => setSelectedSource(source)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                      selectedSource === source
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {source === "all" ? "All" : source}
                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                      selectedSource === source
                        ? 'bg-primary-foreground/20'
                        : 'bg-background'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Image Grid */}
        {filteredImages.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {filteredImages.map((img, index) => (
              <button
                key={`${img.source}-${index}`}
                onClick={() => setSelectedImageIndex(index)}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                  selectedImageIndex === index 
                    ? 'border-primary ring-2 ring-primary/20' 
                    : 'border-transparent hover:border-border'
                }`}
              >
                <img 
                  src={img.url} 
                  alt={`Option ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = imagePreview || '';
                  }}
                />
                {selectedImageIndex === index && (
                  <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                )}
                {/* Confidence indicator */}
                <div className={`absolute bottom-1 right-1 w-2 h-2 rounded-full ${
                  img.confidence === 'high' 
                    ? 'bg-accent' 
                    : img.confidence === 'medium'
                    ? 'bg-primary'
                    : 'bg-muted-foreground'
                }`} />
              </button>
            ))}
            {/* Use uploaded photo option */}
            {imagePreview && (
              <button
                onClick={() => {
                  setOfficialImages([]);
                  setSelectedImageIndex(0);
                  setSelectedSource("all");
                }}
                className="relative aspect-square rounded-xl overflow-hidden border-2 border-dashed border-border hover:border-primary/50 transition-all"
              >
                <img 
                  src={imagePreview} 
                  alt="Your photo"
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                  <Image className="w-4 h-4 text-muted-foreground" />
                </div>
              </button>
            )}
          </div>
        )}

        {/* No images state */}
        {officialImages.length === 0 && imagePreview && (
          <div className="p-3 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Image className="w-4 h-4" />
              <span>Using your uploaded photo</span>
            </div>
          </div>
        )}

        {/* Product Details Form */}
        <div className="space-y-4 pt-2">
          <div>
            <Label htmlFor="productName" className="text-sm font-medium">Product Name</Label>
            <Input
              id="productName"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Enter product name"
              className="mt-1.5"
            />
          </div>
          
          <div>
            <Label htmlFor="productDescription" className="text-sm font-medium">Description</Label>
            <textarea
              id="productDescription"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Enter product description"
              className="mt-1.5 w-full px-3 py-2 border border-input rounded-lg text-sm bg-background resize-none h-20 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="productPrice" className="text-sm font-medium">Price (₦)</Label>
              <Input
                id="productPrice"
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                placeholder="0"
                min="0"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="productBrand" className="text-sm font-medium">Brand</Label>
              <Input
                id="productBrand"
                value={editBrand}
                onChange={(e) => setEditBrand(e.target.value)}
                placeholder="Brand name"
                className="mt-1.5"
              />
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Category</Label>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUseNewCategory(false)}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg border transition-all ${
                  !useNewCategory 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                Existing
              </button>
              <button
                type="button"
                onClick={() => setUseNewCategory(true)}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg border transition-all ${
                  useNewCategory 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                New Category
              </button>
            </div>

            {useNewCategory ? (
              <Input
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                placeholder="Enter new category name"
              />
            ) : (
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select a category</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border flex gap-3 flex-shrink-0">
        <Button variant="outline" className="flex-1" onClick={resetState}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Scan Again
        </Button>
        <Button className="flex-1" onClick={addProduct} disabled={!editName.trim() || isScanning}>
          {isScanning ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Plus className="w-4 h-4 mr-2" />
          )}
          Add Product
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        {!showCamera && !imagePreview && !productPreview && renderCaptureView()}
        {showCamera && renderCameraView()}
        {isScanning && renderScanningView()}
        {productPreview && !isScanning && renderProductView()}
      </DialogContent>
    </Dialog>
  );
};

export default ScanProductModal;
