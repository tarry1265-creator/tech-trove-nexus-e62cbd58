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

    // Step 2: Search for official product image URL using web search
    let officialImageUrl: string | null = null;
    
    if (productData.name) {
      console.log("Step 2: Searching for official product image for:", productData.name);
      
      try {
        const searchQuery = `${productData.name}${productData.brand ? ` ${productData.brand}` : ''} official product image`;
        
        const imageSearchResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
                content: `Search the web and find the official product image URL for: "${searchQuery}"

I need you to find a direct URL to a high-quality official product image (JPG, PNG, or WEBP format) from:
1. The manufacturer's official website
2. Major retailers like Amazon, Best Buy, Walmart, etc.
3. Official product pages

Requirements for the image URL:
- Must be a direct link to an image file (ends with .jpg, .jpeg, .png, .webp, or contains image parameters)
- Must be from a reputable source
- Should be a clean product photo (white/transparent background preferred)
- High resolution preferred

Respond with ONLY the direct image URL, nothing else. If you cannot find a suitable official image URL, respond with exactly: NO_IMAGE_FOUND`
              }
            ],
            tools: [{
              type: "function",
              function: {
                name: "web_search",
                description: "Search the web for information"
              }
            }]
          }),
        });

        if (imageSearchResponse.ok) {
          const searchData = await imageSearchResponse.json();
          const searchResult = searchData.choices?.[0]?.message?.content?.trim();
          
          console.log("Image search result:", searchResult);
          
          if (searchResult && searchResult !== "NO_IMAGE_FOUND" && searchResult.startsWith("http")) {
            // Validate it looks like an image URL
            const lowerUrl = searchResult.toLowerCase();
            if (lowerUrl.includes('.jpg') || lowerUrl.includes('.jpeg') || 
                lowerUrl.includes('.png') || lowerUrl.includes('.webp') ||
                lowerUrl.includes('image') || lowerUrl.includes('/img')) {
              officialImageUrl = searchResult;
              console.log("Found official product image URL:", officialImageUrl);
            } else {
              console.log("URL doesn't appear to be an image, skipping");
            }
          } else {
            console.log("No official image URL found, will use uploaded image as fallback");
          }
        } else {
          const errorText = await imageSearchResponse.text();
          console.error("Image search failed:", errorText);
        }
      } catch (searchError) {
        console.error("Error searching for product image:", searchError);
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
