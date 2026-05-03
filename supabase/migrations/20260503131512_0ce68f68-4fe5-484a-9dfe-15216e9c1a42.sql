-- Bảng danh mục sản phẩm (admin có thể CRUD)
CREATE TABLE public.product_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL DEFAULT '📦',
  group_name TEXT NOT NULL DEFAULT 'KHÁC',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active categories" ON public.product_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins view all categories" ON public.product_categories
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage categories" ON public.product_categories
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_product_categories_updated_at
  BEFORE UPDATE ON public.product_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed dữ liệu danh mục mặc định
INSERT INTO public.product_categories (name, slug, icon, group_name, sort_order) VALUES
('Mực khô', 'muc-kho', '🦑', 'HẢI SẢN KHÔ', 10),
('Mực rim', 'muc-rim', '🦑', 'HẢI SẢN KHÔ', 11),
('Mực một nắng', 'muc-mot-nang', '🦑', 'HẢI SẢN KHÔ', 12),
('Bạch tuộc khô', 'bach-tuoc-kho', '🦑', 'HẢI SẢN KHÔ', 13),
('Cá khô', 'ca-kho', '🐟', 'CÁ KHÔ', 20),
('Cá thu khô', 'ca-thu-kho', '🐟', 'CÁ KHÔ', 21),
('Cá thu một nắng', 'ca-thu-mot-nang', '🐟', 'CÁ KHÔ', 22),
('Cá đục khô', 'ca-duc-kho', '🐟', 'CÁ KHÔ', 23),
('Cá chỉ vàng khô', 'ca-chi-vang-kho', '🐟', 'CÁ KHÔ', 24),
('Cá cơm khô', 'ca-com-kho', '🐟', 'CÁ KHÔ', 25),
('Tôm khô', 'tom-kho', '🦐', 'TÔM & GIÁP XÁC KHÔ', 30),
('Tôm nõn khô', 'tom-non-kho', '🦐', 'TÔM & GIÁP XÁC KHÔ', 31),
('Ghẹ khô', 'ghe-kho', '🦐', 'TÔM & GIÁP XÁC KHÔ', 32),
('Mắm tôm', 'mam-tom', '🫙', 'MẮM CÁC LOẠI', 40),
('Mắm ruốc', 'mam-ruoc', '🫙', 'MẮM CÁC LOẠI', 41),
('Mắm cá thu', 'mam-ca-thu', '🫙', 'MẮM CÁC LOẠI', 42),
('Nước mắm nguyên chất', 'nuoc-mam', '🫙', 'MẮM CÁC LOẠI', 43),
('Ruốc tôm', 'ruoc-tom', '🌿', 'RUỐC & CHÀ BÔNG', 50),
('Chà bông cá thu', 'cha-bong-ca-thu', '🌿', 'RUỐC & CHÀ BÔNG', 51),
('Hải sản 1 nắng', 'hai-san-1-nang', '🏖️', 'HẢI SẢN MỘT NẮNG', 60),
('Nem chua', 'nem-chua', '🥘', 'HẢI SẢN CHẾ BIẾN SẴN', 70),
('Chả mực', 'cha-muc', '🥘', 'HẢI SẢN CHẾ BIẾN SẴN', 71),
('Chả cá', 'cha-ca', '🥘', 'HẢI SẢN CHẾ BIẾN SẴN', 72),
('Combo quà biếu', 'combo-qua-bieu', '🎁', 'COMBO & QUÀ BIẾU', 80),
('Combo gia đình', 'combo-gia-dinh', '🎁', 'COMBO & QUÀ BIẾU', 81),
('Combo tết', 'combo-tet', '🎁', 'COMBO & QUÀ BIẾU', 82),
('Muối ớt hải sản', 'muoi-ot-hai-san', '🧂', 'GIA VỊ & NƯỚC CHẤM', 90),
('Sứa biển', 'sua-bien', '🌊', 'ĐẶC SẢN SẦM SƠN KHÁC', 100),
('Rong biển khô', 'rong-bien-kho', '🌊', 'ĐẶC SẢN SẦM SƠN KHÁC', 101),
('Đặc sản khác', 'dac-san-khac', '📦', 'KHÁC', 200),
('Sản phẩm mới', 'san-pham-moi', '📦', 'KHÁC', 201)
ON CONFLICT (name) DO NOTHING;

-- Thêm cột views cho products để hiển thị lượt xem
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS views INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS original_price INTEGER NOT NULL DEFAULT 0;