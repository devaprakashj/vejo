-- Migration: Add extra products to fill out the grid
-- These are aesthetic placeholders to make the store look full!

INSERT INTO public.products (name, description, price, category, image_url, colors, sizes)
VALUES 
(
  'Premium Olive Wood Salad Bowl',
  'Bring rustic elegance to your dining table with this stunning Olive Wood Salad Bowl. Hand-carved by master artisans, each bowl features unique, mesmerizing wood grains that make it a true one-of-a-kind piece. Perfectly sized for family gatherings, it naturally resists stains and odors while adding a warm, organic touch to any kitchen aesthetic.',
  1499,
  'Kitchen & Dining',
  'https://images.unsplash.com/photo-1615486171434-601955b25916?q=80&w=1200',
  ARRAY['Natural Wood'], 
  ARRAY['Large']
),
(
  'Minimalist Ceramic Dinner Plates - Set of 4',
  'Elevate your everyday dining with our Minimalist Ceramic Dinner Plates. Featuring a matte, eggshell finish and a subtle raised lip, these plates offer a contemporary, restaurant-quality plating experience right at home. Crafted from high-fired stoneware, they are exceptionally durable, microwave-safe, and dishwasher-friendly.',
  2199,
  'Kitchen & Dining',
  'https://images.unsplash.com/photo-1613274554329-70f997f5789f?q=80&w=1200',
  ARRAY['Eggshell White', 'Charcoal'], 
  ARRAY['Standard']
),
(
  'Handcrafted Brushed Steel Cutlery Set',
  'Redefine luxury with this 16-piece Handcrafted Cutlery Set. Forged from premium 18/10 stainless steel, each piece is finished with a stunning brushed texture that resists fingerprints and scratching. With a perfect ergonomic weight and an ultra-modern slender profile, this set guarantees to impress your dinner guests.',
  3499,
  'Kitchen & Dining',
  'https://images.unsplash.com/photo-1579624592751-e0e64c1bb25c?q=80&w=1200',
  ARRAY['Brushed Steel', 'Matte Black'], 
  ARRAY['16-Piece Set']
);
