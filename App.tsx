
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import AttendanceManager from './components/AttendanceManager';
import AdvanceManager from './components/AdvanceManager';
import AdminPanel from './components/AdminPanel';
import EmployeeManagement from './components/EmployeeManagement';
import ProjectManagement from './components/ProjectManagement';
import PayoutManager from './components/PayoutManager';
import Login from './components/Login';
import { AppView, AttendanceEntry, AdvanceEntry, Employee, Project, AuthState, PayoutEntry } from './types';
import * as storage from './services/storage';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({ role: null });
  const [view, setView] = useState<AppView>('dashboard');
  
  // State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [attendance, setAttendance] = useState<AttendanceEntry[]>([]);
  const [advances, setAdvances] = useState<AdvanceEntry[]>([]);
  const [payouts, setPayouts] = useState<PayoutEntry[]>([]);

  // Load Initial Data
  useEffect(() => {
    setEmployees(storage.getEmployees());
    setProjects(storage.getProjects());
    setAttendance(storage.getAttendance());
    setAdvances(storage.getAdvances());
    // Use a custom key for payouts since it's a new feature
    const savedPayouts = localStorage.getItem('ft_payouts');
    if (savedPayouts) setPayouts(JSON.parse(savedPayouts));
  }, []);

  // Sync with Storage
  useEffect(() => {
    if (employees.length > 0) storage.saveEmployees(employees);
  }, [employees]);
  useEffect(() => {
    storage.saveProjects(projects);
  }, [projects]);
  useEffect(() => {
    storage.saveAttendance(attendance);
  }, [attendance]);
  useEffect(() => {
    storage.saveAdvances(advances);
  }, [advances]);
  useEffect(() => {
    localStorage.setItem('ft_payouts', JSON.stringify(payouts));
  }, [payouts]);

  // Actions
  const addAttendance = (entry: Omit<AttendanceEntry, 'id' | 'timestamp' | 'createdBy'>) => {
    const newEntry: AttendanceEntry = {
      ...entry,
      id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      createdBy: auth.userId
    };
    setAttendance(prev => [...prev, newEntry]);
  };

  const deleteAttendance = (id: string) => {
    setAttendance(prev => prev.filter(a => a.id !== id));
  };

  const addAdvance = (entry: Omit<AdvanceEntry, 'id' | 'timestamp' | 'createdBy'>) => {
    const newEntry: AdvanceEntry = {
      ...entry,
      id: `adv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      createdBy: auth.userId
    };
    setAdvances(prev => [...prev, newEntry]);
  };

  const deleteAdvance = (id: string) => {
    setAdvances(prev => prev.filter(a => a.id !== id));
  };

  const addPayout = (entry: Omit<PayoutEntry, 'id' | 'timestamp'>) => {
    const newEntry: PayoutEntry = {
      ...entry,
      id: `pay-${Date.now()}`,
      timestamp: Date.now()
    };
    setPayouts(prev => [...prev, newEntry]);
  };

  const deletePayout = (id: string) => {
    setPayouts(prev => prev.filter(p => p.id !== id));
  };

  const addEmployee = (data: Omit<Employee, 'id'>) => {
    const newEmp: Employee = { ...data, id: `emp-${Date.now()}` };
    setEmployees(prev => [...prev, newEmp]);
    if (data.initialAdvance && data.initialAdvance > 0) {
      addAdvance({
        employeeId: newEmp.id,
        amount: data.initialAdvance,
        date: data.joinDate,
        reason: 'Initial onboarding advance'
      });
    }
  };

  const updateEmployee = (emp: Employee) => {
    setEmployees(prev => prev.map(e => e.id === emp.id ? emp : e));
  };

  const deleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
  };

  const addProject = (data: Omit<Project, 'id'>) => {
    setProjects(prev => [...prev, { ...data, id: `proj-${Date.now()}` }]);
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const handleLogout = () => {
    setAuth({ role: null });
    setView('dashboard');
  };

  if (!auth.role) {
    return <Login employees={employees} onLogin={setAuth} />;
  }

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return (
          <Dashboard 
            attendance={attendance} 
            advances={advances} 
            employees={employees} 
            projects={projects}
            auth={auth}
          />
        );
      case 'attendance':
        return (
          <AttendanceManager 
            employees={employees} 
            projects={projects} 
            entries={attendance} 
            onAdd={addAttendance} 
            onDelete={deleteAttendance} 
            auth={auth}
          />
        );
      case 'advances':
        return (
          <AdvanceManager 
            employees={employees} 
            entries={advances} 
            onAdd={addAdvance} 
            onDelete={deleteAdvance} 
            auth={auth}
          />
        );
      case 'payouts':
        return (
          <PayoutManager
            employees={employees}
            attendance={attendance}
            advances={advances}
            payouts={payouts}
            onAdd={addPayout}
            onDelete={deletePayout}
            auth={auth}
          />
        );
      case 'admin':
        return (
          <AdminPanel 
            attendance={attendance} 
            advances={advances} 
            employees={employees} 
            projects={projects}
            onDeleteAttendance={deleteAttendance}
            onDeleteAdvance={deleteAdvance}
          />
        );
      case 'projects':
        return (
          <ProjectManagement 
            projects={projects} 
            onAdd={addProject} 
            onDelete={deleteProject} 
          />
        );
      case 'employees':
        return (
          <EmployeeManagement 
            employees={employees} 
            onAdd={addEmployee} 
            onUpdate={updateEmployee} 
            onDelete={deleteEmployee} 
          />
        );
      default:
        return <div>View not implemented.</div>;
    }
  };

  return (
    <Layout activeView={view} onNavigate={setView} auth={auth} onLogout={handleLogout}>
      {renderContent()}
    </Layout>
  );
};

export default App;
