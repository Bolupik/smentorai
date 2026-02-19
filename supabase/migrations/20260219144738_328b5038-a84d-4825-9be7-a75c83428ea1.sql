
-- Storage bucket RLS policies for avatars
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage bucket RLS policies for knowledge-images
CREATE POLICY "Users can upload own knowledge images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'knowledge-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Public can view knowledge images"
ON storage.objects FOR SELECT
USING (bucket_id = 'knowledge-images');

CREATE POLICY "Users can delete own knowledge images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'knowledge-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Tighten profiles public access: only show profiles of contributors
DROP POLICY IF EXISTS "Anyone can view profiles for contributor display" ON public.profiles;

CREATE POLICY "Anyone can view contributor profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.knowledge_base
    WHERE knowledge_base.user_id = profiles.user_id
      AND knowledge_base.approved = true
  )
);
