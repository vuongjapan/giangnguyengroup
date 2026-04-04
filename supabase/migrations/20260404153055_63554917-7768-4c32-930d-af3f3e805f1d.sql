
DROP POLICY "Anyone can insert orders" ON public.orders;

-- Allow anonymous orders (user_id is null)
CREATE POLICY "Anyone can insert guest orders" ON public.orders
  FOR INSERT TO public WITH CHECK (user_id IS NULL);
