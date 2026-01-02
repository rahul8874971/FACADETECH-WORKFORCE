
import React, { useState, useMemo } from 'react';
import { PayoutEntry, Employee, AttendanceEntry, AdvanceEntry, AuthState } from '../types';

interface PayoutManagerProps {
  employees: Employee[];
  attendance: AttendanceEntry[];
  advances: AdvanceEntry[];
  payouts: PayoutEntry[];
  onAdd: (entry: Omit<PayoutEntry, 'id' | 'timestamp'>) => void;
  onDelete: (id: string) => void;
  auth: AuthState;
}

const PayoutManager: React.FC<PayoutManagerProps> = ({ employees, attendance, advances, payouts, onAdd, onDelete, auth }) => {
  const isAdmin = auth.role === 'admin';
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [employeeId, setEmployeeId] = useState('');
  const [paymentMode, setPaymentMode] = useState<'cash' | 'bank' | 'cheque'>('bank');
  const [reference, setReference] = useState('');

  const payrollData = useMemo(() => {
    return employees.map(emp => {
      const monthAtt = attendance.filter(a => a.employeeId === emp.id && a.date.startsWith(selectedMonth));
      const monthAdv = advances.filter(a => a.employeeId === emp.id && a.date.startsWith(selectedMonth));
      const alreadyPaid = payouts.filter(p => p.employeeId === emp.id && p.month === selectedMonth)
                                .reduce((sum, p) => sum + p.amount, 0);

      const dailyRate = emp.monthlySalary / 30;
      const hourlyRate = dailyRate / 8;
      
      const earned = monthAtt.reduce((sum, a) => {
        const base = (a.regularHours / 8) * dailyRate;
        const ot = a.overtimeHours * hourlyRate;
        return sum + base + ot;
      }, 0);

      const totalAdv = monthAdv.reduce((sum, a) => sum + a.amount, 0);
      const netPayable = Math.max(0, Math.round(earned - totalAdv - alreadyPaid));

      return { ...emp, earned, totalAdv, alreadyPaid, netPayable };
    });
  }, [employees, attendance, advances, payouts, selectedMonth]);

  const selectedEmpData = payrollData.find(d => d.id === employeeId);

  const handleDisburse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !employeeId || !selectedEmpData || selectedEmpData.netPayable <= 0) return;

    onAdd({
      employeeId,
      amount: selectedEmpData.netPayable,
      date: new Date().toISOString().split('T')[0],
      month: selectedMonth,
      paymentMode,
      reference
    });

    setEmployeeId('');
    setReference('');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payout Form */}
        <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-1 h-fit ${!isAdmin ? 'opacity-70 grayscale' : ''}`}>
          <h3 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-tight">Disburse Salary</h3>
          
          <div className="mb-6">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Payroll Month</label>
            <input 
              type="month" 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full border-slate-200 rounded-xl bg-slate-50 font-bold py-3 px-4"
            />
          </div>

          <form onSubmit={handleDisburse} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Select Employee</label>
              <select
                disabled={!isAdmin}
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full border-slate-200 rounded-xl bg-slate-50 font-bold py-3 px-4 disabled:bg-slate-100"
                required
              >
                <option value="">Choose Staff</option>
                {payrollData.filter(d => d.netPayable > 0).map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} (₹{emp.netPayable.toLocaleString()})</option>
                ))}
              </select>
            </div>

            {selectedEmpData && (
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-2 animate-fadeIn">
                <div className="flex justify-between text-xs font-bold text-blue-800">
                  <span>Gross Earned:</span>
                  <span>₹{Math.round(selectedEmpData.earned).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-rose-600">
                  <span>Deductions:</span>
                  <span>- ₹{selectedEmpData.totalAdv.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-blue-200 flex justify-between font-black text-slate-900">
                  <span>Net Payable:</span>
                  <span>₹{selectedEmpData.netPayable.toLocaleString()}</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {['bank', 'cash', 'cheque'].map(mode => (
                  <button
                    key={mode}
                    type="button"
                    disabled={!isAdmin}
                    onClick={() => setPaymentMode(mode as any)}
                    className={`py-2 rounded-lg text-[10px] font-black uppercase transition-all border ${paymentMode === mode ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-500 border-slate-200'}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Ref / Notes</label>
              <input 
                type="text" 
                disabled={!isAdmin}
                placeholder="Transaction ID or Remark"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full border-slate-200 rounded-xl bg-slate-50 font-bold py-3 px-4 disabled:bg-slate-100"
              />
            </div>

            <button
              type="submit"
              disabled={!isAdmin || !employeeId || selectedEmpData?.netPayable === 0}
              className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-100 disabled:bg-slate-200 disabled:shadow-none transition-all"
            >
              {isAdmin ? 'Confirm Disbursement' : 'Admin Only Feature'}
            </button>
          </form>
        </div>

        {/* Payroll Summary Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 lg:col-span-2 overflow-hidden">
          <div className="p-5 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
             <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Monthly Payroll Ledger</h4>
             <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase">{new Date(selectedMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase">
                  <th className="px-6 py-4">Staff</th>
                  <th className="px-6 py-4">Earned</th>
                  <th className="px-6 py-4">Advances</th>
                  <th className="px-6 py-4">Paid</th>
                  <th className="px-6 py-4 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {payrollData.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{emp.name}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">{emp.role}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-600">₹{Math.round(emp.earned).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-bold text-rose-500">₹{emp.totalAdv.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-bold text-emerald-600">₹{emp.alreadyPaid.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-black text-slate-900">
                      {emp.netPayable > 0 ? (
                        <span className="text-blue-600">₹{emp.netPayable.toLocaleString()}</span>
                      ) : (
                        <span className="text-emerald-500 flex items-center justify-end">
                          <span className="mr-1">✅</span> Settled
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* History Registry */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
          <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Historical Payout Registry</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase">
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Month</th>
                <th className="px-6 py-4 text-center">Mode</th>
                <th className="px-6 py-4 text-center">Amount</th>
                <th className="px-6 py-4">Reference</th>
                {isAdmin && <th className="px-6 py-4 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payouts.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="px-6 py-12 text-center text-slate-300 italic">No disbursement history recorded yet.</td>
                </tr>
              ) : (
                payouts.slice().reverse().map(p => {
                  const emp = employees.find(e => e.id === p.employeeId);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{emp?.name || 'Unknown'}</p>
                      </td>
                      <td className="px-6 py-4 text-xs font-black text-slate-500 uppercase">{new Date(p.month + '-01').toLocaleString('default', { month: 'short', year: 'numeric' })}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-[9px] font-black uppercase text-slate-600">{p.paymentMode}</span>
                      </td>
                      <td className="px-6 py-4 text-center font-black text-emerald-600">₹{p.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-xs text-slate-400 truncate max-w-[150px]">{p.reference || '-'}</td>
                      {isAdmin && (
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => onDelete(p.id)} className="text-rose-400 hover:text-rose-600 transition">🗑️</button>
                        </td>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PayoutManager;
