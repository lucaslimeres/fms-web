import { X } from 'lucide-react';
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
    // <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30 p-4">
    //   <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
    //     <div className="flex justify-between items-center p-6 border-b">
    //       <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
    //       <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
    //     </div>
    //     <form onSubmit={handleSubmit}>
    //       <div className="p-6">
    //         <label className="block text-sm font-medium text-gray-700">{label}</label>
    //         <input
    //           type="text"
    //           value={name}
    //           onChange={(e) => setName(e.target.value)}
    //           className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md"
    //           required
    //         />
    //       </div>
    //       <div className="flex justify-end items-center p-6 bg-gray-50 rounded-b-xl space-x-4">
    //         <button type="button" onClick={onClose} className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100">Cancelar</button>
    //         <button type="submit" className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-semibold">Salvar</button>
    //       </div>
    //     </form>
    //   </div>
    // </div>
    <div className="fixed inset-0 bg-teal-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl border border-teal-50 overflow-hidden animate-in zoom-in duration-200">
        <div className="p-8 border-b border-teal-50 flex justify-between items-center bg-teal-50/30">
          <h3 className="text-2xl font-black text-teal-800 italic">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-teal-500 transition-colors"><X size={28}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-teal-700 uppercase tracking-widest ml-1">{label}</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-teal-100 font-bold text-gray-800 transition-all" 
              placeholder="Ex: Alimentação" 
              required 
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 font-black text-gray-400 hover:text-teal-500 transition-colors uppercase text-xs tracking-widest">Cancelar</button>
            <button type="submit" className="flex-1 bg-teal-500 text-white font-black py-4 rounded-2xl hover:bg-teal-600 shadow-xl shadow-teal-100 transition-all active:scale-95 italic">Salvar Tag</button>
          </div>
        </form>
      </div>
    </div>    
  );
};

export default AdminModal;