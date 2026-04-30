-- Add is_hidden column to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false;

-- Customer chat messages (1-1 between member and admin)
CREATE TABLE IF NOT EXISTS public.customer_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  sender text NOT NULL CHECK (sender IN ('customer', 'admin')),
  content text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customer_chat_user ON public.customer_chat_messages(user_id, created_at);

ALTER TABLE public.customer_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view own chat"
  ON public.customer_chat_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Members send own chat"
  ON public.customer_chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.uid() = user_id AND sender = 'customer')
    OR (has_role(auth.uid(), 'admin'::app_role) AND sender = 'admin')
  );

CREATE POLICY "Admin/owner update chat"
  ON public.customer_chat_messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin delete chat"
  ON public.customer_chat_messages FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow members to view orders matched by email/phone (for legacy guest orders)
DROP POLICY IF EXISTS "Members view orders by email or phone" ON public.orders;
CREATE POLICY "Members view orders by email or phone"
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    is_hidden = false
    AND (
      auth.uid() = user_id
      OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND (
          (p.email <> '' AND lower(p.email) = lower(orders.customer_email))
          OR (p.phone <> '' AND p.phone = orders.customer_phone)
        )
      )
    )
  );

-- Enable realtime
ALTER TABLE public.customer_chat_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.customer_chat_messages;