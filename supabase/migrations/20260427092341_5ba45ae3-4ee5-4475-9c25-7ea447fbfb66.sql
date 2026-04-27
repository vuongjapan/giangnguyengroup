
-- Order status history table
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  order_code text NOT NULL,
  from_status text,
  to_status text NOT NULL,
  note text NOT NULL DEFAULT '',
  changed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_osh_order_id ON public.order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_osh_order_code ON public.order_status_history(order_code);

ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view order_status_history"
ON public.order_status_history FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert order_status_history"
ON public.order_status_history FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins delete order_status_history"
ON public.order_status_history FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger to log status changes
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.order_status_history (order_id, order_code, from_status, to_status, note, changed_by)
    VALUES (NEW.id, NEW.order_code, NULL, NEW.status, 'Đơn được tạo', auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.order_status_history (order_id, order_code, from_status, to_status, note, changed_by)
    VALUES (NEW.id, NEW.order_code, OLD.status, NEW.status, '', auth.uid());
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_order_status ON public.orders;
CREATE TRIGGER trg_log_order_status
AFTER INSERT OR UPDATE OF status ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.log_order_status_change();

-- Enable realtime
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.order_status_history REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.order_status_history;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
