
import { AttendanceEntry, AdvanceEntry, Employee, Project } from '../types';
import { INITIAL_EMPLOYEES, INITIAL_PROJECTS } from '../constants';

const KEYS = {
  ATTENDANCE: 'ft_attendance',
  ADVANCES: 'ft_advances',
  EMPLOYEES: 'ft_employees',
  PROJECTS: 'ft_projects',
  ADMIN_PWD: 'ft_admin_password',
};

export const getAttendance = (): AttendanceEntry[] => {
  const data = localStorage.getItem(KEYS.ATTENDANCE);
  return data ? JSON.parse(data) : [];
};

export const saveAttendance = (entries: AttendanceEntry[]) => {
  localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(entries));
};

export const getAdvances = (): AdvanceEntry[] => {
  const data = localStorage.getItem(KEYS.ADVANCES);
  return data ? JSON.parse(data) : [];
};

export const saveAdvances = (entries: AdvanceEntry[]) => {
  localStorage.setItem(KEYS.ADVANCES, JSON.stringify(entries));
};

export const getEmployees = (): Employee[] => {
  const data = localStorage.getItem(KEYS.EMPLOYEES);
  return data ? JSON.parse(data) : INITIAL_EMPLOYEES;
};

export const saveEmployees = (employees: Employee[]) => {
  localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(employees));
};

export const getProjects = (): Project[] => {
  const data = localStorage.getItem(KEYS.PROJECTS);
  return data ? JSON.parse(data) : INITIAL_PROJECTS;
};

export const saveProjects = (projects: Project[]) => {
  localStorage.setItem(KEYS.PROJECTS, JSON.stringify(projects));
};

export const getAdminPassword = (): string => {
  return localStorage.getItem(KEYS.ADMIN_PWD) || 'admin123';
};

export const saveAdminPassword = (password: string) => {
  localStorage.setItem(KEYS.ADMIN_PWD, password);
};
