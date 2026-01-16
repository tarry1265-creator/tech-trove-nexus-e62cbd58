-- Add additional_images column for products with multiple images
ALTER TABLE public.products 
ADD COLUMN additional_images text[] DEFAULT '{}';

-- Insert Gaming category
INSERT INTO public.categories (name, slug, description, icon)
VALUES ('Gaming', 'gaming', 'Gaming accessories for mobile and PC gaming', 'sports_esports');

-- Insert Gaming products
INSERT INTO public.products (name, slug, description, price, currency, image_url, category_id, brand, rating, is_featured, is_new_arrival, additional_images)
VALUES 
-- SUOILE Mobile Phone Cooler
('SUOILE Mobile Phone Cooling Fan', 'suoile-mobile-phone-cooling-fan', 'High-performance semiconductor cooling fan for mobile gaming. Features RGB lighting, powerful cooling that drops your phone temperature in seconds. Universal compatibility with all smartphones. Silent operation with maximum cooling efficiency.', 8500, 'NGN', '/products/suoile-mobile-phone-cooler.jpg', (SELECT id FROM public.categories WHERE slug = 'gaming'), 'SUOILE', 4.6, true, true, '{}'),

-- Mobile Phone Cooler with Digital Display
('Mobile Phone Cooler with Digital Display', 'mobile-phone-cooler-digital-display', 'Advanced phone cooling fan with real-time digital temperature display. Shows exact temperature drop while gaming. Semiconductor cooling technology, RGB LED lights, adjustable clamp fits all phone sizes. Perfect for intensive mobile gaming sessions.', 12000, 'NGN', '/products/mobile-phone-cooler-digital-display.jpg', (SELECT id FROM public.categories WHERE slug = 'gaming'), 'Generic', 4.5, true, false, '{}'),

-- HP 2.4G Wireless Mouse (Red)
('HP 2.4G Wireless Mouse Extreme Series', 'hp-wireless-mouse-extreme-red', 'Premium wireless mouse from HP Extreme Series. Features 2.4GHz wireless connectivity with USB nano receiver, ergonomic design, precision optical tracking, and long battery life. Sleek red finish with comfortable grip for extended use.', 7500, 'NGN', '/products/hp-wireless-mouse-red.jpg', (SELECT id FROM public.categories WHERE slug = 'gaming'), 'HP', 4.4, false, true, '{}'),

-- HP Blu-Ray Gaming Mouse
('HP Cool Family Blu-Ray Gaming Mouse', 'hp-bluray-gaming-mouse-black', 'HP 1200DPI optical gaming mouse with Games+Speed technology. Features comfortable ergonomic design, precise optical sensor, durable construction, and plug-and-play USB connectivity. Perfect for gaming and everyday use.', 4500, 'NGN', '/products/hp-bluray-gaming-mouse.jpg', (SELECT id FROM public.categories WHERE slug = 'gaming'), 'HP', 4.3, false, false, '{}'),

-- HP Gaming Mouse S1
('HP Gaming Mouse S1', 'hp-gaming-mouse-s1', 'HP S1 wired gaming mouse with 3 buttons and high-precision optical sensor. Features ergonomic contoured design for comfortable grip, reliable wired USB connection, and smooth tracking on multiple surfaces. Ideal for gaming and office work.', 3500, 'NGN', '/products/hp-gaming-mouse-s1.jpg', (SELECT id FROM public.categories WHERE slug = 'gaming'), 'HP', 4.2, false, false, '{}'),

-- Mobile Gaming Controller with Cooling Fans (2 images)
('Mobile Gaming Controller with Cooling Fans', 'mobile-gaming-controller-cooling-fans', 'All-in-one mobile gaming controller with built-in dual cooling fans and L1R1 trigger buttons. Features ergonomic grip handles, powerful cooling system, charging port, and universal phone compatibility. Perfect for PUBG, Call of Duty Mobile, and other shooter games. Reduces phone heat during intense gaming sessions.', 9500, 'NGN', '/products/mobile-gaming-controller-1.jpg', (SELECT id FROM public.categories WHERE slug = 'gaming'), 'Generic', 4.7, true, true, '{"/products/mobile-gaming-controller-2.jpg"}'),

-- Wasp Feelers Gaming Finger Sleeves
('Wasp Feelers Gaming Finger Sleeves', 'wasp-feelers-gaming-finger-sleeves', 'Professional gaming finger sleeves for touch screen gaming. Features anti-sweat and anti-slip material, ultra-thin breathable fabric, and enhanced touch sensitivity. Helps you maintain precise control during mobile gaming. Pack includes multiple pairs.', 1500, 'NGN', '/products/wasp-feelers-finger-sleeves.jpg', (SELECT id FROM public.categories WHERE slug = 'gaming'), 'Wasp Feelers', 4.5, false, true, '{}'),

-- Xbox 360 USB Wired Controller
('Xbox 360 Style USB Wired Controller', 'xbox-360-usb-wired-controller', 'Classic Xbox 360 style wired gamepad controller for PC gaming. Features dual analog sticks, vibration feedback, D-pad, bumpers, triggers, and all standard buttons. USB plug-and-play connectivity, compatible with Windows PC and Android devices. Comfortable ergonomic design for long gaming sessions.', 8000, 'NGN', '/products/xbox-360-usb-controller.jpg', (SELECT id FROM public.categories WHERE slug = 'gaming'), 'Generic', 4.4, false, false, '{}');