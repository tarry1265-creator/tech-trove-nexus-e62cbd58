-- Allow anyone to insert products (for AI scan feature)
CREATE POLICY "Anyone can insert products"
ON public.products
FOR INSERT
WITH CHECK (true);

-- Allow anyone to delete products (for admin delete feature)
CREATE POLICY "Anyone can delete products"
ON public.products
FOR DELETE
USING (true);

-- Allow anyone to insert categories (for creating new categories from AI scan)
CREATE POLICY "Anyone can insert categories"
ON public.categories
FOR INSERT
WITH CHECK (true);