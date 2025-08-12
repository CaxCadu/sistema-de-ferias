/*
  # Fix Profile Access Permissions

  1. Security Updates
    - Ensure RLS is properly enabled on both profiles and users tables
    - Add comprehensive policies for profile access
    - Fix any foreign key constraint issues with notifications table

  2. Policy Updates
    - Allow authenticated users to read their own profile data
    - Allow system operations for profile creation
    - Ensure managers can access necessary data
*/

-- Ensure RLS is enabled on all relevant tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Managers can read all profiles" ON profiles;

-- Recreate profiles policies with proper permissions
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "System can insert profiles"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Managers can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles manager_profile
      WHERE manager_profile.id = auth.uid()
      AND manager_profile.role IN ('manager', 'hr')
    )
  );

-- Fix notifications foreign key constraint
-- The notifications table references 'users' but should reference 'profiles'
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Ensure users table policies are correct
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Add policy for managers to read user data
CREATE POLICY "Managers can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles manager_profile
      WHERE manager_profile.id = auth.uid()
      AND manager_profile.role IN ('manager', 'hr')
    )
  );