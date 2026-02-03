

# Plan: Integrate Firecrawl for Official Product Image Search

## Overview

Currently, the AI model (Gemini) cannot actually search the web - it can only "guess" image URLs based on its training data, which often results in invalid or broken links. We'll integrate **Firecrawl** to perform real web searches and scrape actual product images from retailer websites.

## How It Will Work

```text
+------------------+     +-------------------+     +------------------+
|  Admin uploads   | --> |  AI identifies    | --> |  Firecrawl       |
|  product photo   |     |  product name &   |     |  searches web    |
|                  |     |  brand            |     |  for product     |
+------------------+     +-------------------+     +------------------+
                                                           |
                                                           v
+------------------+     +-------------------+     +------------------+
|  Product saved   | <-- |  Admin reviews &  | <-- |  Scrapes real    |
|  with official   |     |  confirms details |     |  image URLs from |
|  image URL       |     |                   |     |  Amazon/Jumia    |
+------------------+     +-------------------+     +------------------+
```

## Implementation Steps

### Step 1: Connect Firecrawl

First, I'll prompt you to connect your Firecrawl account. This will add the `FIRECRAWL_API_KEY` secret to your project, enabling web search and scraping capabilities.

### Step 2: Create Firecrawl Search Edge Function

Create a new edge function `firecrawl-product-search` that:
- Takes a product name and brand as input
- Uses Firecrawl's search API to find the product on Amazon, Jumia, and other retailers
- Scrapes the search results to extract actual product image URLs
- Returns a list of verified image URLs

### Step 3: Update the Scan Product Edge Function

Modify the existing `scan-product` function to:
1. First, use AI to identify the product name, brand, and other details from the uploaded image
2. Then call the new `firecrawl-product-search` function with the product name and brand
3. Return the AI-identified details along with real image URLs from Firecrawl
4. Fall back to the uploaded image only if Firecrawl finds no results

### Step 4: Update the Scan Modal UI

Enhance `ScanProductModal.tsx` to:
- Show a "Searching for official images..." loading state during the image search phase
- Display multiple image options if Firecrawl finds several (let admin pick the best one)
- Clearly indicate when using the uploaded photo as fallback vs. an official image

---

## Technical Details

### New Edge Function: `firecrawl-product-search`

```text
Location: supabase/functions/firecrawl-product-search/index.ts

Input:
  - productName: string (e.g., "JBL Tune 500BT Wireless Headphones")
  - brand: string | null (e.g., "JBL")

Process:
  1. Build search query: "{brand} {productName} site:amazon.com OR site:jumia.com.ng"
  2. Call Firecrawl search API with scrapeOptions to get page content
  3. Extract image URLs from the scraped HTML/markdown
  4. Filter for high-quality product images (look for patterns like large dimensions, CDN URLs)
  5. Return array of valid image URLs

Output:
  - images: string[] (up to 5 verified image URLs)
  - source: string (which retailer the image came from)
```

### Updated `scan-product` Flow

```text
Current Flow:
  1. Receive image -> AI analyzes -> Return product data with guessed image URL

New Flow:
  1. Receive image
  2. AI analyzes -> Extract name, brand, description, price, category
  3. Call firecrawl-product-search with name + brand
  4. If images found -> Add to response as officialImages[]
  5. If no images found -> Set officialImages to empty array
  6. Return complete product data
```

### UI Changes

The modal will show:
- Primary display: First official image from Firecrawl (if available)
- Image selector: Thumbnails of alternative images to choose from
- Fallback indicator: "Using uploaded photo (no official image found)" when applicable
- Source badge: "From Amazon" or "From Jumia" to show image origin

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/firecrawl-product-search/index.ts` | Create | New edge function for Firecrawl web search |
| `supabase/functions/scan-product/index.ts` | Modify | Add Firecrawl integration after AI analysis |
| `supabase/config.toml` | Modify | Register new edge function |
| `src/components/admin/ScanProductModal.tsx` | Modify | Add image selection UI and loading states |

---

## Benefits

- **Real image URLs**: Instead of AI-guessed URLs that often don't work, you'll get actual verified image links
- **Multiple options**: Admin can choose from several official images
- **Better fallback**: Clear indication when using uploaded photo as backup
- **Reliable**: Images come from real product pages on major retailers

