import React, { useState, useEffect } from 'react';
import api from '../services/api';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-2xl font-bold text-gray-800">{isEditing ? 'Editar Cartão' : 'Novo Cartão'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome do Cartão</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Dia do Vencimento</label>
                <input type="number" name="dueDay" value={formData.dueDay} onChange={handleChange} min="1" max="31" className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Dia do Fechamento</label>
                <input type="number" name="closingDay" value={formData.closingDay} onChange={handleChange} min="1" max="31" className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md" required />
              </div>
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

export default CreditCardModal;