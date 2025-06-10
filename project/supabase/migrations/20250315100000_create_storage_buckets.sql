-- Create storage buckets for course materials and test images
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('course_materials', 'course_materials', true),
  ('test_images', 'test_images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Course materials are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can upload course materials" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can update their course materials" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can delete their course materials" ON storage.objects;
DROP POLICY IF EXISTS "Test images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can upload test images" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can update their test images" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can delete their test images" ON storage.objects;

-- Set up storage policies for course_materials bucket
CREATE POLICY "Course materials are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'course_materials');

CREATE POLICY "Teachers can upload course materials"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'course_materials' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  );

CREATE POLICY "Teachers can update their course materials"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'course_materials' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  );

CREATE POLICY "Teachers can delete their course materials"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'course_materials' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  );

-- Set up storage policies for test_images bucket
CREATE POLICY "Test images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'test_images');

CREATE POLICY "Teachers can upload test images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'test_images' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  );

CREATE POLICY "Teachers can update their test images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'test_images' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  );

CREATE POLICY "Teachers can delete their test images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'test_images' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  ); 