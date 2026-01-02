
import React, { useState, useMemo } from 'react';
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
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Policy: 50% of monthly salary is the cap
  const ADVANCE_CAP_PERCENTAGE = 0.5;

  const selectedEmployee = useMemo(() => 
    employees.find(e => e.id === employeeId), 
    [employeeId, employees]
  );

  // Calculate total advances for this employee in the selected month
  const monthlyUtilization = useMemo(() => {
    if (!employeeId || !date) return 0;
    const monthYear = date.substring(0, 7); // YYYY-MM
    return entries
      .filter(e => e.employeeId === employeeId && e.date.startsWith(monthYear))
      .reduce((sum, e) => sum + e.amount, 0);
  }, [employeeId, date, entries]);

  const currentMonthTotal = useMemo(() => {
    const now = new Date().toISOString().substring(0, 7);
    return entries
      .filter(e => e.date.startsWith(now))
      .reduce((sum, e) => sum + e.amount, 0);
  }, [entries]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!employeeId || !amount || amount <= 0 || !date) return;

    if (selectedEmployee) {
      const cap = selectedEmployee.monthlySalary * ADVANCE_CAP_PERCENTAGE;
      if (monthlyUtilization + amount > cap) {
        setError(`Limit Exceeded: Total monthly advance for ${selectedEmployee.name} cannot exceed ₹${cap.toLocaleString()} (50% of salary). Currently used: ₹${monthlyUtilization.toLocaleString()}.`);
        return;
      }
    }

    onAdd({ employeeId, amount, date, reason });
    setEmployeeId('');
    setAmount('');
    setReason('');
  };

  const visibleEntries = useMemo(() => {
    const base = isAdmin ? entries : entries.filter(e => e.createdBy === auth.userId);
    if (!searchTerm) return base;
    return base.filter(entry => {
      const emp = employees.find(e => e.id === entry.employeeId);
      return emp?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
             entry.reason.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [entries, isAdmin, auth.userId, searchTerm, employees]);

  const getRiskColor = (amt: number, salary: number) => {
    const ratio = amt / salary;
    if (ratio > 0.4) return 'text-rose-600 bg-rose-50 border-rose-100';
    if (ratio > 0.2) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-emerald-600 bg-emerald-50 border-emerald-100';
  };

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Company Liquidity</p>
          <h4 className="text-2xl font-black">₹{currentMonthTotal.toLocaleString()}</h4>
          <p className="text-[10px] text-slate-500 mt-2 font-medium">Total advances disbursed this month</p>
        </div>
        
        {selectedEmployee && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 md:col-span-2 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Limit Utilization: {selectedEmployee.name}</p>
                <h4 className="text-xl font-black text-slate-800">
                  ₹{monthlyUtilization.toLocaleString()} / ₹{(selectedEmployee.monthlySalary * ADVANCE_CAP_PERCENTAGE).toLocaleString()}
                </h4>
              </div>
              <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase border ${getRiskColor(monthlyUtilization, selectedEmployee.monthlySalary)}`}>
                {Math.round((monthlyUtilization / selectedEmployee.monthlySalary) * 100)}% Used
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${monthlyUtilization / (selectedEmployee.monthlySalary * ADVANCE_CAP_PERCENTAGE) > 0.8 ? 'bg-rose-500' : 'bg-blue-600'}`}
                style={{ width: `${Math.min(100, (monthlyUtilization / (selectedEmployee.monthlySalary * ADVANCE_CAP_PERCENTAGE)) * 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold mb-4 text-slate-800 flex items-center">
          <span className="mr-2">📝</span> New Advance Request
        </h3>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl font-medium flex items-start animate-shake">
            <span className="mr-3 text-xl">🚫</span> 
            <div>
              <p className="font-bold">Policy Violation</p>
              <p className="mt-1 opacity-80">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Employee</label>
            <select
              value={employeeId}
              onChange={(e) => {
                setEmployeeId(e.target.value);
                setError('');
              }}
              className="w-full border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all font-medium py-2.5"
              required
            >
              <option value="">Select Employee</option>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value === '' ? '' : Number(e.target.value));
                setError('');
              }}
              placeholder="0.00"
              className="w-full border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all font-bold py-2.5"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setError('');
              }}
              className="w-full border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all font-medium py-2.5"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reason / Notes</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Internal notes..."
              className="w-full border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all font-medium py-2.5"
            />
          </div>
          <div className="md:col-span-2 lg:col-span-4 flex justify-end pt-2 border-t border-slate-50">
            <button
              type="submit"
              className="bg-blue-600 text-white px-10 py-3 rounded-xl hover:bg-blue-700 transition font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200"
            >
              Disburse Advance
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
           <div className="flex items-center space-x-2">
             <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">
               Transaction Registry
             </h4>
             <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-bold rounded-full">{visibleEntries.length}</span>
           </div>
           
           <div className="relative w-full sm:w-64">
             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
             <input 
               type="text" 
               placeholder="Search by name or reason..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-9 pr-4 py-2 text-xs border-slate-200 rounded-full focus:ring-blue-500"
             />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Amount</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Risk Category</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes</th>
                {isAdmin && <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleEntries.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="px-6 py-16 text-center text-slate-400 font-medium italic">
                    No transactions match your search criteria.
                  </td>
                </tr>
              ) : (
                visibleEntries.slice().reverse().map(entry => {
                  const emp = employees.find(e => e.id === entry.employeeId);
                  const riskRatio = emp ? entry.amount / emp.monthlySalary : 0;
                  return (
                    <tr key={entry.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{emp?.name || 'Unknown'}</p>
                        <p className="text-[10px] text-slate-400 font-medium uppercase">{emp?.role}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-bold text-sm">{entry.date}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-slate-900 font-black">₹{entry.amount.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase border ${getRiskColor(entry.amount, emp?.monthlySalary || 1000000)}`}>
                          {riskRatio > 0.4 ? '🚨 High Risk' : riskRatio > 0.2 ? '⚠️ Medium' : '✅ Low Risk'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 italic text-xs max-w-xs truncate">{entry.reason || '-'}</td>
                      {isAdmin && (
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => onDelete(entry.id)}
                            className="text-rose-500 hover:text-rose-700 opacity-0 group-hover:opacity-100 transition p-2"
                            title="Delete Transaction"
                          >
                            🗑️
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
