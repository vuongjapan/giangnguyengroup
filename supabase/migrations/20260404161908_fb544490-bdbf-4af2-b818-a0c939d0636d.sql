
CREATE TABLE public.hotels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  images text[] NOT NULL DEFAULT '{}',
  address text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Cao cấp',
  amenities text[] NOT NULL DEFAULT '{}',
  discount_percent integer NOT NULL DEFAULT 10,
  phone text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active hotels" ON public.hotels FOR SELECT TO public USING (is_active = true);
CREATE POLICY "Admins can insert hotels" ON public.hotels FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update hotels" ON public.hotels FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete hotels" ON public.hotels FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view all hotels" ON public.hotels FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_hotels_updated_at BEFORE UPDATE ON public.hotels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
