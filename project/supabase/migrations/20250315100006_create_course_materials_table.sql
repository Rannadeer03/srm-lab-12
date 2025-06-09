-- Create course_materials table
CREATE TABLE IF NOT EXISTS course_materials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    material_type TEXT NOT NULL,
    filename TEXT NOT NULL,
    stored_filename TEXT NOT NULL,
    path TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    subject_code TEXT NOT NULL,
    file_type TEXT NOT NULL,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE course_materials ENABLE ROW LEVEL SECURITY;

-- Create policies for course_materials table
CREATE POLICY "Enable read access for authenticated users" ON course_materials
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert for teachers" ON course_materials
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'teacher'
        )
    );

CREATE POLICY "Enable update for teachers" ON course_materials
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'teacher'
        )
    );

CREATE POLICY "Enable delete for teachers" ON course_materials
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'teacher'
        )
    ); 