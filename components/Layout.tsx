
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
  const isManager = auth.role === 'manager';
  const hasReportAccess = isAdmin || isManager;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: '📊', show: auth.role !== 'worker' },
    { id: 'my-profile', label: 'My Profile', icon: '👤', show: auth.role === 'worker' },
    { id: 'attendance', label: 'Attendance', icon: '⏰', show: auth.role !== 'worker' },
    { id: 'advances', label: 'Advances', icon: '💸', show: auth.role !== 'worker' },
    { id: 'payouts', label: 'Payouts', icon: '💰', show: hasReportAccess },
    { id: 'projects', label: 'Projects', icon: '🏗️', show: hasReportAccess },
    { id: 'employees', label: 'Staff', icon: '👥', show: hasReportAccess },
    { id: 'admin', label: 'Audit', icon: '🛡️', show: isAdmin },
  ];

  const visibleNavItems = navItems.filter(item => item.show);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 pb-20 md:pb-0 font-sans">
      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div className={`fixed top-0 left-0 bottom-0 w-72 bg-slate-900 z-[70] md:hidden transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black tracking-tighter text-blue-400">FACADE TECH</h1>
            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-black">Workforce OS 2.5</p>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-white text-2xl">✕</button>
        </div>
        <div className="p-4 border-b border-slate-800">
           <div className="flex items-center space-x-3 bg-slate-800/50 p-3 rounded-2xl">
             <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center font-black text-sm text-white shadow-lg shadow-blue-500/20">
               {auth.userName?.charAt(0)}
             </div>
             <div className="overflow-hidden">
               <p className="text-xs font-bold text-white truncate">{auth.userName}</p>
               <p className="text-[9px] text-slate-500 uppercase font-black tracking-tighter">{auth.role}</p>
             </div>
           </div>
        </div>
        <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-200px)]">
          {visibleNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id as AppView); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeView === item.id 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' 
                  : 'text-slate-500 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-bold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800 bg-slate-900">
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all font-bold text-sm"
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-white flex-col flex-shrink-0 sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-black tracking-tighter text-blue-400">FACADE TECH</h1>
          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-black">Workforce OS 2.5</p>
        </div>
        <div className="p-4 border-b border-slate-800">
           <div className="flex items-center space-x-3 bg-slate-800/50 p-3 rounded-2xl">
             <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center font-black text-sm text-white shadow-lg shadow-blue-500/20">
               {auth.userName?.charAt(0)}
             </div>
             <div className="overflow-hidden">
               <p className="text-xs font-bold text-white truncate">{auth.userName}</p>
               <p className="text-[9px] text-slate-500 uppercase font-black tracking-tighter">{auth.role}</p>
             </div>
           </div>
        </div>
        <nav className="p-4 space-y-1.5 flex-1">
          {visibleNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as AppView)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeView === item.id 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' 
                  : 'text-slate-500 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-bold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all font-bold text-sm"
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-50 shadow-xl">
        <div className="flex items-center space-x-3">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-slate-400 hover:text-white">
            <span className="text-2xl">☰</span>
          </button>
          <h1 className="text-lg font-black tracking-tighter text-blue-400">FACADE TECH</h1>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center font-black text-xs text-white">
            {auth.userName?.charAt(0)}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <header className="mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 capitalize tracking-tight">
            {activeView === 'dashboard' ? `Dashboard` : activeView.replace('-', ' ')}
          </h2>
          <div className="flex items-center space-x-2 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest">
              Live: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </header>
        
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center p-3 z-50 shadow-2xl">
        {visibleNavItems.slice(0, 4).map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id as AppView)}
            className={`flex flex-col items-center p-2 rounded-xl transition-all ${
              activeView === item.id ? 'bg-blue-50 text-blue-600' : 'text-slate-400'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center p-2 rounded-xl text-slate-400"
        >
          <span className="text-xl">☰</span>
          <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">More</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
