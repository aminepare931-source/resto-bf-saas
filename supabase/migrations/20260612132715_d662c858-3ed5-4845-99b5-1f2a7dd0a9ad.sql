
CREATE POLICY "Public read restaurant-media" ON storage.objects FOR SELECT
  USING (bucket_id = 'restaurant-media');

CREATE POLICY "Owner upload restaurant-media" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'restaurant-media'
    AND EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id::text = (storage.foldername(name))[1]
        AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "Owner update restaurant-media" ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'restaurant-media'
    AND EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id::text = (storage.foldername(name))[1]
        AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "Owner delete restaurant-media" ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'restaurant-media'
    AND EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id::text = (storage.foldername(name))[1]
        AND r.user_id = auth.uid()
    )
  );
