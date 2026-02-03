import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ImageResult {
  url: string;
  source: string;
  confidence: "high" | "medium" | "low";
}

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

    // Step 1: Use AI to identify the product from the image
    console.log("Step 1: Analyzing product image with AI...");
    
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are a product identification expert. Analyze this product image and provide the following information in JSON format:

1. name: The official product name (be specific, include brand if visible)
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

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error("Failed to analyze product image");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response from AI
    let productData;
    try {
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      productData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse product information");
    }

    console.log("AI identified product:", productData.name, "Brand:", productData.brand);

    // Step 2: Use Firecrawl to search for official product images
    console.log("Step 2: Searching for official product images with Firecrawl...");
    
    let officialImages: ImageResult[] = [];
    
    try {
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
      const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
      
      if (SUPABASE_URL && SUPABASE_ANON_KEY) {
        const firecrawlResponse = await fetch(
          `${SUPABASE_URL}/functions/v1/firecrawl-product-search`,
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              productName: productData.name,
              brand: productData.brand,
            }),
          }
        );

        if (firecrawlResponse.ok) {
          const firecrawlData = await firecrawlResponse.json();
          if (firecrawlData.images && firecrawlData.images.length > 0) {
            officialImages = firecrawlData.images;
            console.log(`Found ${officialImages.length} official images via Firecrawl`);
          } else {
            console.log("No official images found via Firecrawl");
          }
        } else {
          console.error("Firecrawl search failed:", await firecrawlResponse.text());
        }
      } else {
        console.log("Supabase environment variables not available for Firecrawl call");
      }
    } catch (firecrawlError) {
      console.error("Error calling Firecrawl:", firecrawlError);
      // Continue without official images - not a critical error
    }

    // Build response with official images
    const response = {
      ...productData,
      officialImages,
      officialImageUrl: officialImages.length > 0 ? officialImages[0].url : null,
    };

    console.log("Product scan complete:", {
      name: response.name,
      hasOfficialImages: officialImages.length > 0,
      imageCount: officialImages.length,
    });

    return new Response(
      JSON.stringify(response),
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