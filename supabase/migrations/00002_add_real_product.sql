-- 1. First, delete all the old dummy products
DELETE FROM public.products;

-- 2. Insert the new REAL product
INSERT INTO public.products (name, description, price, category, image_url, colors, sizes)
VALUES (
  'Premium Bamboo Chopping Board with Sleek Metal Handle',
  'Elevate your culinary experience with the VEJO Natural Bamboo Chopping Board. Expertly crafted from dense, eco-friendly bamboo, this heavy-duty board provides a pristine, knife-safe surface for all your prep work—from chopping fresh vegetables to serving artisanal cheeses. Designed with a sleek, ergonomic metal handle for a comfortable grip and effortless storage, it seamlessly blends rustic charm with modern utility. A sustainable, durable, and beautifully crafted addition to your kitchen.',
  899,
  'Kitchen & Dining',
  '/images/products/1.jpg',
  ARRAY['Natural Wood'], 
  ARRAY['Standard']
);
