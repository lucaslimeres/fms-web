import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-2xl font-bold text-gray-800">Convidar Novo Usuário</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">E-mail</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Senha Provisória</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Perfil de Acesso</label>
              <select name="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md">
                <option value="user">Usuário Padrão</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end items-center p-6 bg-gray-50 rounded-b-xl space-x-4">
            <button type="button" onClick={onClose} className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100">Cancelar</button>
            <button type="submit" className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-semibold">Convidar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;