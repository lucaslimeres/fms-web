import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../services/api';
import { ChevronDown, User, Pencil, CreditCard, Trash2, CheckCircle, Plus } from 'lucide-react';
import ExpenseModal from '../components/ExpenseModal'; // Importa a nova modal

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
        } catch (error) {
            console.error("Erro ao buscar faturas:", error);
        } finally {
            setLoading(false);
        }
    }, [selectedMonth]);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

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

            <header className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Contas e Faturas</h2>
                    <p className="text-gray-500">Detalhes das despesas por responsável.</p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <input 
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-semibold w-full flex-1"
                    />
                     <button onClick={handleOpenCreateModal} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 flex items-center">
                        <Plus size={20} className="mr-2" />
                        <span className="hidden sm:inline">Nova Despesa</span>
                    </button>
                </div>
            </header>

            {loading && <p>Carregando faturas...</p>}
            
            <div className="space-y-4">
                {invoices.map(({ responsible, bills, cardExpenses }, index) => {
                    const { total, pending } = totalAmount[index] || { total: 0, pending: 0 };
                    
                    return (
                        <div key={responsible.responsible_id} className="bg-white rounded-xl shadow-md overflow-hidden">
                            <button onClick={() => toggleAccordion(responsible.responsible_id)} className="w-full flex justify-between items-center p-6 text-left">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-full bg-blue-100"><User className="text-blue-500" /></div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800">{responsible.name}</h3>
                                        <div className="flex flex-col sm:flex-row sm:gap-4 text-sm text-gray-500">
                                            <p>Total: <span className="font-semibold text-red-500">{new Intl.NumberFormat('pt-BR', {style: 'currency',currency: 'BRL'}).format(+total)}</span></p>
                                            <p>Pendente: <span className="font-semibold text-yellow-600">{new Intl.NumberFormat('pt-BR', {style: 'currency',currency: 'BRL'}).format(+pending)}</span></p>
                                        </div>
                                    </div>
                                </div>
                                <ChevronDown className={`transition-transform ${openAccordion === responsible.responsible_id ? 'rotate-180' : ''}`} />
                            </button>                            
                            
                            {openAccordion === responsible.responsible_id && (
                                <div className="p-6 border-t border-gray-200 space-y-6">
                                    {/* Contas e Despesas de Grupo */}
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-700 mb-3">Despesas da Fatura</h4>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm text-left text-gray-500">
                                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3">Descrição</th>
                                                        <th className="px-6 py-3">Categoria</th>
                                                        <th className="px-6 py-3">Valor</th>
                                                        <th className="px-6 py-3">Status</th>
                                                        <th className="px-6 py-3">Ações</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {[...bills].map((exp: any) => (
                                                        <tr key={exp.expense_id} className="bg-white border-b">
                                                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{exp.description}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap">{exp.category_name}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap">{new Intl.NumberFormat('pt-BR', {style: 'currency',currency: 'BRL'}).format(+exp.amount)}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                {exp.status === 'paid' 
                                                                    ? <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Pago</span>
                                                                    : <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Pendente</span>
                                                                }
                                                            </td>
                                                            <td className="px-6 py-4 flex items-center gap-4">
                                                                {exp.status === 'pending' && <button onClick={() => handlePayExpense(exp.expense_id)} className="text-green-600 hover:text-green-800" title="Marcar como pago"><CheckCircle size={18} /></button>}
                                                                <button onClick={() => handleOpenEditModal(exp)} className="text-blue-600 hover:text-blue-800" title="Editar despesa"><Pencil size={18} /></button>
                                                                <button onClick={() => handleDeleteExpense(exp.expense_id)} className="text-red-600 hover:text-red-800" title="Excluir despesa"><Trash2 size={18} /></button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Gastos por Cartão de Crédito */}
                                    {cardExpenses.length > 0 && (
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-700 mb-3">Gastos por Cartão de Crédito</h4>
                                            <div className="space-y-3">
                                                {cardExpenses.map((card: any) => (
                                                    <div key={card.card_id} className="bg-gray-50 rounded-lg border border-gray-200">
                                                        <button onClick={() => toggleNestedAccordion(card.card_id)} className="w-full flex justify-between items-center p-4 text-left">
                                                            <div className="flex items-center gap-3"><CreditCard className="text-blue-800" /><span className="font-semibold text-gray-700">{card.card_name}</span></div>
                                                            <div className="flex items-center gap-4">
                                                                <span className={`${getStatusClass(card.status)} text-xs font-medium px-2.5 py-0.5 rounded-full`}>{card.status}</span>
                                                                <span className="text-gray-600 font-semibold">Total: {new Intl.NumberFormat('pt-BR', {style: 'currency',currency: 'BRL'}).format(+card.total)}</span>
                                                                <ChevronDown className={`transition-transform ${openNestedAccordion === card.card_id ? 'rotate-180' : ''}`} />
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
                    )
                })}
            </div>
        </>
    );
};

export default InvoicesPage;