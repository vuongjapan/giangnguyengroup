-- 1. Abandoned carts
CREATE TABLE public.abandoned_carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recovery_token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  customer_email text DEFAULT '',
  customer_phone text DEFAULT '',
  customer_name text DEFAULT '',
  cart_data jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_value integer NOT NULL DEFAULT 0,
  user_id uuid,
  reminder_sent_at timestamptz,
  recovered boolean NOT NULL DEFAULT false,
  recovered_at timestamptz,
  voucher_code text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_abandoned_carts_token ON public.abandoned_carts(recovery_token);
CREATE INDEX idx_abandoned_carts_pending ON public.abandoned_carts(reminder_sent_at, recovered, created_at) WHERE recovered = false AND reminder_sent_at IS NULL;

ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert abandoned cart"
  ON public.abandoned_carts FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Anyone can update by token"
  ON public.abandoned_carts FOR UPDATE TO public USING (true);

CREATE POLICY "Anyone can read by token"
  ON public.abandoned_carts FOR SELECT TO public USING (true);

CREATE POLICY "Admins can delete abandoned carts"
  ON public.abandoned_carts FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_abandoned_carts_updated_at
  BEFORE UPDATE ON public.abandoned_carts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. SEO landing pages
CREATE TABLE public.seo_landing_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  keyword text NOT NULL DEFAULT '',
  title text NOT NULL,
  meta_description text NOT NULL DEFAULT '',
  h1 text NOT NULL DEFAULT '',
  intro text NOT NULL DEFAULT '',
  content_html text NOT NULL DEFAULT '',
  faq jsonb NOT NULL DEFAULT '[]'::jsonb,
  json_ld jsonb NOT NULL DEFAULT '{}'::jsonb,
  related_product_ids uuid[] NOT NULL DEFAULT '{}',
  hero_image text DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  views integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_seo_landing_status ON public.seo_landing_pages(status, slug);

ALTER TABLE public.seo_landing_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published landing"
  ON public.seo_landing_pages FOR SELECT TO public
  USING (status = 'published');

CREATE POLICY "Admins view all landing"
  ON public.seo_landing_pages FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert landing"
  ON public.seo_landing_pages FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update landing"
  ON public.seo_landing_pages FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete landing"
  ON public.seo_landing_pages FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_seo_landing_updated_at
  BEFORE UPDATE ON public.seo_landing_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Repeat order campaigns
CREATE TABLE public.repeat_order_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  customer_email text NOT NULL,
  customer_name text DEFAULT '',
  days_after integer NOT NULL,
  voucher_code text DEFAULT '',
  suggested_product_ids uuid[] NOT NULL DEFAULT '{}',
  sent_at timestamptz NOT NULL DEFAULT now(),
  opened boolean NOT NULL DEFAULT false,
  reordered boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_repeat_campaigns_unique ON public.repeat_order_campaigns(order_id, days_after);
CREATE INDEX idx_repeat_campaigns_email ON public.repeat_order_campaigns(customer_email);

ALTER TABLE public.repeat_order_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view repeat campaigns"
  ON public.repeat_order_campaigns FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage repeat campaigns"
  ON public.repeat_order_campaigns FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- 4. Add status column to products for AI Quick Import
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);