-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  total_amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending', -- Pending, Processing, Shipped, Delivered, Cancelled
  
  -- Dropshipping Fields (Meesho)
  meesho_order_id TEXT,
  tracking_id TEXT,
  tracking_url TEXT,
  
  -- Customer details for dropshipping
  shipping_address JSONB NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id BIGINT REFERENCES public.products(id) NOT NULL,
  quantity INTEGER NOT NULL,
  price_at_time INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Users can view their own orders
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can view their own order items"
  ON public.order_items FOR SELECT
  USING ( 
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Users can insert their own orders
CREATE POLICY "Users can create orders"
  ON public.orders FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can create order items"
  ON public.order_items FOR INSERT
  WITH CHECK ( 
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );
  
-- Note: Admin access for UPDATE/DELETE will be handled via the frontend and Service Role key or via explicit policies later.
-- For now, we allow the Service Role to bypass RLS automatically.
