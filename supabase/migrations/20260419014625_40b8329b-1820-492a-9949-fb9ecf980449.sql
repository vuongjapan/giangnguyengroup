
-- AI module on/off switches (cost control)
CREATE TABLE IF NOT EXISTS public.ai_module_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_key text NOT NULL UNIQUE,
  enabled boolean NOT NULL DEFAULT false,
  auto_off_at timestamptz,
  monthly_budget_usd numeric NOT NULL DEFAULT 1.0,
  used_this_month numeric NOT NULL DEFAULT 0,
  last_reset_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_module_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ai_module_settings" ON public.ai_module_settings FOR SELECT USING (true);
CREATE POLICY "Admins manage ai_module_settings" ON public.ai_module_settings FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Seed modules (all OFF by default)
INSERT INTO public.ai_module_settings (module_key, enabled) VALUES
  ('seo_landing', false),
  ('product_import', false),
  ('popup_text', false),
  ('analytics_insight', false)
ON CONFLICT (module_key) DO NOTHING;

-- Popup campaigns (static image, no AI cost)
CREATE TABLE IF NOT EXISTS public.popup_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL DEFAULT 'home', -- home | exit | cart_threshold | seasonal
  image_url text NOT NULL DEFAULT '',
  headline text NOT NULL DEFAULT '',
  button_text text NOT NULL DEFAULT 'Xem ngay',
  coupon_code text NOT NULL DEFAULT '',
  target_url text NOT NULL DEFAULT '/san-pham',
  cart_threshold integer NOT NULL DEFAULT 0,
  show_pages text[] NOT NULL DEFAULT '{}',
  start_at timestamptz,
  end_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  views integer NOT NULL DEFAULT 0,
  clicks integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.popup_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active popup_campaigns" ON public.popup_campaigns FOR SELECT USING (is_active = true);
CREATE POLICY "Admins view all popup_campaigns" ON public.popup_campaigns FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage popup_campaigns" ON public.popup_campaigns FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Daily analytics summary (pre-aggregated to avoid heavy queries)
CREATE TABLE IF NOT EXISTS public.analytics_daily_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  carts_created integer NOT NULL DEFAULT 0,
  carts_recovered integer NOT NULL DEFAULT 0,
  exit_popup_shown integer NOT NULL DEFAULT 0,
  exit_popup_converted integer NOT NULL DEFAULT 0,
  landing_views integer NOT NULL DEFAULT 0,
  repeat_voucher_used integer NOT NULL DEFAULT 0,
  total_orders integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.analytics_daily_summary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view daily summary" ON public.analytics_daily_summary FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone insert daily summary" ON public.analytics_daily_summary FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone update daily summary" ON public.analytics_daily_summary FOR UPDATE USING (true);

-- Exit intent events (lightweight tracking)
CREATE TABLE IF NOT EXISTS public.exit_intent_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL, -- shown | clicked | dismissed | converted
  cart_value integer NOT NULL DEFAULT 0,
  coupon_code text DEFAULT '',
  session_id text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.exit_intent_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone insert exit events" ON public.exit_intent_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view exit events" ON public.exit_intent_events FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_popup_campaigns_type_active ON public.popup_campaigns(type, is_active);
CREATE INDEX IF NOT EXISTS idx_analytics_summary_date ON public.analytics_daily_summary(date DESC);
CREATE INDEX IF NOT EXISTS idx_exit_events_created ON public.exit_intent_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_seo_landing_status ON public.seo_landing_pages(status, views DESC);

-- Update trigger for ai_module_settings
CREATE TRIGGER update_ai_module_settings_updated_at
  BEFORE UPDATE ON public.ai_module_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_popup_campaigns_updated_at
  BEFORE UPDATE ON public.popup_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
