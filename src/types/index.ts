export interface User {
  id: string;
  email: string;
  name: string;
  role: 'employee' | 'manager' | 'hr';
  employeeType: 'CLT' | 'PJ';
  avatar?: string;
}

export interface VacationRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  days: number;
  fractionType: '30' | '15-15' | '20-10' | '15-5-10' | '14-9-7';
  status: 'pending' | 'approved' | 'rejected' | 'hr_notified';
  requestDate: string;
  approvalDate?: string;
  managerId?: string;
  notes?: string;
  type: 'vacation';
}

export interface AbsenceRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  days: number;
  status: 'pending' | 'approved' | 'rejected' | 'hr_notified';
  requestDate: string;
  approvalDate?: string;
  managerId?: string;
  notes?: string;
  type: 'absence';
}

export type Request = VacationRequest | AbsenceRequest;

export interface SupabaseRequest {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  days: number;
  tipo: 'ferias' | 'ausencia';
  fracao?: string;
  motivo?: string;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'rh_notificado';
  created_at: string;
  updated_at: string;
  approved_at?: string;
  approved_by?: string;
  profiles?: {
    name: string;
    email: string;
    employee_type?: string;
  };
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  type: 'vacation' | 'absence';
  status: string;
  employeeName: string;
}