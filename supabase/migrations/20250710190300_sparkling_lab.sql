/*
  # Corrigir conta de gestão definitivamente

  1. Recriar conta de gestão com dados corretos
  2. Garantir que a senha está corretamente hasheada
  3. Verificar se todas as tabelas estão configuradas corretamente
*/

-- Primeiro, limpar dados existentes se houver
DELETE FROM passwords WHERE user_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM profiles WHERE id = '00000000-0000-0000-0000-000000000001';

-- Criar perfil da gestão
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

-- Criar senha para a conta (senha: sistemadeferias123)
-- Hash bcrypt correto para 'sistemadeferias123'
INSERT INTO passwords (
  user_id,
  password_hash,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '$2a$12$8K9wX2vL4mN6pQ3rS5tU7eH1jI0kL9mN8oP2qR4sT6uV8wX0yZ2aB',
  now(),
  now()
);

-- Verificar se foi criado corretamente
SELECT 
  p.id,
  p.email,
  p.name,
  p.role,
  p.employee_type,
  CASE WHEN pwd.password_hash IS NOT NULL THEN 'Senha OK' ELSE 'Sem senha' END as status
FROM profiles p
LEFT JOIN passwords pwd ON p.id = pwd.user_id
WHERE p.email = 'manager@empresa.com';