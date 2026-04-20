-- Trigger: tự update current_price khi có bid mới hợp lệ
CREATE OR REPLACE FUNCTION public.update_auction_current_price()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.auction_products
  SET current_price = NEW.bid_amount,
      updated_at = now()
  WHERE id = NEW.auction_id
    AND NEW.bid_amount > current_price
    AND NEW.bid_amount >= start_price;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_auction_current_price ON public.auction_bids;
CREATE TRIGGER trg_update_auction_current_price
AFTER INSERT ON public.auction_bids
FOR EACH ROW
EXECUTE FUNCTION public.update_auction_current_price();

-- Sửa data sai: set current_price = max(bid_amount, start_price)
UPDATE public.auction_products ap
SET current_price = GREATEST(
  ap.start_price,
  COALESCE((SELECT MAX(bid_amount) FROM public.auction_bids WHERE auction_id = ap.id), 0)
);

-- Đảm bảo realtime
ALTER TABLE public.auction_products REPLICA IDENTITY FULL;
ALTER TABLE public.auction_bids REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'auction_products'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.auction_products;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'auction_bids'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.auction_bids;
  END IF;
END $$;