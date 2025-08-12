/*
  # Create passwords table for user authentication

  1. New Tables
    - `passwords`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `password_hash` (text, encrypted password)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `passwords` table
    - Add policy for users to manage their own passwords
    - Add policy for system to create passwords during registration

  3. Indexes
    - Add index on user_id for faster lookups
*/

CREATE TABLE IF NOT EXISTS passwords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE passwords ENABLE ROW LEVEL SECURITY;

-- Add unique constraint to ensure one password per user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'passwords_user_id_key' 
    AND table_name = 'passwords'
  ) THEN
    ALTER TABLE passwords ADD CONSTRAINT passwords_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_passwords_user_id ON passwords(user_id);

-- RLS Policies
CREATE POLICY "Users can read own password"
  ON passwords
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own password"
  ON passwords
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create passwords"
  ON passwords
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Add updated_at trigger
CREATE TRIGGER handle_passwords_updated_at
  BEFORE UPDATE ON passwords
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();