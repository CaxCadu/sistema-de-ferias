import React from 'react';
import { Calendar, Clock, CheckCircle, XCircle, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRequests } from '../contexts/RequestsContext';
import { format } from '../utils/dateUtils';

const StatusBadge = ({ status }: { status: string }) => {
  const config = {
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pendente' },
    approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Aprovado' },
    rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejeitado' },
    hr_notified: { color: 'bg-blue-100 text-blue-800', icon: Bell, label: 'P&C Notificado' }
  };

  const { color, icon: Icon, label } = config[status as keyof typeof config] || config.pending;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </span>
  );
};

export function RequestsList() {
  const { user } = useAuth();
  const { getRequestsByUser } = useRequests();
  
  const userRequests = user ? getRequestsByUser(user.id) : [];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Minhas Solicitações</h2>
          <p className="mt-1 text-sm text-gray-600">
            Acompanhe o status das suas solicitações
          </p>
        </div>

        <div className="p-6">
          {userRequests.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma solicitação encontrada
              </h3>
              <p className="text-gray-600">
                Você ainda não fez nenhuma solicitação de {user?.employeeType === 'CLT' ? 'férias' : 'ausência'}.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {userRequests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {request.type === 'vacation' ? 'Férias' : 'Ausência'}
                        </h3>
                        <StatusBadge status={request.status} />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="font-medium text-gray-900">Período</p>
                          <p>{format(request.startDate)} até {format(request.endDate)}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Duração</p>
                          <p>{request.days} dias corridos</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Solicitado em</p>
                          <p>{format(request.requestDate)}</p>
                        </div>
                      </div>

                      {request.type === 'vacation' && 'fractionType' in request && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium text-gray-900">Fracionamento: </span>
                          <span className="text-gray-600">
                            {request.fractionType === '30' ? '30 dias corridos' :
                             request.fractionType === '15-15' ? '15 + 15 dias' :
                             request.fractionType === '20-10' ? '20 + 10 dias' :
                             request.fractionType === '15-5-10' ? '15 + 5 + 10 dias' :
                             '14 + 9 + 7 dias'}
                          </span>
                        </div>
                      )}

                      {request.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-700">{request.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}