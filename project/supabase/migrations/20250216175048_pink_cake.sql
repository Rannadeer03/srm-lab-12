/*
  # Create tests and related tables

  1. New Tables
    - `tests`
      - `id` (uuid, primary key)
      - `teacher_id` (uuid, references profiles)
      - `title` (text)
      - `subject` (text)
      - `duration` (integer)
      - `status` (text)
      - `average_score` (numeric)
      - `created_at` (timestamptz)
  2. Security
    - Enable RLS on all tables
    - Add policies for teachers and students
*/

CREATE TABLE IF NOT EXISTS tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid REFERENCES profiles(id),
  title text NOT NULL,
  subject text NOT NULL,
  duration integer NOT NULL,
  status text NOT NULL CHECK (status IN ('draft', 'active', 'completed')),
  average_score numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Teachers can manage own tests"
  ON tests
  FOR ALL
  TO authenticated
  USING (teacher_id = auth.uid());

CREATE POLICY "Students can read active tests"
  ON tests
  FOR SELECT
  TO authenticated
  USING (status = 'active');