-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Teachers can view all profiles" ON profiles; 