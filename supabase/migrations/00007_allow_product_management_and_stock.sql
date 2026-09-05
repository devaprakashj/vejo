-- Allow insert for authenticated users
CREATE POLICY "Enable insert for authenticated users only" ON "public"."products"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow update for authenticated users
CREATE POLICY "Enable update for authenticated users only" ON "public"."products"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow delete for authenticated users
CREATE POLICY "Enable delete for authenticated users only" ON "public"."products"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (true);

-- Also add stock column
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;
