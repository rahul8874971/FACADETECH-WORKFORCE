
export interface Employee {
  id: string;
  name: string;
  role: string;
  monthlySalary: number; // Changed from hourlyRate to monthlySalary
  joinDate: string;
  photo?: string;
  isSupervisor: boolean;
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
  regularHours: number;
  overtimeHours: number;
  timestamp: number;
  createdBy?: string; // Tracks the userId of the creator
}

export interface AdvanceEntry {
  id: string;
  employeeId: string;
  amount: number;
  date: string;
  reason: string;
  timestamp: number;
  createdBy?: string; // Tracks the userId of the creator
}

export type UserRole = 'admin' | 'supervisor' | null;

export interface AuthState {
  role: UserRole;
  userId?: string;
  userName?: string;
}

export type AppView = 'dashboard' | 'attendance' | 'advances' | 'admin' | 'projects' | 'employees';
