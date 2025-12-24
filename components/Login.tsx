
import React, { useState } from 'react';
import { Employee, AuthState } from '../types';
import { getAdminPassword } from '../services/storage';

interface LoginProps {
  employees: Employee[];
  onLogin: (auth: AuthState) => void;
}

const Login: React.FC<LoginProps> = ({ employees, onLogin }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
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

    // Supervisor check
    const supervisor = employees.find(
      emp => emp.isSupervisor && emp.userId === userId && emp.password === password
    );

    if (supervisor) {
      onLogin({ role: 'supervisor', userId: supervisor.id, userName: supervisor.name });
    } else {
      setError('Invalid credentials. Please contact your administrator.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-blue-600 p-8 text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">FACADE TECH</h1>
          <p className="text-blue-100 mt-2 uppercase text-xs tracking-widest font-semibold">Workforce Pro Login</p>
        </div>
        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-lg font-medium">
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">User ID</label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Enter your ID"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transform transition active:scale-[0.98] shadow-lg shadow-blue-200"
            >
              Sign In
            </button>
          </form>
          <p className="mt-8 text-center text-slate-400 text-xs italic">
            Please use your assigned credentials to log in.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
