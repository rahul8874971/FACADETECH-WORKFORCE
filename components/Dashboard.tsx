
import React, { useState } from 'react';
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
  const isManager = auth.role === 'manager';
  const hasFullFinancials = isAdmin || isManager;
  
  const [filterMonth, setFilterMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [viewAllTime, setViewAllTime] = useState(false);

  // Filter logic
  const filteredAttendance = viewAllTime 
    ? attendance 
    : attendance.filter(a => a.date.startsWith(filterMonth));
    
  const filteredAdvances = viewAllTime
    ? advances
    : advances.filter(a => a.date.startsWith(filterMonth));

  // Supervisor Check: Who is missing attendance for today?
  const todayStr = new Date().toISOString().split('T')[0];
  const missingAttendanceToday = auth.role === 'supervisor' ? employees.filter(emp => {
    return !attendance.some(a => a.employeeId === emp.id && a.date === todayStr);
  }) : [];

  // Group by project for charts (using filtered data)
  const projectStats = projects.map(p => {
    const projAtt = filteredAttendance.filter(a => a.projectId === p.id);
    const hours = projAtt.reduce((sum, a) => sum + a.regularHours + a.overtimeHours, 0);
    
    // Calculate cost for project
    const cost = projAtt.reduce((sum, a) => {
      const emp = employees.find(e => e.id === a.employeeId);
      if (!emp) return sum;
      const dailyRate = emp.monthlySalary / 30;
      const hourlyRate = dailyRate / 8;
      return sum + (a.regularHours / 8) * dailyRate + (a.overtimeHours * hourlyRate);
    }, 0);

    return { name: p.name, hours, cost };
  });

  // Per-employee detailed calculations
  const employeeStats = employees.map(emp => {
    const empAttendance = filteredAttendance.filter(a => a.employeeId === emp.id);
    const empAdvances = filteredAdvances.filter(a => a.employeeId === emp.id);
    
    const uniqueDates = new Set(empAttendance.map(a => a.date));
    const totalDays = uniqueDates.size;
    const totalOT = empAttendance.reduce((sum, a) => sum + a.overtimeHours, 0);
    const totalAdvance = empAdvances.reduce((sum, a) => sum + a.amount, 0);
    
    const dailyRate = emp.monthlySalary / 30;
    const hourlyRate = dailyRate / 8;
    
    const totalSalaryEarned = empAttendance.reduce((total, entry) => {
      const base = (entry.regularHours / 8) * dailyRate;
      const ot = entry.overtimeHours * hourlyRate;
      return total + base + ot;
    }, 0);

    return { ...emp, totalDays, totalOT, totalAdvance, totalSalaryEarned };
  });

  const totalRegularHours = filteredAttendance.reduce((sum, entry) => sum + entry.regularHours, 0);
  const totalOTHours = filteredAttendance.reduce((sum, entry) => sum + entry.overtimeHours, 0);
  const totalAdvances = filteredAdvances.reduce((sum, entry) => sum + entry.amount, 0);
  const totalSalaryEstimate = employeeStats.reduce((sum, emp) => sum + emp.totalSalaryEarned, 0);

  const handleExport = () => {
    const headers = ["Employee", "Role", "Days Worked", "OT Hours", "Advances", "Net Payable"];
    const rows = employeeStats.map(stat => [
      stat.name,
      stat.role,
      stat.totalDays,
      stat.totalOT.toFixed(1),
      stat.totalAdvance,
      Math.round(stat.totalSalaryEarned - stat.totalAdvance)
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `FacadeTech_Report_${filterMonth}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const COLORS_CHART = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899'];

  return (
    <div className="space-y-6 pb-12">
      {/* View Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <label className="text-xs font-bold text-slate-500 uppercase">Report Period:</label>
          <input 
            type="month" 
            value={filterMonth} 
            onChange={(e) => { setFilterMonth(e.target.value); setViewAllTime(false); }}
            className="text-sm border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
          <button 
            onClick={() => setViewAllTime(!viewAllTime)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${viewAllTime ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            All Time View
          </button>
        </div>
        <div className="text-xs font-medium text-slate-400 italic">
          Showing {viewAllTime ? 'Complete History' : `Data for ${new Date(filterMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}`}
        </div>
      </div>

      {/* Supervisor Reminder */}
      {auth.role === 'supervisor' && missingAttendanceToday.length > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-xl shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0 text-amber-400 text-xl">⚠️</div>
            <div className="ml-3">
              <p className="text-sm text-amber-800 font-bold">Pending Attendance Today</p>
              <p className="text-xs text-amber-700 mt-1">
                {missingAttendanceToday.length} staff members have not been marked yet. 
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Work Hours', value: (totalRegularHours + totalOTHours).toFixed(1), icon: '⏱️', color: 'text-blue-600' },
          { label: 'OT Hours', value: totalOTHours.toFixed(1), icon: '⚡', color: 'text-amber-600' },
          { label: 'Advances Paid', value: `₹${totalAdvances.toLocaleString()}`, icon: '💸', color: 'text-rose-600', hide: !hasFullFinancials },
          { label: 'Net Payable', value: `₹${Math.round(totalSalaryEstimate - totalAdvances).toLocaleString()}`, icon: '💰', color: 'text-emerald-600', hide: !hasFullFinancials },
        ].filter(s => !s.hide).map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-blue-200 transition-colors group">
            <div className="flex justify-between items-start">
              <span className="text-2xl group-hover:scale-110 transition-transform">{stat.icon}</span>
              <span className={`text-2xl font-black ${stat.color}`}>{stat.value}</span>
            </div>
            <p className="text-slate-500 text-[10px] mt-2 font-bold uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800">Project Labor Costing</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Financial Metric</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" fontSize={10} stroke="#94a3b8" />
                <YAxis fontSize={10} stroke="#94a3b8" />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}} 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value: any) => [`₹${Math.round(value).toLocaleString()}`, 'Labor Cost']}
                />
                <Bar dataKey="cost" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {projectStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_CHART[index % COLORS_CHART.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800">Man-Hour Utilization</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Efficiency Metric</span>
          </div>
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
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS_CHART[i % COLORS_CHART.length] }}></div>
                  <span className="text-slate-600 font-medium">{p.name} ({p.hours}h)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Workforce Summary Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50/50 gap-4">
          <div>
            <h3 className="font-bold text-slate-800">Workforce Payroll Statement</h3>
            <p className="text-xs text-slate-500 font-medium">Detailed breakdown of earnings, overtime, and deductions.</p>
          </div>
          {hasFullFinancials && (
            <button 
              onClick={handleExport}
              className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-50 shadow-sm flex items-center space-x-2"
            >
              <span>📥</span> <span>Export Statement (CSV)</span>
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-100/50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                {hasFullFinancials && <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fixed Pay</th>}
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Days Worked</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">OT (Hrs)</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Advances</th>
                {hasFullFinancials && <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Net Payable</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employeeStats.map(stat => (
                <tr key={stat.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 overflow-hidden shadow-inner group-hover:bg-white transition-colors">
                        {stat.photo ? <img src={stat.photo} className="w-full h-full object-cover" /> : stat.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">{stat.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{stat.role}</p>
                      </div>
                    </div>
                  </td>
                  {hasFullFinancials && (
                    <td className="px-6 py-4 text-sm font-semibold text-slate-600">
                      ₹{stat.monthlySalary.toLocaleString()}
                    </td>
                  )}
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-[10px] font-black border border-blue-100">
                      {stat.totalDays} DAYS
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-[10px] font-black border ${stat.totalOT > 0 ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-50 text-slate-300 border-slate-100'}`}>
                      {stat.totalOT.toFixed(1)} HRS
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`font-bold ${stat.totalAdvance > 0 ? 'text-rose-600' : 'text-slate-300'}`}>
                      ₹{stat.totalAdvance.toLocaleString()}
                    </span>
                  </td>
                  {hasFullFinancials && (
                    <td className="px-6 py-4 text-right">
                      <p className="font-black text-emerald-600">₹{Math.round(stat.totalSalaryEarned - stat.totalAdvance).toLocaleString()}</p>
                      <p className="text-[9px] text-slate-400 font-bold tracking-tight">GROSS: ₹{Math.round(stat.totalSalaryEarned).toLocaleString()}</p>
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
