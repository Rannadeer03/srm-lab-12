-- Update profiles table to allow admin role
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('student', 'teacher', 'admin'));

-- Add policy for service role to insert profiles
CREATE POLICY "Users can insert their own profile."
  ON profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Add policy for service role to read profiles
CREATE POLICY "Service role can read profiles"
  ON profiles
  FOR SELECT
  TO service_role
  USING (true);

-- Add policy for service role to update profiles
CREATE POLICY "Service role can update profiles"
  ON profiles
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on subjects table
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- Add policies for subjects table
CREATE POLICY "Anyone can read subjects"
  ON subjects
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage subjects"
  ON subjects
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Insert default subjects
INSERT INTO subjects (name, code) VALUES
  ('Physics', 'PHY'),
  ('Chemistry', 'CHE'),
  ('Mathematics', 'MAT'),
  ('Biology', 'BIO'),
  ('English', 'ENG'),
  ('Computer Science', 'CS')
ON CONFLICT (code) DO NOTHING; 