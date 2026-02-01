import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Repair = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [deviceName, setDeviceName] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [damageDescription, setDamageDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Image too large",
          description: "Please select an image under 5MB",
          variant: "destructive",
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const fileExt = file.name.split('.').pop();
    const fileName = `repair-${timestamp}-${randomStr}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('repair-images')
      .upload(fileName, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error("Failed to upload image");
    }

    const { data: { publicUrl } } = supabase.storage
      .from('repair-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!deviceName.trim() || !damageDescription.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in the device name and damage description",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl: string | null = null;

      // Upload image to Supabase Storage if provided
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const { data, error } = await supabase.functions.invoke("process-repair-request", {
        body: {
          deviceName: deviceName.trim(),
          deviceModel: deviceModel.trim(),
          damageDescription: damageDescription.trim(),
          imageUrl,
        },
      });

      if (error) throw error;

      const whatsappMessage = encodeURIComponent(data.message);
      // Use whatsapp:// scheme to open app directly on mobile, fallback to wa.me for web
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const whatsappUrl = isMobile 
        ? `whatsapp://send?phone=2349127204575&text=${whatsappMessage}`
        : `https://wa.me/2349127204575?text=${whatsappMessage}`;
      
      window.open(whatsappUrl, "_blank");

      toast({
        title: "Request processed!",
        description: "Opening WhatsApp to send your repair request...",
      });

      setDeviceName("");
      setDeviceModel("");
      setDamageDescription("");
      removeImage();
    } catch (error: any) {
      console.error("Error processing repair request:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="content-container py-6 lg:py-10">
        {/* Back to Home */}
        <button
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          <span className="text-sm font-medium">Back to Home</span>
        </button>

        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl text-primary">build</span>
            </div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-2">
              Device Repair Request
            </h1>
            <p className="text-muted-foreground">
              Tell us about your device and we'll help you get it fixed
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="card p-6 space-y-5">
              {/* Device Name */}
              <div className="space-y-2">
                <Label htmlFor="deviceName" className="text-foreground font-medium">
                  Device Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="deviceName"
                  placeholder="e.g., iPhone 14 Pro, Samsung Galaxy S23, MacBook Pro"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  className="input-field"
                />
              </div>

              {/* Device Model */}
              <div className="space-y-2">
                <Label htmlFor="deviceModel" className="text-foreground font-medium">
                  Model/Serial Number <span className="text-muted-foreground text-xs">(Optional)</span>
                </Label>
                <Input
                  id="deviceModel"
                  placeholder="e.g., A2894, SM-S911B"
                  value={deviceModel}
                  onChange={(e) => setDeviceModel(e.target.value)}
                  className="input-field"
                />
              </div>

              {/* Damage Description */}
              <div className="space-y-2">
                <Label htmlFor="damageDescription" className="text-foreground font-medium">
                  Describe the Damage <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="damageDescription"
                  placeholder="Please describe what happened to your device, how it got damaged, and what issues you're experiencing..."
                  value={damageDescription}
                  onChange={(e) => setDamageDescription(e.target.value)}
                  className="input-field min-h-[120px] resize-none"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Photo of Damage <span className="text-muted-foreground text-xs">(Optional)</span>
                </Label>
                
                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-border">
                    <img
                      src={imagePreview}
                      alt="Device damage"
                      className="w-full h-48 object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-foreground/60 flex items-center justify-center hover:bg-foreground/80 transition-colors"
                    >
                      <span className="material-symbols-outlined text-background text-sm">close</span>
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-secondary transition-colors"
                  >
                    <span className="material-symbols-outlined text-4xl text-muted-foreground mb-2">
                      add_a_photo
                    </span>
                    <p className="text-muted-foreground text-sm">
                      Click to upload a photo of the damage
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Max 5MB, JPG or PNG
                    </p>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary py-6 text-lg"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined">send</span>
                  Send Repair Request via WhatsApp
                </span>
              )}
            </Button>

            <p className="text-center text-muted-foreground text-xs">
              Our AI will analyze your request and send it directly to our repair team via WhatsApp
            </p>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Repair;
