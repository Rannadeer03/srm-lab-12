-- Drop existing function if it exists
DROP FUNCTION IF EXISTS check_email_exists;

-- Create function with fixed search path
CREATE OR REPLACE FUNCTION check_email_exists(email_to_check TEXT)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE email = email_to_check
    );
END;
$$; 