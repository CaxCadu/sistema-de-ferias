import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { hashPassword, verifyPassword, validatePassword } from '../utils/auth';
import { User } from '../types';
import { showNotification } from '../utils/notifications';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, employeeType: 'CLT' | 'PJ') => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Fallback for demo mode when Supabase is not configured
const isDemoMode = !isSupabaseConfigured;

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('Initializing auth, isDemoMode:', isDemoMode);
      if (isDemoMode) {
        // Demo mode - sem persistência local, sempre mostrar login
        console.log('Demo mode - setting isLoading to false');
        setIsLoading(false);
      } else {
        // Supabase mode - check session
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) {
            console.error('Error getting session:', error);
            showNotification('Erro ao verificar sessão', 'error');
            setIsLoading(false);
            return;
          }

          if (session?.user) {
            await fetchUserProfile(session.user.id);
          } else {
            setIsLoading(false);
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
          showNotification('Erro ao inicializar autenticação', 'error');
          setIsLoading(false);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          try {
            if (event === 'TOKEN_REFRESHED') {
              console.log('Token refreshed successfully');
            }
            
            if (event === 'SIGNED_OUT') {
              clearUserData();
              setUser(null);
              setIsLoading(false);
              return;
            }

            if (session?.user) {
              await fetchUserProfile(session.user.id);
            } else {
              setUser(null);
              setIsLoading(false);
            }
          } catch (error) {
            console.error('Error in auth state change:', error);
            showNotification('Erro na autenticação', 'error');
            setUser(null);
            setIsLoading(false);
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      }
    };

    initializeAuth();
  }, []);

  const clearUserData = () => {
    // Limpar dados sensíveis do localStorage
    localStorage.removeItem('userRequests');
    localStorage.removeItem('requests');
    localStorage.removeItem('user');
    
    // Limpar outros dados sensíveis se houver
    sessionStorage.clear();
  };

  const refreshSession = async () => {
    if (isDemoMode) return;
    
    try {
      const { error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Error refreshing session:', error);
        showNotification('Sessão expirada. Faça login novamente.', 'error');
        await logout();
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      showNotification('Erro ao renovar sessão', 'error');
      await logout();
    }
  };
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        showNotification('Erro ao carregar perfil do usuário', 'error');
        setIsLoading(false);
        return;
      }

      if (data) {
        const userProfile: User = {
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role,
          employeeType: data.employee_type,
          avatar: data.avatar_url
        };
        setUser(userProfile);
        showNotification(`Bem-vindo, ${userProfile.name}!`, 'success');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      showNotification('Erro ao carregar dados do usuário', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      if (isDemoMode) {
        // Demo mode - sempre falhar para forçar uso do Supabase
        throw new Error('Modo demo desabilitado. Configure o Supabase para usar o sistema.');
      } else {
        // Supabase login - verifica primeiro o sistema de senha customizado
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, email, name, role, employee_type, avatar_url')
          .eq('email', email)
          .maybeSingle();

        if (profileError || !profileData) {
          // Se não encontrou no sistema customizado, tenta Supabase Auth
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (authError) {
            showNotification('Email ou senha incorretos', 'error');
            throw new Error('Email ou senha incorretos');
          }
          return; // Supabase Auth vai lidar com o resto
        }

        // Verifica senha na tabela passwords
        const { data: passwordData, error: passwordError } = await supabase
          .from('passwords')
          .select('password_hash')
          .eq('user_id', profileData.id)
          .maybeSingle();

        if (passwordError || !passwordData) {
          showNotification('Email ou senha incorretos', 'error');
          throw new Error('Email ou senha incorretos');
        }

        const isValidPassword = await verifyPassword(password, passwordData.password_hash);
        if (!isValidPassword) {
          showNotification('Email ou senha incorretos', 'error');
          throw new Error('Email ou senha incorretos');
        }

        // Cria sessão manualmente para usuários de auth customizado
        const userProfile: User = {
          id: profileData.id,
          email: profileData.email,
          name: profileData.name,
          role: profileData.role,
          employeeType: profileData.employee_type,
          avatar: profileData.avatar_url
        };
        
        setUser(userProfile);
        showNotification(`Bem-vindo, ${userProfile.name}!`, 'success');
      }
    } catch (error: any) {
      showNotification(error.message || 'Erro ao fazer login', 'error');
      throw new Error(error.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, employeeType: 'CLT' | 'PJ') => {
    setIsLoading(true);

    try {
      // Validate password
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        showNotification(passwordValidation.errors.join(', '), 'error');
        throw new Error(passwordValidation.errors.join(', '));
      }

      // Determine role based on email for manager accounts
      const isManagerEmail = email.toLowerCase().includes('manager') || email.toLowerCase().includes('gestor');
      const userRole = isManagerEmail ? 'manager' : 'employee';
      if (isDemoMode) {
        // Demo mode - sempre falhar para forçar uso do Supabase
        showNotification('Modo demo desabilitado. Configure o Supabase para usar o sistema.', 'error');
        throw new Error('Modo demo desabilitado. Configure o Supabase para usar o sistema.');
      } else {
        // Supabase registration
        try {
          // Try to register with Supabase Auth first
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: name,
                employee_type: employeeType
              }
            }
          });

          if (authError) {
            // Handle specific Supabase Auth errors
            if (authError.message === 'User already registered') {
              showNotification('Este email já está cadastrado. Por favor, faça login.', 'error');
              throw new Error('Este email já está cadastrado. Por favor, faça login.');
            }
            showNotification(authError.message, 'error');
            throw authError;
          }
          if (authData.user) {
            // Create profile in database
            const { error: profileError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: authData.user.id,
                  email: authData.user.email,
                  name: name,
                  employee_type: employeeType,
                  role: userRole
                }
              ]);

            if (profileError) {
              showNotification('Erro ao criar perfil', 'error');
              throw profileError;
            }
            
            showNotification('Conta criada com sucesso!', 'success');
          }
        } catch (authError) {
          // Check if this is a user already exists error before attempting custom registration
          if (authError.message === 'User already registered' || authError.message === 'Este email já está cadastrado. Por favor, faça login.') {
            throw authError;
          }

          // If Supabase Auth fails, use custom registration
          const userId = crypto.randomUUID();
          
          // Create profile
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: userId,
                email: email,
                name: name,
                employee_type: employeeType,
                role: userRole
              }
            ]);

          if (profileError) {
            if (profileError.code === '23505') { // Unique constraint violation
              showNotification('Este email já está cadastrado', 'error');
              throw new Error('Este email já está cadastrado');
            }
            showNotification('Erro ao criar conta', 'error');
            throw profileError;
          }

          // Hash and store password
          const hashedPassword = await hashPassword(password);
          const { error: passwordError } = await supabase
            .from('passwords')
            .insert([
              {
                user_id: userId,
                password_hash: hashedPassword
              }
            ]);

          if (passwordError) {
            showNotification('Erro ao configurar senha', 'error');
            throw passwordError;
          }

          // Set user session
          const userProfile: User = {
            id: userId,
            email,
            name,
            role: userRole,
            employeeType,
            avatar: null
          };
          
          setUser(userProfile);
          showNotification('Conta criada com sucesso!', 'success');
        }
      }
    } catch (error: any) {
      showNotification(error.message || 'Erro ao criar conta', 'error');
      throw new Error(error.message || 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);

    try {
      if (isDemoMode) {
        // Demo mode - sempre falhar para forçar uso do Supabase
        showNotification('Modo demo desabilitado. Configure o Supabase para usar o sistema.', 'error');
        throw new Error('Modo demo desabilitado. Configure o Supabase para usar o sistema.');
      } else {
        // Supabase Google login
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`
          }
        });

        if (error) {
          showNotification('Erro ao fazer login com Google', 'error');
          throw error;
        }
      }
    } catch (error: any) {
      showNotification(error.message || 'Erro ao fazer login com Google', 'error');
      throw new Error(error.message || 'Erro ao fazer login com Google');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (isDemoMode) {
        // Demo mode - sem ação necessária
        clearUserData();
        setUser(null);
      } else {
        await supabase.auth.signOut();
        clearUserData();
        setUser(null);
      }
      showNotification('Logout realizado com sucesso', 'success');
    } catch (error) {
      console.error('Error during logout:', error);
      showNotification('Erro ao fazer logout', 'error');
      // Force logout even if there's an error
      clearUserData();
      setUser(null);
    }
  };

  // Função para sincronizar dados do usuário após login
  const syncUserData = async (userId: string) => {
    if (!isDemoMode) {
      try {
        // Buscar solicitações do usuário no Supabase
        const { data: vacationRequests } = await supabase
          .from('vacation_requests')
          .select('*')
          .eq('employee_id', userId);

        const { data: absenceRequests } = await supabase
          .from('absence_requests')
          .select('*')
          .eq('employee_id', userId);

        // Converter para formato do contexto
        const allRequests = [
          ...(vacationRequests || []).map(req => ({
            id: req.id,
            employeeId: req.employee_id,
            employeeName: req.employee_name,
            startDate: req.start_date,
            endDate: req.end_date,
            days: req.days,
            fractionType: req.fraction_type,
            status: req.status,
            requestDate: req.request_date,
            approvalDate: req.approval_date,
            managerId: req.manager_id,
            notes: req.notes,
            type: 'vacation' as const
          })),
          ...(absenceRequests || []).map(req => ({
            id: req.id,
            employeeId: req.employee_id,
            employeeName: req.employee_name,
            startDate: req.start_date,
            endDate: req.end_date,
            days: req.days,
            status: req.status,
            requestDate: req.request_date,
            approvalDate: req.approval_date,
            managerId: req.manager_id,
            notes: req.notes,
            type: 'absence' as const
          }))
        ];

        // Salvar no localStorage para sincronização
        localStorage.setItem('userRequests', JSON.stringify(allRequests));
      } catch (error) {
        console.error('Erro ao sincronizar dados do usuário:', error);
        showNotification('Erro ao sincronizar dados', 'error');
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, loginWithGoogle, logout, isLoading, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}