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
      console.error("FIRECRAWL_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Firecrawl API not configured", images: [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const brandPrefix = brand ? `${brand} ` : "";
    const images: ImageResult[] = [];
    const seenUrls = new Set<string>();

    console.log("Using Firecrawl Search API for product images...");

    // Search 1: Exact product name for official images
    const query1 = `${brandPrefix}${productName} official product image`;
    console.log(`Search 1: "${query1}"`);

    try {
      const results1 = await searchWithFirecrawl(FIRECRAWL_API_KEY, query1, productName, brand, seenUrls);
      images.push(...results1);
      console.log(`Found ${results1.length} images from search 1`);
    } catch (err) {
      console.error("Search 1 failed:", err);
    }

    // Search 2: Product on e-commerce sites
    if (images.length < 5) {
      const query2 = `${brandPrefix}${productName} buy online`;
      console.log(`Search 2: "${query2}"`);

      try {
        const results2 = await searchWithFirecrawl(FIRECRAWL_API_KEY, query2, productName, brand, seenUrls);
        images.push(...results2);
        console.log(`Found ${results2.length} images from search 2`);
      } catch (err) {
        console.error("Search 2 failed:", err);
      }
    }

    // Sort by confidence
    images.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.confidence] - order[b.confidence];
    });

    const topImages = images.slice(0, 10);
    const highConfidenceCount = topImages.filter(i => i.confidence === "high").length;
    console.log(`Total: Found ${topImages.length} product images (${highConfidenceCount} high confidence)`);

    return new Response(
      JSON.stringify({
        success: true,
        images: topImages,
        totalFound: topImages.length,
        highConfidenceCount
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

  const response = await fetch("https://api.firecrawl.dev/v1/search", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      limit: 10,
      scrapeOptions: {
        formats: ["links", "markdown"],
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Firecrawl search error:", response.status, errorText);
    throw new Error(`Firecrawl search failed: ${response.status}`);
  }

  const data = await response.json();
  const results = data.data || [];

  for (const result of results) {
    // Extract image URLs from the markdown content
    const markdown = result.markdown || "";
    const imgRegex = /!\[.*?\]\((https?:\/\/[^\s)]+)\)/g;
    let match;

    while ((match = imgRegex.exec(markdown)) !== null) {
      const imageUrl = match[1];
      if (!imageUrl || seenUrls.has(imageUrl)) continue;
      if (!isValidProductImageUrl(imageUrl)) continue;
      if (isLikelyUnrelatedImage(imageUrl)) continue;

      seenUrls.add(imageUrl);
      const source = extractSource(result.url || imageUrl);
      const confidence = determineConfidence(imageUrl, result.title || "", productName, brand, result.url);
      images.push({ url: imageUrl, source, confidence });
    }

    // Also check for og:image or main images in metadata-like patterns
    const srcRegex = /(?:src|href)=["'](https?:\/\/[^\s"']+\.(?:jpg|jpeg|png|webp)[^"']*)/gi;
    while ((match = srcRegex.exec(markdown)) !== null) {
      const imageUrl = match[1];
      if (!imageUrl || seenUrls.has(imageUrl)) continue;
      if (!isValidProductImageUrl(imageUrl)) continue;
      if (isLikelyUnrelatedImage(imageUrl)) continue;

      seenUrls.add(imageUrl);
      const source = extractSource(result.url || imageUrl);
      const confidence = determineConfidence(imageUrl, result.title || "", productName, brand, result.url);
      images.push({ url: imageUrl, source, confidence });
    }
  }

  return images;
}

function isValidProductImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;

    const validPatterns = [
      /\.(jpg|jpeg|png|webp)(\?|$)/i,
      /images?\.amazon\./i,
      /m\.media-amazon\./i,
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

function isLikelyUnrelatedImage(url: string): boolean {
  const unrelatedPatterns = [
    /[_\/\-]icon[_\/\-.]/i,
    /[_\/\-]avatar[_\/\-.]/i,
    /[_\/\-]logo[_\/\-.]/i,
    /favicon/i,
    /[_\/\-]banner[_\/\-.]/i,
    /sponsor/i,
    /[_\/\-]badge[_\/\-.]/i,
    /[_\/\-]rating[_\/\-.]/i,
    /[_\/\-]star[_\/\-.]/i,
    /[_\/\-]cart[_\/\-.]/i,
    /checkout/i,
    /payment/i,
    /visa|mastercard|paypal|verve/i,
    /\.gif$/i,
    /\.svg$/i,
    /placeholder/i,
    /spinner/i,
    /facebook|twitter|instagram|linkedin|whatsapp/i,
    /arrow|chevron|caret/i,
    /close|menu|hamburger/i,
    /\d{2}x\d{2}\./i,
    /btn[_\/\-]/i,
    /button/i,
  ];

  return unrelatedPatterns.some(pattern => pattern.test(url));
}

function extractSource(url: string): string {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname.includes("jumia")) return "Jumia";
    if (hostname.includes("amazon")) return "Amazon";
    if (hostname.includes("ebay")) return "eBay";
    if (hostname.includes("walmart")) return "Walmart";
    if (hostname.includes("aliexpress")) return "AliExpress";
    if (hostname.includes("konga")) return "Konga";
    if (hostname.includes("slot")) return "Slot";
    return "Web";
  } catch {
    return "Web";
  }
}

function determineConfidence(
  imageUrl: string,
  title: string,
  productName: string,
  brand: string | null,
  sourceUrl?: string
): "high" | "medium" | "low" {
  const urlLower = imageUrl.toLowerCase();
  const titleLower = title.toLowerCase();
  const nameLower = productName.toLowerCase();
  const brandLower = brand?.toLowerCase() || "";
  const sourceLower = sourceUrl?.toLowerCase() || "";

  const highConfidencePatterns = [
    nameLower.split(/\s+/).some(word =>
      word.length > 3 && (urlLower.includes(word) || titleLower.includes(word))
    ),
    brandLower && urlLower.includes(brandLower.replace(/\s+/g, "")),
    urlLower.includes("amazon") && (urlLower.includes("_AC_SL") || urlLower.includes("_AC_UL")),
    brandLower && sourceLower.includes(brandLower.replace(/\s+/g, "")),
    /_SL1[0-9]{3}|_UL1[0-9]{3}/i.test(urlLower),
  ];

  if (highConfidencePatterns.some(Boolean)) return "high";

  const mediumConfidencePatterns = [
    /amazon|jumia|ebay|walmart|aliexpress|bestbuy/i.test(urlLower),
    /cdn|cloudfront|static|media|assets/i.test(urlLower),
    /product|catalog|item/i.test(urlLower),
  ];

  if (mediumConfidencePatterns.some(Boolean)) return "medium";

  return "low";
}
