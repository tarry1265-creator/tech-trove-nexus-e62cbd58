
ALTER TABLE public.profiles ADD COLUMN is_banned boolean NOT NULL DEFAULT false;

-- Allow admins to update any profile (for banning)
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all orders for dispatch
CREATE POLICY "Admins can update order status"
ON public.orders
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
