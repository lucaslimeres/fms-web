import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, X } from 'lucide-react';

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
    <div className="fixed inset-0 bg-teal-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl border border-teal-50 overflow-hidden animate-in zoom-in duration-200">
        <div className="p-8 border-b border-teal-50 flex justify-between items-center bg-teal-50/30">
          <h3 className="text-2xl font-black text-teal-800 italic">{isEditing ? 'Editar Grupo' : 'Novo Grupo'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-teal-500 transition-colors"><X size={28}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-black text-teal-700 uppercase tracking-widest ml-1">Nome do Grupo</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-teal-100 font-bold text-gray-800 transition-all" required />
            </div>
            <div>
              <h4 className="text-lg font-black text-teal-700 uppercase mb-2">Membros</h4>
              <div className="space-y-2 mb-4">
                {members.map(member => (
                  <div key={member.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span>{member.name}</span>
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] font-black text-teal-700 uppercase tracking-widest ml-1">Peso:</label>
                      <input type="number" value={member.weight} onChange={(e) => handleWeightChange(member.id, parseInt(e.target.value))} min="1" className="w-16 p-1 border rounded-md text-center" />
                      <button type="button" onClick={() => handleRemoveMember(member.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-end gap-2 p-3 border-t">
                <div className="flex-1">
                  <label className="text-[10px] font-black text-teal-700 uppercase tracking-widest ml-1">Adicionar Responsável</label>
                  <select value={newMemberId} onChange={(e) => setNewMemberId(e.target.value)} className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-teal-100 font-bold text-gray-800 transition-all">
                    <option value="">Selecione...</option>
                    {allResponsibles.filter(r => !members.some(m => m.id === r.id)).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div>
                   <label className="text-[10px] font-black text-teal-700 uppercase tracking-widest ml-1">Peso</label>
                  <input type="number" value={newMemberWeight} onChange={(e) => setNewMemberWeight(parseInt(e.target.value))} min="1" className="w-20 block p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-teal-100 font-bold text-gray-800 transition-all" />
                </div>
                <button type="button" onClick={handleAddMember} className="bg-blue-100 text-blue-700 font-semibold p-3 rounded-lg hover:bg-blue-200 flex"><Plus size={18} /></button>
              </div>
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 font-black text-gray-400 hover:text-teal-500 transition-colors uppercase text-xs tracking-widest">Cancelar</button>
            <button type="submit" className="flex-1 bg-teal-500 text-white font-black py-4 rounded-2xl hover:bg-teal-600 shadow-xl shadow-teal-100 transition-all active:scale-95 italic">Salvar Grupo</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupModal;