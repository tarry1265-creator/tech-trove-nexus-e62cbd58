import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SearchResult {
  url: string;
  title?: string;
  description?: string;
  markdown?: string;
}

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
    const { productName, brand } = await req.json();

    if (!productName) {
      return new Response(
        JSON.stringify({ error: "Product name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) {
      console.error("FIRECRAWL_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Firecrawl is not configured", images: [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build search query targeting major retailers
    const brandPrefix = brand ? `${brand} ` : "";
    const searchQuery = `${brandPrefix}${productName} product image`;
    
    console.log("Searching for product images:", searchQuery);

    // Use Firecrawl search API
    const searchResponse = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: searchQuery,
        limit: 5,
        scrapeOptions: {
          formats: ["markdown", "links"],
        },
      }),
    });

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error("Firecrawl search error:", searchResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to search for images", images: [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const searchData = await searchResponse.json();
    console.log("Firecrawl search results:", JSON.stringify(searchData).slice(0, 500));

    const images: ImageResult[] = [];
    const seenUrls = new Set<string>();

    // Extract images from search results
    const results: SearchResult[] = searchData.data || [];
    
    for (const result of results) {
      // Skip if no markdown content
      if (!result.markdown) continue;

      // Extract image URLs from markdown
      const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
      let match;
      
      while ((match = imageRegex.exec(result.markdown)) !== null) {
        const imageUrl = match[2];
        
        // Skip if already seen
        if (seenUrls.has(imageUrl)) continue;
        
        // Validate it's an actual image URL
        if (!isValidImageUrl(imageUrl)) continue;
        
        // Skip small/thumbnail images
        if (isLikelyThumbnail(imageUrl)) continue;
        
        seenUrls.add(imageUrl);
        
        // Determine source and confidence
        const source = extractSource(result.url || "");
        const confidence = determineConfidence(imageUrl, productName, brand);
        
        images.push({
          url: imageUrl,
          source,
          confidence,
        });

        // Limit to 5 images
        if (images.length >= 5) break;
      }

      // Also check for direct image links in the content
      const directImageRegex = /(https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp|gif)(?:\?[^\s"'<>]*)?)/gi;
      while ((match = directImageRegex.exec(result.markdown)) !== null) {
        const imageUrl = match[1];
        
        if (seenUrls.has(imageUrl)) continue;
        if (!isValidImageUrl(imageUrl)) continue;
        if (isLikelyThumbnail(imageUrl)) continue;
        
        seenUrls.add(imageUrl);
        
        const source = extractSource(result.url || imageUrl);
        const confidence = determineConfidence(imageUrl, productName, brand);
        
        images.push({
          url: imageUrl,
          source,
          confidence,
        });

        if (images.length >= 5) break;
      }

      if (images.length >= 5) break;
    }

    // Sort by confidence
    images.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.confidence] - order[b.confidence];
    });

    console.log(`Found ${images.length} product images`);

    return new Response(
      JSON.stringify({ 
        success: true,
        images,
        query: searchQuery,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error searching for product images:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to search for images";
    return new Response(
      JSON.stringify({ error: errorMessage, images: [] }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Check for common image CDN patterns
    const validPatterns = [
      /\.(jpg|jpeg|png|webp|gif)(\?|$)/i,
      /images?\.amazon\./i,
      /m\.media-amazon\./i,
      /images\.unsplash\./i,
      /cdn\./i,
      /cloudfront\./i,
      /img\./i,
      /static\./i,
    ];
    return validPatterns.some(pattern => pattern.test(url));
  } catch {
    return false;
  }
}

function isLikelyThumbnail(url: string): boolean {
  const thumbnailPatterns = [
    /thumb/i,
    /small/i,
    /tiny/i,
    /icon/i,
    /avatar/i,
    /logo/i,
    /favicon/i,
    /\d{2,3}x\d{2,3}/i, // Small dimensions like 50x50, 100x100
    /\.gif$/i, // Often animated icons
  ];
  return thumbnailPatterns.some(pattern => pattern.test(url));
}

function extractSource(url: string): string {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    
    if (hostname.includes("amazon")) return "Amazon";
    if (hostname.includes("jumia")) return "Jumia";
    if (hostname.includes("ebay")) return "eBay";
    if (hostname.includes("walmart")) return "Walmart";
    if (hostname.includes("aliexpress")) return "AliExpress";
    if (hostname.includes("bestbuy")) return "Best Buy";
    if (hostname.includes("target")) return "Target";
    if (hostname.includes("newegg")) return "Newegg";
    
    // Return cleaned hostname
    return hostname.replace(/^www\./, "").split(".")[0];
  } catch {
    return "Web";
  }
}

function determineConfidence(
  imageUrl: string, 
  productName: string, 
  brand: string | null
): "high" | "medium" | "low" {
  const url = imageUrl.toLowerCase();
  const name = productName.toLowerCase();
  const brandLower = brand?.toLowerCase() || "";

  // High confidence: URL contains product name or brand
  if (brandLower && url.includes(brandLower.replace(/\s+/g, ""))) {
    return "high";
  }

  // High confidence: Amazon/major retailer high-res image
  if (url.includes("amazon") && (url.includes("_AC_SL") || url.includes("_AC_UL"))) {
    return "high";
  }

  // Medium confidence: Known CDN patterns
  if (url.includes("cdn") || url.includes("cloudfront") || url.includes("static")) {
    return "medium";
  }

  return "low";
}
