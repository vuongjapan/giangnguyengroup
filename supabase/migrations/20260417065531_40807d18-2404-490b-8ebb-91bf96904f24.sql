-- AI Sales Assistant tables

-- 1. ai_settings: cấu hình tổng thể
CREATE TABLE IF NOT EXISTS public.ai_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT true,
  avatar_url TEXT NOT NULL DEFAULT '',
  cooldown_seconds INTEGER NOT NULL DEFAULT 20,
  position TEXT NOT NULL DEFAULT 'bottom-right',
  style_theme TEXT NOT NULL DEFAULT 'tiktok',
  close_sleep_hours INTEGER NOT NULL DEFAULT 24,
  max_close_count INTEGER NOT NULL DEFAULT 2,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ai_settings"
  ON public.ai_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert ai_settings"
  ON public.ai_settings FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update ai_settings"
  ON public.ai_settings FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_ai_settings_updated_at
  BEFORE UPDATE ON public.ai_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default row
INSERT INTO public.ai_settings (enabled, cooldown_seconds, position, style_theme)
VALUES (true, 20, 'bottom-right', 'tiktok')
ON CONFLICT DO NOTHING;

-- 2. ai_scripts: kịch bản message theo trigger
CREATE TABLE IF NOT EXISTS public.ai_scripts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trigger_type TEXT NOT NULL,
  message TEXT NOT NULL,
  cta_label TEXT NOT NULL DEFAULT 'Xem ngay',
  cta_action TEXT NOT NULL DEFAULT 'view',
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_scripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active ai_scripts"
  ON public.ai_scripts FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can view all ai_scripts"
  ON public.ai_scripts FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert ai_scripts"
  ON public.ai_scripts FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update ai_scripts"
  ON public.ai_scripts FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete ai_scripts"
  ON public.ai_scripts FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_ai_scripts_updated_at
  BEFORE UPDATE ON public.ai_scripts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default scripts
INSERT INTO public.ai_scripts (trigger_type, message, cta_label, cta_action, sort_order) VALUES
('welcome', 'Chào bạn 👋 Hôm nay bên em đang có ưu đãi mực khô rất tốt!', 'Xem combo', 'combo', 1),
('product_view', 'Sản phẩm này đang bán rất chạy 🔥 Bạn muốn xem combo tiết kiệm hơn không?', 'Combo ngon nhất', 'combo', 2),
('idle', 'Bạn cần em tư vấn loại ngon nhất hôm nay không?', 'Tư vấn cho tôi', 'chat', 3),
('cart_upsell', 'Thêm 1 món nữa để được giá combo tốt hơn nhé 🛒', 'Xem combo', 'combo', 4),
('returning', 'Chào mừng quay lại 👋 Sản phẩm anh/chị xem hôm trước vẫn còn hàng!', 'Xem lại', 'recent', 5),
('exit_intent', 'Khoan rời đi 😄 Em giữ ưu đãi này thêm vài phút cho mình nhé!', 'Giữ ưu đãi', 'view', 6),
('night_combo', 'Combo nhậu hot tối nay 🍻 Mực khô + nem chua + lạc rang, ăn là mê!', 'Xem combo nhậu', 'combo', 7)
ON CONFLICT DO NOTHING;

-- 3. ai_logs: tracking events
CREATE TABLE IF NOT EXISTS public.ai_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_logs_session ON public.ai_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_event ON public.ai_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_ai_logs_created ON public.ai_logs(created_at DESC);

ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert ai_logs"
  ON public.ai_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view ai_logs"
  ON public.ai_logs FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. product_relations: gợi ý chéo
CREATE TABLE IF NOT EXISTS public.product_relations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL,
  related_product_id UUID NOT NULL,
  relation_type TEXT NOT NULL DEFAULT 'cross_sell',
  weight INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id, related_product_id, relation_type)
);

CREATE INDEX IF NOT EXISTS idx_product_relations_product ON public.product_relations(product_id);

ALTER TABLE public.product_relations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product_relations"
  ON public.product_relations FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert product_relations"
  ON public.product_relations FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update product_relations"
  ON public.product_relations FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete product_relations"
  ON public.product_relations FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));