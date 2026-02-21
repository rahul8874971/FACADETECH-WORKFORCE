
import React, { useState } from 'react';
import { Employee, AuthState } from '../types';
import { getAdminPassword } from '../services/storage';

interface LoginProps {
  employees: Employee[];
  onLogin: (auth: AuthState) => void;
  onUpdateEmployee: (emp: Employee) => void;
}

const Login: React.FC<LoginProps> = ({ employees, onLogin, onUpdateEmployee }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [pendingUser, setPendingUser] = useState<Employee | null>(null);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Admin check using dynamic password from storage
    const currentAdminPwd = getAdminPassword();
    if (userId === 'admin' && password === currentAdminPwd) {
      onLogin({ role: 'admin', userId: 'admin', userName: 'Administrator' });
      return;
    }

    // Find any matching employee
    const matchedUser = employees.find(
      emp => emp.userId === userId && emp.password === password
    );

    if (matchedUser) {
      if (matchedUser.mustChangePassword) {
        setPendingUser(matchedUser);
        setShowChangePassword(true);
      } else {
        onLogin({ 
          role: matchedUser.isManager ? 'manager' : matchedUser.isSupervisor ? 'supervisor' : 'worker', 
          userId: matchedUser.id, 
          userName: matchedUser.name 
        });
      }
    } else {
      setError('Invalid credentials. Please contact your administrator.');
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (pendingUser) {
      const updatedUser = { 
        ...pendingUser, 
        password: newPassword, 
        mustChangePassword: false 
      };
      onUpdateEmployee(updatedUser);
      
      onLogin({ 
        role: updatedUser.isManager ? 'manager' : updatedUser.isSupervisor ? 'supervisor' : 'worker', 
        userId: updatedUser.id, 
        userName: updatedUser.name 
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-800">
        <div className="bg-blue-600 p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-white font-black text-6xl italic transform rotate-12">FT</div>
          <h1 className="text-4xl font-black text-white tracking-tighter relative z-10">FACADE TECH</h1>
          <p className="text-blue-100 mt-2 uppercase text-[10px] tracking-[0.2em] font-black relative z-10">Workforce Management OS</p>
        </div>
        <div className="p-10">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs rounded-xl font-black uppercase tracking-wider flex items-center">
              <span className="mr-3 text-xl">🚫</span> {error}
            </div>
          )}
          
          {!showChangePassword ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">User ID</label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-800"
                  placeholder="Staff ID"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Access Key</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-800"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-black transform transition active:scale-[0.98] shadow-2xl shadow-blue-900/20 text-xs uppercase tracking-widest"
              >
                Secure Sign In
              </button>
            </form>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-xl mb-4">
                <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">First Login Security</p>
                <p className="text-xs text-blue-600 mt-1">Please set a new secure password to continue.</p>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-800"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-800"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transform transition active:scale-[0.98] shadow-2xl shadow-blue-900/20 text-xs uppercase tracking-widest"
              >
                Update & Sign In
              </button>
            </form>
          )}
          <div className="mt-10 flex flex-col items-center space-y-4">
            <p className="text-center text-slate-400 text-[10px] font-medium tracking-tight px-4 border-t border-slate-50 pt-6">
              Authorized personnel only. All access attempts are logged for auditing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
