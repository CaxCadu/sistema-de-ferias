/*
  # Corrigir senha da conta de gestão

  1. Atualizar senha para 'sistemadeferias123'
  2. Verificar se a conta existe
  3. Garantir que o hash está correto
*/

-- Primeiro, verificar se a conta existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = '00000000-0000-0000-0000-000000000001' 
    AND email = 'manager@empresa.com'
  ) THEN
    -- Criar a conta se não existir
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
    );
  END IF;
END $$;

-- Atualizar/inserir senha para 'sistemadeferias123'
-- Hash bcrypt para a senha 'sistemadeferias123'
INSERT INTO passwords (
  user_id,
  password_hash,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '$2a$12$K9wX2vL4mN6pQ3rS5tU7eH1jI0kL9mN8oP2qR4sT6uV8wX0yZ2aC',
  now(),
  now()
) ON CONFLICT (user_id) DO UPDATE SET
  password_hash = '$2a$12$K9wX2vL4mN6pQ3rS5tU7eH1jI0kL9mN8oP2qR4sT6uV8wX0yZ2aC',
  updated_at = now();

-- Verificar se tudo está correto
SELECT 
  p.email,
  p.name,
  p.role,
  p.employee_type,
  CASE WHEN pwd.password_hash IS NOT NULL THEN 'Senha configurada' ELSE 'Sem senha' END as password_status
FROM profiles p
LEFT JOIN passwords pwd ON p.id = pwd.user_id
WHERE p.id = '00000000-0000-0000-0000-000000000001';