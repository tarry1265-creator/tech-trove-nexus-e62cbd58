import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ScanProductModalProps {
  open: boolean;
  onClose: () => void;
  onProductAdded: () => void;
}

interface ProductData {
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string | null;
  isNewCategory: boolean;
}

const ScanProductModal = ({ open, onClose, onProductAdded }: ScanProductModalProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [productPreview, setProductPreview] = useState<ProductData | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const resetState = () => {
    setIsScanning(false);
    setShowCamera(false);
    setProductPreview(null);
    setImagePreview(null);
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
      toast.success("Product identified!");
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
    if (!productPreview || !imagePreview) return;

    setIsScanning(true);
    try {
      // First, handle the category
      let categoryId: string | null = null;

      // Check if category exists
      const { data: existingCategory } = await supabase
        .from('categories')
        .select('id')
        .eq('name', productPreview.category)
        .single();

      if (existingCategory) {
        categoryId = existingCategory.id;
      } else {
        // Create new category
        const { data: newCategory, error: categoryError } = await supabase
          .from('categories')
          .insert({
            name: productPreview.category,
            slug: generateSlug(productPreview.category),
            description: `${productPreview.category} products`,
            icon: 'category'
          })
          .select('id')
          .single();

        if (categoryError) throw categoryError;
        categoryId = newCategory.id;
        toast.success(`Created new category: ${productPreview.category}`);
      }

      // Upload image to storage
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

      // Insert product
      const { error: productError } = await supabase
        .from('products')
        .insert({
          name: productPreview.name,
          slug: generateSlug(productPreview.name),
          description: productPreview.description,
          price: productPreview.price,
          category_id: categoryId,
          brand: productPreview.brand,
          image_url: publicUrl.publicUrl,
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
            <p className="text-sm text-muted-foreground">Analyzing product...</p>
          </div>
        )}

        {productPreview && !isScanning && (
          <div className="flex flex-col gap-4 py-4">
            {imagePreview && (
              <img 
                src={imagePreview} 
                alt="Product preview" 
                className="w-full h-48 object-contain rounded-lg bg-muted"
              />
            )}
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Product Name</label>
                <p className="font-medium text-foreground">{productPreview.name}</p>
              </div>
              
              <div>
                <label className="text-xs font-medium text-muted-foreground">Description</label>
                <p className="text-sm text-foreground">{productPreview.description}</p>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-medium text-muted-foreground">Price</label>
                  <p className="font-bold text-primary">₦{productPreview.price.toLocaleString()}</p>
                </div>
                <div className="flex-1">
                  <label className="text-xs font-medium text-muted-foreground">Category</label>
                  <p className="text-sm text-foreground">
                    {productPreview.category}
                    {productPreview.isNewCategory && (
                      <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">New</span>
                    )}
                  </p>
                </div>
              </div>
              
              {productPreview.brand && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Brand</label>
                  <p className="text-sm text-foreground">{productPreview.brand}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={resetState}>
                Scan Again
              </Button>
              <Button className="flex-1" onClick={addProduct}>
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
