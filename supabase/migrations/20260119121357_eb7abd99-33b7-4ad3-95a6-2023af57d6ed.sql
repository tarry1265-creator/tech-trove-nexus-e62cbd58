-- Insert Routers category
INSERT INTO public.categories (name, slug, description, icon)
VALUES ('Routers', 'routers', 'Portable WiFi routers and MiFi devices for internet connectivity on the go', 'router');

-- Insert router products
INSERT INTO public.products (name, slug, description, brand, price, image_url, category_id, is_featured, is_new_arrival, rating, stock_quantity, additional_images)
VALUES 
(
  'Glo 4G LTE Mobile WiFi Router (MiFi)',
  'glo-4g-lte-mifi-router',
  'Stay connected anywhere with the Glo 4G LTE Mobile WiFi Router. This compact and portable MiFi device supports 3G/4G networks and can connect up to 10 devices simultaneously. Features a long-lasting battery for all-day use, LED status indicators, and easy setup. Perfect for travelers, remote workers, and anyone needing reliable internet on the go. Compatible across Europe, Asia, Africa, and the Middle East.',
  'Glo',
  25000,
  '/products/glo-4g-mifi-router.jpg',
  (SELECT id FROM public.categories WHERE slug = 'routers'),
  true,
  true,
  4.6,
  50,
  ARRAY['/products/glo-mifi-router-white.jpg']
);