import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCategories } from "@/hooks/useProducts";

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

  // Update editable fields when product preview changes
  useEffect(() => {
    if (productPreview) {
      setEditName(productPreview.name);
      setEditDescription(productPreview.description);
      setEditPrice(String(productPreview.price));
      setEditBrand(productPreview.brand || "");
      setEditCategory(productPreview.category);
      setUseNewCategory(productPreview.isNewCategory);
      
      // Try to find matching category
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
      
      // Set official images if available
      if (data.officialImages && data.officialImages.length > 0) {
        setOfficialImages(data.officialImages);
        setSelectedImageIndex(0);
        toast.success(`Product identified! Found ${data.officialImages.length} official image(s).`);
      } else {
        setOfficialImages([]);
        toast.success("Product identified! Using uploaded photo.");
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
      toast.error("Could not access camera. Please check permissions.");
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

  const addProduct = async () => {
    if (!imagePreview || !editName.trim()) {
      toast.error("Product name is required");
      return;
    }

    setIsScanning(true);
    try {
      let categoryId: string | null = null;

      if (useNewCategory && editCategory.trim()) {
        // Check if category already exists
        const { data: existingCategory } = await supabase
          .from('categories')
          .select('id')
          .eq('name', editCategory.trim())
          .maybeSingle();

        if (existingCategory) {
          categoryId = existingCategory.id;
        } else {
          // Create new category
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

      // Determine which image to use - prefer selected official image
      let finalImageUrl: string;
      
      if (officialImages.length > 0 && officialImages[selectedImageIndex]) {
        // Use selected official image URL directly
        finalImageUrl = officialImages[selectedImageIndex].url;
      } else if (productPreview?.officialImageUrl) {
        // Fallback to first official image URL
        finalImageUrl = productPreview.officialImageUrl;
      } else if (imagePreview) {
        // Upload the captured/selected image to storage
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

      // Insert product
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
      toast.error("Failed to add product. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">qr_code_scanner</span>
            Scan Product
          </DialogTitle>
        </DialogHeader>

        {!showCamera && !imagePreview && !productPreview && (
          <div className="flex flex-col gap-4 py-4">
            <p className="text-sm text-muted-foreground text-center">
              Add products by scanning an image. The AI will identify the product details automatically.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-32 flex flex-col gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <span className="material-symbols-outlined text-3xl">upload_file</span>
                <span className="text-sm">Pick a File</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-32 flex flex-col gap-2"
                onClick={startCamera}
              >
                <span className="material-symbols-outlined text-3xl">photo_camera</span>
                <span className="text-sm">Take a Picture</span>
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        )}

        {showCamera && (
          <div className="flex flex-col gap-4 py-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full aspect-square object-cover rounded-lg bg-muted"
            />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => { stopCamera(); setShowCamera(false); }}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={capturePhoto}>
                <span className="material-symbols-outlined mr-2">camera</span>
                Capture
              </Button>
            </div>
          </div>
        )}

        {isScanning && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Analyzing product & searching for official images...</p>
          </div>
        )}

        {productPreview && !isScanning && (
          <div className="flex flex-col gap-4 py-4">
            {/* Image Selection Section */}
            <div className="space-y-3">
              {/* Main Image Display */}
              <div className="relative">
                <img 
                  src={
                    officialImages.length > 0 
                      ? officialImages[selectedImageIndex]?.url 
                      : (productPreview.officialImageUrl || imagePreview!)
                  } 
                  alt="Product preview" 
                  className="w-full h-48 object-contain rounded-lg bg-muted"
                  onError={(e) => {
                    // Fallback to uploaded image if official URL fails
                    if (imagePreview && e.currentTarget.src !== imagePreview) {
                      e.currentTarget.src = imagePreview;
                    }
                  }}
                />
                {officialImages.length > 0 && (
                  <span className="absolute top-2 right-2 px-2 py-1 bg-primary/90 text-primary-foreground text-xs rounded-full">
                    {officialImages[selectedImageIndex]?.source}
                  </span>
                )}
              </div>
              
              {/* Image Thumbnails - only show if multiple images */}
              {officialImages.length > 1 && (
                <div className="space-y-2">
                  <Label className="text-xs">Select image ({officialImages.length} found)</Label>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {officialImages.map((img, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                          selectedImageIndex === index 
                            ? 'border-primary' 
                            : 'border-border hover:border-primary/50'
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
                        <span className={`absolute bottom-0 left-0 right-0 text-[10px] py-0.5 text-center ${
                          img.confidence === 'high' 
                            ? 'bg-green-500/90 text-white' 
                            : img.confidence === 'medium'
                            ? 'bg-yellow-500/90 text-black'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {img.source}
                        </span>
                      </button>
                    ))}
                    {/* Option to use uploaded photo */}
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setOfficialImages([]);
                          setSelectedImageIndex(0);
                        }}
                        className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 border-dashed border-border hover:border-primary/50 transition-colors"
                      >
                        <img 
                          src={imagePreview} 
                          alt="Your photo"
                          className="w-full h-full object-cover opacity-70"
                        />
                        <span className="absolute bottom-0 left-0 right-0 text-[10px] py-0.5 text-center bg-muted text-muted-foreground">
                          Your photo
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              {/* Status indicator */}
              <p className="text-xs text-muted-foreground text-center">
                {officialImages.length > 0 ? (
                  <>✓ {officialImages.length} official image{officialImages.length > 1 ? 's' : ''} found via web search</>
                ) : productPreview.officialImageUrl ? (
                  <>✓ Official product image found</>
                ) : (
                  <>Using your uploaded photo (no official images found)</>
                )}
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="productName">Product Name</Label>
                <Input
                  id="productName"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter product name"
                />
              </div>
              
              <div>
                <Label htmlFor="productDescription">Description</Label>
                <textarea
                  id="productDescription"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Enter product description"
                  className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background resize-none h-20 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="productPrice">Price (₦)</Label>
                  <Input
                    id="productPrice"
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="productBrand">Brand</Label>
                  <Input
                    id="productBrand"
                    value={editBrand}
                    onChange={(e) => setEditBrand(e.target.value)}
                    placeholder="Brand name"
                  />
                </div>
              </div>

              {/* Category Selection */}
              <div className="space-y-3">
                <Label>Category</Label>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setUseNewCategory(false)}
                    className={`flex-1 py-2 px-3 text-sm rounded-lg border transition-colors ${
                      !useNewCategory 
                        ? 'border-primary bg-primary/10 text-primary' 
                        : 'border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    Existing Category
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseNewCategory(true)}
                    className={`flex-1 py-2 px-3 text-sm rounded-lg border transition-colors ${
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
                    className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
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

            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={resetState}>
                Scan Again
              </Button>
              <Button className="flex-1" onClick={addProduct} disabled={!editName.trim()}>
                <span className="material-symbols-outlined mr-2 text-lg">add</span>
                Add Product
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ScanProductModal;
