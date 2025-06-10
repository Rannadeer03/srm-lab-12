-- Drop the problematic policy if it exists
DROP POLICY IF EXISTS "Teachers can create questions" ON questions;

-- Recreate the policy with a direct role check
CREATE POLICY "Teachers can create questions"
  ON questions FOR INSERT
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'teacher'
  ); 