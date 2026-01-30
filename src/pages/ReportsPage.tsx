import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../services/api';
import { Filter } from 'lucide-react';

// Tipos para os dados
interface Expense {
  expense_id: string;
  reference_date: string;
  description: string;
  responsible_name: string;
  group_name: string;
  category_name: string;
  amount: string;
}

interface SelectOption {
  id: string;
  name: string;
}

const ReportsPage: React.FC = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [responsibles, setResponsibles] = useState<SelectOption[]>([]);
    const [loading, setLoading] = useState(true);

    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState(`${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`);
    const [selectedResponsible, setSelectedResponsible] = useState('all');

    const fetchResponsibles = useCallback(async () => {
        try {
            const response = await api.get('/responsibles');
            setResponsibles(response.data.map((r: any) => ({ id: r.id, name: r.name })));
        } catch (error) {
            console.error("Erro ao buscar responsáveis:", error);
        }
    }, []);

    const fetchExpenses = useCallback(async () => {
        setLoading(true);
        try {
            const params: any = { monthYear: selectedMonth };
            if (selectedResponsible !== 'all') {
                params.responsibleId = selectedResponsible;
            }

            const response = await api.get('/expenses', { params });
            setExpenses(response.data);
        } catch (error) {
            console.error("Erro ao buscar despesas:", error);
        } finally {
            setLoading(false);
        }
    }, [selectedMonth, selectedResponsible]);

    useEffect(() => {
        fetchResponsibles();
    }, [fetchResponsibles]);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    const categorySummary = useMemo(() => {
        const summary = expenses.reduce((acc, expense) => {
            const category = expense.category_name;
            const amount = parseFloat(expense.amount);
            if (!acc[category]) {
                acc[category] = 0;
            }
            acc[category] += amount;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(summary).map(([name, total]) => ({ name, total })).sort((a,b) => b.total - a.total);
    }, [expenses]);
    
    const totalExpenses = useMemo(() => {
        return categorySummary.reduce((acc, cat) => acc + cat.total, 0);
    }, [categorySummary]);

    const barColors = ['bg-red-500', 'bg-green-500', 'bg-yellow-400', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500'];

    return (
        <div className="space-y-12 animate-in fade-in duration-500">
            <header>
                <h2 className="text-5xl font-black text-gray-900 tracking-tight italic text-left">Relatórios</h2>
                <p className="text-teal-600 font-black uppercase text-[10px] tracking-[0.3em] mt-2 ml-1 text-left">Análise de consumo mensal</p>
            </header>

            <div className="bg-white p-10 md:p-14 rounded-[56px] shadow-sm border border-teal-50">
                {/* Filtros */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <div>
                        <p className="text-teal-600 font-black uppercase text-[12px] tracking-[0.3em] mt-2 ml-1 text-left">Mês/Ano</p>
                        <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-full p-5 bg-gray-50 rounded-3xl border border-gray-100 font-bold outline-none" />
                    </div>
                    <div>
                        <p className="text-teal-600 font-black uppercase text-[12px] tracking-[0.3em] mt-2 ml-1 text-left">Responsável</p>
                        <select 
                            value={selectedResponsible}
                            onChange={(e) => setSelectedResponsible(e.target.value)}
                            className="w-full p-5 bg-gray-50 rounded-3xl border border-gray-100 font-bold outline-none"
                        >
                            <option value="all">Todos</option>
                            {responsibles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>                        
                    </div>                    
                </div>

                {loading ? <p>Carregando relatório...</p> : (
                <>
                    {/* Composição das Despesas */}
                    <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                        <h3 className="text-xl font-black uppercase text-teal-600 mb-4">Composição das Despesas por Categoria</h3>
                        <div className="space-y-4">
                            {categorySummary.map((cat, index) => {
                                const percentage = totalExpenses > 0 ? (cat.total / totalExpenses) * 100 : 0;
                                return (
                                    <div key={cat.name}>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-base font-medium text-gray-600">{cat.name}</span>
                                            <span className="text-sm font-medium text-gray-600">{new Intl.NumberFormat('pt-BR', {style: 'currency',currency: 'BRL'}).format(+cat.total)} ({percentage.toFixed(1)}%)</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div className={`${barColors[index % barColors.length]} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
                                        </div>
                                    </div>
                                )
                            })}
                            {categorySummary.length === 0 && <p className="text-gray-500">Nenhuma despesa encontrada para os filtros selecionados.</p>}
                        </div>
                    </div>

                    {/* Lista de Despesas */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
                            <h3 className="text-xl font-semibold text-gray-700">Detalhes das Despesas</h3>
                            <p className="font-bold text-lg text-red-500">Total: {new Intl.NumberFormat('pt-BR', {style: 'currency',currency: 'BRL'}).format(+totalExpenses)}</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3">Data</th>
                                        <th className="px-6 py-3">Descrição</th>
                                        <th className="px-6 py-3">Responsável</th>
                                        <th className="px-6 py-3">Categoria</th>
                                        <th className="px-6 py-3 text-right">Valor</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {expenses.map((exp) => (
                                        <tr key={exp.expense_id} className="bg-white">
                                            <td className="px-6 py-4 whitespace-nowrap">{new Date(exp.reference_date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{exp.description}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{exp.responsible_name || exp.group_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{exp.category_name}</td>
                                            <td className="px-6 py-4 text-right font-medium whitespace-nowrap">{new Intl.NumberFormat('pt-BR', {style: 'currency',currency: 'BRL'}).format(+exp.amount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
                )}
            </div>
        </div>
    );
};

export default ReportsPage;