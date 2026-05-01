-- Allow anyone to update products (for the open admin dashboard)
DROP POLICY IF EXISTS "Admins can update products" ON public.products;

CREATE POLICY "Anyone can update products" 
ON public.products 
FOR UPDATE 
USING (true)
WITH CHECK (true);