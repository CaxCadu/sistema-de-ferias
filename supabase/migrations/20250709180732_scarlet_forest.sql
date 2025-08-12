/*
  # Add Manager Account to Database

  1. New User Creation
    - Create auth user entry for manager account
    - Create profile entry linked to auth user
    - Create password entry for custom authentication

  2. Account Details
    - Email: manager@empresa.com
    - Password: manager123 (hashed with bcrypt)
    - Name: Gestor Sistema
    - Role: manager
    - Employee Type: CLT

  3. Security
    - Properly links to auth.users table to satisfy foreign key constraints
    - Uses secure password hashing
    - Handles conflicts gracefully
*/

-- First, insert into auth.users table to satisfy foreign key constraint
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'manager@empresa.com',
  '$2a$10$placeholder.hash.for.supabase.auth',
  now(),
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = now();

-- Insert profile for the manager account
INSERT INTO profiles (
  id,
  email,
  name,
  role,
  employee_type,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'manager@empresa.com',
  'Gestor Sistema',
  'manager',
  'CLT',
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  employee_type = EXCLUDED.employee_type,
  updated_at = now();

-- Create password for the manager account (password: manager123)
-- Hash generated with bcrypt for the password 'manager123'
INSERT INTO passwords (
  user_id,
  password_hash,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXfs2Sk9/KIM',
  now(),
  now()
) ON CONFLICT (user_id) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  updated_at = now();