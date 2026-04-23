
-- 1) New table: agents
CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  region TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  zalo TEXT NOT NULL DEFAULT '',
  avatar TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  products_distributed TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active agents"
  ON public.agents FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins view all agents"
  ON public.agents FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage agents"
  ON public.agents FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Add product description fields
ALTER TABLE public.products
  ADD COLUMN taste TEXT NOT NULL DEFAULT '',
  ADD COLUMN color TEXT NOT NULL DEFAULT '',
  ADD COLUMN ingredients TEXT NOT NULL DEFAULT '',
  ADD COLUMN cooking TEXT NOT NULL DEFAULT '';
