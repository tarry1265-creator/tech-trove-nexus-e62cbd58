-- Allow anyone to delete categories (for empty category cleanup)
CREATE POLICY "Anyone can delete categories"
ON public.categories
FOR DELETE
USING (true);