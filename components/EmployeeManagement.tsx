
import React, { useState } from 'react';
import { Employee } from '../types';

interface EmployeeManagementProps {
  employees: Employee[];
  onAdd: (emp: Omit<Employee, 'id'>) => void;
  onUpdate: (emp: Employee) => void;
  onDelete: (id: string) => void;
}

const EmployeeManagement: React.FC<EmployeeManagementProps> = ({ employees, onAdd, onUpdate, onDelete }) => {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    monthlySalary: 0,
    joinDate: new Date().toISOString().split('T')[0],
    isSupervisor: false,
    userId: '',
    password: '',
    initialAdvance: 0,
    photo: ''
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({
      name: '',
      role: '',
      monthlySalary: 0,
      joinDate: new Date().toISOString().split('T')[0],
      isSupervisor: false,
      userId: '',
      password: '',
      initialAdvance: 0,
      photo: ''
    });
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Create New Employee Profile</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border-slate-300 rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Designation / Role</label>
              <input type="text" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full border-slate-300 rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Monthly Salary (₹)</label>
              <input type="number" value={formData.monthlySalary} onChange={e => setFormData({ ...formData, monthlySalary: Number(e.target.value) })} className="w-full border-slate-300 rounded-lg" required />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Join Date</label>
              <input type="date" value={formData.joinDate} onChange={e => setFormData({ ...formData, joinDate: e.target.value })} className="w-full border-slate-300 rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Initial Advance (if any)</label>
              <input type="number" value={formData.initialAdvance} onChange={e => setFormData({ ...formData, initialAdvance: Number(e.target.value) })} className="w-full border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Profile Photo</label>
              <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>
          </div>

          <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center space-x-2 mb-4">
              <input type="checkbox" checked={formData.isSupervisor} onChange={e => setFormData({ ...formData, isSupervisor: e.target.checked })} className="rounded text-blue-600 focus:ring-blue-500 w-5 h-5" />
              <label className="text-sm font-bold text-slate-800">Designate as Supervisor</label>
            </div>
            {formData.isSupervisor && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Login User ID</label>
                  <input type="text" value={formData.userId} onChange={e => setFormData({ ...formData, userId: e.target.value })} className="w-full border-slate-300 rounded-lg bg-white" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Login Password</label>
                  <input type="text" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full border-slate-300 rounded-lg bg-white" required />
                </div>
              </>
            )}
          </div>

          <div className="md:col-span-2 lg:col-span-3 flex justify-end">
            <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition">
              Register Employee
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Employee</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Role</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Join Date</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Status</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {employees.map(emp => (
              <tr key={emp.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                      {emp.photo ? <img src={emp.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400">👤</div>}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{emp.name}</p>
                      <p className="text-xs text-slate-500">₹{emp.monthlySalary.toLocaleString()}/mo</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">{emp.role}</td>
                <td className="px-6 py-4 text-slate-500">{emp.joinDate}</td>
                <td className="px-6 py-4">
                  {emp.isSupervisor ? (
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md text-[10px] font-bold uppercase tracking-wider">Supervisor</span>
                  ) : (
                    <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded-md text-[10px] font-bold uppercase tracking-wider">Labor</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => onDelete(emp.id)} className="text-rose-500 hover:text-rose-700 font-bold text-xs uppercase">Terminate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeManagement;
