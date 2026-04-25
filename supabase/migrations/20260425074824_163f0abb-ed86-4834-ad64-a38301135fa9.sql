ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS invoice_pdf_status text NOT NULL DEFAULT 'not_sent',
  ADD COLUMN IF NOT EXISTS invoice_pdf_sent_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS invoice_pdf_send_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS invoice_pdf_last_error text,
  ADD COLUMN IF NOT EXISTS invoice_pdf_last_url text;