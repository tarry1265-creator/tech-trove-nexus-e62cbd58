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

    // Strategy 1: Google Images search (most accurate for official product images)
    console.log("Strategy 1: Searching Google Images...");
    const googleQuery = `${brandPrefix}${productName} official product image`;
    
    try {
      const googleImages = await searchWithFirecrawl(
        FIRECRAWL_API_KEY,
        googleQuery,
        productName,
        brand,
        seenUrls
      );
      images.push(...googleImages);
      console.log(`Found ${googleImages.length} images from Google search`);
    } catch (err) {
      console.error("Google search failed:", err);
    }

    // Strategy 2: Retailer-specific search (Amazon, Jumia)
    if (images.length < 5) {
      console.log("Strategy 2: Searching retailer sites...");
      const retailerQuery = `${brandPrefix}${productName} site:amazon.com OR site:jumia.com.ng OR site:ebay.com`;
      
      try {
        const retailerImages = await searchWithFirecrawl(
          FIRECRAWL_API_KEY,
          retailerQuery,
          productName,
          brand,
          seenUrls
        );
        images.push(...retailerImages);
        console.log(`Found ${retailerImages.length} images from retailer search`);
      } catch (err) {
        console.error("Retailer search failed:", err);
      }
    }

    // Strategy 3: Brand official site search
    if (images.length < 5 && brand) {
      console.log("Strategy 3: Searching brand official site...");
      const brandQuery = `${productName} site:${brand.toLowerCase().replace(/\s+/g, '')}.com`;
      
      try {
        const brandImages = await searchWithFirecrawl(
          FIRECRAWL_API_KEY,
          brandQuery,
          productName,
          brand,
          seenUrls
        );
        // Mark brand site images as high confidence
        brandImages.forEach(img => img.confidence = "high");
        images.push(...brandImages);
        console.log(`Found ${brandImages.length} images from brand site search`);
      } catch (err) {
        console.error("Brand site search failed:", err);
      }
    }

    // Sort by confidence
    images.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.confidence] - order[b.confidence];
    });

    // Limit to top 8 images
    const topImages = images.slice(0, 8);

    console.log(`Total: Found ${topImages.length} product images`);

    return new Response(
      JSON.stringify({ 
        success: true,
        images: topImages,
        query: googleQuery,
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
  seenUrls: Set<string>
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
      limit: 10,
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
      
      seenUrls.add(imageUrl);
      
      const source = extractSource(result.url || imageUrl);
      const confidence = determineConfidence(imageUrl, altText, productName, brand, result.url);
      
      images.push({ url: imageUrl, source, confidence });
      
      if (images.length >= 5) break;
    }

    // Also extract direct image URLs
    const directImageRegex = /(https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp)(?:\?[^\s"'<>]*)?)/gi;
    while ((match = directImageRegex.exec(result.markdown)) !== null) {
      const imageUrl = match[1];
      
      if (seenUrls.has(imageUrl)) continue;
      if (!isValidProductImageUrl(imageUrl)) continue;
      if (isLikelyUnrelatedImage(imageUrl, "")) continue;
      
      seenUrls.add(imageUrl);
      
      const source = extractSource(result.url || imageUrl);
      const confidence = determineConfidence(imageUrl, "", productName, brand, result.url);
      
      images.push({ url: imageUrl, source, confidence });
      
      if (images.length >= 5) break;
    }

    if (images.length >= 5) break;
  }

  return images;
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
    /thumb/i,
    /tiny/i,
    /icon/i,
    /avatar/i,
    /logo/i,
    /favicon/i,
    /banner/i,
    /ad[_-]?/i,
    /sponsor/i,
    /badge/i,
    /rating/i,
    /star/i,
    /cart/i,
    /checkout/i,
    /payment/i,
    /visa|mastercard|paypal/i,
    /shipping/i,
    /delivery/i,
    /\.gif$/i,
    /\.svg$/i,
    /placeholder/i,
    /loading/i,
    /spinner/i,
    /profile/i,
    /user/i,
    /social/i,
    /facebook|twitter|instagram|linkedin/i,
    /arrow|chevron|caret/i,
    /close|menu|hamburger/i,
    /\d{2,3}x\d{2,3}/i, // Small dimensions like 50x50
  ];
  
  const combinedText = urlLower + " " + altLower;
  return unrelatedPatterns.some(pattern => pattern.test(combinedText));
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
    if (hostname.includes("google")) return "Google";
    
    // Return cleaned hostname
    return hostname.replace(/^www\./, "").split(".")[0];
  } catch {
    return "Web";
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
