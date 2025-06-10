-- Disable RLS temporarily to drop policies cleanly
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE test_questions DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies for questions
DROP POLICY IF EXISTS "Teachers can view all questions" ON questions;
DROP POLICY IF EXISTS "Teachers can create questions" ON questions;
DROP POLICY IF EXISTS "Teachers can update questions" ON questions;
DROP POLICY IF EXISTS "Teachers can delete questions" ON questions;
DROP POLICY IF EXISTS "Students can view questions in active tests" ON questions;
DROP POLICY IF EXISTS "Teachers can view their own questions" ON questions;

-- Drop all existing policies for test_questions
DROP POLICY IF EXISTS "Students can view test questions for accessible tests" ON test_questions;
DROP POLICY IF EXISTS "Teachers can view their own test questions" ON test_questions;
DROP POLICY IF EXISTS "Teachers can view test questions" ON test_questions;
DROP POLICY IF EXISTS "Teachers can create test questions" ON test_questions;
DROP POLICY IF EXISTS "Teachers can update test questions" ON test_questions;
DROP POLICY IF EXISTS "Teachers can delete test questions" ON test_questions;


-- Enable RLS for questions and test_questions
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_questions ENABLE ROW LEVEL SECURITY;

-- NEW POLICIES FOR 'questions' TABLE
-- Students can read questions if they are part of an active test
CREATE POLICY "Students and Public can view questions in active tests"
  ON questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.test_questions
      WHERE public.test_questions.question_id = questions.id
      AND EXISTS (
        SELECT 1 FROM public.tests
        WHERE public.tests.id = public.test_questions.test_id
        AND public.tests.is_active = TRUE
      )
    )
  );

-- Teachers can create questions
CREATE POLICY "Teachers can create questions"
  ON questions FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'teacher'));

-- Teachers can update questions if they are linked to their tests
CREATE POLICY "Teachers can update questions for their tests"
  ON questions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.test_questions
      WHERE public.test_questions.question_id = questions.id
      AND EXISTS (
        SELECT 1 FROM public.tests
        WHERE public.tests.id = public.test_questions.test_id
        AND public.tests.teacher_id = auth.uid()
      )
    )
  );

-- Teachers can delete questions if they are linked to their tests
CREATE POLICY "Teachers can delete questions for their tests"
  ON questions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.test_questions
      WHERE public.test_questions.question_id = questions.id
      AND EXISTS (
        SELECT 1 FROM public.tests
        WHERE public.tests.id = public.test_questions.test_id
        AND public.tests.teacher_id = auth.uid()
      )
    )
  );


-- NEW POLICIES FOR 'test_questions' TABLE
-- Students can view test_questions if the test is active
CREATE POLICY "Students and Public can view test_questions for active tests"
  ON test_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tests
      WHERE public.tests.id = test_questions.test_id
      AND public.tests.is_active = TRUE
    )
  );

-- Teachers can create test_questions for their tests
CREATE POLICY "Teachers can insert test_questions for their tests"
  ON test_questions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tests
      WHERE public.tests.id = test_questions.test_id
      AND public.tests.teacher_id = auth.uid()
    )
  );

-- Teachers can delete test_questions for their tests
CREATE POLICY "Teachers can delete test_questions for their tests"
  ON test_questions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.tests
      WHERE public.tests.id = test_questions.test_id
      AND public.tests.teacher_id = auth.uid()
    )
  ); 