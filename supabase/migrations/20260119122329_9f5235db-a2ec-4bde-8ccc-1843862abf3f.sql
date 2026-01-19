-- Insert Headphones category
INSERT INTO public.categories (name, slug, description, icon)
VALUES ('Headphones', 'headphones', 'Premium wireless and wired headphones with superior sound quality and comfort', 'headphones');

-- Insert headphone products
INSERT INTO public.products (name, slug, description, brand, price, image_url, category_id, is_featured, is_new_arrival, rating, stock_quantity, additional_images)
VALUES 
(
  'JBL E55BT Wireless Over-Ear Headphones with Active Noise Cancelling',
  'jbl-e55bt-wireless-anc-headphones',
  'Experience premium sound with the JBL E55BT Wireless Over-Ear Headphones. Featuring Active Noise Cancelling technology that blocks out ambient noise for an immersive listening experience. Enjoy up to 20 hours of battery life, JBL Signature Sound, and plush cushioned ear cups for all-day comfort. Fast Pair technology for quick Bluetooth connection.',
  'JBL',
  45000,
  '/products/jbl-e55bt-headphones.jpg',
  (SELECT id FROM public.categories WHERE slug = 'headphones'),
  true,
  true,
  4.7,
  35,
  NULL
),
(
  'Air Max2 Wireless Bluetooth Headphones',
  'air-max2-wireless-headphones',
  'The Air Max2 delivers exceptional wireless audio in a sleek, modern design. Features Bluetooth 5.0 for stable connectivity, foldable design for portability, and soft memory foam ear cushions. Offers up to 25 hours of playtime, built-in microphone for hands-free calls, and intuitive touch controls.',
  'Air Max',
  18000,
  '/products/air-max2-wireless-headphones.jpg',
  (SELECT id FROM public.categories WHERE slug = 'headphones'),
  false,
  true,
  4.4,
  60,
  NULL
),
(
  'BK R-19BT Wireless Bluetooth Headphones',
  'bk-r19bt-wireless-headphones',
  'The BK R-19BT offers versatile wireless audio with multiple connectivity options. Features TF card mode for wireless music playback without a phone, long-lasting battery life, and high-fidelity sound quality. Comfortable over-ear design with adjustable headband and soft ear cushions for extended listening sessions.',
  'BK',
  20000,
  '/products/bk-r19bt-wireless-headphones.jpg',
  (SELECT id FROM public.categories WHERE slug = 'headphones'),
  false,
  false,
  4.3,
  45,
  NULL
),
(
  'JBL Live 460NC Wireless On-Ear Noise Cancelling Headphones',
  'jbl-live-460nc-anc-headphones',
  'Tune out the noise with JBL Live 460NC wireless on-ear headphones. Featuring Adaptive Noise Cancelling and Smart Ambient technology, enjoy your music while staying aware of your surroundings. Up to 50 hours of playtime, JBL Signature Sound, and multi-point connection to switch between devices seamlessly. Voice Assistant integration with Google Assistant and Amazon Alexa.',
  'JBL',
  65000,
  '/products/jbl-live-460nc-headphones.png',
  (SELECT id FROM public.categories WHERE slug = 'headphones'),
  true,
  true,
  4.8,
  25,
  NULL
),
(
  'MS-881A Athlete Wireless Stereo Headphones',
  'ms-881a-athlete-wireless-headphones',
  'Designed for active lifestyles, the MS-881A Athlete Wireless Stereo Headphones deliver powerful sound with a comfortable fit. Features full Dolby sound, built-in microphone for calls, and wireless Bluetooth connectivity. Foldable design makes it easy to carry, and the cushioned headband ensures comfort during workouts and daily use.',
  'Athlete',
  12000,
  '/products/ms-881a-athlete-headphones.jpg',
  (SELECT id FROM public.categories WHERE slug = 'headphones'),
  false,
  false,
  4.2,
  80,
  NULL
),
(
  'JBL JB7700 Powerful Bass Wireless Headphones',
  'jbl-jb7700-bass-wireless-headphones',
  'Experience powerful bass with the JBL JB7700 Wireless Headphones. Engineered for bass lovers with enhanced low-frequency response and shock sound effects. Features Bluetooth connectivity with stable signal, low power consumption, high endurance battery, and comfortable over-ear design. Perfect for music enthusiasts who love deep, punchy bass.',
  'JBL',
  28000,
  '/products/jbl-jb7700-headphones-box.jpg',
  (SELECT id FROM public.categories WHERE slug = 'headphones'),
  true,
  true,
  4.5,
  40,
  ARRAY['/products/jbl-jb7700-headphones-product.jpg']
);