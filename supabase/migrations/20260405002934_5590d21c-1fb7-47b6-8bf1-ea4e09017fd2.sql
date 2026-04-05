
CREATE TABLE public.combos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  tag text NOT NULL DEFAULT '',
  tag_color text NOT NULL DEFAULT 'bg-coral text-primary-foreground',
  category text NOT NULL DEFAULT 'Quà biếu',
  description text NOT NULL DEFAULT '',
  product_ids text[] NOT NULL DEFAULT '{}',
  original_price integer NOT NULL DEFAULT 0,
  combo_price integer NOT NULL DEFAULT 0,
  image text NOT NULL DEFAULT '',
  images text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.combos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active combos" ON public.combos
FOR SELECT TO public USING (is_active = true);

CREATE POLICY "Admins can view all combos" ON public.combos
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert combos" ON public.combos
FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update combos" ON public.combos
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete combos" ON public.combos
FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_combos_updated_at BEFORE UPDATE ON public.combos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.combos;
