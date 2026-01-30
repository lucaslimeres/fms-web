import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { X } from 'lucide-react';

interface CreditCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  cardToEdit: any | null;
}

const CreditCardModal: React.FC<CreditCardModalProps> = ({ isOpen, onClose, onSave, cardToEdit }) => {
  const [formData, setFormData] = useState({ name: '', dueDay: '', closingDay: '' });
  const isEditing = !!cardToEdit;

  useEffect(() => {
    if (isEditing) {
      setFormData({
        name: cardToEdit.name,
        dueDay: cardToEdit.dueDay,
        closingDay: cardToEdit.closingDay,
      });
    } else {
      setFormData({ name: '', dueDay: '', closingDay: '' });
    }
  }, [cardToEdit, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cardData = {
      name: formData.name,
      dueDay: parseInt(formData.dueDay),
      closingDay: parseInt(formData.closingDay),
    };

    try {
      if (isEditing) {
        await api.put(`/credit-cards/${cardToEdit.id}`, cardData);
      } else {
        await api.post('/credit-cards', cardData);
      }
      onSave();
    } catch (error) {
      console.error("Erro ao salvar cartão:", error);
      alert("Falha ao salvar o cartão.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-teal-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl border border-teal-50 overflow-hidden animate-in zoom-in duration-200">
        <div className="p-8 border-b border-teal-50 flex justify-between items-center bg-teal-50/30">
          <h3 className="text-2xl font-black text-teal-800 italic">{isEditing ? 'Editar Cartão' : 'Novo Cartão'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-teal-500 transition-colors"><X size={28}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-black text-teal-700 uppercase tracking-widest ml-1">Nome do Cartão</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-teal-100 font-bold text-gray-800 transition-all" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-teal-700 uppercase tracking-widest ml-1">Dia do Vencimento</label>
                <input type="number" name="dueDay" value={formData.dueDay} onChange={handleChange} min="1" max="31" className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-teal-100 font-bold text-gray-800 transition-all" required />
              </div>
              <div>
                <label className="text-[10px] font-black text-teal-700 uppercase tracking-widest ml-1">Dia do Fechamento</label>
                <input type="number" name="closingDay" value={formData.closingDay} onChange={handleChange} min="1" max="31" className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-teal-100 font-bold text-gray-800 transition-all" required />
              </div>
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 font-black text-gray-400 hover:text-teal-500 transition-colors uppercase text-xs tracking-widest">Cancelar</button>
            <button type="submit" className="flex-1 bg-teal-500 text-white font-black py-4 rounded-2xl hover:bg-teal-600 shadow-xl shadow-teal-100 transition-all active:scale-95 italic">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreditCardModal;