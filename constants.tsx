
import React from 'react';
import { Employee, Project } from './types';

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'emp1', name: 'John Doe', role: 'Foreman', monthlySalary: 45000, joinDate: '2023-01-01', isSupervisor: true },
  { id: 'emp2', name: 'Alice Smith', role: 'Installer', monthlySalary: 30000, joinDate: '2023-03-15', isSupervisor: false },
  { id: 'emp3', name: 'Bob Johnson', role: 'Glass Cutter', monthlySalary: 35000, joinDate: '2023-05-20', isSupervisor: false },
  { id: 'emp4', name: 'Sarah Wilson', role: 'Technician', monthlySalary: 28000, joinDate: '2023-06-10', isSupervisor: false },
];

export const INITIAL_PROJECTS: Project[] = [
  { id: 'proj1', name: 'Skyline Tower', location: 'Downtown' },
  { id: 'proj2', name: 'Marina Bay Hotel', location: 'Coastal Area' },
  { id: 'proj3', name: 'Tech Park Plaza', location: 'Suburb' },
];

export const COLORS = {
  primary: 'blue-600',
  secondary: 'slate-600',
  accent: 'indigo-500',
  success: 'emerald-500',
  danger: 'rose-500',
  warning: 'amber-500',
};
