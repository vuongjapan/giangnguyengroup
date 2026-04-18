-- Create wholesale_leads table
CREATE TABLE public.wholesale_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  region TEXT NOT NULL DEFAULT '',
  products_interest TEXT NOT NULL DEFAULT '',
  expected_volume TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  lead_score INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'new',
  source TEXT NOT NULL DEFAULT 'website',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.wholesale_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert wholesale leads"
ON public.wholesale_leads FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Admins can view wholesale leads"
ON public.wholesale_leads FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update wholesale leads"
ON public.wholesale_leads FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete wholesale leads"
ON public.wholesale_leads FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_wholesale_leads_updated_at
BEFORE UPDATE ON public.wholesale_leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_wholesale_leads_status ON public.wholesale_leads(status);
CREATE INDEX idx_wholesale_leads_created ON public.wholesale_leads(created_at DESC);