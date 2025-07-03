import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2 } from 'lucide-react';

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  groupToEdit: any | null;
  allResponsibles: any[];
}

const GroupModal: React.FC<GroupModalProps> = ({ isOpen, onClose, onSave, groupToEdit, allResponsibles }) => {
  const [name, setName] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [newMemberId, setNewMemberId] = useState('');
  const [newMemberWeight, setNewMemberWeight] = useState(1);
  const isEditing = !!groupToEdit;

  useEffect(() => {
    if (isOpen) {
      setName(isEditing ? groupToEdit.name : '');
      setMembers(isEditing ? groupToEdit.members.map((m: any) => ({ ...m.responsible, weight: m.weight })) : []);
    }
  }, [groupToEdit, isOpen, isEditing]);

  const handleAddMember = () => {
    if (!newMemberId) return;
    const responsibleToAdd = allResponsibles.find(r => r.id === newMemberId);
    if (responsibleToAdd && !members.some(m => m.id === newMemberId)) {
      setMembers([...members, { ...responsibleToAdd, weight: newMemberWeight }]);
      setNewMemberId('');
      setNewMemberWeight(1);
    }
  };

  const handleRemoveMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
  };

  const handleWeightChange = (id: string, weight: number) => {
    setMembers(members.map(m => m.id === id ? { ...m, weight } : m));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let groupId = isEditing ? groupToEdit.id : null;
      
      // Cria ou atualiza o grupo
      if (isEditing) {
        await api.put(`/groups/${groupId}`, { name });
      } else {
        const response = await api.post('/groups', { name });
        groupId = response.data.id;
      }

      // Sincroniza os membros
      const existingMembers = groupToEdit?.members.map((m:any) => m.responsible.id) || [];
      const newMembers = members.map(m => m.id);

      // Adiciona/Atualiza membros
      for (const member of members) {
        await api.post(`/groups/${groupId}/members`, { responsibleId: member.id, weight: member.weight });
      }

      // Remove membros que não estão mais na lista
      for (const oldMemberId of existingMembers) {
        if (!newMembers.includes(oldMemberId)) {
          await api.delete(`/groups/${groupId}/members/${oldMemberId}`);
        }
      }

      onSave();
    } catch (error) {
      console.error("Erro ao salvar grupo:", error);
      alert("Falha ao salvar o grupo.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-2xl font-bold text-gray-800">{isEditing ? 'Editar Grupo' : 'Novo Grupo'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome do Grupo</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md" required />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-2">Membros</h4>
              <div className="space-y-2 mb-4">
                {members.map(member => (
                  <div key={member.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span>{member.name}</span>
                    <div className="flex items-center gap-2">
                      <label className="text-sm">Peso:</label>
                      <input type="number" value={member.weight} onChange={(e) => handleWeightChange(member.id, parseInt(e.target.value))} min="1" className="w-16 p-1 border rounded-md text-center" />
                      <button type="button" onClick={() => handleRemoveMember(member.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-end gap-2 p-3 border-t">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Adicionar Responsável</label>
                  <select value={newMemberId} onChange={(e) => setNewMemberId(e.target.value)} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md">
                    <option value="">Selecione...</option>
                    {allResponsibles.filter(r => !members.some(m => m.id === r.id)).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Peso</label>
                  <input type="number" value={newMemberWeight} onChange={(e) => setNewMemberWeight(parseInt(e.target.value))} min="1" className="mt-1 block w-20 py-2 px-3 border border-gray-300 rounded-md" />
                </div>
                <button type="button" onClick={handleAddMember} className="bg-blue-100 text-blue-700 font-semibold py-2 px-4 rounded-lg hover:bg-blue-200 flex items-center"><Plus size={18} /></button>
              </div>
            </div>
          </div>
          <div className="flex justify-end items-center p-6 bg-gray-50 rounded-b-xl space-x-4">
            <button type="button" onClick={onClose} className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100">Cancelar</button>
            <button type="submit" className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-semibold">Salvar Grupo</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupModal;