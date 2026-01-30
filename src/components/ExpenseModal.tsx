import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { X } from 'lucide-react';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  expenseToEdit: any | null;
}

// Tipos para os dados dos seletores
interface SelectOption { id: string; name: string; }
interface GroupOption { group_id: string; name: string; }

const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose, onSave, expenseToEdit }) => {
  const [activeTab, setActiveTab] = useState<'bill' | 'credit_card'>('bill');
  
  // Estados para os dados dos seletores
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [responsibles, setResponsibles] = useState<SelectOption[]>([]);
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [creditCards, setCreditCards] = useState<SelectOption[]>([]);

  // Estados do formulário
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    referenceDate: '',
    referenceMonthYear: '',
    categoryId: '',
    responsibleOrGroupId: '', // ID do responsável ou do grupo
    billType: '',
    cardId: '',
    installments: '1',
  });

  const isEditing = !!expenseToEdit;

  // Busca os dados para os seletores quando a modal abre
  const fetchDataForSelects = useCallback(async () => {
    try {
      const [catRes, respRes, groupRes, cardRes] = await Promise.all([
        api.get('/categories'),
        api.get('/responsibles'),
        api.get('/groups'),
        api.get('/credit-cards'),
      ]);
      console.log({ respRes, groupRes })
      setCategories(catRes.data.map((c: any) => ({ id: c.id, name: c.name })));
      setResponsibles(respRes.data.map((r: any) => ({ id: r.id, name: r.name })));
      setGroups(groupRes.data.map((g: any) => ({ group_id: g.id, name: g.name })));
      setCreditCards(cardRes.data.map((c: any) => ({ id: c.id, name: c.name })));
    } catch (error) {
      console.error("Erro ao buscar dados para a modal:", error);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchDataForSelects();
    }
  }, [isOpen, fetchDataForSelects]);

  // Preenche o formulário quando o modo de edição é ativado
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const currentMonthYear = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
      const currentDay = `${currentMonthYear}-${now.getDate().toString().padStart(2, '0')}`;
            
      if (isEditing) {
        console.log({ expenseToEdit })
        setActiveTab(expenseToEdit.type);
        setFormData({
            description: expenseToEdit.description,
            amount: expenseToEdit.amount.toString(),
            referenceDate: new Date(expenseToEdit.reference_date).toISOString().split('T')[0],
            referenceMonthYear: expenseToEdit.reference_month_year,
            categoryId: expenseToEdit.category_id,
            responsibleOrGroupId: expenseToEdit.responsible_id ? `responsible_${expenseToEdit.responsible_id}` : (expenseToEdit.group_id ? `group_${expenseToEdit.group_id}` : ''),
            billType: expenseToEdit.bill_type || 'variable',
            cardId: expenseToEdit.card_id || '',
            installments: (expenseToEdit.installment_total || '1').toString(),
        });
      } else {
        setFormData({
            description: '',
            amount: '',
            referenceDate: currentDay,
            referenceMonthYear: currentMonthYear,
            categoryId: '',
            responsibleOrGroupId: '',
            billType: '',
            cardId: '',
            installments: '1',
        });
        setActiveTab('bill');
      }
    }
  }, [expenseToEdit, isOpen, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const [type, id] = formData.responsibleOrGroupId.split('_');
    const isGroup = type === 'group';

    const expenseData = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        referenceDate: formData.referenceDate,
        referenceMonthYear: formData.referenceMonthYear,
        categoryId: formData.categoryId,
        responsibleId: !isGroup ? id : undefined,
        groupId: isGroup ? id : undefined,
        type: activeTab,
        billType: activeTab === 'bill' ? formData.billType : undefined,
        cardId: activeTab === 'credit_card' ? formData.cardId : undefined,
        installments: activeTab === 'credit_card' ? parseInt(formData.installments) : undefined,
    };

    try {
      if (isEditing) {
        // Na edição, não se pode mudar o tipo, responsável, etc. Apenas valores.
        await api.put(`/expenses/${expenseToEdit.expense_id}`, {
            description: formData.description,
            amount: parseFloat(formData.amount),
            referenceDate: formData.referenceDate,
            referenceMonthYear: formData.referenceMonthYear,
            categoryId: formData.categoryId,
        });
      } else {
        await api.post('/expenses', expenseData);
      }
      onSave();
    } catch (error) {
      console.error("Erro ao salvar despesa:", error);
      alert("Falha ao salvar a despesa.");
    }
  };

  if (!isOpen) return null;

  const renderBillForm = () => (
    <>
      <div className='space-y-2'>
        <div>
          <label className="text-[10px] font-black text-teal-700 uppercase tracking-widest ml-1">Data de Vencimento</label>
          <input type="date" name="referenceDate" value={formData.referenceDate} onChange={handleChange} className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-teal-100 font-bold text-gray-800 transition-all" required />
        </div>
      </div>
      <div className='space-y-2'>        
        <div>
          <label className="text-[10px] font-black text-teal-700 uppercase tracking-widest ml-1">Tipo de Conta</label>
          <select name="billType" value={formData.billType} onChange={handleChange} className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-teal-100 font-bold text-gray-800 transition-all">
            <option value="variable">Variável</option>
            <option value="fixed">Fixa</option>
          </select>
        </div>
      </div>
    </>
  );

  const renderCardForm = () => (
    <>
      <div className='space-y-2'>
        <div>
          <label className="text-[10px] font-black text-teal-700 uppercase tracking-widest ml-1">Data da Compra</label>
          <input type="date" name="referenceDate" value={formData.referenceDate} onChange={handleChange} className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-teal-100 font-bold text-gray-800 transition-all" required />
        </div>
      </div>
      <div className='space-y-2'>        
        <div>
          <label className="text-[10px] font-black text-teal-700 uppercase tracking-widest ml-1">Nº de Parcelas</label>
          <input type="number" name="installments" value={formData.installments} onChange={handleChange} min="1" className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-teal-100 font-bold text-gray-800 transition-all" required />
        </div>
      </div>
      <div className='md:col-span-2 space-y-2'>
        <label className="text-[10px] font-black text-teal-700 uppercase tracking-widest ml-1">Cartão de Crédito</label>
        <select name="cardId" value={formData.cardId} onChange={handleChange} className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-teal-100 font-bold text-gray-800 transition-all" required>
          <option value="">Selecione um cartão</option>
          {creditCards.map(card => <option key={card.id} value={card.id}>{card.name}</option>)}
        </select>
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 bg-teal-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-2 sm:p-4">
      {/* Container Principal da Modal */}
      <div className="bg-white w-full max-w-2xl h-full max-h-[95vh] sm:max-h-[95vh] flex flex-col rounded-[32px] sm:rounded-[40px] shadow-2xl border border-teal-50 overflow-hidden animate-in zoom-in duration-200">
        {/* Header Fixo */}
        <div className="p-5 sm:pb-1 sm:p-6 border-b border-teal-50 flex justify-between items-center bg-teal-50/30 flex-none">
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-black text-teal-800 italic">
              {expenseToEdit ? 'Editar Despesa' : 'Nova Despesa'}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-teal-500 hover:bg-teal-50 rounded-full transition-all"
          >
            <X size={28}/>
          </button>
        </div>

        {/* Corpo Rolável */}          
        <div className="flex-1 overflow-y-auto p-6 sm:p-5 space-y-8 min-h-0 bg-white" style={{ scrollbarWidth: 'thin', scrollbarColor: '#38b2ac #f0fff4' }}>
          {!isEditing && (
            <div className="mb-2 border-b border-gray-200">
              <nav className="-mb-px flex space-x-6">
                <button type="button" onClick={() => setActiveTab('bill')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg ${activeTab === 'bill' ? 'text-teal-600 border-teal-600' : 'text-gray-500 border-transparent'}`}>Conta / Fatura</button>
                <button type="button" onClick={() => setActiveTab('credit_card')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg ${activeTab === 'credit_card' ? 'text-teal-600 border-teal-600' : 'text-gray-500 border-transparent'}`}>Cartão de Crédito</button>
              </nav>
            </div>
          )}
          <form id="expense-form" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-teal-700 uppercase tracking-widest ml-1">Descrição</label>
                <input type="text" name="description" value={formData.description} onChange={handleChange} className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-teal-100 font-bold text-gray-800 transition-all" required />
              </div>
              <div className='space-y-2'>
                <div>
                  <label className="text-[10px] font-black text-teal-700 uppercase tracking-widest ml-1">Valor Total</label>
                  <input type="number" name="amount" value={formData.amount} onChange={handleChange} step="0.01" className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-teal-100 font-bold text-gray-800 transition-all" required />
                </div>
              </div>
              <div className='space-y-2'>                  
                <div>
                  <label className="text-[10px] font-black text-teal-700 uppercase tracking-widest ml-1">Categoria</label>
                  <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-teal-100 font-bold text-gray-800 transition-all" required>
                    <option value="">Selecione uma categoria</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
              </div>
              <div className='space-y-2'>
                <label className="text-[10px] font-black text-teal-700 uppercase tracking-widest ml-1">
                  {activeTab === 'bill' ? 'Mês/Ano de Referência' : 'Mês/Ano da 1ª Fatura'}
                </label>
                <input 
                  type="month" 
                  name="referenceMonthYear" 
                  value={formData.referenceMonthYear} 
                  onChange={handleChange} 
                  className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-teal-100 font-bold text-gray-800 transition-all" 
                  required 
                />
              </div>
              <div className='space-y-2'>
                <label className="text-[10px] font-black text-teal-700 uppercase tracking-widest ml-1">Atribuir a</label>
                <select name="responsibleOrGroupId" value={formData.responsibleOrGroupId} onChange={handleChange} className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-teal-100 font-bold text-gray-800 transition-all" required>
                  <option value="">Selecione...</option>
                  <optgroup label="Grupos">
                    {groups.map(group => <option key={group.group_id} value={`group_${group.group_id}`}>{group.name}</option>)}
                  </optgroup>
                  <optgroup label="Individuais">
                    {responsibles.map(resp => <option key={resp.id} value={`responsible_${resp.id}`}>{resp.name}</option>)}
                  </optgroup>
                </select>
              </div>
              {activeTab === 'bill' ? renderBillForm() : renderCardForm()}
            </div>
          </form>
        </div>

        {/* Footer Fixo */}
        <div className="p-6 sm:p-8 border-t border-teal-50 bg-white flex flex-col sm:flex-row justify-end gap-3 flex-none">
          <button type="button" onClick={onClose} className="px-8 py-4 font-black text-gray-400 hover:text-teal-600 transition-colors uppercase text-xs tracking-[0.2em]">Cancelar</button>
          <button onClick={handleSubmit} className="bg-teal-500 text-white px-12 py-4 rounded-[20px] font-black text-lg hover:bg-teal-600 shadow-2xl shadow-teal-100 transition-all transform active:scale-95 flex items-center justify-center gap-2 italic">Salvar</button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseModal;