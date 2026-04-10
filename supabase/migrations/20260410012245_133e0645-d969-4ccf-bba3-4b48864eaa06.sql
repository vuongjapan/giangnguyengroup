INSERT INTO public.combos (name, slug, tag, tag_color, category, description, product_ids, original_price, combo_price, sort_order)
VALUES
('Combo Quà Biếu Cao Cấp', 'combo-qua-bieu-cao-cap', '🎁 Best Seller', 'bg-coral text-primary-foreground', 'Quà biếu sếp',
 'Bộ 3 đặc sản biển Sầm Sơn – Đóng hộp quà sang trọng, thích hợp biếu tặng sếp, đối tác.',
 ARRAY['9cdc4db0-b32b-4330-82dd-0a4c6de7982f','dd38733a-1135-4756-b843-29a0c6fe6dea','3682fdde-5531-4408-8222-ae215a9d5c60'],
 1980000, 1680000, 1),

('Combo Gia Đình', 'combo-gia-dinh', '👨‍👩‍👧‍👦 Cho cả nhà', 'bg-primary text-primary-foreground', 'Quà gia đình',
 'Bộ hải sản cho bữa cơm gia đình – Mực 1 nắng, Cá chỉ vàng, Nem chua Thanh Hóa.',
 ARRAY['e9dbb0ca-97b6-4303-b01b-7e424ff08db6','e6777222-55a7-4c5d-b832-b36e604e4d5c','79070260-c09f-47f5-a43c-7a873246f196'],
 685000, 580000, 2),

('Combo Tiết Kiệm', 'combo-tiet-kiem', '💰 Giá tốt', 'bg-accent text-accent-foreground', 'Combo tiết kiệm',
 'Combo hải sản khô giá rẻ – Cá bò, Tép khô, Mắm tép. Phù hợp ăn hàng ngày.',
 ARRAY['4fe779b6-f4cd-4d96-bf19-91f37cd19d56','8abbf8aa-1ed9-42e2-8171-a2dd8ca010a2','29890865-de67-45d1-8ee1-dcec8fc4c55d'],
 430000, 360000, 3),

('Combo Đặc Biệt Sầm Sơn', 'combo-dac-biet-sam-son', '⭐ Premium', 'bg-coral text-primary-foreground', 'Quà Tết',
 'Bộ quà Tết sang trọng gồm 4 đặc sản biển hảo hạng – Tặng kèm hộp quà & thiệp chúc Tết.',
 ARRAY['9cdc4db0-b32b-4330-82dd-0a4c6de7982f','dd38733a-1135-4756-b843-29a0c6fe6dea','e6777222-55a7-4c5d-b832-b36e604e4d5c','79070260-c09f-47f5-a43c-7a873246f196'],
 2080000, 1750000, 0);