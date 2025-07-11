import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { ChevronDown, CreditCard, Plus, Pencil, Trash2 } from 'lucide-react';
import CreditCardModal from '../components/CreditCardModal';

const CreditCardsPage: React.FC = () => {
    const [faturas, setFaturas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [cardToEdit, setCardToEdit] = useState<any | null>(null);

    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState(`${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`);

    const fetchFaturas = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/credit-cards/faturas', { params: { monthYear: selectedMonth } });
            setFaturas(response.data);
        } catch (error) {
            console.error("Erro ao buscar faturas dos cartões:", error);
        } finally {
            setLoading(false);
        }
    }, [selectedMonth]);

    useEffect(() => {
        fetchFaturas();
    }, [fetchFaturas]);

    const handlePayFatura = async (cardId: string) => {
        if (window.confirm("Tem certeza que deseja marcar esta fatura como paga?")) {
            try {
                await api.patch(`/credit-cards/${cardId}/pay-fatura`, { monthYear: selectedMonth });
                fetchFaturas();
            } catch (error) {
                console.error("Erro ao pagar fatura:", error);
                alert("Não foi possível pagar a fatura.");
            }
        }
    };

    const handleDeleteCard = async (cardId: string) => {
        if (window.confirm("Tem certeza que deseja excluir este cartão? Esta ação não pode ser desfeita.")) {
            try {
                await api.delete(`/credit-cards/${cardId}`);
                fetchFaturas();
            } catch (error) {
                console.error("Erro ao excluir cartão:", error);
                alert("Não foi possível excluir o cartão.");
            }
        }
    };

    const handleOpenCreateModal = () => {
        setCardToEdit(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (card: any) => {
        setCardToEdit(card);
        setIsModalOpen(true);
    };
    
    const handleSave = () => {
        setIsModalOpen(false);
        setCardToEdit(null);
        fetchFaturas();
    };

    const toggleAccordion = (id: string) => {
        setOpenAccordion(openAccordion === id ? null : id);
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

    return (
        <>
            <CreditCardModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                cardToEdit={cardToEdit}
            />

            <header className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Cartões de Crédito</h2>
                    <p className="text-gray-500">Gerencie suas faturas e cartões.</p>
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
                        <span className="hidden sm:inline">Novo Cartão</span>
                    </button>
                </div>
            </header>

            {loading && <p>Carregando faturas...</p>}

            <div className="space-y-6">
                {faturas.map((fatura) => (
                    <div key={fatura.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                <div className="flex-1 flex items-center gap-4 text-left">
                                    <CreditCard className="text-4xl text-blue-800 flex-shrink-0" />
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800">{fatura.name}</h3>
                                        <p className="text-gray-500 text-sm">Vencimento dia {fatura.dueDay}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between w-full sm:w-auto gap-4 sm:gap-6">
                                    <div className="text-right">
                                        <p className="text-gray-500 text-sm">Fatura</p>
                                        <p className="font-bold text-xl text-red-500">{new Intl.NumberFormat('pt-BR', {style: 'currency',currency: 'BRL'}).format(+fatura.total)}</p>
                                    </div>
                                    <span className={`${getStatusClass(fatura.status)} text-sm font-medium px-3 py-1 rounded-full whitespace-nowrap`}>{fatura.status}</span>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleOpenEditModal(fatura)} className="text-gray-500 hover:text-blue-600" title="Editar Cartão"><Pencil size={18}/></button>
                                        <button onClick={() => handleDeleteCard(fatura.id)} className="text-gray-500 hover:text-red-600" title="Excluir Cartão"><Trash2 size={18}/></button>
                                        <button onClick={() => toggleAccordion(fatura.id)} className="text-gray-500 hover:text-gray-800" title="Ver Detalhes"><ChevronDown className={`transition-transform text-2xl ${openAccordion === fatura.id ? 'rotate-180' : ''}`} /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {openAccordion === fatura.id && (
                            <div className="p-6 border-t border-gray-200">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-lg font-semibold text-gray-700">Detalhamento da Fatura</h4>
                                    {fatura.status === 'Fatura Aberta' && (
                                        <button onClick={() => handlePayFatura(fatura.id)} className="bg-green-500 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-green-600 whitespace-nowrap">Marcar como Paga</button>
                                    )}
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
                                        <tbody>
                                            {fatura.expenses.length > 0 ? (
                                                fatura.expenses.map((exp: any) => (
                                                    <tr key={exp.expense_id} className="bg-white border-b">
                                                        <td className="px-6 py-4 whitespace-nowrap">{new Date(exp.reference_date).toLocaleDateString()}</td>
                                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{exp.description}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">{exp.responsible_name}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">{exp.category_name}</td>
                                                        <td className="px-6 py-4 text-right font-medium whitespace-nowrap">{new Intl.NumberFormat('pt-BR', {style: 'currency',currency: 'BRL'}).format(+exp.amount)}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="text-center py-4 text-gray-500">Nenhum gasto registrado para esta fatura.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </>
    );
};

export default CreditCardsPage;