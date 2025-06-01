
-- Create test_results table
CREATE TABLE IF NOT EXISTS test_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Results data
  score DECIMAL NOT NULL,
  total_marks DECIMAL NOT NULL,
  percentage DECIMAL NOT NULL,
  time_taken INTEGER, -- in seconds
  
  -- Answers (JSON format)
  answers JSONB,
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(test_id, student_id)
);

-- Create indexes
CREATE INDEX idx_test_results_test_id ON test_results(test_id);
CREATE INDEX idx_test_results_student_id ON test_results(student_id);
CREATE INDEX idx_test_results_score ON test_results(score);
