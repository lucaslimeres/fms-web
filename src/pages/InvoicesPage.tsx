import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import { Users, ChevronDown, Pencil, Trash2, CheckCircle, User, CreditCard, Plus } from 'lucide-react';
import ExpenseModal from '../components/ExpenseModal'; 

const InvoicesPage: React.FC = () => {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);
    const [openNestedAccordion, setOpenNestedAccordion] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<any | null>(null);

    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState(`${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`);

    const fetchInvoices = useCallback(async () => {
        setLoading(true);
        try {
        const response = await api.get('/invoices', { params: { monthYear: selectedMonth } });
        setInvoices(response.data);
        } catch (error) { console.error("Erro ao buscar faturas:", error); } finally { setLoading(false); }
    }, [selectedMonth]);

    useEffect(() => { fetchInvoices(); }, [fetchInvoices]);  

    const handlePayExpense = async (expenseId: string) => {
        try {
            await api.patch(`/expenses/${expenseId}/pay`);
            fetchInvoices();
        } catch (error) {
            console.error("Erro ao pagar despesa:", error);
            alert("Não foi possível marcar a despesa como paga.");
        }
    };

    const handleDeleteExpense = async (expenseId: string) => {
        if (window.confirm("Tem certeza que deseja excluir esta despesa?")) {
            try {
                await api.delete(`/expenses/${expenseId}`);
                fetchInvoices();
            } catch (error) {
                console.error("Erro ao excluir despesa:", error);
                alert("Não foi possível excluir a despesa.");
            }
        }
    };

    const handleOpenEditModal = (expense: any) => {
        setEditingExpense(expense);
        setIsModalOpen(true);
    };
    
    const handleOpenCreateModal = () => {
        setEditingExpense(null);
        setIsModalOpen(true);
    };

    const handleSave = () => {
        setIsModalOpen(false);
        setEditingExpense(null);
        fetchInvoices();
    };

    const toggleAccordion = (id: string) => {
        setOpenAccordion(openAccordion === id ? null : id);
        setOpenNestedAccordion(null);
    };

    const toggleNestedAccordion = (id: string) => {
        setOpenNestedAccordion(openNestedAccordion === id ? null : id);
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Fatura Paga':
                return 'bg-green-100 text-green-800';
            case 'Sem Gastos':
                return 'bg-gray-100 text-gray-700';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };    

    const totalAmount = useMemo(() => {
        return invoices.map(invoice => {
            const { bills, cardExpenses } = invoice;
            const allExpenses = [...bills, ...cardExpenses.flatMap((c: any) => c.expenses)];
            const total = allExpenses.reduce((acc, exp) => acc + parseFloat(exp.amount), 0);
            const pending = allExpenses.filter(e => e.status === 'pending').reduce((acc, exp) => acc + parseFloat(exp.amount), 0);
            return { total, pending };
        });
    }, [invoices]);  

  return (
    <>
        <ExpenseModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSave}
            expenseToEdit={editingExpense}
        />

        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                <div>
                    <h2 className="text-5xl font-black text-gray-900 tracking-tight italic">Faturas</h2>
                    <p className="text-teal-600 font-black uppercase text-[10px] tracking-[0.3em] mt-2 ml-1">Controle por pessoa</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="p-4 bg-white border border-teal-100 rounded-3xl font-black text-teal-700 outline-none shadow-sm" />        
                    <button onClick={handleOpenCreateModal} className="bg-teal-500 text-white p-4 rounded-3xl hover:bg-teal-600 shadow-xl shadow-teal-100 transition-all active:scale-90">
                        <Plus size={28}/>
                        {/* <span className="hidden sm:inline">Nova Despesa</span> */}
                    </button>            
                </div>
            </header>

            {loading && <p>Carregando faturas...</p>}
            
            {invoices.map(({ responsible, bills, cardExpenses }, index) => {
                const { total, pending } = totalAmount[index] || { total: 0, pending: 0 };            

                return (
                    <div key={responsible.responsible_id} className="bg-white rounded-[48px] shadow-sm border border-teal-50 overflow-hidden group">
                        <button onClick={() =>toggleAccordion(responsible.responsible_id)} className="w-full p-10 flex flex-col md:flex-row justify-between items-center hover:bg-teal-50/10 transition-all gap-8">
                            <div className="flex items-center gap-8 w-full text-left">
                                <div className="w-20 h-20 bg-teal-50 rounded-[28px] flex items-center justify-center text-teal-500 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300 shadow-sm"><Users size={36}/></div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-gray-800">{responsible.name}</h3>
                                    {/* <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Total: <span className="text-gray-900 font-black">R$ {inv.bills.reduce((a:any, b:any) => a + parseFloat(b.amount), 0).toFixed(2)}</span></p> */}
                                    <div className="flex flex-col sm:flex-row sm:gap-4 text-sm text-gray-500">
                                        <p>Total: <span className="font-semibold text-red-500">{new Intl.NumberFormat('pt-BR', {style: 'currency',currency: 'BRL'}).format(+total)}</span></p>
                                        <p>Pendente: <span className="font-semibold text-yellow-600">{new Intl.NumberFormat('pt-BR', {style: 'currency',currency: 'BRL'}).format(+pending)}</span></p>
                                    </div>                            
                                </div>
                            </div>
                            <div className={`p-4 bg-teal-50 rounded-full text-teal-500 transition-all duration-500 ${openAccordion === responsible.responsible_id ? 'rotate-180 bg-teal-500 text-white' : ''}`}>
                                <ChevronDown size={28} />
                            </div>
                        </button>
                        
                        {openAccordion === responsible.responsible_id && (
                            <div>
                                <h4 className="p-10 text-lg font-semibold text-teal-600 mb-3">Despesas da Fatura</h4>
                                <div className="p-10 border-t border-teal-50 bg-teal-50/5 overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                        <tr className="text-[10px] font-black text-teal-800 uppercase tracking-widest border-b border-teal-100">
                                            <th className="pb-6 px-4">Descrição</th>
                                            <th className="pb-6 px-4">Categoria</th>
                                            <th className="pb-6 px-4">Valor</th>
                                            <th className="pb-6 px-4">Status</th>
                                            <th className="pb-6 px-4">Ações</th>
                                        </tr>
                                        </thead>
                                        <tbody className="text-sm font-bold">
                                        {bills.map((exp: any) => (
                                            <tr key={exp.expense_id} className="border-b border-teal-50/30 hover:bg-white transition-colors">
                                                <td className="py-6 px-4 text-gray-700">{exp.description}</td>
                                                <td className="py-6 px-4"><span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black uppercase text-gray-400">{exp.category_name}</span></td>
                                                <td className="py-6 px-4 font-black text-gray-900 text-lg text-right">{new Intl.NumberFormat('pt-BR', {style: 'currency',currency: 'BRL'}).format(+exp.amount)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {exp.status === 'paid' 
                                                        ? <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Pago</span>
                                                        : <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Pendente</span>
                                                    }
                                                </td>
                                                <td className="py-6 px-4 flex items-center gap-4">
                                                    {exp.status === 'pending' && <button onClick={() => handlePayExpense(exp.expense_id)} className="p-3 bg-teal-50  text-teal-500 rounded-2xl hover:bg-teal-500  hover:text-white transition-all" title="Marcar como pago"><CheckCircle size={18} /></button>}
                                                    <div className="flex justify-end gap-3"><button onClick={() => handleOpenEditModal(exp)} className="p-3 bg-teal-50 text-teal-500 rounded-2xl hover:bg-teal-500 hover:text-white transition-all" title="Editar despesa"><Pencil size={18}/></button></div>
                                                    <div className="flex justify-end gap-3"><button onClick={() => handleDeleteExpense(exp.expense_id)} className="p-3 bg-teal-50 text-teal-500 rounded-2xl hover:bg-teal-500 hover:text-white transition-all" title="Editar despesa"><Trash2 size={18} /></button></div>
                                                </td>                                    
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>

                                {cardExpenses.length > 0 && (
                                    <div>
                                        <h4 className="p-10 text-lg font-semibold text-teal-600 mb-3">Gastos por Cartão de Crédito</h4>
                                        <div className="space-y-3">
                                            {cardExpenses.map((card: any) => (
                                                // <div key={card.card_id} className="bg-gray-50 rounded-lg border border-gray-200">
                                                <div key={card.card_id} className="bg-white rounded-[48px] shadow-sm border border-teal-50 overflow-hidden group">                                                    
                                                    <button onClick={() => toggleNestedAccordion(card.card_id)} className="w-full p-10 flex flex-col md:flex-row justify-between items-center hover:bg-teal-50/10 transition-all gap-8">
                                                        <div className="w-20 h-20 bg-teal-50 rounded-[28px] flex items-center justify-center text-teal-500 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300 shadow-sm">
                                                            <CreditCard size={20}/>
                                                        </div>
                                                        <h3 className="text-2xl font-black text-gray-800">{card.card_name}</h3>                                                    
                                                        <div className="flex items-center gap-4">
                                                            <span className={`${getStatusClass(card.status)} text-xs font-medium px-2.5 py-0.5 rounded-full`}>{card.status}</span>
                                                            <span className="text-gray-600 font-semibold">Total: {new Intl.NumberFormat('pt-BR', {style: 'currency',currency: 'BRL'}).format(+card.total)}</span>
                                                            {/* <ChevronDown className={`transition-transform ${openNestedAccordion === card.card_id ? 'rotate-180' : ''}`} /> */}
                                                            <div className={`p-4 bg-teal-50 rounded-full text-teal-500 transition-all duration-500 ${openNestedAccordion === card.card_id ? 'rotate-180 bg-teal-500 text-white' : ''}`}>
                                                                <ChevronDown size={15} />
                                                            </div>                                                            
                                                        </div>
                                                    </button>

                                                    {openNestedAccordion === card.card_id && (
                                                        <div className="px-4 pb-4 overflow-x-auto">
                                                            <table className="w-full text-sm text-left text-gray-500">
                                                                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                                                    <tr>
                                                                        <th className="px-4 py-2">Descrição</th>
                                                                        <th className="px-4 py-2">Categoria</th>
                                                                        <th className="px-4 py-2 text-right">Valor</th>
                                                                        <th className="px-4 py-2 text-center">Ações</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {card.expenses.map((exp: any) => (
                                                                        <tr key={exp.expense_id} className="border-b">
                                                                            <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{exp.description}</td>
                                                                            <td className="px-4 py-3 whitespace-nowrap">{exp.category_name}</td>
                                                                            <td className="px-4 py-3 text-right whitespace-nowrap">{new Intl.NumberFormat('pt-BR', {style: 'currency',currency: 'BRL'}).format(+exp.amount)}</td>
                                                                            <td className="px-4 py-3 text-center flex justify-center gap-4">
                                                                                <button onClick={() => handleOpenEditModal(exp)} className="text-blue-600 hover:text-blue-800" title="Editar despesa"><Pencil size={18} /></button><button onClick={() => handleDeleteExpense(exp.expense_id)} className="text-red-600 hover:text-red-800" title="Excluir despesa"><Trash2 size={18} /></button>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>                     
                        )}
                    </div>
                );
            })}
        </div>
    </>
  );
};

export default InvoicesPage;