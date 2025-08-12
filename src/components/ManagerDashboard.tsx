import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRequests } from '../contexts/RequestsContext';
import { Request } from '../types';
import { Calendar, Clock, CheckCircle, XCircle, User, FileText } from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';
import { LoadingSpinner } from './LoadingSpinner';
import { showNotification } from '../utils/notifications';

export function ManagerDashboard() {
  const { user } = useAuth();
  const { requests, updateRequestStatus, isLoading, refreshRequests } = useRequests();
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [processingRequest, setProcessingRequest] = useState(false);

  // Atualizar dados periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      refreshRequests();
    }, 30000); // Atualiza a cada 30 segundos

    return () => clearInterval(interval);
  }, [refreshRequests]);

  const pendingRequests = requests.filter(request => request.status === 'pending');
  const recentRequests = requests
    .filter(request => request.status !== 'pending')
    .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime())
    .slice(0, 10);

  const handleAction = (request: Request, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(action);
    setShowConfirmDialog(true);
  };

  const confirmAction = async () => {
    if (!selectedRequest || !actionType) return;

    setProcessingRequest(true);
    try {
      const newStatus = actionType === 'approve' ? 'approved' : 'rejected';
      await updateRequestStatus(selectedRequest.id, newStatus);
    } catch (error) {
      // Error notification is handled in the context
    } finally {
      setProcessingRequest(false);
      setShowConfirmDialog(false);
      setSelectedRequest(null);
      setActionType(null);
    }
  };

  const getStatusIcon = (status: Request['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusText = (status: Request['status']) => {
    switch (status) {
      case 'approved':
        return 'Aprovada';
      case 'rejected':
        return 'Rejeitada';
      default:
        return 'Pendente';
    }
  };

  const getStatusColor = (status: Request['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <User className="w-6 h-6 mr-2" />
          Dashboard do Gestor
        </h2>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-900">{pendingRequests.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-green-800">Aprovadas</p>
                <p className="text-2xl font-bold text-green-900">
                  {requests.filter(r => r.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center">
              <XCircle className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-red-800">Rejeitadas</p>
                <p className="text-2xl font-bold text-red-900">
                  {requests.filter(r => r.status === 'rejected').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Solicitações Pendentes ({pendingRequests.length})
          </h3>

          {pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma solicitação pendente</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <User className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="font-medium text-gray-900">{request.employeeName}</span>
                        <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {request.type === 'vacation' ? 'Férias' : 'Ausência'}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{formatDate(request.startDate)} - {formatDate(request.endDate)}</span>
                        <span className="ml-4 font-medium">{request.days} dias</span>
                      </div>

                      {request.notes && (
                        <p className="text-sm text-gray-600 mt-2">
                          <strong>Observações:</strong> {request.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(request, 'approve')}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                        disabled={processingRequest}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Aprovar
                      </button>
                      <button
                        onClick={() => handleAction(request, 'reject')}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                        disabled={processingRequest}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Rejeitar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Requests */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Solicitações Recentes
          </h3>

          {recentRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma solicitação processada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRequests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <User className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="font-medium text-gray-900">{request.employeeName}</span>
                        <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {request.type === 'vacation' ? 'Férias' : 'Ausência'}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{formatDate(request.startDate)} - {formatDate(request.endDate)}</span>
                        <span className="ml-4 font-medium">{request.days} dias</span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1">{getStatusText(request.status)}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirm Dialog */}
      {showConfirmDialog && selectedRequest && actionType && (
        <ConfirmDialog
          isOpen={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          onConfirm={confirmAction}
          title={`${actionType === 'approve' ? 'Aprovar' : 'Rejeitar'} Solicitação`}
          message={`Tem certeza que deseja ${actionType === 'approve' ? 'aprovar' : 'rejeitar'} a solicitação de ${selectedRequest.type === 'vacation' ? 'férias' : 'ausência'} de ${selectedRequest.employeeName}?`}
          type={actionType === 'approve' ? 'info' : 'danger'}
          confirmText={actionType === 'approve' ? 'Aprovar' : 'Rejeitar'}
          isLoading={processingRequest}
        />
      )}
    </div>
  );
}