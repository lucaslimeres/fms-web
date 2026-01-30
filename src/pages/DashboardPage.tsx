import React, { useState, useEffect, useCallback } from 'react';
import { ArrowDown, TriangleAlert, Check, CreditCard, Plus, Users, Utensils, Home, HeartPulse, Car, Tag } from 'lucide-react';
import api from '../services/api';
import ExpenseModal from '../components/ExpenseModal';

const DashboardPage: React.FC = () => {
  const [summaryData, setSummaryData] = useState({ totalExpenses: '0.00', pending: '0.00', paid: '0.00', cardBill: '0.00' });
  const [byResponsible, setByResponsible] = useState<any[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any | null>(null);
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(`${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`);

  const fetchInvoices = useCallback(async () => {
      setLoading(true);
      try {
        const res = await api.get('/dashboard', { params: { monthYear: selectedMonth } });
        setSummaryData(res.data.summary);
        setByResponsible(res.data.byResponsible);
        setRecentExpenses(res.data.recent);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [selectedMonth]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);  

  const handleSave = () => {
      setIsModalOpen(false);
      setEditingExpense(null);
      fetchInvoices();
  };

  const handleOpenCreateModal = () => {
      setEditingExpense(null);
      setIsModalOpen(true);
  };  

  const renderCategoryIcon = (categoryName: string) => {
    const cat = categoryName.toLowerCase();
    if (cat.includes('alimen')) return <Utensils size={20} />;
    if (cat.includes('casa')) return <Home size={20} />;
    if (cat.includes('saud')) return <HeartPulse size={20} />;
    if (cat.includes('carro')) return <Car size={20} />;
    return <Tag size={20} />;
  };

  return (
    <>
      <ExpenseModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          expenseToEdit={editingExpense}
      />

      <div className="space-y-12 animate-in fade-in duration-500">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h2 className="text-5xl font-black text-gray-900 tracking-tight italic">Dashboard</h2>
            <p className="text-teal-600 font-black uppercase text-[10px] tracking-[0.3em] mt-2 ml-1">Sua saúde financeira em tempo real</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="flex-1 p-4 bg-white border border-teal-100 rounded-3xl font-black text-teal-700 outline-none shadow-sm focus:ring-4 focus:ring-teal-50" />
            <button onClick={handleOpenCreateModal} className="bg-teal-500 text-white p-4 rounded-3xl hover:bg-teal-600 shadow-xl shadow-teal-100 transition-all active:scale-90"><Plus size={28}/></button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Total Gasto', val: summaryData.totalExpenses, icon: ArrowDown, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
            { label: 'Pendentes', val: summaryData.pending, icon: TriangleAlert, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
            { label: 'Pagas', val: summaryData.paid, icon: Check, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
            { label: 'No Cartão', val: summaryData.cardBill, icon: CreditCard, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100' }
          ].map((item, i) => (
            <div key={i} className={`bg-white p-8 rounded-[40px] shadow-sm border ${item.border} flex items-center gap-6 group hover:shadow-xl transition-all duration-300`}>
              <div className={`p-5 ${item.bg} ${item.color} rounded-3xl group-hover:scale-110 transition-transform`}><item.icon size={32} className="stroke-[3]"/></div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                <p className="text-2xl font-black text-gray-900 tracking-tight">{new Intl.NumberFormat('pt-BR', {style: 'currency',currency: 'BRL'}).format(+item.val)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 bg-white p-10 rounded-[48px] shadow-sm border border-teal-50">
            <h3 className="text-3xl font-black text-gray-800 mb-10 italic">Gastos por Pessoa</h3>
            <div className="space-y-10">
              {byResponsible.map((r, i) => (
                <div key={i} className="group">
                  <div className="flex justify-between mb-3 items-end">
                    <span className="font-black text-gray-600 group-hover:text-teal-600 transition-colors uppercase text-xs tracking-widest">{r.name}</span>
                    <span className="font-black text-2xl text-gray-900 tracking-tight">{new Intl.NumberFormat('pt-BR', {style: 'currency',currency: 'BRL'}).format(+r.total)}</span>
                  </div>
                  <div className="w-full bg-gray-50 h-5 rounded-full overflow-hidden shadow-inner p-1 border border-gray-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-teal-400 to-teal-600 shadow-lg transition-all duration-1000" style={{ width: `${Math.min(100, (parseFloat(r.total) / parseFloat(summaryData.totalExpenses || '1')) * 100)}%` }}></div>
                  </div>
                </div>
              ))}
              {byResponsible.length === 0 && <p className="text-gray-500">Nenhuma despesa encontrada para este mês.</p>}
            </div>
          </div>
          
          <div className="bg-white p-10 rounded-[48px] shadow-sm border border-teal-50 flex flex-col">
            <h3 className="text-3xl font-black text-gray-800 mb-10 italic">Recentes</h3>
            <div className="space-y-8 flex-1 overflow-auto pr-2 custom-scrollbar">
              {recentExpenses.map((item, i) => (
                <div key={i} className="flex justify-between items-center group cursor-pointer hover:bg-teal-50/20 p-3 rounded-3xl transition-colors">
                  <div className="flex items-center gap-5">
                    <div className="p-4 bg-teal-50 text-teal-500 rounded-[20px] shadow-sm group-hover:bg-teal-500 group-hover:text-white transition-all">{renderCategoryIcon(item.category_name)}</div>
                    <div><p className="font-black text-gray-800 text-lg group-hover:text-teal-700 transition-colors">{item.description}</p><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.category_name}</p></div>
                  </div>
                  <p className="font-black text-gray-900 text-xl tracking-tighter">- {new Intl.NumberFormat('pt-BR', {style: 'currency',currency: 'BRL'}).format(+item.amount)}</p>
                </div>
              ))}
              {recentExpenses.length === 0 && <p className="text-gray-500">Nenhuma despesa recente.</p>}
            </div>
            {/* <button className="mt-8 text-center text-teal-500 font-black text-sm uppercase tracking-[0.2em] hover:text-teal-700 transition-colors italic">Ver Histórico Completo</button> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;