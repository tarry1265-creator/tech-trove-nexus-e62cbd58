-- Create repair-images bucket for storing device damage photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('repair-images', 'repair-images', true);

-- Allow public to view repair images
CREATE POLICY "Anyone can view repair images"
ON storage.objects FOR SELECT
USING (bucket_id = 'repair-images');

-- Allow anyone to upload repair images (anonymous uploads for repair requests)
CREATE POLICY "Anyone can upload repair images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'repair-images');