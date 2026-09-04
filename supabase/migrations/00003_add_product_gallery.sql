-- 1. Add the gallery_urls column to the products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS gallery_urls TEXT[] DEFAULT '{}';

-- 2. Update the Bamboo Chopping Board with extra gallery images
UPDATE public.products
SET gallery_urls = ARRAY[
  '/images/products/2.webp',
  '/images/products/3.jpg',
  '/images/products/4.jpg',
  '/images/products/5.webp',
  '/images/products/6.webp'
]
WHERE name = 'Premium Bamboo Chopping Board with Sleek Metal Handle';
