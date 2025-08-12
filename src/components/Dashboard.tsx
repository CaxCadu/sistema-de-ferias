import React, { useState } from 'react';
import { Calendar, Plus, FileText, CheckSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { RequestForm } from './RequestForm';
import { RequestsList } from './RequestsList';
import { CalendarView } from './CalendarView';
import { ManagerDashboard } from './ManagerDashboard';

type View = 'calendar' | 'requests' | 'new-request' | 'manage';

export function Dashboard() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<View>('calendar');

  // Verificação de acesso de gestão baseada no role e nome do usuário
  const isManager = user?.role === 'manager';
  const isGestorSistema = user?.name === 'Gestor Sistema';

  // Se for "Gestor Sistema", mostrar interface restrita (calendário + aprovações)
  if (isGestorSistema) {
    const gestorMenuItems = [
      { id: 'calendar' as View, label: 'Calendário', icon: Calendar },
      { id: 'manage' as View, label: 'Aprovações', icon: CheckSquare }
    ];

    const renderGestorView = () => {
      switch (currentView) {
        case 'calendar':
          return <CalendarView />;
        case 'manage':
          return <ManagerDashboard />;
        default:
          return <CalendarView />;
      }
    };

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          {/* Sidebar para Gestor Sistema */}
          <div className="w-64 bg-white shadow-sm min-h-screen">
            <nav className="mt-5 px-2">
              <div className="space-y-1">
                {gestorMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentView(item.id)}
                      className={`${
                        currentView === item.id
                          ? 'bg-purple-50 text-purple-700 border-r-2 border-purple-500'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left transition-colors duration-200`}
                    >
                      <Icon
                        className={`${
                          currentView === item.id ? 'text-purple-500' : 'text-gray-400 group-hover:text-gray-500'
                        } mr-3 flex-shrink-0 h-5 w-5`}
                      />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>

          {/* Main content para Gestor Sistema */}
          <div className="flex-1 p-6">
            {renderGestorView()}
          </div>
        </div>
      </div>
    );
  }

  // Outros gestores têm acesso completo (se houver)
  if (isManager && !isGestorSistema) {
    // Gestores regulares podem ter acesso completo se necessário
    // Por enquanto, também direcionamos para o painel de gestão
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <ManagerDashboard />
      </div>
    );
  }

  // Regular employee interface
  const menuItems = [
    { id: 'calendar' as View, label: 'Calendário', icon: Calendar },
    { id: 'requests' as View, label: 'Minhas Solicitações', icon: FileText },
    { id: 'new-request' as View, label: 'Nova Solicitação', icon: Plus }
  ];

  const renderView = () => {
    switch (currentView) {
      case 'calendar':
        return <CalendarView />;
      case 'requests':
        return <RequestsList />;
      case 'new-request':
        return <RequestForm onSuccess={() => setCurrentView('requests')} />;
      default:
        return <CalendarView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="mt-5 px-2">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`${
                      currentView === item.id
                        ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left transition-colors duration-200`}
                  >
                    <Icon
                      className={`${
                        currentView === item.id ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 flex-shrink-0 h-5 w-5`}
                    />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 p-6">
          {renderView()}
        </div>
      </div>
    </div>
  );
}