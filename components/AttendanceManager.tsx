
import React, { useState, useEffect } from 'react';
import { AttendanceEntry, Employee, Project, AuthState, AttendanceStatus } from '../types';

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
  const [status, setStatus] = useState<AttendanceStatus>('present');
  const [regularHours, setRegularHours] = useState(8);
  const [overtimeHours, setOvertimeHours] = useState(0);
  const [error, setError] = useState('');

  // Auto-adjust hours based on status
  useEffect(() => {
    switch(status) {
      case 'present': setRegularHours(8); break;
      case 'half-day': setRegularHours(4); break;
      case 'absent': 
      case 'leave': setRegularHours(0); break;
    }
  }, [status]);

  useEffect(() => {
    if (!isAdmin) setDate(today);
  }, [isAdmin, today]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!employeeId || !projectId || !date) return;

    const existingEntry = entries.find(entry => entry.employeeId === employeeId && entry.date === date);
    if (existingEntry) {
      setError(`Attendance for this employee has already been marked for today.`);
      return;
    }

    onAdd({ employeeId, projectId, date, status, regularHours, overtimeHours });
    setEmployeeId('');
    setProjectId('');
    setStatus('present');
    setOvertimeHours(0);
  };

  const visibleEntries = isAdmin ? entries : entries.filter(e => e.createdBy === auth.userId);

  const getStatusBadge = (s: AttendanceStatus) => {
    switch(s) {
      case 'present': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'half-day': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'absent': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'leave': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center">
          <span className="mr-2">📝</span> Log Daily Attendance
        </h3>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-black rounded-xl uppercase tracking-wider flex items-center">
            <span className="mr-2 text-lg">⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="lg:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Employee Name</label>
            <select
              value={employeeId}
              onChange={(e) => { setEmployeeId(e.target.value); setError(''); }}
              className="w-full border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all font-bold py-3"
              required
            >
              <option value="">Select Staff</option>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Project Site</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all font-bold py-3"
              required
            >
              <option value="">Select Project</option>
              {projects.map(proj => <option key={proj.id} value={proj.id}>{proj.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              max={today}
              disabled={!isAdmin}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border-slate-200 rounded-xl bg-slate-50 disabled:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 font-bold py-3"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Attendance Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
              className="w-full border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all font-bold py-3"
              required
            >
              <option value="present">Present (Full Day)</option>
              <option value="half-day">Half Day (4h)</option>
              <option value="absent">Absent</option>
              <option value="leave">Paid Leave</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">OT Hours</label>
            <input
              type="number"
              value={overtimeHours}
              min={0}
              onChange={(e) => setOvertimeHours(Number(e.target.value))}
              className="w-full border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all font-bold py-3"
              required
            />
          </div>

          <div className="lg:col-span-2 flex items-end">
            <button
              type="submit"
              className="w-full bg-slate-900 text-white py-3.5 rounded-xl hover:bg-black transition font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200"
            >
              Mark Attendance
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
           <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">
             Activity Registry
           </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Staff</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Project</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-center">Regular</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-center">OT</th>
                {isAdmin && <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleEntries.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="px-6 py-20 text-center text-slate-400 italic">
                    No attendance logs found for this period.
                  </td>
                </tr>
              ) : (
                visibleEntries.slice().reverse().map(entry => {
                  const emp = employees.find(e => e.id === entry.employeeId);
                  const proj = projects.find(p => p.id === entry.projectId);
                  return (
                    <tr key={entry.id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{emp?.name || 'Unknown'}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{emp?.role}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{proj?.name || '-'}</td>
                      <td className="px-6 py-4 text-slate-900 font-black text-sm">{entry.date}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase border ${getStatusBadge(entry.status)}`}>
                          {entry.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-600">{entry.regularHours}h</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${entry.overtimeHours > 0 ? 'bg-amber-100 text-amber-700' : 'text-slate-300'}`}>
                          {entry.overtimeHours}h
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => onDelete(entry.id)} className="text-rose-500 hover:text-rose-700 text-lg">🗑️</button>
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
