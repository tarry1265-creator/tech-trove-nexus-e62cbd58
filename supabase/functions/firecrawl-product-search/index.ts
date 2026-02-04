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

    const brandPrefix = brand ? `${brand} ` : "";
    const images: ImageResult[] = [];
    const seenUrls = new Set<string>();

    // Strategy 1: Google search for official product images
    console.log("Strategy 1: Searching Google for official product images...");
    const googleQuery = `${brandPrefix}${productName} official product image high resolution -logo -icon -banner`;
    
    try {
      const googleImages = await searchWithFirecrawl(
        FIRECRAWL_API_KEY,
        googleQuery,
        productName,
        brand,
        seenUrls,
        "Google"
      );
      images.push(...googleImages);
      console.log(`Found ${googleImages.length} images from Google search`);
    } catch (err) {
      console.error("Google search failed:", err);
    }

    // Strategy 2: Jumia Nigeria search (great for local products)
    console.log("Strategy 2: Searching Jumia for product images...");
    const jumiaQuery = `${brandPrefix}${productName} site:jumia.com.ng`;
    
    try {
      const jumiaImages = await searchWithFirecrawl(
        FIRECRAWL_API_KEY,
        jumiaQuery,
        productName,
        brand,
        seenUrls,
        "Jumia"
      );
      images.push(...jumiaImages);
      console.log(`Found ${jumiaImages.length} images from Jumia search`);
    } catch (err) {
      console.error("Jumia search failed:", err);
    }

    // Strategy 3: If not enough high-quality images, try alternative Google search
    const highConfidenceCount = images.filter(img => img.confidence === "high").length;
    if (highConfidenceCount < 3) {
      console.log("Strategy 3: Trying refined Google search...");
      const altQuery = `"${productName}" product photo -review -unboxing -thumbnail`;
      
      try {
        const altImages = await searchWithFirecrawl(
          FIRECRAWL_API_KEY,
          altQuery,
          productName,
          brand,
          seenUrls,
          "Google"
        );
        images.push(...altImages);
        console.log(`Found ${altImages.length} additional images from refined search`);
      } catch (err) {
        console.error("Refined search failed:", err);
      }
    }

    // Sort by confidence (high first, then medium, then low)
    images.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.confidence] - order[b.confidence];
    });

    // Limit to top 10 images
    const topImages = images.slice(0, 10);

    console.log(`Total: Found ${topImages.length} product images (${images.filter(i => i.confidence === "high").length} high confidence)`);

    return new Response(
      JSON.stringify({ 
        success: true,
        images: topImages,
        query: googleQuery,
        sources: {
          google: images.filter(i => i.source === "Google").length,
          jumia: images.filter(i => i.source === "Jumia").length,
        }
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

async function searchWithFirecrawl(
  apiKey: string,
  query: string,
  productName: string,
  brand: string | null,
  seenUrls: Set<string>,
  defaultSource: string = "Web"
): Promise<ImageResult[]> {
  const images: ImageResult[] = [];

  const searchResponse = await fetch("https://api.firecrawl.dev/v1/search", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      limit: 15,
      scrapeOptions: {
        formats: ["markdown", "links"],
        waitFor: 3000,
      },
    }),
  });

  if (!searchResponse.ok) {
    const errorText = await searchResponse.text();
    console.error("Firecrawl search error:", searchResponse.status, errorText);
    throw new Error(`Firecrawl search failed: ${searchResponse.status}`);
  }

  const searchData = await searchResponse.json();
  const results = searchData.data || [];

  for (const result of results) {
    if (!result.markdown) continue;

    // Extract images from markdown syntax: ![alt](url)
    const markdownImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let match;
    
    while ((match = markdownImageRegex.exec(result.markdown)) !== null) {
      const altText = match[1].toLowerCase();
      const imageUrl = match[2];
      
      if (seenUrls.has(imageUrl)) continue;
      if (!isValidProductImageUrl(imageUrl)) continue;
      if (isLikelyUnrelatedImage(imageUrl, altText)) continue;
      
      // Check minimum image quality indicators
      if (!hasMinimumQuality(imageUrl)) continue;
      
      seenUrls.add(imageUrl);
      
      const source = extractSource(result.url || imageUrl, defaultSource);
      const confidence = determineConfidence(imageUrl, altText, productName, brand, result.url);
      
      images.push({ url: imageUrl, source, confidence });
      
      if (images.length >= 8) break;
    }

    // Also extract direct image URLs
    const directImageRegex = /(https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp)(?:\?[^\s"'<>]*)?)/gi;
    while ((match = directImageRegex.exec(result.markdown)) !== null) {
      const imageUrl = match[1];
      
      if (seenUrls.has(imageUrl)) continue;
      if (!isValidProductImageUrl(imageUrl)) continue;
      if (isLikelyUnrelatedImage(imageUrl, "")) continue;
      if (!hasMinimumQuality(imageUrl)) continue;
      
      seenUrls.add(imageUrl);
      
      const source = extractSource(result.url || imageUrl, defaultSource);
      const confidence = determineConfidence(imageUrl, "", productName, brand, result.url);
      
      images.push({ url: imageUrl, source, confidence });
      
      if (images.length >= 8) break;
    }

    if (images.length >= 8) break;
  }

  return images;
}

// Check if image URL suggests minimum quality (not thumbnails, not tiny)
function hasMinimumQuality(url: string): boolean {
  const urlLower = url.toLowerCase();
  
  // Reject known small/thumbnail patterns
  const lowQualityPatterns = [
    /[_-]thumb/i,
    /[_-]small/i,
    /[_-]tiny/i,
    /\/thumb\//i,
    /\/thumbnails?\//i,
    /[_-](\d{2,3})x(\d{2,3})\./i, // dimensions like _50x50. or _120x120.
    /\?.*w=\d{1,2}(&|$)/i, // query params like ?w=50
    /\?.*width=\d{1,2}(&|$)/i,
    /\/s\d{2,3}\//i, // paths like /s50/ or /s120/
  ];
  
  if (lowQualityPatterns.some(pattern => pattern.test(urlLower))) {
    return false;
  }
  
  // Prefer known high-quality patterns
  const highQualityPatterns = [
    /_SL\d{3,4}/i, // Amazon high-res _SL1500
    /_AC_SL/i, // Amazon AC sizing
    /\/large\//i,
    /\/original\//i,
    /\/full\//i,
    /-large\./i,
    /-original\./i,
    /[_-]\d{3,4}x\d{3,4}\./i, // dimensions like _500x500. or -1000x1000.
  ];
  
  // Boost confidence for high-quality patterns (not a hard requirement)
  return true;
}

function isValidProductImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    
    // Must be HTTPS for security
    if (parsed.protocol !== "https:") return false;
    
    // Check for common image CDN and product image patterns
    const validPatterns = [
      /\.(jpg|jpeg|png|webp)(\?|$)/i,
      /images?\.amazon\./i,
      /m\.media-amazon\./i,
      /images\.unsplash\./i,
      /cdn\./i,
      /cloudfront\./i,
      /img\./i,
      /static\./i,
      /media\./i,
      /assets\./i,
      /product/i,
      /catalog/i,
    ];
    
    return validPatterns.some(pattern => pattern.test(url));
  } catch {
    return false;
  }
}

function isLikelyUnrelatedImage(url: string, altText: string): boolean {
  const urlLower = url.toLowerCase();
  const altLower = altText.toLowerCase();
  
  // Skip common non-product images
  const unrelatedPatterns = [
    /[_\/\-]icon[_\/\-.]/i,
    /[_\/\-]avatar[_\/\-.]/i,
    /[_\/\-]logo[_\/\-.]/i,
    /favicon/i,
    /[_\/\-]banner[_\/\-.]/i,
    /[_\/\-]ad[_\/\-.]/i,
    /sponsor/i,
    /[_\/\-]badge[_\/\-.]/i,
    /[_\/\-]rating[_\/\-.]/i,
    /[_\/\-]star[_\/\-.]/i,
    /[_\/\-]cart[_\/\-.]/i,
    /checkout/i,
    /payment/i,
    /visa|mastercard|paypal|verve/i,
    /shipping/i,
    /delivery/i,
    /\.gif$/i,
    /\.svg$/i,
    /placeholder/i,
    /loading/i,
    /spinner/i,
    /profile/i,
    /user[_\/\-]/i,
    /social/i,
    /facebook|twitter|instagram|linkedin|whatsapp/i,
    /arrow|chevron|caret/i,
    /close|menu|hamburger/i,
    /\d{2}x\d{2}\./i, // Very small dimensions like 50x50.
    /btn[_\/\-]/i,
    /button/i,
    /share/i,
    /wishlist/i,
    /compare/i,
    /notification/i,
    /alert/i,
    /warning/i,
    /error/i,
    /success/i,
    /info[_\/\-.]/i,
    /help/i,
    /question/i,
    /search[_\/\-.]/i,
    /filter/i,
    /sort/i,
    /grid/i,
    /list[_\/\-.]/i,
    /view[_\/\-.]/i,
    /zoom/i,
    /play/i,
    /video/i,
    /youtube/i,
    /vimeo/i,
  ];
  
  const combinedText = urlLower + " " + altLower;
  return unrelatedPatterns.some(pattern => pattern.test(combinedText));
}

function extractSource(url: string, defaultSource: string = "Web"): string {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    
    if (hostname.includes("jumia")) return "Jumia";
    if (hostname.includes("amazon")) return "Amazon";
    if (hostname.includes("google")) return "Google";
    if (hostname.includes("ebay")) return "eBay";
    if (hostname.includes("walmart")) return "Walmart";
    if (hostname.includes("aliexpress")) return "AliExpress";
    if (hostname.includes("konga")) return "Konga";
    if (hostname.includes("slot")) return "Slot";
    
    // Return the default source passed in (Google or Jumia based on search)
    return defaultSource;
  } catch {
    return defaultSource;
  }
}

function determineConfidence(
  imageUrl: string, 
  altText: string,
  productName: string, 
  brand: string | null,
  sourceUrl?: string
): "high" | "medium" | "low" {
  const urlLower = imageUrl.toLowerCase();
  const altLower = altText.toLowerCase();
  const nameLower = productName.toLowerCase();
  const brandLower = brand?.toLowerCase() || "";
  const sourceLower = sourceUrl?.toLowerCase() || "";

  // High confidence indicators
  const highConfidencePatterns = [
    // Product name words in URL or alt text
    nameLower.split(/\s+/).some(word => 
      word.length > 3 && (urlLower.includes(word) || altLower.includes(word))
    ),
    // Brand name in URL
    brandLower && urlLower.includes(brandLower.replace(/\s+/g, "")),
    // Amazon high-res product images
    urlLower.includes("amazon") && (urlLower.includes("_AC_SL") || urlLower.includes("_AC_UL")),
    // Official brand site
    brandLower && sourceLower.includes(brandLower.replace(/\s+/g, "")),
    // Large image indicators
    /_SL1[0-9]{3}|_UL1[0-9]{3}/i.test(urlLower),
  ];

  if (highConfidencePatterns.some(Boolean)) {
    return "high";
  }

  // Medium confidence: from known retailers or CDNs
  const mediumConfidencePatterns = [
    /amazon|jumia|ebay|walmart|aliexpress|bestbuy/i.test(urlLower),
    /cdn|cloudfront|static|media|assets/i.test(urlLower),
    /product|catalog|item/i.test(urlLower),
  ];

  if (mediumConfidencePatterns.some(Boolean)) {
    return "medium";
  }

  return "low";
}
