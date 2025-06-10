-- Ensure RLS is enabled for the profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop potentially conflicting policies if they exist (for SELECT operations)
DROP POLICY IF EXISTS "Users can update own profile." ON profiles; -- This one might be a select policy too
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;

-- Allow authenticated users to select their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Re-add/ensure insert policy for users to create their own profile upon signup
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Re-add/ensure update policy for users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Add a policy to allow teachers to view all profiles (optional, but useful for admin/teacher dashboards)
CREATE POLICY "Teachers can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'teacher')
  ); 