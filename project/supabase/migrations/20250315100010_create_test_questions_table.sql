-- Drop existing table if it exists
DROP TABLE IF EXISTS test_questions;

-- Create test_questions junction table
CREATE TABLE test_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  question_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(test_id, question_id)
);

-- Create indexes for better performance
CREATE INDEX idx_test_questions_test_id ON test_questions(test_id);
CREATE INDEX idx_test_questions_question_id ON test_questions(question_id);
CREATE INDEX idx_test_questions_order ON test_questions(question_order);

-- Enable Row Level Security
ALTER TABLE test_questions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Teachers can view test questions"
  ON test_questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tests
      WHERE tests.id = test_questions.test_id
      AND tests.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can create test questions"
  ON test_questions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tests
      WHERE tests.id = test_questions.test_id
      AND tests.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can update test questions"
  ON test_questions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tests
      WHERE tests.id = test_questions.test_id
      AND tests.teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tests
      WHERE tests.id = test_questions.test_id
      AND tests.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can delete test questions"
  ON test_questions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tests
      WHERE tests.id = test_questions.test_id
      AND tests.teacher_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_test_questions_updated_at()
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
CREATE TRIGGER update_test_questions_updated_at
    BEFORE UPDATE ON test_questions
    FOR EACH ROW
    EXECUTE FUNCTION update_test_questions_updated_at(); 