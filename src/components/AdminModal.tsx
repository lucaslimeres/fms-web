import React, { useState, useEffect } from 'react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  itemToEdit: { name: string } | null;
  title: string;
  label: string;
}

const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, onSave, itemToEdit, title, label }) => {
  const [name, setName] = useState('');
  const isEditing = !!itemToEdit;

  useEffect(() => {
    if (isOpen) {
      setName(isEditing ? itemToEdit.name : '');
    }
  }, [itemToEdit, isOpen, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md"
              required
            />
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

export default AdminModal;