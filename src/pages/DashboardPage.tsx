import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    ArrowDown, TriangleAlert, Check, CreditCard as CreditCardIcon, Plus, 
    Utensils, Home, HeartPulse, Car, Tag 
} from 'lucide-react';
import api from '../services/api';
import ExpenseModal from '../components/ExpenseModal';

// Tipagem para os novos dados
interface ResponsibleSummary {
  name: string;
  total: number;
}

interface RecentExpense {
  expense_id: string;
  description: string;
  amount: number;
  category_name: string;
}

const barColors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-teal-500', 'bg-amber-500'];

const renderCategoryIcon = (categoryName: string) => {
    const lowerCaseCategory = categoryName.toLowerCase();
    switch (lowerCaseCategory) {
        case 'alimentação':
            return <div className="p-2 rounded-full bg-red-100"><Utensils size={18} className="text-red-500" /></div>;
        case 'moradia':
            return <div className="p-2 rounded-full bg-blue-100"><Home size={18} className="text-blue-500" /></div>;
        case 'saúde':
            return <div className="p-2 rounded-full bg-green-100"><HeartPulse size={18} className="text-green-500" /></div>;
        case 'transporte':
            return <div className="p-2 rounded-full bg-purple-100"><Car size={18} className="text-purple-500" /></div>;
        default:
            return <div className="p-2 rounded-full bg-gray-100"><Tag size={18} className="text-gray-500" /></div>;
    }
};

const DashboardPage: React.FC = () => {
    const [summaryData, setSummaryData] = useState({ totalExpenses: '0.00', pending: '0.00', paid: '0.00', cardBill: '0.00' });
    const [byResponsible, setByResponsible] = useState<ResponsibleSummary[]>([]);
    const [recentExpenses, setRecentExpenses] = useState<RecentExpense[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingExpense, setEditingExpense] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState(`${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`);

    const fetchDashboardData = useCallback(async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get('/dashboard', {
                    params: { monthYear: selectedMonth }
                });             

                setSummaryData(response.data.summary);
                setByResponsible(response.data.byResponsible);
                setRecentExpenses(response.data.recent);
            } catch (err) {
                console.error("Erro ao buscar dados do dashboard:", err);
                setError("Não foi possível carregar os dados do dashboard.");
            } finally {
                setLoading(false);
            }
        }, [selectedMonth]);

    useEffect(() => {fetchDashboardData()}, [selectedMonth]);
    
    const handleOpenCreateModal = () => {
        setEditingExpense(null);
        setIsModalOpen(true);
    };

    const handleSave = () => {
        setIsModalOpen(false);
        setEditingExpense(null);
        fetchDashboardData();
    };  
    
    const totalResponsibleExpenses = useMemo(() => {
        return byResponsible.reduce((acc, item) => acc + Number(item.total), 0);
    }, [byResponsible]);
    
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
                    <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
                    <p className="text-gray-500">Resumo geral das suas finanças.</p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <input 
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-semibold w-full flex-1"
                    />
                    <button onClick={handleOpenCreateModal} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 flex items-center transition-colors">
                        <Plus size={20} className="mr-2" />
                        <span className="hidden sm:inline">Nova Despesa</span>
                    </button>
                 </div>
            </header>            
            
            {loading && <div className="text-center p-4">Carregando...</div>}
            {error && <div className="text-center p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

            {!loading && !error && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-xl shadow-md flex items-center">
                            <div className="p-3 rounded-full bg-red-100"><ArrowDown className="text-red-500" /></div>
                            <div className="ml-4">
                                <p className="text-gray-500">Total Despesas</p>
                                <p className="text-2xl font-bold text-gray-800">{new Intl.NumberFormat('pt-BR', {style: 'currency',currency: 'BRL'}).format(+summaryData.totalExpenses)}</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-md flex items-center">
                            <div className="p-3 rounded-full bg-yellow-100"><TriangleAlert className="text-yellow-500" /></div>
                            <div className="ml-4">
                                <p className="text-gray-500">Pendentes</p>
                                <p className="text-2xl font-bold text-gray-800">{new Intl.NumberFormat('pt-BR', {style: 'currency',currency: 'BRL'}).format(+summaryData.pending)}</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-md flex items-center">
                            <div className="p-3 rounded-full bg-green-100"><Check className="text-green-500" /></div>
                            <div className="ml-4">
                                <p className="text-gray-500">Pagas</p>
                                <p className="text-2xl font-bold text-gray-800">{new Intl.NumberFormat('pt-BR', {style: 'currency',currency: 'BRL'}).format(+summaryData.paid)}</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-md flex items-center">
                            <div className="p-3 rounded-full bg-blue-100"><CreditCardIcon className="text-blue-500" /></div>
                            <div className="ml-4">
                                <p className="text-gray-500">Fatura Cartões</p>
                                <p className="text-2xl font-bold text-gray-800">{new Intl.NumberFormat('pt-BR', {style: 'currency',currency: 'BRL'}).format(+summaryData.cardBill)}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
                            <h3 className="text-xl font-semibold text-gray-700 mb-4">Despesas por Responsável</h3>
                            <div className="space-y-4">
                                {byResponsible.map((item, index) => {
                                    const percentage = totalResponsibleExpenses > 0 ? (Number(item.total) / totalResponsibleExpenses) * 100 : 0;
                                    return (
                                        <div key={item.name}>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-base font-medium text-gray-600">{item.name}</span>
                                                <span className="text-base font-medium text-gray-600">{new Intl.NumberFormat('pt-BR', {style: 'currency',currency: 'BRL'}).format(+item.total)}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-4">
                                                <div 
                                                    className={`${barColors[index % barColors.length]} h-4 rounded-full`} 
                                                    style={{width: `${percentage}%`}}>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                                {byResponsible.length === 0 && <p className="text-gray-500">Nenhuma despesa encontrada para este mês.</p>}
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h3 className="text-xl font-semibold text-gray-700 mb-4">Despesas Recentes</h3>
                            <ul className="space-y-4">
                                {recentExpenses.map(expense => (
                                    <li key={expense.expense_id} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            {renderCategoryIcon(expense.category_name)}
                                            <div className="ml-3">
                                                <p className="font-semibold">{expense.description}</p>
                                                <p className="text-sm text-gray-500">{expense.category_name}</p>
                                            </div>
                                        </div>
                                        <span className="font-semibold text-red-600">- {new Intl.NumberFormat('pt-BR', {style: 'currency',currency: 'BRL'}).format(+expense.amount)}</span>
                                    </li>
                                ))}
                                {recentExpenses.length === 0 && <p className="text-gray-500">Nenhuma despesa recente.</p>}
                            </ul>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}

export default DashboardPage;