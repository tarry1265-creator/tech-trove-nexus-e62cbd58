-- Insert Speakers category
INSERT INTO public.categories (name, slug, description, icon)
VALUES ('Speakers', 'speakers', 'Portable and wireless Bluetooth speakers', 'speaker');

-- Insert Speaker products
INSERT INTO public.products (name, slug, description, price, currency, image_url, category_id, brand, rating, is_featured, is_new_arrival, additional_images)
VALUES 
-- WUF W33 Portable Speaker
('WUF W33 Portable Wireless Speaker', 'wuf-w33-portable-wireless-speaker', 'Compact portable Bluetooth speaker with LED RGB lighting. Features professional speaker design, powerful bass output, wireless connectivity, and durable build. Perfect for outdoor adventures, parties, and everyday listening. Includes convenient carry strap.', 7500, 'NGN', '/products/wuf-w33-portable-speaker.jpg', (SELECT id FROM public.categories WHERE slug = 'speakers'), 'WUF', 4.4, false, true, '{}'),

-- ZEALOT S38 TWS Bass Wireless Speaker (3 images as slider)
('ZEALOT S38 TWS Bass Wireless Speaker', 'zealot-s38-tws-bass-wireless-speaker', 'Premium portable Bluetooth speaker with powerful bass and TWS (True Wireless Stereo) pairing capability. Features IPX6 waterproof rating, 20W output power, 24-hour playtime, built-in microphone for hands-free calls, TF card slot, and USB charging. Comes with shoulder strap for easy portability. Perfect for outdoor parties, camping, and beach trips.', 25000, 'NGN', '/products/zealot-s38-speaker-box.jpg', (SELECT id FROM public.categories WHERE slug = 'speakers'), 'ZEALOT', 4.7, true, true, '{"/products/zealot-s38-speaker-unboxed.jpg", "/products/zealot-s38-speaker-product.jpg"}'),

-- ZEALOT S75 Karaoke Speaker with Dual Microphones (2 images as slider)
('ZEALOT S75 Karaoke Speaker with Dual Microphones', 'zealot-s75-karaoke-speaker-dual-mics', 'Ultimate party speaker with dual wireless microphones for karaoke. Features 80W powerful output, deep bass, Bluetooth 5.0, RGB LED lights, TWS pairing, and long battery life. Portable design with shoulder strap makes it perfect for outdoor events, parties, picnics, and family gatherings. Includes 2 wireless microphones for duet performances.', 65000, 'NGN', '/products/zealot-s75-speaker-mics.jpg', (SELECT id FROM public.categories WHERE slug = 'speakers'), 'ZEALOT', 4.8, true, true, '{"/products/zealot-s75-speaker-outdoor.jpg"}');