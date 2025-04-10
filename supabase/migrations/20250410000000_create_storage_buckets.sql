
-- Create storage buckets for profile pictures and clinic logos
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the storage buckets
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
  
CREATE POLICY "Users can update their own avatars"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
  
CREATE POLICY "Users can delete their own avatars"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Logo images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'logos');

CREATE POLICY "Users can upload their own logos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'logos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
  
CREATE POLICY "Users can update their own logos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'logos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
  
CREATE POLICY "Users can delete their own logos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'logos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
