import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Request, VacationRequest, AbsenceRequest } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { showNotification } from '../utils/notifications';

interface RequestsContextType {
  requests: Request[];
  addRequest: (request: Omit<Request, 'id' | 'requestDate'>) => Promise<void>;
  updateRequestStatus: (id: string, status: Request['status']) => Promise<void>;
  getRequestsByUser: (userId: string) => Request[];
  getPendingRequests: () => Request[];
  isLoading: boolean;
  refreshRequests: () => Promise<void>;
}

const RequestsContext = createContext<RequestsContextType | undefined>(undefined);

export function useRequests() {
  const context = useContext(RequestsContext);
  if (context === undefined) {
    throw new Error('useRequests must be used within a RequestsProvider');
  }
  return context;
}

interface RequestsProviderProps {
  children: ReactNode;
}

export function RequestsProvider({ children }: RequestsProviderProps) {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Função para converter dados do Supabase para o formato do frontend
  const convertSupabaseToRequest = (supabaseData: any): Request => {
    const baseRequest = {
      id: supabaseData.id,
      employeeId: supabaseData.user_id,
      employeeName: supabaseData.profiles?.name || 'Usuário',
      startDate: supabaseData.start_date,
      endDate: supabaseData.end_date,
      days: supabaseData.days,
      status: supabaseData.status,
      requestDate: supabaseData.created_at,
      approvalDate: supabaseData.approved_at,
      managerId: supabaseData.approved_by,
      notes: supabaseData.motivo,
      type: supabaseData.tipo === 'ferias' ? 'vacation' as const : 'absence' as const
    };

    if (supabaseData.tipo === 'ferias') {
      return {
        ...baseRequest,
        fractionType: supabaseData.fracao || '30'
      } as VacationRequest;
    }

    return baseRequest as AbsenceRequest;
  };

  // Carregar solicitações do usuário
  const loadUserRequests = async () => {
    if (!user || !isSupabaseConfigured) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('solicitacoes')
        .select(`
          *,
          profiles (
            name,
            email
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading user requests:', error);
        showNotification('Erro ao carregar solicitações', 'error');
        return;
      }

      const convertedRequests = data.map(convertSupabaseToRequest);
      setRequests(convertedRequests);
    } catch (error) {
      console.error('Error loading user requests:', error);
      showNotification('Erro ao carregar solicitações', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar todas as solicitações (para managers)
  const loadAllRequests = async () => {
    if (!user || !isSupabaseConfigured) return;
    if (user.role !== 'manager' && !user.name?.includes('Gestor')) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('solicitacoes')
        .select(`
          *,
          profiles (
            name,
            email,
            employee_type
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading all requests:', error);
        showNotification('Erro ao carregar solicitações', 'error');
        return;
      }

      const convertedRequests = data.map(convertSupabaseToRequest);
      setRequests(convertedRequests);
    } catch (error) {
      console.error('Error loading all requests:', error);
      showNotification('Erro ao carregar solicitações', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Configurar realtime subscription
  useEffect(() => {
    if (!user || !isSupabaseConfigured) return;

    // Carregar dados iniciais
    if (user.role === 'manager' || user.name?.includes('Gestor')) {
      loadAllRequests();
    } else {
      loadUserRequests();
    }

    // Configurar subscription para realtime
    const channel = supabase
      .channel('solicitacoes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'solicitacoes'
        },
        (payload) => {
          console.log('Realtime update:', payload);
          
          if (payload.eventType === 'INSERT') {
            // Nova solicitação criada
            const newRequest = convertSupabaseToRequest(payload.new);
            setRequests(prev => [newRequest, ...prev]);
            
            // Notificar managers sobre nova solicitação
            if (user.role === 'manager' || user.name?.includes('Gestor')) {
              showNotification(`Nova solicitação de ${newRequest.employeeName}`, 'info');
            }
          } else if (payload.eventType === 'UPDATE') {
            // Solicitação atualizada
            const updatedRequest = convertSupabaseToRequest(payload.new);
            setRequests(prev => 
              prev.map(req => req.id === updatedRequest.id ? updatedRequest : req)
            );
            
            // Notificar usuário sobre mudança de status
            if (payload.new.user_id === user.id) {
              const statusText = payload.new.status === 'aprovado' ? 'aprovada' : 
                               payload.new.status === 'rejeitado' ? 'rejeitada' : 'atualizada';
              showNotification(`Sua solicitação foi ${statusText}`, 'info');
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addRequest = async (requestData: Omit<Request, 'id' | 'requestDate'>) => {
    if (!user || !isSupabaseConfigured) {
      showNotification('Erro: usuário não autenticado ou Supabase não configurado', 'error');
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('solicitacoes')
        .insert([{
          user_id: user.id,
          start_date: requestData.startDate,
          end_date: requestData.endDate,
          days: requestData.days,
          tipo: requestData.type === 'vacation' ? 'ferias' : 'ausencia',
          fracao: requestData.type === 'vacation' && 'fractionType' in requestData ? requestData.fractionType : null,
          motivo: requestData.notes,
          status: 'pendente'
        }])
        .select(`
          *,
          profiles (
            name,
            email
          )
        `)
        .single();

      if (error) {
        console.error('Error creating request:', error);
        showNotification('Erro ao criar solicitação', 'error');
        throw new Error('Erro ao criar solicitação');
      }

      showNotification('Solicitação criada com sucesso!', 'success');
    } catch (error: any) {
      console.error('Error in addRequest:', error);
      showNotification(error.message || 'Erro ao criar solicitação', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateRequestStatus = async (id: string, status: Request['status']) => {
    if (!user || !isSupabaseConfigured) {
      showNotification('Erro: usuário não autenticado ou Supabase não configurado', 'error');
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('solicitacoes')
        .update({
          status,
          approved_at: status !== 'pending' ? new Date().toISOString() : null,
          approved_by: status !== 'pending' ? user.id : null
        })
        .eq('id', id)
        .select(`
          *,
          profiles (
            name,
            email
          )
        `)
        .single();

      if (error) {
        console.error('Error updating request status:', error);
        showNotification('Erro ao atualizar status da solicitação', 'error');
        throw new Error('Erro ao atualizar status da solicitação');
      }

      const statusText = status === 'approved' ? 'aprovada' : 
                        status === 'rejected' ? 'rejeitada' : 'atualizada';
      showNotification(`Solicitação ${statusText} com sucesso!`, 'success');
    } catch (error: any) {
      console.error('Error in updateRequestStatus:', error);
      showNotification(error.message || 'Erro ao atualizar status', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshRequests = async () => {
    if (user?.role === 'manager' || user?.name?.includes('Gestor')) {
      await loadAllRequests();
    } else {
      await loadUserRequests();
    }
  };

  const getRequestsByUser = (userId: string) => {
    return requests.filter(request => request.employeeId === userId);
  };

  const getPendingRequests = () => {
    return requests.filter(request => request.status === 'pending');
  };

  return (
    <RequestsContext.Provider value={{
      requests,
      addRequest,
      updateRequestStatus,
      getRequestsByUser,
      getPendingRequests,
      isLoading,
      refreshRequests
    }}>
      {children}
    </RequestsContext.Provider>
  );
}