import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../services/api';

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
        <>
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Relatórios</h2>
                    <p className="text-gray-500">Analise seus gastos com filtros detalhados.</p>
                </div>
            </header>

            {/* Filtros */}
            <div className="bg-white p-4 rounded-xl shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mês/Ano</label>
                        <input 
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Responsável</label>
                        <select 
                            value={selectedResponsible}
                            onChange={(e) => setSelectedResponsible(e.target.value)}
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md"
                        >
                            <option value="all">Todos</option>
                            {responsibles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {loading ? <p>Carregando relatório...</p> : (
            <>
                {/* Composição das Despesas */}
                <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Composição das Despesas por Categoria</h3>
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
        </>
    );
};

export default ReportsPage;