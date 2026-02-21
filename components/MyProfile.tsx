
import React from 'react';
import { Employee, AttendanceEntry, AdvanceEntry, PayoutEntry, AuthState } from '../types';

interface MyProfileProps {
  auth: AuthState;
  employees: Employee[];
  attendance: AttendanceEntry[];
  advances: AdvanceEntry[];
  payouts: PayoutEntry[];
}

const MyProfile: React.FC<MyProfileProps> = ({ auth, employees, attendance, advances, payouts }) => {
  const employee = employees.find(e => e.id === auth.userId);
  
  if (!employee) {
    return (
      <div className="p-8 bg-white rounded-2xl shadow-sm border border-slate-200 text-center">
        <p className="text-slate-500 font-bold">Employee profile not found.</p>
      </div>
    );
  }

  const myAttendance = attendance.filter(a => a.employeeId === employee.id);
  const myAdvances = advances.filter(a => a.employeeId === employee.id);
  const myPayouts = payouts.filter(p => p.employeeId === employee.id);

  const totalAdvances = myAdvances.reduce((sum, adv) => sum + adv.amount, 0);
  const totalPayouts = myPayouts.reduce((sum, pay) => sum + pay.amount, 0);
  
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthAttendance = myAttendance.filter(a => a.date.startsWith(currentMonth));
  const daysPresent = monthAttendance.filter(a => a.status === 'present').length;
  const halfDays = monthAttendance.filter(a => a.status === 'half-day').length;

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
        <div className="w-32 h-32 rounded-3xl bg-slate-100 overflow-hidden border-4 border-slate-50 shadow-inner flex-shrink-0">
          {employee.photo ? (
            <img src={employee.photo} className="w-full h-full object-cover" alt={employee.name} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">👤</div>
          )}
        </div>
        <div className="text-center md:text-left flex-1">
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">{employee.name}</h3>
          <p className="text-blue-600 font-bold uppercase text-xs tracking-widest mt-1">{employee.role}</p>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Salary</p>
              <p className="text-xl font-black text-slate-800">₹{employee.monthlySalary.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Join Date</p>
              <p className="text-sm font-bold text-slate-800 mt-1">{new Date(employee.joinDate).toLocaleDateString()}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">User ID</p>
              <p className="text-sm font-bold text-slate-800 mt-1">{employee.userId}</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Status</p>
              <p className="text-sm font-bold text-emerald-700 mt-1">Active</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Financial Summary</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-rose-50 rounded-xl">
                <span className="text-xs font-bold text-rose-700">Total Advances</span>
                <span className="font-black text-rose-700">₹{totalAdvances.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                <span className="text-xs font-bold text-emerald-700">Total Payouts</span>
                <span className="font-black text-emerald-700">₹{totalPayouts.toLocaleString()}</span>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs font-black text-slate-400 uppercase">Current Balance</span>
                <span className="font-black text-slate-900">₹{(totalAdvances - totalPayouts).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Attendance ({new Date().toLocaleString('default', { month: 'long' })})</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-2xl">
                <p className="text-2xl font-black text-slate-800">{daysPresent}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Full Days</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-2xl">
                <p className="text-2xl font-black text-slate-800">{halfDays}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Half Days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Recent Attendance</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myAttendance.slice(-5).reverse().map(att => (
                    <tr key={att.id}>
                      <td className="px-6 py-4 text-sm font-bold text-slate-700">{att.date}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${
                          att.status === 'present' ? 'bg-emerald-100 text-emerald-700' :
                          att.status === 'half-day' ? 'bg-amber-100 text-amber-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                          {att.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{att.regularHours + att.overtimeHours}h</td>
                    </tr>
                  ))}
                  {myAttendance.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-slate-400 text-sm italic">No attendance records yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Recent Payouts</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myPayouts.slice(-5).reverse().map(pay => (
                    <tr key={pay.id}>
                      <td className="px-6 py-4 text-sm font-bold text-slate-700">{pay.date}</td>
                      <td className="px-6 py-4 text-sm font-black text-slate-900">₹{pay.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-xs text-slate-500 uppercase font-bold">{pay.paymentMode}</td>
                    </tr>
                  ))}
                  {myPayouts.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-slate-400 text-sm italic">No payout records yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
