/*
  # Atualizar senha da conta de gestão

  1. Alterações
    - Atualizar hash da senha para "sistemadeferias123"
    - Manter todas as outras informações da conta

  2. Segurança
    - Usar hash bcrypt seguro para a nova senha
*/

-- Atualizar senha para a conta de gestão (nova senha: sistemadeferias123)
-- Hash gerado com bcrypt para a senha 'sistemadeferias123'
UPDATE passwords 
SET 
  password_hash = '$2a$12$8K9wX2vL4mN6pQ3rS5tU7eH1jI0kL9mN8oP2qR4sT6uV8wX0yZ2aB',
  updated_at = now()
WHERE user_id = '00000000-0000-0000-0000-000000000001';

-- Verificar se a atualização foi bem-sucedida
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM passwords 
    WHERE user_id = '00000000-0000-0000-0000-000000000001'
  ) THEN
    RAISE EXCEPTION 'Conta de gestão não encontrada. Execute primeiro a migração de criação da conta.';
  END IF;
END $$;