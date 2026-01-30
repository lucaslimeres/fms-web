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

            <div className="space-y-12 animate-in fade-in duration-500">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <h2 className="text-5xl font-black text-gray-900 tracking-tight italic">Cartões de crédito</h2>
                        <p className="text-teal-600 font-black uppercase text-[10px] tracking-[0.3em] mt-2 ml-1">Gerencie suas faturas e cartões.</p>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="p-4 bg-white border border-teal-100 rounded-3xl font-black text-teal-700 outline-none shadow-sm" />        
                        <button onClick={handleOpenCreateModal} className="w-full md:w-auto bg-teal-500 text-white px-10 py-5 rounded-[24px] font-black text-lg hover:bg-teal-600 shadow-2xl transition-all flex items-center justify-center gap-3 italic"><Plus size={24}/> Novo Cartão</button>
                    </div>
                </header>

                {loading && <p>Carregando faturas...</p>}

                <div className="space-y-6">
                    {faturas.map((fatura, index) => (
                        <div key={fatura.id} className="bg-white p-10 rounded-[56px] shadow-sm border border-teal-50 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 ${index % 2 === 0 ? 'bg-teal-600' : 'bg-teal-500'} rounded-2xl flex items-center justify-center text-white shadow-lg`}><CreditCard size={28}/></div>
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900 tracking-tight italic">{fatura.name}</h3>                                        
                                        <p className="text-gray-500 text-sm">Vencimento dia {fatura.dueDay}</p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center w-full sm:w-auto gap-4 sm:gap-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-teal-500 uppercase tracking-widest">Fatura</p>
                                        <p className="text-5xl font-black text-gray-900 tracking-tighter">R$ {fatura.total}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleOpenEditModal(fatura)} className="p-5 bg-teal-50 rounded-[20px] text-teal-600 hover:bg-teal-500 hover:text-white transition-all" title="Editar Cartão"><Pencil size={18}/></button>
                                        <button onClick={() => handleDeleteCard(fatura.id)} className="p-5 bg-teal-50 rounded-[20px] text-teal-600 hover:bg-teal-500 hover:text-white transition-all" title="Excluir Cartão"><Trash2 size={18}/></button>
                                        <button onClick={() => toggleAccordion(fatura.id)} className="p-5 bg-teal-50 rounded-[20px] text-teal-600 hover:bg-teal-500 hover:text-white transition-all" title="Ver Detalhes"><ChevronDown size={28} /></button>
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
            </div>
        </>
    );
};

export default CreditCardsPage;