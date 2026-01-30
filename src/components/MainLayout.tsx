import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, Wallet, CreditCard, BarChart3, Users, Tag, Users2, LogOut, Menu, X, Pocket, Check, UserCheck 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from './Logo';

const BRAND_NAME = "Meu Bolso";

const MainLayout: React.FC = () => {
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', admin: false },
    { id: 'invoices', icon: Wallet, label: 'Faturas', path: '/invoices', admin: false },
    { id: 'cards', icon: CreditCard, label: 'Cartões', path: '/cards', admin: false },
    { id: 'reports', icon: BarChart3, label: 'Análise', path: '/reports', admin: false },
    { id: 'responsibles', icon: Users, label: 'Pessoas', path: '/responsibles', admin: true },
    { id: 'categories', icon: Tag, label: 'Tags', path: '/categories', admin: true },
    { id: 'users', icon: Users2, label: 'Equipe', path: '/users', admin: true },
  ];

  return (
    <div className="flex h-screen bg-teal-50/20 font-sans">
      {/* Sidebar Overlay */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-teal-900/40 backdrop-blur-sm z-[40] md:hidden"></div>}

      <aside className={`fixed inset-y-0 left-0 z-50 w-80 bg-teal-900 border-r border-teal-50 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-500 ease-in-out md:relative md:translate-x-0 flex flex-col`}>
        <div className="flex items-center gap-4 p-10 border-b border-teal-50">
          <Logo size={40} />
          <div className="flex flex-col">
            <span className="text-3xl font-black text-white tracking-tighter leading-none">{BRAND_NAME}</span>
            <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest mt-1">Digital Hub</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden ml-auto text-gray-300 hover:text-teal-500 transition-colors"><X size={32}/></button>
        </div>
        
        <nav className="flex-1 p-8 space-y-3 overflow-y-auto custom-scrollbar" style={{ scrollbarWidth: 'thin', scrollbarColor: '#38b2ac #f0fff4' }}>
          {navItems.map((item) => (
            item.admin && user?.role !== 'admin' ? null : (
              <NavLink 
                key={item.id} 
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `
                  w-full flex items-center gap-5 px-8 py-5 rounded-[24px] font-black transition-all duration-300
                  ${isActive ? 'bg-teal-500 text-white shadow-2xl shadow-teal-400 transform scale-105' : 'text-white hover:text-teal-600 hover:bg-teal-50'}
                `}
              >
                <item.icon size={26} className="group-hover:text-teal-200" strokeWidth={3} />
                <span className="tracking-tight">{item.label}</span>
                {item.admin && <UserCheck size={14} className="ml-auto text-teal-400 opacity-50" />}
              </NavLink>
            )
          ))}
        </nav>
        
        <div className="p-8 space-y-8">
           {/* <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-8 rounded-[40px] border border-teal-100 shadow-sm">
             <div className="flex items-center gap-3 mb-3">
               <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
               <p className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.3em]">Dica do Bolso</p>
             </div>
             <p className="text-xs text-emerald-600 font-bold leading-relaxed">Seus dados estão protegidos com criptografia total!</p>
           </div> */}
           <button onClick={signOut} className="w-full flex items-center gap-5 px-8 py-5 text-red-400 font-black hover:bg-red-50 rounded-[24px] transition-all transform hover:scale-105 group">
             <LogOut size={26} className="group-hover:rotate-12 transition-transform" /> 
             <span className="tracking-tight uppercase text-xs tracking-[0.1em]">Fechar Bolso</span>
           </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-24 flex items-center justify-between px-10 md:px-14 bg-white/80 backdrop-blur-md border-b border-teal-50 z-30">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-3 bg-teal-50 text-teal-600 rounded-2xl hover:bg-teal-500 hover:text-white transition-all shadow-sm"><Menu size={32} /></button>
          <div className="flex items-center gap-6 ml-auto">
            <div className="text-right hidden sm:block">
              <p className="text-lg font-black text-gray-800 leading-none">{user?.name}</p>
              <p className="text-[10px] font-black text-teal-500 uppercase tracking-widest mt-2 ml-auto inline-block border-b-2 border-teal-100">{user?.role === 'admin' ? 'Administrador' : 'Membro'}</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-teal-50 to-teal-100 rounded-[24px] flex items-center justify-center border-4 border-white shadow-xl transform hover:rotate-6 transition-transform cursor-pointer">
              <span className="text-teal-800 font-black text-xl">
                {user?.name?.substring(0,2).toUpperCase() || 'MB'}
              </span>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-8 md:p-14 lg:p-20 scroll-smooth">
          <div className="max-w-7xl mx-auto pb-20">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;