-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    file_path TEXT NOT NULL,
    filename TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for assignments table
CREATE POLICY "Enable read access for authenticated users" ON assignments
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert for teachers" ON assignments
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'teacher'
        )
    );

CREATE POLICY "Enable update for teachers" ON assignments
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'teacher'
        )
    );

CREATE POLICY "Enable delete for teachers" ON assignments
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'teacher'
        )
    );

-- Create assignments storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('assignments', 'assignments', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for assignments bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'assignments');

CREATE POLICY "Teachers can upload assignments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'assignments' AND
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'teacher'
    )
);

CREATE POLICY "Teachers can update assignments"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'assignments' AND
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'teacher'
    )
);

CREATE POLICY "Teachers can delete assignments"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'assignments' AND
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'teacher'
    )
);

CREATE POLICY "Users can insert their own profile."
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Add the teacher_id column
ALTER TABLE subjects
ADD COLUMN teacher_id uuid;

-- (Optional but recommended) Add a foreign key constraint
-- If you use Supabase's default auth.users table:
ALTER TABLE subjects
ADD CONSTRAINT subjects_teacher_id_fkey
FOREIGN KEY (teacher_id) REFERENCES auth.users(id);

-- If you use a custom profiles table:
-- ALTER TABLE subjects
-- ADD CONSTRAINT subjects_teacher_id_fkey
-- FOREIGN KEY (teacher_id) REFERENCES profiles(id); 