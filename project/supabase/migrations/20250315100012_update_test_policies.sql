-- Drop existing policies
DROP POLICY IF EXISTS "Teachers can view their own tests" ON tests;
DROP POLICY IF EXISTS "Teachers can create tests" ON tests;
DROP POLICY IF EXISTS "Teachers can update their own tests" ON tests;
DROP POLICY IF EXISTS "Teachers can delete their own tests" ON tests;

-- Create updated policies
CREATE POLICY "Teachers can view their own tests"
  ON tests FOR SELECT
  TO authenticated
  USING (
    teacher_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  );

CREATE POLICY "Students can view available tests"
  ON tests FOR SELECT
  TO authenticated
  USING (
    is_active = true AND
    (
      -- Test is not scheduled
      (is_scheduled = false) OR
      -- Test is scheduled and within access window
      (
        is_scheduled = true AND
        (
          -- No access window set
          (access_window_start IS NULL AND access_window_end IS NULL) OR
          -- Current time is within access window
          (
            NOW() >= COALESCE(access_window_start, NOW()) AND
            NOW() <= COALESCE(access_window_end, NOW())
          )
        )
      )
    ) AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'student'
    )
  );

CREATE POLICY "Teachers can create tests"
  ON tests FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  );

CREATE POLICY "Teachers can update their own tests"
  ON tests FOR UPDATE
  TO authenticated
  USING (
    teacher_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  )
  WITH CHECK (
    teacher_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  );

CREATE POLICY "Teachers can delete their own tests"
  ON tests FOR DELETE
  TO authenticated
  USING (
    teacher_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  ); 