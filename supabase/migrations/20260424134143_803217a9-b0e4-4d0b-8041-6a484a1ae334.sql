-- Add SKU column to products for stable external mapping
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku text;

-- Enforce uniqueness only on non-null SKUs (allows many NULLs, blocks duplicate SKUs)
CREATE UNIQUE INDEX IF NOT EXISTS products_sku_unique_idx
  ON public.products (sku)
  WHERE sku IS NOT NULL AND sku <> '';

-- Helpful lookup index (case-insensitive convenience for admin search)
CREATE INDEX IF NOT EXISTS products_sku_lower_idx
  ON public.products (lower(sku))
  WHERE sku IS NOT NULL;