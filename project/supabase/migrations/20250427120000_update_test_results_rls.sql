-- Enable Row Level Security on test_results table
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- Allow students to select their own test results
CREATE POLICY "Students can view their own results"
  ON test_results FOR SELECT
  USING (auth.uid() = student_id);

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