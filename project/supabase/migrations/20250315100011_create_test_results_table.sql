-- Drop existing table if it exists
DROP TABLE IF EXISTS test_results;

-- Create test_results table
CREATE TABLE test_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score DECIMAL NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  wrong_answers INTEGER NOT NULL DEFAULT 0,
  unattempted INTEGER NOT NULL DEFAULT 0,
  time_taken INTEGER, -- in minutes
  started_at TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  answers JSONB, -- Store student's answers
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(test_id, student_id)
);

-- Create indexes for better performance
CREATE INDEX idx_test_results_test_id ON test_results(test_id);
CREATE INDEX idx_test_results_student_id ON test_results(student_id);
CREATE INDEX idx_test_results_status ON test_results(status);
CREATE INDEX idx_test_results_score ON test_results(score);

-- Enable Row Level Security
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Students can view their own test results"
  ON test_results FOR SELECT
  USING (
    student_id = auth.uid()
  );

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

CREATE POLICY "Students can update their own test results"
  ON test_results FOR UPDATE
  USING (
    student_id = auth.uid()
  )
  WITH CHECK (
    student_id = auth.uid()
  );

CREATE POLICY "Teachers can view results for their tests"
  ON test_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tests
      WHERE tests.id = test_results.test_id
      AND tests.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can update results for their tests"
  ON test_results FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM tests
      WHERE tests.id = test_results.test_id
      AND tests.teacher_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_test_results_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_test_results_updated_at
    BEFORE UPDATE ON test_results
    FOR EACH ROW
    EXECUTE FUNCTION update_test_results_updated_at(); 