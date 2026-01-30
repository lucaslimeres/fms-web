import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { X } from 'lucide-react';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.accountId) {
      alert("Erro: ID da conta não encontrado. Por favor, faça login novamente.");
      return;
    }

    try {
      await api.post('/users', { ...formData, accountId: user.accountId });
      onSave();
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      alert("Falha ao criar o usuário.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-teal-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl border border-teal-50 overflow-hidden animate-in zoom-in duration-200">
        <div className="p-8 border-b border-teal-50 flex justify-between items-center bg-teal-50/30">
          <h3 className="text-2xl font-black text-teal-800 italic">Convidar Novo Usuário</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-teal-500 transition-colors"><X size={28}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-black text-teal-700 uppercase tracking-widest ml-1">Nome Completo</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-teal-100 font-bold text-gray-800 transition-all" required />
            </div>
            <div>
              <label className="text-[10px] font-black text-teal-700 uppercase tracking-widest ml-1">E-mail</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-teal-100 font-bold text-gray-800 transition-all" required />
            </div>
            <div>
              <label className="text-[10px] font-black text-teal-700 uppercase tracking-widest ml-1">Senha Provisória</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-teal-100 font-bold text-gray-800 transition-all" required />
            </div>
            <div>
              <label className="text-[10px] font-black text-teal-700 uppercase tracking-widest ml-1">Perfil de Acesso</label>
              <select name="role" value={formData.role} onChange={handleChange} className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-teal-100 font-bold text-gray-800 transition-all">
                <option value="user">Usuário Padrão</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 font-black text-gray-400 hover:text-teal-500 transition-colors uppercase text-xs tracking-widest">Cancelar</button>
            <button type="submit" className="flex-1 bg-teal-500 text-white font-black py-4 rounded-2xl hover:bg-teal-600 shadow-xl shadow-teal-100 transition-all active:scale-95 italic">Convidar</button>
          </div>
        </form>
      </div>
    </div>
  );

};
export default UserModal;