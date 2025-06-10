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

-- Allow students to create their own test results (only if they haven't taken the test before)
CREATE POLICY "Students can create their own test results"
  ON test_results FOR INSERT
  WITH CHECK (
    student_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM tests
      WHERE tests.id = test_results.test_id
      AND tests.is_active = true
    ) AND
    NOT EXISTS (
      SELECT 1 FROM test_results
      WHERE test_id = test_results.test_id
      AND student_id = auth.uid()
    )
  );

-- Allow students to update their own test results (only if status is 'in_progress')
CREATE POLICY "Students can update their own test results"
  ON test_results FOR UPDATE
  USING (
    student_id = auth.uid() AND
    status = 'in_progress'
  )
  WITH CHECK (
    student_id = auth.uid() AND
    status = 'in_progress'
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

-- Add a trigger to prevent multiple test attempts
CREATE OR REPLACE FUNCTION prevent_multiple_test_attempts()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM test_results
    WHERE test_id = NEW.test_id
    AND student_id = NEW.student_id
    AND status = 'completed'
  ) THEN
    RAISE EXCEPTION 'Student has already completed this test';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS prevent_multiple_test_attempts_trigger ON test_results;
CREATE TRIGGER prevent_multiple_test_attempts_trigger
  BEFORE INSERT ON test_results
  FOR EACH ROW
  EXECUTE FUNCTION prevent_multiple_test_attempts(); 