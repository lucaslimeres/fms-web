import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Columns3Cog } from 'lucide-react';

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Data de Vencimento</label>
          <input type="date" name="referenceDate" value={formData.referenceDate} onChange={handleChange} className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tipo de Conta</label>
          <select name="billType" value={formData.billType} onChange={handleChange} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md">
            <option value="variable">Variável</option>
            <option value="fixed">Fixa</option>
          </select>
        </div>
      </div>
    </>
  );

  const renderCardForm = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Data da Compra</label>
          <input type="date" name="referenceDate" value={formData.referenceDate} onChange={handleChange} className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Nº de Parcelas</label>
          <input type="number" name="installments" value={formData.installments} onChange={handleChange} min="1" className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md" required />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Cartão de Crédito</label>
        <select name="cardId" value={formData.cardId} onChange={handleChange} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md" required>
          <option value="">Selecione um cartão</option>
          {creditCards.map(card => <option key={card.id} value={card.id}>{card.name}</option>)}
        </select>
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-2xl font-bold text-gray-800">{isEditing ? 'Editar Despesa' : 'Nova Despesa'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {!isEditing && (
              <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-6">
                  <button type="button" onClick={() => setActiveTab('bill')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg ${activeTab === 'bill' ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent'}`}>Conta / Fatura</button>
                  <button type="button" onClick={() => setActiveTab('credit_card')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg ${activeTab === 'credit_card' ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent'}`}>Cartão de Crédito</button>
                </nav>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                <input type="text" name="description" value={formData.description} onChange={handleChange} className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Valor Total</label>
                  <input type="number" name="amount" value={formData.amount} onChange={handleChange} step="0.01" className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Categoria</label>
                  <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md" required>
                    <option value="">Selecione uma categoria</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {activeTab === 'bill' ? 'Mês/Ano de Referência' : 'Mês/Ano da 1ª Fatura'}
                </label>
                <input 
                  type="month" 
                  name="referenceMonthYear" 
                  value={formData.referenceMonthYear} 
                  onChange={handleChange} 
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md" 
                  required 
                />
              </div>              
              <div>
                <label className="block text-sm font-medium text-gray-700">Atribuir a</label>
                <select name="responsibleOrGroupId" value={formData.responsibleOrGroupId} onChange={handleChange} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md" required>
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
          </div>
          <div className="flex justify-end items-center p-6 bg-gray-50 rounded-b-xl space-x-4">
            <button type="button" onClick={onClose} className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100">Cancelar</button>
            <button type="submit" className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-semibold">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;