import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "Image is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Step 1: Analyzing product image to extract details...");

    // Step 1: Analyze the image to extract product details
    const analysisResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are a product identification expert. Analyze this product image and provide the following information in JSON format:

1. name: The official product name (be specific, include brand and model number if visible)
2. description: A detailed product description (2-3 sentences about features and benefits)
3. price: The estimated retail price in Nigerian Naira (NGN) as a number only (no currency symbol)
4. category: The product category. Must be one of these existing categories if it matches: "Headphones", "Speakers", "Gaming", "Fans", "Flash Drives", "Routers", "Airpods/Earbuds", "Action Figures". If the product doesn't fit any existing category, suggest a new category name.
5. brand: The brand name if visible, otherwise null
6. isNewCategory: true if you're suggesting a new category, false if using an existing one

Respond ONLY with valid JSON, no additional text. Example:
{
  "name": "JBL Tune 500BT Wireless Headphones",
  "description": "Wireless on-ear headphones with powerful JBL Pure Bass sound. Features 16 hours of battery life and a lightweight, foldable design for easy portability.",
  "price": 25000,
  "category": "Headphones",
  "brand": "JBL",
  "isNewCategory": false
}`
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
      }),
    });

    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text();
      console.error("AI API error during analysis:", errorText);
      
      if (analysisResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (analysisResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error("Failed to analyze product image");
    }

    const analysisData = await analysisResponse.json();
    const analysisContent = analysisData.choices?.[0]?.message?.content;

    if (!analysisContent) {
      throw new Error("No response from AI analysis");
    }

    // Parse the JSON response from AI
    let productData;
    try {
      const cleanedContent = analysisContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      productData = JSON.parse(cleanedContent);
      console.log("Product identified:", productData.name);
    } catch (parseError) {
      console.error("Failed to parse AI response:", analysisContent);
      throw new Error("Failed to parse product information");
    }

    // Step 2: Generate an official-looking product image using the product name
    let officialImageUrl: string | null = null;
    
    if (productData.name) {
      console.log("Step 2: Generating official product image for:", productData.name);
      
      try {
        const imageGenResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image",
            messages: [
              {
                role: "user",
                content: `Generate a professional product photography image of: ${productData.name}${productData.brand ? ` by ${productData.brand}` : ''}. 
                
The image should be:
- Clean white or light gray background
- Professional studio lighting
- Product centered and clearly visible
- High quality commercial product photo style
- No text overlays or watermarks
- Similar to official manufacturer product images`
              }
            ],
            modalities: ["image", "text"]
          }),
        });

        if (imageGenResponse.ok) {
          const imageGenData = await imageGenResponse.json();
          const generatedImage = imageGenData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
          
          if (generatedImage) {
            officialImageUrl = generatedImage;
            console.log("Successfully generated official product image");
          } else {
            console.log("No image in generation response, using uploaded image as fallback");
          }
        } else {
          const errorText = await imageGenResponse.text();
          console.error("Image generation failed:", errorText);
        }
      } catch (imageGenError) {
        console.error("Error generating product image:", imageGenError);
      }
    }

    const result = {
      ...productData,
      officialImageUrl
    };

    console.log("Returning result with officialImageUrl:", officialImageUrl ? "generated" : "null");

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error scanning product:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to scan product";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
