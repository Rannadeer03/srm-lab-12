
-- Create tests table
CREATE TABLE IF NOT EXISTS tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  duration INTEGER NOT NULL,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  participants TEXT[],
  
  -- Test scheduling
  is_scheduled BOOLEAN DEFAULT false,
  scheduled_date DATE,
  scheduled_time TIME,
  time_limit INTEGER,
  allow_late_submissions BOOLEAN DEFAULT false,
  access_window_start TIMESTAMP WITH TIME ZONE,
  access_window_end TIMESTAMP WITH TIME ZONE,
  
  -- Difficulty distribution
  easy_count INTEGER DEFAULT 0,
  medium_count INTEGER DEFAULT 0,
  hard_count INTEGER DEFAULT 0,
  
  -- Target ratio
  target_easy DECIMAL DEFAULT 0.0,
  target_medium DECIMAL DEFAULT 0.0,
  target_hard DECIMAL DEFAULT 0.0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_tests_teacher_id ON tests(teacher_id);
CREATE INDEX idx_tests_subject ON tests(subject);
CREATE INDEX idx_tests_is_active ON tests(is_active);
