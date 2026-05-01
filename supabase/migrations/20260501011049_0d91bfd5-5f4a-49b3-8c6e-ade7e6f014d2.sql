
-- 1. Bổ sung cột vào profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS avatar_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS cover_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS bio text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS address text NOT NULL DEFAULT '';

-- Đồng bộ full_name từ name cũ nếu có
UPDATE public.profiles SET full_name = name WHERE full_name = '' AND name <> '';

-- 2. Bổ sung ghi chú vào orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS admin_note text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS customer_note text NOT NULL DEFAULT '';

-- 3. Gắn order_id vào customer_chat_messages (tùy chọn)
ALTER TABLE public.customer_chat_messages
  ADD COLUMN IF NOT EXISTS order_id uuid NULL;

CREATE INDEX IF NOT EXISTS idx_chat_msg_order ON public.customer_chat_messages(order_id);
CREATE INDEX IF NOT EXISTS idx_chat_msg_user ON public.customer_chat_messages(user_id, created_at DESC);

-- 4. Bảng search_logs
CREATE TABLE IF NOT EXISTS public.search_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  search_type text NOT NULL,
  search_value text NOT NULL,
  result_found boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.search_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert search logs"
  ON public.search_logs FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Admins view search logs"
  ON public.search_logs FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete search logs"
  ON public.search_logs FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_search_logs_created ON public.search_logs(created_at DESC);

-- 5. Sequence sinh mã đơn GN-YYYY-NNN theo năm
CREATE SEQUENCE IF NOT EXISTS public.order_code_seq START 1;

CREATE OR REPLACE FUNCTION public.generate_order_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_year text := to_char(now(), 'YYYY');
  v_count int;
  v_code text;
BEGIN
  SELECT count(*) + 1 INTO v_count
  FROM public.orders
  WHERE order_code LIKE 'GN-' || v_year || '-%';
  v_code := 'GN-' || v_year || '-' || lpad(v_count::text, 3, '0');
  RETURN v_code;
END;
$$;

-- 6. Bật Realtime
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.customer_chat_messages REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'customer_chat_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.customer_chat_messages;
  END IF;
END $$;
