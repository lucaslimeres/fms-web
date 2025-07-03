import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Wallet, CreditCard, BarChart3, Users, Tag, Users2, LogOut, Menu, X,
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/', adminOnly: false },
    { icon: Wallet, label: 'Contas e Faturas', path: '/invoices', adminOnly: false },
    { icon: CreditCard, label: 'Cartões de Crédito', path: '/cards', adminOnly: false },
    { icon: BarChart3, label: 'Relatórios', path: '/reports', adminOnly: false },
    { icon: Users, label: 'Responsáveis', path: '/responsibles', adminOnly: true },
    { icon: Tag, label: 'Categorias', path: '/categories', adminOnly: true },
    { icon: Users2, label: 'Gerenciar Acessos', path: '/users', adminOnly: true },
  ];

  // Filtra os itens do menu baseados no perfil do usuário
  const accessibleNavItems = navItems.filter(item => {
    if (item.adminOnly) {
      return user?.role === 'admin';
    }
    return true;
  });

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 text-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h1 className="text-2xl font-bold">Finanças+</h1>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden"><X size={24} /></button>
        </div>
        <nav className="p-4">
          <ul>
            {accessibleNavItems.map((item) => (
              <li key={item.path} className="mb-2">
                <NavLink to={item.path} end className={({ isActive }) => `flex items-center p-2 rounded-lg text-base font-normal transition-colors ${ isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700' }`}>
                  <item.icon size={20} />
                  <span className="ml-3">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-gray-700">
            <div className="p-2 text-sm text-gray-400"><p>Usuário: {user?.name}</p></div>
            <button onClick={signOut} className="flex items-center w-full p-2 text-base font-normal text-gray-300 rounded-lg hover:bg-gray-700">
                <LogOut size={20} />
                <span className="ml-3">Sair</span>
            </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-4 bg-white border-b md:justify-end">
            <button onClick={() => setSidebarOpen(true)} className="text-gray-500 md:hidden"><Menu size={24} /></button>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-8">
            <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;