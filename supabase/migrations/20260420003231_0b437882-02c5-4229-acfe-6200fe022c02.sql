-- Auction products
CREATE TABLE public.auction_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  image TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  list_price INTEGER NOT NULL DEFAULT 0,
  start_price INTEGER NOT NULL DEFAULT 0,
  min_increment INTEGER NOT NULL DEFAULT 10000,
  current_price INTEGER NOT NULL DEFAULT 0,
  start_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  is_active BOOLEAN NOT NULL DEFAULT true,
  fake_viewers INTEGER NOT NULL DEFAULT 12,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.auction_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active auctions"
  ON public.auction_products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins view all auctions"
  ON public.auction_products FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage auctions"
  ON public.auction_products FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_auction_products_updated_at
  BEFORE UPDATE ON public.auction_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auction bids
CREATE TABLE public.auction_bids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_id UUID NOT NULL REFERENCES public.auction_products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL DEFAULT '',
  customer_phone TEXT NOT NULL DEFAULT '',
  bid_amount INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.auction_bids ENABLE ROW LEVEL SECURITY;

-- Public can view bids but masked names handled in client
CREATE POLICY "Anyone can view bids"
  ON public.auction_bids FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert bids"
  ON public.auction_bids FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins delete bids"
  ON public.auction_bids FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_auction_bids_auction_id ON public.auction_bids(auction_id, created_at DESC);

-- Realtime
ALTER TABLE public.auction_products REPLICA IDENTITY FULL;
ALTER TABLE public.auction_bids REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.auction_products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.auction_bids;

-- Default setting
INSERT INTO public.site_settings (key, value)
VALUES ('auction_enabled', 'true'::jsonb)
ON CONFLICT DO NOTHING;