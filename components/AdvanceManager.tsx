
import React, { useState } from 'react';
import { AdvanceEntry, Employee, AuthState } from '../types';

interface AdvanceManagerProps {
  employees: Employee[];
  entries: AdvanceEntry[];
  onAdd: (entry: Omit<AdvanceEntry, 'id' | 'timestamp' | 'createdBy'>) => void;
  onDelete: (id: string) => void;
  auth: AuthState;
}

const AdvanceManager: React.FC<AdvanceManagerProps> = ({ employees, entries, onAdd, onDelete, auth }) => {
  const isAdmin = auth.role === 'admin';
  const [employeeId, setEmployeeId] = useState('');
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!employeeId || amount <= 0 || !date) return;

    // Check for duplicate advance entry for this employee on this date
    // Checked against ALL entries globally
    const existingAdvance = entries.find(
      (entry) => entry.employeeId === employeeId && entry.date === date
    );

    if (existingAdvance) {
      const empName = employees.find(emp => emp.id === employeeId)?.name || 'This employee';
      setError(`An advance for ${empName} has already been recorded on ${date}.`);
      return;
    }

    onAdd({ employeeId, amount, date, reason });
    setEmployeeId('');
    setAmount(0);
    setReason('');
  };

  // Filter entries so supervisors only see their own recorded advances
  const visibleEntries = isAdmin 
    ? entries 
    : entries.filter(e => e.createdBy === auth.userId);

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold mb-4 tracking-tight">Record Advance Payment</h3>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-lg font-medium flex items-center animate-pulse">
            <span className="mr-2">💸</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Employee</label>
            <select
              value={employeeId}
              onChange={(e) => {
                setEmployeeId(e.target.value);
                setError('');
              }}
              className="w-full border-slate-300 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500 transition"
              required
            >
              <option value="">Select Employee</option>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full border-slate-300 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500 transition"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setError('');
              }}
              className="w-full border-slate-300 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500 transition"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reason (Optional)</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Family Emergency"
              className="w-full border-slate-300 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500 transition"
            />
          </div>
          <div className="md:col-span-2 lg:col-span-4 flex justify-end">
            <button
              type="submit"
              className="bg-emerald-600 text-white px-8 py-2 rounded-lg hover:bg-emerald-700 transition font-bold shadow-lg shadow-emerald-100"
            >
              Record Advance
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
           <h4 className="text-sm font-bold text-slate-600 uppercase tracking-widest">
             {isAdmin ? 'All Advance Records' : 'My Recorded Advances'}
           </h4>
           {!isAdmin && <span className="text-[10px] text-slate-400 font-bold uppercase italic">Locked after submission</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Reason</th>
                {isAdmin && <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleEntries.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="px-6 py-12 text-center text-slate-400 font-medium">
                    No advance records to display.
                  </td>
                </tr>
              ) : (
                visibleEntries.slice().reverse().map(entry => {
                  const emp = employees.find(e => e.id === entry.employeeId);
                  return (
                    <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{emp?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{entry.date}</td>
                      <td className="px-6 py-4 text-emerald-600 font-bold">₹{entry.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-slate-500 italic text-sm">{entry.reason || '-'}</td>
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

export default AdvanceManager;
