
INSERT INTO storage.buckets (id, name, public) VALUES ('site-media', 'site-media', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view site media" ON storage.objects FOR SELECT TO public USING (bucket_id = 'site-media');
CREATE POLICY "Admins can upload site media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'site-media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete site media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'site-media' AND public.has_role(auth.uid(), 'admin'));
