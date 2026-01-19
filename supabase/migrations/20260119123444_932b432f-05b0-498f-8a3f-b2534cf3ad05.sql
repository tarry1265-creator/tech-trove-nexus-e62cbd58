-- Insert 5 more headphone products (category already exists)
INSERT INTO public.products (name, slug, description, price, image_url, brand, category_id, rating, stock_quantity, is_featured, is_new_arrival, additional_images)
VALUES 
  (
    'JBL LIVE 650BTNC Wireless Noise Cancelling Headphones',
    'jbl-live-650btnc-wireless-noise-cancelling-headphones',
    'Experience powerful sound with the JBL LIVE 650BTNC wireless over-ear headphones. Featuring Active Noise Cancelling technology, built-in Google Assistant and Amazon Alexa, and up to 20 hours of battery life. Premium comfort with soft ear cushions and a padded headband for all-day listening. Bluetooth connectivity for seamless wireless audio.',
    89000,
    '/products/jbl-live-650btnc-headphones.webp',
    'JBL',
    (SELECT id FROM public.categories WHERE slug = 'headphones'),
    4.7,
    25,
    true,
    false,
    '{}'
  ),
  (
    'JBL LIVE 770NC Wireless Over-Ear Headphones',
    'jbl-live-770nc-wireless-over-ear-headphones',
    'Immerse yourself in JBL Signature Sound with the LIVE 770NC wireless headphones. Features True Adaptive Noise Cancelling, Ambient Aware and TalkThru modes, and up to 65 hours of playtime. Smart Ambient technology lets you stay aware of your surroundings while enjoying your music. Comfortable memory foam ear cushions and multi-point connection support.',
    125000,
    '/products/jbl-live-770nc-headphones.jpg',
    'JBL',
    (SELECT id FROM public.categories WHERE slug = 'headphones'),
    4.8,
    20,
    true,
    true,
    '{}'
  ),
  (
    'P9 Max Wireless Bluetooth Headphones',
    'p9-max-wireless-bluetooth-headphones',
    'Premium wireless Bluetooth headphones with AirPods Max-inspired design. Features high-fidelity audio, active noise cancellation, and a sleek aluminum build. Soft memory foam ear cushions provide exceptional comfort for extended listening sessions. Long battery life and quick charging support.',
    28000,
    '/products/p9-max-wireless-headphones.jpg',
    'P9',
    (SELECT id FROM public.categories WHERE slug = 'headphones'),
    4.4,
    50,
    false,
    true,
    '{}'
  ),
  (
    'Magicfly H1 Pro Max Wireless Headphones',
    'magicfly-h1-pro-max-wireless-headphones',
    'Experience superior audio with the Magicfly H1 Pro Max wireless headphones. Features advanced Bluetooth 5.0 technology, active noise cancellation, and premium 40mm drivers for rich, detailed sound. Ergonomic design with soft protein leather ear cushions ensures maximum comfort. Up to 30 hours of battery life with quick charge support.',
    35000,
    '/products/magicfly-h1-pro-max-angle.jpg',
    'Magicfly',
    (SELECT id FROM public.categories WHERE slug = 'headphones'),
    4.5,
    35,
    false,
    true,
    '{"/products/magicfly-h1-pro-max-front.jpg"}'
  ),
  (
    'NFC Bluetooth Wireless Headphones',
    'nfc-bluetooth-wireless-headphones',
    'Stylish on-ear Bluetooth wireless headphones with NFC pairing support. Features foldable design for easy portability, built-in microphone for hands-free calls, and soft cushioned ear pads. Red accent detailing adds a sporty aesthetic. Compatible with all Bluetooth-enabled devices with up to 15 hours of playback time.',
    12000,
    '/products/nfc-bluetooth-headphones.jpg',
    'Generic',
    (SELECT id FROM public.categories WHERE slug = 'headphones'),
    4.2,
    60,
    false,
    false,
    '{}'
  );