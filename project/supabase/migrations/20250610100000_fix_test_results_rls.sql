-- Disable RLS temporarily to drop policies cleanly
ALTER TABLE test_results DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies for test_results
DROP POLICY IF EXISTS "Students can view their own test results" ON test_results;
DROP POLICY IF EXISTS "Teachers can view results for their tests" ON test_results;
DROP POLICY IF EXISTS "Students can create their own test results" ON test_results;
DROP POLICY IF EXISTS "Students can update their own test results" ON test_results;
DROP POLICY IF EXISTS "Teachers can view all test results" ON test_results;

-- Enable RLS for test_results
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- NEW POLICIES FOR 'test_results' TABLE
-- Allow students to view their own test results
CREATE POLICY "Students can view their own test results"
  ON test_results FOR SELECT
  USING (
    student_id = auth.uid()
  );

-- Allow students to create their own test results
CREATE POLICY "Students can create their own test results"
  ON test_results FOR INSERT
  WITH CHECK (
    student_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM tests
      WHERE tests.id = test_results.test_id
      AND tests.is_active = true
    )
  );

-- Allow students to update their own test results
CREATE POLICY "Students can update their own test results"
  ON test_results FOR UPDATE
  USING (
    student_id = auth.uid()
  )
  WITH CHECK (
    student_id = auth.uid()
  );

-- Allow teachers to view results for their tests
CREATE POLICY "Teachers can view results for their tests"
  ON test_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tests
      WHERE tests.id = test_results.test_id
      AND tests.teacher_id = auth.uid()
    )
  );

-- Allow teachers to update results for their tests
CREATE POLICY "Teachers can update results for their tests"
  ON test_results FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM tests
      WHERE tests.id = test_results.test_id
      AND tests.teacher_id = auth.uid()
    )
  ); 