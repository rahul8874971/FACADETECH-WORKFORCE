
import React from 'react';
import { AppView, AuthState } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  auth: AuthState;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onNavigate, auth, onLogout }) => {
  const isAdmin = auth.role === 'admin';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', show: true },
    { id: 'attendance', label: 'Attendance', icon: '⏰', show: true },
    { id: 'advances', label: 'Advances', icon: '💵', show: true },
    { id: 'projects', label: 'Projects', icon: '🏗️', show: isAdmin },
    { id: 'employees', label: 'Staff Management', icon: '👥', show: isAdmin },
    { id: 'admin', label: 'Audit Panel', icon: '🛡️', show: isAdmin },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-tight text-blue-400">FACADE TECH</h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">Workforce Pro</p>
        </div>
        <div className="p-4 border-b border-slate-800">
           <div className="flex items-center space-x-3 bg-slate-800/50 p-3 rounded-xl">
             <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-sm">
               {auth.userName?.charAt(0)}
             </div>
             <div>
               <p className="text-xs font-bold text-white truncate max-w-[120px]">{auth.userName}</p>
               <p className="text-[10px] text-slate-400 uppercase tracking-tighter">{auth.role}</p>
             </div>
           </div>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.filter(item => item.show).map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as AppView)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeView === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
          <button
            onClick={onLogout}
            className="w-full mt-8 flex items-center space-x-3 px-4 py-3 rounded-lg text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all duration-200"
          >
            <span className="text-xl">🚪</span>
            <span className="font-medium">Sign Out</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <header className="mb-8 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800 capitalize">{activeView.replace('-', ' ')}</h2>
          <div className="flex items-center space-x-4">
            <span className="bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </header>
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
