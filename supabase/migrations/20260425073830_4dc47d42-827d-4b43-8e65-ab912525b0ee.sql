-- Create private storage bucket for order invoice PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('order-invoices', 'order-invoices', false)
ON CONFLICT (id) DO NOTHING;

-- Admins can manage invoice PDFs
CREATE POLICY "Admins manage order invoices"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'order-invoices' AND public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (bucket_id = 'order-invoices' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- Service role inserts handled implicitly (bypass RLS); no public read policy — access via signed URLs only.
