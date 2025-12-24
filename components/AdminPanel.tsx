
import React, { useState } from 'react';
import { AttendanceEntry, AdvanceEntry, Employee, Project } from '../types';
import { auditLogs } from '../services/geminiService';
import { getAdminPassword, saveAdminPassword } from '../services/storage';

interface AdminPanelProps {
  attendance: AttendanceEntry[];
  advances: AdvanceEntry[];
  employees: Employee[];
  projects: Project[];
  onDeleteAttendance: (id: string) => void;
  onDeleteAdvance: (id: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  attendance, 
  advances, 
  employees, 
  projects,
  onDeleteAttendance,
  onDeleteAdvance 
}) => {
  const [auditResult, setAuditResult] = useState<any>(null);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Password change state
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState({ text: '', type: '' });

  const handleAudit = async () => {
    setLoadingAudit(true);
    try {
      const result = await auditLogs(attendance, advances, employees, projects);
      setAuditResult(result);
    } catch (error) {
      console.error(error);
      alert('Audit failed. Ensure your API key is configured correctly.');
    } finally {
      setLoadingAudit(false);
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg({ text: '', type: '' });

    const storedPwd = getAdminPassword();
    if (currentPwd !== storedPwd) {
      setPwdMsg({ text: 'Current password is incorrect.', type: 'error' });
      return;
    }

    if (newPwd !== confirmPwd) {
      setPwdMsg({ text: 'New passwords do not match.', type: 'error' });
      return;
    }

    if (newPwd.length < 6) {
      setPwdMsg({ text: 'Password must be at least 6 characters long.', type: 'error' });
      return;
    }

    saveAdminPassword(newPwd);
    setPwdMsg({ text: 'Admin password updated successfully!', type: 'success' });
    setCurrentPwd('');
    setNewPwd('');
    setConfirmPwd('');
  };

  const getRepeatedEntries = () => {
    const counts: Record<string, string[]> = {};
    attendance.forEach(a => {
      const key = `${a.employeeId}-${a.date}-${a.projectId}`;
      if (!counts[key]) counts[key] = [];
      counts[key].push(a.id);
    });
    return Object.entries(counts).filter(([_, ids]) => ids.length > 1);
  };

  const repeated = getRepeatedEntries();

  return (
    <div className="space-y-8 pb-12">
      {/* AI Audit Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800">System Integrity Audit</h3>
            <p className="text-slate-500 text-sm">Use AI to detect duplicates, excessive overtime, and payroll anomalies.</p>
          </div>
          <button
            onClick={handleAudit}
            disabled={loadingAudit}
            className={`px-6 py-2 rounded-lg font-bold transition flex items-center space-x-2 ${
              loadingAudit ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-black'
            }`}
          >
            {loadingAudit ? 'Auditing...' : '🚀 Start AI Audit'}
          </button>
        </div>

        {auditResult && (
          <div className="mt-6 p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <h4 className="font-bold text-slate-800">Audit Summary</h4>
            <p className="text-slate-700 leading-relaxed bg-white p-4 rounded-lg border border-slate-200">{auditResult.summary}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {auditResult.findings.map((f: any, i: number) => (
                <div key={i} className={`p-4 rounded-lg border flex flex-col ${
                  f.severity === 'high' ? 'bg-rose-50 border-rose-200 text-rose-800' :
                  f.severity === 'medium' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                  'bg-blue-50 border-blue-200 text-blue-800'
                }`}>
                  <div className="flex justify-between">
                    <span className="text-xs uppercase font-bold tracking-wider">{f.type}</span>
                    <span className="text-xs font-bold uppercase">{f.severity} Priority</span>
                  </div>
                  <p className="mt-2 text-sm font-medium">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Security Settings Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-2">Security Settings</h3>
        <p className="text-slate-500 text-sm mb-6">Change your administrator access password.</p>
        
        <form onSubmit={handlePasswordChange} className="max-w-md space-y-4">
          {pwdMsg.text && (
            <div className={`p-3 rounded-lg text-sm font-medium border ${
              pwdMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              {pwdMsg.text}
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Current Password</label>
            <input 
              type="password" 
              value={currentPwd} 
              onChange={(e) => setCurrentPwd(e.target.value)} 
              className="w-full border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">New Password</label>
            <input 
              type="password" 
              value={newPwd} 
              onChange={(e) => setNewPwd(e.target.value)} 
              className="w-full border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Confirm New Password</label>
            <input 
              type="password" 
              value={confirmPwd} 
              onChange={(e) => setConfirmPwd(e.target.value)} 
              className="w-full border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
              required 
            />
          </div>
          <button 
            type="submit" 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
          >
            Update Admin Password
          </button>
        </form>
      </div>

      {/* Repeated Entries Section */}
      {repeated.length > 0 && (
        <div className="bg-rose-50 p-6 rounded-xl border border-rose-200">
          <h3 className="text-rose-800 font-bold mb-4 flex items-center space-x-2">
            <span>⚠️ Repeated Entries Detected</span>
          </h3>
          <div className="space-y-3">
            {repeated.map(([key, ids]) => {
              const [empId, date] = key.split('-');
              const emp = employees.find(e => e.id === empId);
              return (
                <div key={key} className="bg-white p-4 rounded-lg border border-rose-100 flex justify-between items-center shadow-sm">
                  <div>
                    <span className="font-bold">{emp?.name}</span>
                    <span className="text-slate-500 mx-2">•</span>
                    <span className="text-slate-600">{date}</span>
                    <span className="ml-3 px-2 py-0.5 bg-rose-100 text-rose-600 text-xs rounded-full font-bold">
                      {ids.length} entries
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    {ids.map(id => (
                      <button
                        key={id}
                        onClick={() => onDeleteAttendance(id)}
                        className="text-xs bg-rose-600 text-white px-3 py-1 rounded hover:bg-rose-700"
                      >
                        Delete One
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Manual Controls Roster Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-4">Manual Records Control</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="border-t pt-4">
              <h4 className="text-slate-600 text-sm font-bold uppercase tracking-tight mb-2">Projects List</h4>
              <ul className="space-y-1">
                {projects.map(p => (
                  <li key={p.id} className="text-sm flex items-center justify-between">
                    <span>🏗️ {p.name} - <span className="text-slate-400">{p.location}</span></span>
                  </li>
                ))}
              </ul>
           </div>
           <div className="border-t pt-4">
              <h4 className="text-slate-600 text-sm font-bold uppercase tracking-tight mb-2">Employee Roster</h4>
              <ul className="space-y-1">
                {employees.map(e => (
                  <li key={e.id} className="text-sm">
                    👤 {e.name} ({e.role}) - <span className="text-slate-400">₹{e.monthlySalary.toLocaleString()}/mo</span>
                  </li>
                ))}
              </ul>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
