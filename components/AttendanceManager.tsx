
import React, { useState, useEffect } from 'react';
import { AttendanceEntry, Employee, Project, AuthState } from '../types';

interface AttendanceManagerProps {
  employees: Employee[];
  projects: Project[];
  entries: AttendanceEntry[];
  onAdd: (entry: Omit<AttendanceEntry, 'id' | 'timestamp' | 'createdBy'>) => void;
  onDelete: (id: string) => void;
  auth: AuthState;
}

const AttendanceManager: React.FC<AttendanceManagerProps> = ({ employees, projects, entries, onAdd, onDelete, auth }) => {
  const isAdmin = auth.role === 'admin';
  const today = new Date().toISOString().split('T')[0];
  
  const [employeeId, setEmployeeId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [date, setDate] = useState(today);
  const [regularHours, setRegularHours] = useState(8);
  const [overtimeHours, setOvertimeHours] = useState(0);
  const [error, setError] = useState('');

  // Force today's date if supervisor
  useEffect(() => {
    if (!isAdmin) {
      setDate(today);
    }
  }, [auth.role, isAdmin, today]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!employeeId || !projectId || !date) return;

    // Check for duplicate entry for this employee on this date
    // Check against ALL entries to prevent same-day double marking across different supervisors
    const existingEntry = entries.find(
      (entry) => entry.employeeId === employeeId && entry.date === date
    );

    if (existingEntry) {
      const empName = employees.find(emp => emp.id === employeeId)?.name || 'This employee';
      setError(`Attendance already marked for ${empName} on ${date}.`);
      return;
    }

    onAdd({ employeeId, projectId, date, regularHours, overtimeHours });
    setEmployeeId('');
    setProjectId('');
    // Reset date to today if supervisor, otherwise keep selected
    if (!isAdmin) setDate(today);
  };

  // Filter entries so supervisors only see their own logs
  const visibleEntries = isAdmin 
    ? entries 
    : entries.filter(e => e.createdBy === auth.userId);

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <span>Log Daily Attendance</span>
          </h3>
          {!isAdmin && (
            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded uppercase tracking-tighter">
              Restricted to Current Date Only
            </span>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-lg font-medium flex items-center animate-pulse">
            <span className="mr-2">⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Employee</label>
            <select
              value={employeeId}
              onChange={(e) => {
                setEmployeeId(e.target.value);
                setError('');
              }}
              className="w-full border-slate-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select Employee</option>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Project</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full border-slate-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select Project</option>
              {projects.map(proj => <option key={proj.id} value={proj.id}>{proj.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              max={today}
              disabled={!isAdmin}
              onChange={(e) => {
                setDate(e.target.value);
                setError('');
              }}
              className={`w-full border-slate-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 ${!isAdmin ? 'bg-slate-50 cursor-not-allowed text-slate-500' : ''}`}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Regular Hours (Max 8)</label>
            <input
              type="number"
              value={regularHours}
              max={8}
              min={0}
              onChange={(e) => setRegularHours(Number(e.target.value))}
              className="w-full border-slate-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Overtime Hours</label>
            <input
              type="number"
              value={overtimeHours}
              min={0}
              onChange={(e) => setOvertimeHours(Number(e.target.value))}
              className="w-full border-slate-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium shadow-md"
            >
              Submit Attendance
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
           <h4 className="text-sm font-bold text-slate-600 uppercase tracking-widest">
             {isAdmin ? 'All Attendance Logs' : 'My Recent Logs'}
           </h4>
           {!isAdmin && <span className="text-[10px] text-slate-400 font-bold uppercase italic">Read-only after submission</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Project</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-center">Hours</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-center">OT</th>
                {isAdmin && <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleEntries.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="px-6 py-12 text-center text-slate-400 font-medium">
                    No records found matching your profile.
                  </td>
                </tr>
              ) : (
                visibleEntries.slice().reverse().slice(0, 50).map(entry => {
                  const emp = employees.find(e => e.id === entry.employeeId);
                  const proj = projects.find(p => p.id === entry.projectId);
                  return (
                    <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{emp?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-slate-600">{proj?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{entry.date}</td>
                      <td className="px-6 py-4 text-center">{entry.regularHours}h</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs ${entry.overtimeHours > 0 ? 'bg-amber-100 text-amber-700 font-bold' : 'text-slate-400'}`}>
                          {entry.overtimeHours}h
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => onDelete(entry.id)}
                            className="text-rose-600 hover:text-rose-800 text-sm font-semibold transition"
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceManager;
