import React, { useState } from 'react';
import { Calendar, LogOut, User, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRequests } from '../contexts/RequestsContext';

export function Header() {
  const { user, logout } = useAuth();
  const { getPendingRequests } = useRequests();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Apenas gestores (incluindo Gestor Sistema) veem notificações
  const pendingCount = user?.role === 'manager' ? getPendingRequests().length : 0;
  const isGestorSistema = user?.name === 'Gestor Sistema';

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'manager':
        return 'Gestor';
      case 'hr':
        return 'RH';
      default:
        return 'Funcionário';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-indigo-600" />
            <h1 className="ml-3 text-xl font-semibold text-gray-900">
              {isGestorSistema ? 'Sistema de Aprovações' : 'Sistema de Férias e Ausências'}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {user?.role === 'manager' && pendingCount > 0 && (
              <div className="relative">
                <Bell className="h-6 w-6 text-gray-400" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {pendingCount}
                </span>
              </div>
            )}

            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">
                    {isGestorSistema ? 'Gestor de Aprovações' : `${getRoleLabel(user?.role || 'employee')} • ${user?.employeeType}`}
                  </p>
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}