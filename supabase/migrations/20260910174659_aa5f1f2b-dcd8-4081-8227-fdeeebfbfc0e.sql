CREATE POLICY "Anyone can read jewellery images"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'jewellery');

CREATE POLICY "Admins can upload jewellery images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'jewellery' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update jewellery images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'jewellery' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete jewellery images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'jewellery' AND public.has_role(auth.uid(), 'admin'));