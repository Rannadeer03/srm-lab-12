-- Disable RLS temporarily to drop policies cleanly
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies for questions
DROP POLICY IF EXISTS "Teachers can view all questions" ON questions;
DROP POLICY IF EXISTS "Teachers can create questions" ON questions;
DROP POLICY IF EXISTS "Teachers can update questions" ON questions;
DROP POLICY IF EXISTS "Teachers can delete questions" ON questions;
DROP POLICY IF EXISTS "Anyone can view questions" ON questions;
DROP POLICY IF EXISTS "Students and Public can view questions in active tests" ON questions;

-- Enable RLS for questions
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- NEW POLICIES FOR 'questions' TABLE
-- Allow teachers to view all questions
CREATE POLICY "Teachers can view all questions"
  ON questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  );

-- Allow teachers to create questions
CREATE POLICY "Teachers can create questions"
  ON questions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  );

-- Allow teachers to update questions
CREATE POLICY "Teachers can update questions"
  ON questions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  );

-- Allow teachers to delete questions
CREATE POLICY "Teachers can delete questions"
  ON questions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  );

-- Allow students to view questions in active tests
CREATE POLICY "Students can view questions in active tests"
  ON questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.test_questions
      WHERE public.test_questions.question_id = questions.id
      AND EXISTS (
        SELECT 1 FROM public.tests
        WHERE public.tests.id = public.test_questions.test_id
        AND public.tests.is_active = true
      )
    )
  ); 