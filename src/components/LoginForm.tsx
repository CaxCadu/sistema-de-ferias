import React, { useState } from 'react';
import { Mail, LogIn, UserPlus, Calendar, Building2, Users, CheckCircle, Eye, EyeOff, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

export function LoginForm() {
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [registerData, setRegisterData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    employeeType: 'CLT' as 'CLT' | 'PJ'
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, register, loginWithGoogle } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) return;

    setIsLoading(true);
    setError('');
    try {
      await login(loginData.email, loginData.password);
    } catch (error: any) {
      setError(error.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerData.email || !registerData.name || !registerData.password) return;

    if (registerData.password !== registerData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (registerData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await register(registerData.email, registerData.password, registerData.name, registerData.employeeType);
    } catch (error: any) {
      setError(error.message || 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError('');
    try {
      await loginWithGoogle();
    } catch (error: any) {
      setError(error.message || 'Erro ao fazer login com Google');
    } finally {
      setIsLoading(false);
    }
  };

  if (showRegisterForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Criar Conta
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Preencha seus dados para acessar o sistema
            </p>
          </div>

          {/* Registration Form */}
          <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl border border-gray-100">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleRegister}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <input
                    id="register-email"
                    name="email"
                    type="email"
                    required
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className="appearance-none block w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    placeholder="seu.email@empresa.com"
                  />
                  <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div>
                <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="register-password"
                    name="password"
                    type={showRegisterPassword ? 'text' : 'password'}
                    required
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className="appearance-none block w-full px-4 py-3 pl-11 pr-11 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showRegisterPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    className="appearance-none block w-full px-4 py-3 pl-11 pr-11 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    placeholder="Confirme sua senha"
                  />
                  <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tipo de Contrato
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRegisterData({ ...registerData, employeeType: 'CLT' })}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      registerData.employeeType === 'CLT'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <Building2 className="h-6 w-6 mx-auto mb-2" />
                    <div className="text-sm font-medium">CLT</div>
                    <div className="text-xs opacity-75">Funcionário</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegisterData({ ...registerData, employeeType: 'PJ' })}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      registerData.employeeType === 'PJ'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <Users className="h-6 w-6 mx-auto mb-2" />
                    <div className="text-sm font-medium">PJ</div>
                    <div className="text-xs opacity-75">Freelancer</div>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !registerData.email || !registerData.name || !registerData.password || !registerData.confirmPassword}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" color="white" />
                ) : (
                  <>
                    <UserPlus className="h-5 w-5 mr-2" />
                    Criar Conta
                  </>
                )}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-gray-500 font-medium">Ou</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleGoogleAuth}
                  disabled={isLoading}
                  className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:shadow-md disabled:opacity-50"
                >
                  <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuar com Google
                </button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setShowRegisterForm(false);
                  setError('');
                }}
                className="text-sm text-indigo-600 hover:text-indigo-500 font-medium transition-colors duration-200"
              >
                Já tem uma conta? Fazer login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Calendar className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Sistema de Férias e Ausências
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Gerencie suas férias e ausências de forma simples
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
            <Calendar className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
            <div className="text-xs font-medium text-gray-700">Calendário</div>
          </div>
          <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
            <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-xs font-medium text-gray-700">Aprovações</div>
          </div>
          <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
            <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-xs font-medium text-gray-700">Equipe</div>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl border border-gray-100">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="appearance-none block w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="seu.email@empresa.com"
                />
                <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="appearance-none block w-full px-4 py-3 pl-11 pr-11 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="Sua senha"
                />
                <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-2" />
                  Entrar
                </>
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500 font-medium">Ou</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:shadow-md disabled:opacity-50"
              >
                <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar com Google
              </button>

              <button
                onClick={() => {
                  setShowRegisterForm(true);
                  setError('');
                }}
                className="w-full inline-flex justify-center py-3 px-4 border-2 border-indigo-200 rounded-xl text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-all duration-200 hover:border-indigo-300"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Criar Nova Conta
              </button>
            </div>
          </div>

          <div className="mt-8 text-xs text-gray-500 bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-100">
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="font-medium">Funcionários:</span>
                <span className="ml-1">Crie sua conta ou use Google</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span className="font-medium">Gestão:</span>
                <span className="ml-1">Entre em contato com o administrador</span>
              </div>
              <div className="text-xs text-gray-400 mt-2 pl-4">
                • CLT: Funcionários com carteira assinada<br/>
                • PJ: Freelancers e prestadores de serviço<br/>
                • Gestores: Acesso a aprovações e relatórios (configurado pelo admin)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}