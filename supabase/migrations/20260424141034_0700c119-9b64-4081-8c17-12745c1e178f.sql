
-- Unified trash bin: stores soft-deleted records as JSON snapshots
CREATE TABLE public.trash_bin (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,        -- 'order' | 'product' | 'member' | 'hotel' | 'store' | 'combo' | 'coupon' | 'review' | 'agent'
  entity_id uuid NOT NULL,
  display_name text NOT NULL DEFAULT '',
  snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  deleted_by uuid,
  deleted_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '30 days')
);

ALTER TABLE public.trash_bin ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage trash_bin" ON public.trash_bin
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_trash_bin_entity ON public.trash_bin (entity_type, deleted_at DESC);
CREATE INDEX idx_trash_bin_expires ON public.trash_bin (expires_at);
