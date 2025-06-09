-- Create course-materials storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('course_materials', 'course_materials', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for course_materials bucket
DO $$ BEGIN
    CREATE POLICY "Public Access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'course_materials');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Teachers can upload course materials"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'course_materials' AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'teacher'
        )
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Teachers can update course materials"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'course_materials' AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'teacher'
        )
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Teachers can delete course materials"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'course_materials' AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'teacher'
        )
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$; 