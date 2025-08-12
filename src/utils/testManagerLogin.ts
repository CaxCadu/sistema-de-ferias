import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { verifyPassword } from './auth';

export async function testManagerLogin() {
  console.log('🔍 Testando acesso à conta de gestão...');
  
  if (!isSupabaseConfigured) {
    console.log('⚠️ Supabase não configurado - usando modo demo');
    return false;
  }
  
  try {
    // 1. Verificar se o perfil existe
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, name, role, employee_type')
      .eq('email', 'manager@empresa.com')
      .maybeSingle();

    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError);
      return false;
    }

    if (!profileData) {
      console.log('ℹ️ Perfil de gestão não encontrado - será criado no primeiro login');
      return false;
    }

    console.log('✅ Perfil encontrado:', profileData);

    // 2. Verificar se a senha existe
    const { data: passwordData, error: passwordError } = await supabase
      .from('passwords')
      .select('password_hash')
      .eq('user_id', profileData.id)
      .maybeSingle();

    if (passwordError) {
      console.error('❌ Erro ao buscar senha:', passwordError);
      return false;
    }

    if (!passwordData) {
      console.log('ℹ️ Senha não encontrada - será criada no primeiro login');
      return false;
    }

    console.log('✅ Senha encontrada no banco');

    // 3. Testar verificação da senha
    const isValidPassword = await verifyPassword('sistemadeferias123', passwordData.password_hash);
    
    if (isValidPassword) {
      console.log('✅ Senha válida! Login deve funcionar.');
      return true;
    } else {
      console.error('❌ Senha inválida');
      return false;
    }

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
    return false;
  }
}

export async function createManagerAccountIfNeeded() {
  console.log('🔧 Criando conta de gestão se necessário...');
  
  if (!isSupabaseConfigured) {
    console.log('⚠️ Supabase não configurado - usando modo demo');
    return false;
  }

  try {
    // Check if manager already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'manager@empresa.com')
      .maybeSingle();

    if (checkError) {
      console.error('❌ Erro ao verificar perfil existente:', checkError);
      return false;
    }

    if (existingProfile) {
      console.log('✅ Conta de gestão já existe');
      return true;
    }

    console.log('ℹ️ Conta de gestão não existe - será criada quando necessário');
    return false;

  } catch (error) {
    console.error('❌ Erro ao verificar conta:', error);
    return false;
  }
}

export async function ensureManagerAccountExists() {
  console.log('🔧 Garantindo que a conta de gestão existe...');
  try {
    // This function should only be called when we have proper authentication context
    // For example, during the first admin setup or when an authenticated user creates the manager
    
    // Try to create the manager account using Supabase Auth first
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'manager@empresa.com',
      password: 'sistemadeferias123',
      options: {
        data: {
          full_name: 'Gestor Sistema',
          employee_type: 'CLT'
        }
      }
    });
  
    if (authError && authError.message !== 'User already registered') {
      console.error('❌ Erro ao criar usuário no Auth:', authError);
      return false;
    }

    if (authData.user) {
      // Profile should be created automatically by trigger
      console.log('✅ Conta de gestão criada via Supabase Auth');
      return true;
    }
    
    console.log('ℹ️ Usuário já existe no sistema');
    return true;
  } catch (error) {
    console.error('❌ Erro ao criar conta de gestão:', error);
    return false;
  }
}
(window as any).testManagerLogin = testManagerLogin;
(window as any).createManagerAccountIfNeeded = createManagerAccountIfNeeded;
(window as any).ensureManagerAccountExists = ensureManagerAccountExists;