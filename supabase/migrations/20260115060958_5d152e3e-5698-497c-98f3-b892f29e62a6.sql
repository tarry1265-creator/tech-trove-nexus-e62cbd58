-- Insert categories
INSERT INTO public.categories (id, name, slug, description, icon) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Airpods/Earbuds', 'airpods-earbuds', 'Premium wireless earbuds and airpods for crystal-clear audio', 'headphones'),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Action Figures', 'action-figures', 'Collectible action figures from popular anime and games', 'toys');

-- Insert products for Airpods/Earbuds category
INSERT INTO public.products (name, slug, description, price, currency, image_url, category_id, brand, rating, is_featured, is_new_arrival) VALUES
(
  'Air F9 Max Buds+',
  'air-f9-max-buds-plus',
  'Premium wireless earbuds with LED display charging case. Features touch controls, deep bass, and up to 30 hours playtime with the charging case. Perfect for music, calls, and gaming.',
  12500.00,
  'NGN',
  '/products/air-f9-max-buds.jpg',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Buds+',
  4.5,
  true,
  true
),
(
  'AirPods Pro (Colorful Edition)',
  'airpods-pro-colorful',
  'Experience immersive audio with Active Noise Cancellation and Transparency mode. Features spatial audio, adaptive EQ, and sweat-resistant design. Comes in vibrant colorful packaging.',
  45000.00,
  'NGN',
  '/products/airpods-pro-colorful.jpg',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Apple',
  4.9,
  true,
  false
),
(
  'JBL Tune S500 TWS',
  'jbl-tune-s500-tws',
  'Award-winning JBL sound with powerful bass. Features 66-hour battery life, touch controls, hands-free calls, and Bluetooth 5.0. Red Dot Award 2021 winner for exceptional design.',
  28000.00,
  'NGN',
  '/products/jbl-tune-s500-tws.jpg',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'JBL',
  4.8,
  true,
  true
),
(
  'Oraimo SpaceBuds Neo+',
  'oraimo-spacebuds-neo-plus',
  'Tune in, Noise out. Features Active Noise Cancellation, Type-C fast charging, and comfortable fit with multiple ear tips. Includes charging cable and welcome guide.',
  18500.00,
  'NGN',
  '/products/oraimo-spacebuds-neo.jpg',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Oraimo',
  4.6,
  false,
  true
),
(
  'Samsung Buds Live+ LED S20 Plus',
  'samsung-buds-live-s20-plus',
  'True Wireless Earbuds with iconic bean design. Features LED charging case display, touch controls, and premium sound quality. Perfect blend of style and functionality.',
  32000.00,
  'NGN',
  '/products/samsung-buds-live-s20.jpg',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Samsung',
  4.7,
  true,
  false
),
(
  'SHPLUS E-8 Stereo Earphone',
  'shplus-e8-stereo-earphone',
  'High-quality wired stereo earphone with Type-C connector. Features premium stereo sound, in-line microphone for calls, and comfortable in-ear design. Budget-friendly audio solution.',
  3500.00,
  'NGN',
  '/products/shplus-e8-earphone.jpg',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'SHPLUS',
  4.3,
  false,
  false
);

-- Insert product for Action Figures category
INSERT INTO public.products (name, slug, description, price, currency, image_url, category_id, brand, rating, is_featured, is_new_arrival) VALUES
(
  'Monkey D. Luffy Action Figure - Wano Arc',
  'luffy-action-figure-wano',
  'Premium collectible One Piece action figure featuring Monkey D. Luffy in his iconic Wano Country outfit. Highly detailed sculpt with dynamic pose, flowing red kimono, and signature straw hat. Perfect for anime collectors.',
  25000.00,
  'NGN',
  '/products/luffy-action-figure.webp',
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  'One Piece',
  4.9,
  true,
  true
);