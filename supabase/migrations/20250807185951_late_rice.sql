/*
  # Fix foreign key relationship between solicitacoes and profiles

  1. Changes
    - Update solicitacoes table to reference profiles(id) instead of auth.users(id)
    - This will allow proper joins between solicitacoes and profiles tables
    - Maintain data integrity with proper foreign key constraints

  2. Security
    - Maintain existing RLS policies
    - Ensure data consistency with foreign key constraints
*/

-- First, drop the existing foreign key constraint
ALTER TABLE solicitacoes DROP CONSTRAINT IF EXISTS solicitacoes_user_id_fkey;

-- Update the foreign key to reference profiles table instead of auth.users
ALTER TABLE solicitacoes 
ADD CONSTRAINT solicitacoes_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Ensure we have proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_solicitacoes_user_id ON solicitacoes(user_id);