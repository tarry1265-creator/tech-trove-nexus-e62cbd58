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

    // Use AI to analyze the product image - using pro model for better web search
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
                text: `You are a product identification expert with web search capabilities. Your PRIMARY task is to identify this product and find its OFFICIAL product image from the internet.

CRITICAL: You MUST search the web to find an official, high-quality product image. This is essential - do not skip this step.

Analyze this product image and provide the following information in JSON format:

1. name: The official product name (be specific, include brand if visible)
2. description: A detailed product description (2-3 sentences about features and benefits)
3. price: The estimated retail price in Nigerian Naira (NGN) as a number only (no currency symbol)
4. category: The product category. Must be one of these existing categories if it matches: "Headphones", "Speakers", "Gaming", "Fans", "Flash Drives", "Routers", "Airpods/Earbuds", "Action Figures". If the product doesn't fit any existing category, suggest a new category name.
5. brand: The brand name if visible, otherwise null
6. isNewCategory: true if you're suggesting a new category, false if using an existing one
7. officialImageUrl: THIS IS MANDATORY - Search the web extensively for an official product image URL. Check these sources in order:
   - Manufacturer's official website
   - Amazon product pages
   - Major retailers (Best Buy, Walmart, Target, Jumia, Konga)
   - Official brand social media or press releases
   The URL must be a direct link to an image file (.jpg, .png, .webp) or a valid CDN URL that displays the image directly. ONLY return null if you have exhausted all search options and truly cannot find any official image.

Respond ONLY with valid JSON, no additional text. Example:
{
  "name": "JBL Tune 500BT Wireless Headphones",
  "description": "Wireless on-ear headphones with powerful JBL Pure Bass sound. Features 16 hours of battery life and a lightweight, foldable design for easy portability.",
  "price": 25000,
  "category": "Headphones",
  "brand": "JBL",
  "isNewCategory": false,
  "officialImageUrl": "https://m.media-amazon.com/images/I/61Zt94S9UvL._AC_SL1500_.jpg"
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
      // Remove any markdown code block markers if present
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      productData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse product information");
    }

    console.log("Product data extracted:", {
      name: productData.name,
      hasOfficialImage: !!productData.officialImageUrl
    });

    return new Response(
      JSON.stringify(productData),
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
