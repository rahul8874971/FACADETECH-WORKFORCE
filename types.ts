
export type AttendanceStatus = 'present' | 'half-day' | 'absent' | 'leave';

export interface Employee {
  id: string;
  name: string;
  role: string;
  monthlySalary: number;
  joinDate: string;
  photo?: string;
  isSupervisor: boolean;
  isManager?: boolean; // New: designated manager with report access
  userId?: string;
  password?: string;
  initialAdvance?: number;
}

export interface Project {
  id: string;
  name: string;
  location: string;
}

export interface AttendanceEntry {
  id: string;
  employeeId: string;
  projectId: string;
  date: string;
  status: AttendanceStatus;
  regularHours: number;
  overtimeHours: number;
  timestamp: number;
  createdBy?: string;
}

export interface AdvanceEntry {
  id: string;
  employeeId: string;
  amount: number;
  date: string;
  reason: string;
  timestamp: number;
  createdBy?: string;
}

export interface PayoutEntry {
  id: string;
  employeeId: string;
  amount: number;
  date: string;
  month: string; // YYYY-MM
  paymentMode: 'cash' | 'bank' | 'cheque';
  reference?: string;
  timestamp: number;
}

export type UserRole = 'admin' | 'manager' | 'supervisor' | null;

export interface AuthState {
  role: UserRole;
  userId?: string;
  userName?: string;
}

export type AppView = 'dashboard' | 'attendance' | 'advances' | 'payouts' | 'admin' | 'projects' | 'employees';
