-- Add admin role support to profiles
-- This migration adds role-based access control for admin features

-- Add role column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' 
CHECK (role IN ('user', 'admin', 'moderator'));

-- Create index for faster role-based queries
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);

-- Update RLS policies for contests table
-- Allow admins to manage all contests
CREATE POLICY "Admins can manage all contests"
  ON contests FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('admin', 'moderator')
    )
  );

-- Update RLS policies for contest_applications table  
-- Allow admins to view and manage all applications
CREATE POLICY "Admins can view all applications"
  ON contest_applications FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Admins can update all applications"
  ON contest_applications FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('admin', 'moderator')
    )
  );

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role IN ('admin', 'moderator')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment for documentation
COMMENT ON COLUMN profiles.role IS 'User role: user (default), admin, or moderator';
COMMENT ON FUNCTION is_admin IS 'Check if a user has admin or moderator role';
