/*
  # Nova estrutura do sistema de solicitações

  1. Novas Tabelas
    - `solicitacoes` - Tabela principal para todas as solicitações
    - Atualização da tabela `profiles` com campo `is_manager`

  2. Segurança
    - Enable RLS em todas as tabelas
    - Políticas para usuários e managers
    - Controle de acesso baseado em roles

  3. Realtime
    - Configuração para notificações em tempo real
*/

-- Criar tabela principal de solicitações
CREATE TABLE IF NOT EXISTS solicitacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  days integer NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('ferias', 'ausencia')),
  fracao text DEFAULT '30' CHECK (fracao IN ('30', '15-15', '20-10', '15-5-10', '14-9-7')),
  motivo text,
  status text DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado', 'rh_notificado')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  approved_at timestamp with time zone,
  approved_by uuid REFERENCES auth.users(id)
);

-- Adicionar campo is_manager na tabela profiles se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_manager'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_manager boolean DEFAULT false;
  END IF;
END $$;

-- Habilitar RLS
ALTER TABLE solicitacoes ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários comuns
CREATE POLICY "Usuários veem apenas suas solicitações"
  ON solicitacoes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias solicitações"
  ON solicitacoes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Políticas para managers
CREATE POLICY "Managers veem todas as solicitações"
  ON solicitacoes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND (role = 'manager' OR is_manager = true)
    )
  );

CREATE POLICY "Managers podem atualizar solicitações"
  ON solicitacoes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND (role = 'manager' OR is_manager = true)
    )
  );

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_solicitacoes_updated_at
  BEFORE UPDATE ON solicitacoes
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_solicitacoes_user_id ON solicitacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_status ON solicitacoes(status);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_created_at ON solicitacoes(created_at DESC);

-- Habilitar realtime para a tabela
ALTER PUBLICATION supabase_realtime ADD TABLE solicitacoes;