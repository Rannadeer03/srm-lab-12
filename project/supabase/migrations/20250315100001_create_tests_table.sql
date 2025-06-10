-- Drop existing tables if they exist
DROP TABLE IF EXISTS test_questions;
DROP TABLE IF EXISTS test_results;
DROP TABLE IF EXISTS tests;

-- Create storage bucket for test images
INSERT INTO storage.buckets (id, name, public)
VALUES ('test_images', 'test_images', true)
ON CONFLICT (id) DO NOTHING;

-- Create tests table
CREATE TABLE IF NOT EXISTS tests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    duration INTEGER NOT NULL,
    teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    is_scheduled BOOLEAN DEFAULT false,
    scheduled_date DATE,
    scheduled_time TIME,
    time_limit INTEGER,
    allow_late_submissions BOOLEAN DEFAULT false,
    access_window_start TIMESTAMP WITH TIME ZONE,
    access_window_end TIMESTAMP WITH TIME ZONE,
    easy_count INTEGER DEFAULT 0,
    medium_count INTEGER DEFAULT 0,
    hard_count INTEGER DEFAULT 0,
    target_easy FLOAT DEFAULT 0.0,
    target_medium FLOAT DEFAULT 0.0,
    target_hard FLOAT DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_text TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('text', 'image')),
    options TEXT[] NOT NULL,
    correct_option TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    image_url TEXT,
    explanation TEXT,
    difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create test_questions table
CREATE TABLE IF NOT EXISTS test_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    question_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(test_id, question_id)
);

-- Create test_results table
CREATE TABLE IF NOT EXISTS test_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    score FLOAT NOT NULL,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    wrong_answers INTEGER NOT NULL,
    unattempted INTEGER NOT NULL,
    time_taken INTEGER NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('completed', 'in_progress', 'abandoned')),
    answers JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(test_id, student_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tests_teacher_id ON tests(teacher_id);
CREATE INDEX IF NOT EXISTS idx_questions_subject_id ON questions(subject_id);
CREATE INDEX IF NOT EXISTS idx_test_questions_test_id ON test_questions(test_id);
CREATE INDEX IF NOT EXISTS idx_test_questions_question_id ON test_questions(question_id);
CREATE INDEX IF NOT EXISTS idx_test_results_test_id ON test_results(test_id);
CREATE INDEX IF NOT EXISTS idx_test_results_student_id ON test_results(student_id);

-- Enable Row Level Security
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- Create policies for tests table
CREATE POLICY "Teachers can view their own tests"
    ON tests FOR SELECT
    USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can create tests"
    ON tests FOR INSERT
    WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own tests"
    ON tests FOR UPDATE
    USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own tests"
    ON tests FOR DELETE
    USING (auth.uid() = teacher_id);

-- Create policies for questions table
CREATE POLICY "Anyone can view questions"
    ON questions FOR SELECT
    USING (true);

CREATE POLICY "Teachers can create questions"
    ON questions FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Teachers can update questions"
    ON questions FOR UPDATE
    USING (true);

CREATE POLICY "Teachers can delete questions"
    ON questions FOR DELETE
    USING (true);

-- Create policies for test_questions table
CREATE POLICY "Anyone can view test questions"
    ON test_questions FOR SELECT
    USING (true);

CREATE POLICY "Teachers can manage test questions"
    ON test_questions FOR ALL
    USING (EXISTS (
        SELECT 1 FROM tests
        WHERE tests.id = test_questions.test_id
        AND tests.teacher_id = auth.uid()
    ));

-- Create policies for test_results table
CREATE POLICY "Students can view their own results"
    ON test_results FOR SELECT
    USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view results for their tests"
    ON test_results FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM tests
        WHERE tests.id = test_results.test_id
        AND tests.teacher_id = auth.uid()
    ));

CREATE POLICY "Students can create their own results"
    ON test_results FOR INSERT
    WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own results"
    ON test_results FOR UPDATE
    USING (auth.uid() = student_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_tests_updated_at
    BEFORE UPDATE ON tests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_results_updated_at
    BEFORE UPDATE ON test_results
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
