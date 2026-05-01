
-- Add phone_number to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number text;

-- Allow public SELECT on orders (admin page needs this without auth)
CREATE POLICY "Anyone can view orders"
ON public.orders FOR SELECT
TO public
USING (true);

-- Allow public SELECT on order_items
CREATE POLICY "Anyone can view order items"
ON public.order_items FOR SELECT
TO public
USING (true);

-- Allow public UPDATE on profiles (for admin ban/unban without auth)
CREATE POLICY "Anyone can update profiles"
ON public.profiles FOR UPDATE
TO public
USING (true)
WITH CHECK (true);
