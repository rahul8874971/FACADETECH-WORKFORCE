
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { AttendanceEntry, AdvanceEntry, Employee, Project, AuthState } from '../types';

interface DashboardProps {
  attendance: AttendanceEntry[];
  advances: AdvanceEntry[];
  employees: Employee[];
  projects: Project[];
  auth: AuthState;
}

const Dashboard: React.FC<DashboardProps> = ({ attendance, advances, employees, projects, auth }) => {
  const isAdmin = auth.role === 'admin';

  // Group by project for charts
  const projectStats = projects.map(p => ({
    name: p.name,
    hours: attendance.filter(a => a.projectId === p.id).reduce((sum, a) => sum + a.regularHours + a.overtimeHours, 0)
  }));

  // Per-employee detailed calculations for the table
  const employeeStats = employees.map(emp => {
    const empAttendance = attendance.filter(a => a.employeeId === emp.id);
    const empAdvances = advances.filter(a => a.employeeId === emp.id);
    
    // Total Days is the count of unique dates worked
    const uniqueDates = new Set(empAttendance.map(a => a.date));
    const totalDays = uniqueDates.size;
    
    const totalOT = empAttendance.reduce((sum, a) => sum + a.overtimeHours, 0);
    const totalAdvance = empAdvances.reduce((sum, a) => sum + a.amount, 0);
    
    /**
     * SALARY CALCULATION RULES:
     * 1. Daily Rate = Monthly Salary / 30
     * 2. Hourly Rate = (Monthly Salary / 30) / 8
     */
    const dailyRate = emp.monthlySalary / 30;
    const hourlyRate = dailyRate / 8;
    
    const totalSalaryEarned = empAttendance.reduce((total, entry) => {
      // Regular hours converted to fraction of daily rate (8h = 1 full dailyRate)
      const base = (entry.regularHours / 8) * dailyRate;
      // Overtime calculated based on the specific rule provided
      const ot = entry.overtimeHours * hourlyRate;
      return total + base + ot;
    }, 0);

    return {
      ...emp,
      totalDays,
      totalOT,
      totalAdvance,
      totalSalaryEarned
    };
  });

  // Global calculations for summary cards
  const totalRegularHours = attendance.reduce((sum, entry) => sum + entry.regularHours, 0);
  const totalOTHours = attendance.reduce((sum, entry) => sum + entry.overtimeHours, 0);
  const totalAdvances = advances.reduce((sum, entry) => sum + entry.amount, 0);
  const totalSalaryEstimate = employeeStats.reduce((sum, emp) => sum + emp.totalSalaryEarned, 0);

  const COLORS_CHART = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899'];

  return (
    <div className="space-y-6 pb-12">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Man Hours', value: (totalRegularHours + totalOTHours).toFixed(1), icon: '⏱️', color: 'text-blue-600' },
          { label: 'Overtime Hours', value: totalOTHours.toFixed(1), icon: '⚡', color: 'text-amber-600' },
          { label: 'Total Advances', value: `₹${totalAdvances.toLocaleString()}`, icon: '💸', color: 'text-rose-600', hide: !isAdmin },
          { label: 'Net Payable', value: `₹${Math.round(totalSalaryEstimate - totalAdvances).toLocaleString()}`, icon: '💰', color: 'text-emerald-600', hide: !isAdmin },
        ].filter(s => !s.hide).map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start">
              <span className="text-2xl">{stat.icon}</span>
              <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
            </div>
            <p className="text-slate-500 text-sm mt-2 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-6">Hours per Project</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" fontSize={12} stroke="#94a3b8" />
                <YAxis fontSize={12} stroke="#94a3b8" />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}} 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {projectStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_CHART[index % COLORS_CHART.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-6">Personnel Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="hours"
                >
                  {projectStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_CHART[index % COLORS_CHART.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col space-y-2 ml-4">
              {projectStats.map((p, i) => (
                <div key={i} className="flex items-center space-x-2 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS_CHART[i % COLORS_CHART.length] }}></div>
                  <span className="text-slate-600">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Workforce Summary Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800">Detailed Workforce Summary</h3>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            {isAdmin ? 'Full Administrator View' : 'Supervisor Overview'}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Employee Name</th>
                {isAdmin && <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Monthly Salary</th>}
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Total Days</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Total OT Hours</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Total Advance</th>
                {isAdmin && <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Net Salary</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employeeStats.map(stat => (
                <tr key={stat.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-500 overflow-hidden shadow-inner">
                        {stat.photo ? <img src={stat.photo} className="w-full h-full object-cover" /> : stat.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{stat.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium uppercase">{stat.role}</p>
                      </div>
                    </div>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      ₹{stat.monthlySalary.toLocaleString()}
                    </td>
                  )}
                  <td className="px-6 py-4 text-center">
                    <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                      {stat.totalDays} Days
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${stat.totalOT > 0 ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                      {stat.totalOT.toFixed(1)}h
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`font-bold ${stat.totalAdvance > 0 ? 'text-rose-600' : 'text-slate-300'}`}>
                      ₹{stat.totalAdvance.toLocaleString()}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right">
                      <p className="font-bold text-emerald-600">₹{Math.round(stat.totalSalaryEarned - stat.totalAdvance).toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Earned: ₹{Math.round(stat.totalSalaryEarned).toLocaleString()}</p>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
