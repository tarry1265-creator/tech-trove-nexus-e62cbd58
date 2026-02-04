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

    const GOOGLE_SEARCH_API_KEY = Deno.env.get("GOOGLE_SEARCH_API_KEY");
    const GOOGLE_SEARCH_ENGINE_ID = Deno.env.get("GOOGLE_SEARCH_ENGINE_ID");

    if (!GOOGLE_SEARCH_API_KEY || !GOOGLE_SEARCH_ENGINE_ID) {
      console.error("Google Custom Search API not configured");
      return new Response(
        JSON.stringify({ error: "Google Custom Search API not configured", images: [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const brandPrefix = brand ? `${brand} ` : "";
    const images: ImageResult[] = [];
    const seenUrls = new Set<string>();

    // PRIMARY: Use Google Custom Search API (more accurate for product images)
    if (hasGoogleSearch) {
      console.log("Using Google Custom Search API (primary)...");
      
      // Search 1: Exact product name for official images
      const query1 = `"${productName}" ${brand || ""} official product image`.trim();
      console.log(`Search 1 (exact name): "${query1}"`);
      
      try {
        const googleImages1 = await searchWithGoogleCSE(
          GOOGLE_SEARCH_API_KEY!,
          GOOGLE_SEARCH_ENGINE_ID!,
          query1,
          productName,
          brand,
          seenUrls
        );
        images.push(...googleImages1);
        console.log(`Found ${googleImages1.length} images from Google CSE search 1`);
      } catch (err) {
        console.error("Google CSE search 1 failed:", err);
      }

      // Search 2: Brand + product for more coverage
      if (images.length < 5) {
        const query2 = `${brandPrefix}${productName}`.trim();
        console.log(`Search 2 (brand + name): "${query2}"`);
        
        try {
          const googleImages2 = await searchWithGoogleCSE(
            GOOGLE_SEARCH_API_KEY!,
            GOOGLE_SEARCH_ENGINE_ID!,
            query2,
            productName,
            brand,
            seenUrls
          );
          images.push(...googleImages2);
          console.log(`Found ${googleImages2.length} images from Google CSE search 2`);
        } catch (err) {
          console.error("Google CSE search 2 failed:", err);
        }
      }

      // Search 3: Product name on retailer sites
      if (images.length < 5) {
        const query3 = `${productName} site:jumia.com.ng OR site:amazon.com`;
        console.log(`Search 3 (retailer sites): "${query3}"`);
        
        try {
          const googleImages3 = await searchWithGoogleCSE(
            GOOGLE_SEARCH_API_KEY!,
            GOOGLE_SEARCH_ENGINE_ID!,
            query3,
            productName,
            brand,
            seenUrls
          );
          images.push(...googleImages3);
          console.log(`Found ${googleImages3.length} images from Google CSE search 3`);
        } catch (err) {
          console.error("Google CSE search 3 failed:", err);
        }
      }
    }

    // FALLBACK: Use Firecrawl if Google CSE didn't find enough images
    if (hasFirecrawl && images.length < 3) {
      console.log("Using Firecrawl as fallback...");
      
      const firecrawlQuery = `${brandPrefix}${productName} product image site:jumia.com.ng OR site:amazon.com`;
      
      try {
        const firecrawlImages = await searchWithFirecrawl(
          FIRECRAWL_API_KEY!,
          firecrawlQuery,
          productName,
          brand,
          seenUrls,
          "Firecrawl"
        );
        images.push(...firecrawlImages);
        console.log(`Found ${firecrawlImages.length} images from Firecrawl fallback`);
      } catch (err) {
        console.error("Firecrawl fallback failed:", err);
      }
    }

    // Sort by confidence (high first, then medium, then low)
    images.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.confidence] - order[b.confidence];
    });

    // Limit to top 10 images
    const topImages = images.slice(0, 10);

    const highConfidenceCount = topImages.filter(i => i.confidence === "high").length;
    console.log(`Total: Found ${topImages.length} product images (${highConfidenceCount} high confidence)`);

    return new Response(
      JSON.stringify({ 
        success: true,
        images: topImages,
        sources: {
          googleCSE: images.filter(i => i.source.includes("Google") || i.source === "Jumia" || i.source === "Amazon").length,
          firecrawl: images.filter(i => i.source === "Firecrawl").length,
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

// Google Custom Search API for image search
async function searchWithGoogleCSE(
  apiKey: string,
  searchEngineId: string,
  query: string,
  productName: string,
  brand: string | null,
  seenUrls: Set<string>
): Promise<ImageResult[]> {
  const images: ImageResult[] = [];
  
  const params = new URLSearchParams({
    key: apiKey,
    cx: searchEngineId,
    q: query,
    searchType: "image",
    num: "10",
    imgSize: "large",
    safe: "active",
  });

  const response = await fetch(`https://www.googleapis.com/customsearch/v1?${params}`);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Google CSE error:", response.status, errorText);
    throw new Error(`Google CSE failed: ${response.status}`);
  }

  const data = await response.json();
  const items = data.items || [];

  for (const item of items) {
    const imageUrl = item.link;
    
    if (!imageUrl || seenUrls.has(imageUrl)) continue;
    if (!isValidProductImageUrl(imageUrl)) continue;
    if (isLikelyUnrelatedImage(imageUrl, item.title || "")) continue;
    
    seenUrls.add(imageUrl);
    
    const source = extractSource(item.displayLink || imageUrl, "Google");
    const confidence = determineConfidence(imageUrl, item.title || "", productName, brand, item.displayLink);
    
    images.push({ url: imageUrl, source, confidence });
  }

  return images;
}

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
