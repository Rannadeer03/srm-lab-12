-- Disable RLS temporarily to drop policies cleanly
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies for profiles
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Teachers can view all profiles" ON profiles; -- This one caused recursion earlier

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- NEW POLICIES FOR 'profiles' TABLE
-- Allow authenticated users to view their own profile
CREATE POLICY "Authenticated users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Allow authenticated users to insert their own profile
CREATE POLICY "Authenticated users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow authenticated users to update their own profile
CREATE POLICY "Authenticated users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Allow authenticated users to view profiles of other authenticated users for role lookup
-- This is crucial for RLS policies on other tables that check roles
CREATE POLICY "Authenticated users can view other profiles for role lookup"
  ON profiles FOR SELECT
  USING (
    auth.role() = 'authenticated' -- Allows any authenticated user to read all profiles
    -- OR auth.role() = 'anon' -- If you need anonymous users to read profiles (less common)
  ); 