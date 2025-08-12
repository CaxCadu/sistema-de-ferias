import React, { useState } from 'react';
import { Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRequests } from '../contexts/RequestsContext';
import { LoadingSpinner } from './LoadingSpinner';
import { showNotification } from '../utils/notifications';

interface RequestFormProps {
  onSuccess: () => void;
}

const VACATION_FRACTIONS = [
  { value: '30', label: '30 dias corridos', days: 30 },
  { value: '15-15', label: '15 + 15 dias', days: 30 },
  { value: '20-10', label: '20 + 10 dias', days: 30 },
  { value: '15-5-10', label: '15 + 5 + 10 dias', days: 30 },
  { value: '14-9-7', label: '14 + 9 + 7 dias', days: 30 }
];

export function RequestForm({ onSuccess }: RequestFormProps) {
  const { user } = useAuth();
  const { addRequest } = useRequests();
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    fractionType: '30' as any,
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.startDate) {
      newErrors.startDate = 'Data de início é obrigatória';
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'Data de fim é obrigatória';
    }
    
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        newErrors.startDate = 'Data de início não pode ser no passado';
      }
      
      if (endDate < startDate) {
        newErrors.endDate = 'Data de fim deve ser posterior à data de início';
      }
      
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      if (diffDays > 365) {
        newErrors.endDate = 'Período não pode exceder 365 dias';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const days = calculateDays(formData.startDate, formData.endDate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!validateForm()) {
      showNotification('Por favor, corrija os erros no formulário', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData = {
        employeeId: user.id,
        employeeName: user.name,
        startDate: formData.startDate,
        endDate: formData.endDate,
        days,
        status: 'pending' as const,
        notes: formData.notes,
        type: user.employeeType === 'CLT' ? 'vacation' as const : 'absence' as const,
        ...(user.employeeType === 'CLT' && { fractionType: formData.fractionType })
      };

      await addRequest(requestData);

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onSuccess();
      }, 2000);
    } catch (error: any) {
      // Error notification is handled in the context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-green-800 mb-2">
            Solicitação enviada com sucesso!
          </h3>
          <p className="text-green-600">
            Sua solicitação foi enviada para aprovação da gestão.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {user?.employeeType === 'CLT' ? 'Solicitar Férias' : 'Registrar Ausência'}
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {user?.employeeType === 'CLT' 
              ? 'Preencha os dados para solicitar suas férias'
              : 'Informe o período de ausência'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {user?.employeeType === 'CLT' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fracionamento das Férias
              </label>
              <select
                value={formData.fractionType}
                onChange={(e) => handleFieldChange('fractionType', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                {VACATION_FRACTIONS.map(fraction => (
                  <option key={fraction.value} value={fraction.value}>
                    {fraction.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Início
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => handleFieldChange('startDate', e.target.value)}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.startDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Fim
              </label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => handleFieldChange('endDate', e.target.value)}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.endDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
              )}
            </div>
          </div>

          {days > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-blue-800 font-medium">
                  Total: {days} dias corridos
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações (opcional)
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Adicione observações sobre sua solicitação..."
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Importante:</p>
                <p>
                  {user?.employeeType === 'CLT' 
                    ? 'Sua solicitação será enviada para aprovação da gestão. Após aprovação, o time de P&C será notificado automaticamente.'
                    : 'Sua ausência será comunicada às pessoas diretamente impactadas. Após confirmação, o time de P&C será notificado.'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onSuccess}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.startDate || !formData.endDate}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" color="white" className="mr-2" />
                  Enviando...
                </>
              ) : (
                'Enviar Solicitação'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}