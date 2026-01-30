import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import AdminModal from '../components/AdminModal';
import GroupModal from '../components/GroupModal'; // NOVO

const ResponsiblesPage: React.FC = () => {
    const [responsibles, setResponsibles] = useState<any[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [isResponsibleModalOpen, setIsResponsibleModalOpen] = useState(false);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [respRes, groupRes] = await Promise.all([
                api.get('/responsibles'),
                api.get('/groups')
            ]);
            setResponsibles(respRes.data);
            setGroups(groupRes.data);
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSaveResponsible = async (name: string) => {
        const url = `/responsibles`;
        const id = editingItem ? editingItem.id : null;
        try {
            if (id) {
                await api.put(`${url}/${id}`, { name });
            } else {
                await api.post(url, { name });
            }
            setIsResponsibleModalOpen(false);
            fetchData();
        } catch (error) {
            console.error(`Erro ao salvar responsável:`, error);
        }
    };

    const handleDelete = async (item: any, type: 'responsible' | 'group') => {
        const id = item.id;
        if (window.confirm(`Tem certeza que deseja excluir?`)) {
            try {
                await api.delete(`/${type}s/${id}`);
                fetchData();
            } catch (error) {
                console.error(`Erro ao excluir ${type}:`, error);
            }
        }
    };

    return (
        <>
            <AdminModal
                isOpen={isResponsibleModalOpen}
                onClose={() => setIsResponsibleModalOpen(false)}
                onSave={handleSaveResponsible}
                itemToEdit={editingItem}
                title={editingItem ? `Editar Responsável` : `Novo Responsável`}
                label={`Nome do Responsável`}
            />
            
            <GroupModal
                isOpen={isGroupModalOpen}
                onClose={() => setIsGroupModalOpen(false)}
                onSave={() => { setIsGroupModalOpen(false); fetchData(); }}
                groupToEdit={editingItem}
                allResponsibles={responsibles}
            />

            <div className="space-y-12 animate-in fade-in duration-500">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                    <h2 className="text-5xl font-black text-gray-900 tracking-tight italic text-left">Responsáveis e Grupos</h2>
                    <p className="text-teal-600 font-black uppercase text-[10px] tracking-[0.3em] mt-2 ml-1 text-left">Responsáveis cadastrados</p>
                    </div>
                    {/* <button className="w-full md:w-auto bg-teal-500 text-white px-10 py-5 rounded-[24px] font-black text-lg hover:bg-teal-600 shadow-2xl italic flex items-center justify-center gap-3"><Plus size={24}/> Nova Pessoa</button> */}
                </header>

                {loading ? <p>Carregando...</p> : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Coluna de Grupos */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-2xl font-semibold text-gray-700">Grupos</h3>
                                <button onClick={() => { setEditingItem(null); setIsGroupModalOpen(true); }} className="w-full md:w-auto bg-teal-500 text-white px-10 py-5 rounded-[24px] font-black text-lg hover:bg-teal-600 shadow-2xl italic flex items-center justify-center gap-3"><Plus size={24}/> Novo Grupo</button>
                            </div>
                            <div className="space-y-4">
                                {groups.map(group => (
                                    <div key={group.group_id} className="bg-white rounded-xl shadow-md p-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-xl font-bold text-gray-800">{group.name}</h4>
                                            <div>
                                                <button onClick={() => { setEditingItem(group); setIsGroupModalOpen(true); }} className="p-4 bg-teal-50 text-teal-500 rounded-[20px] hover:bg-teal-500 hover:text-white transition-all shadow-sm active:scale-90"><Pencil size={22}/></button>
                                                <button onClick={() => handleDelete(group, 'group')} className="p-4 bg-red-50 text-red-400 rounded-[20px] hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90"><Trash2 size={22}/></button>
                                            </div>
                                        </div>
                                        <p className="text-sm font-medium text-gray-600 mb-2">Membros e Pesos:</p>
                                        <div className="space-y-2">
                                            {group.members.map((member: any) => (
                                                <div key={member.responsible.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                                    <span>{member.responsible.name}</span>
                                                    <span className="text-sm font-semibold">Peso: {member.weight}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Coluna de Responsáveis Individuais */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-2xl font-semibold text-gray-700">Individuais</h3>
                                <button onClick={() => { setEditingItem(null); setIsResponsibleModalOpen(true); }} className="w-full md:w-auto bg-teal-500 text-white px-10 py-5 rounded-[24px] font-black text-lg hover:bg-teal-600 shadow-2xl italic flex items-center justify-center gap-3"><Plus size={24}/> Novo Responsável</button>
                            </div>
                            <div className="bg-white rounded-xl shadow-md">
                                <ul className="divide-y divide-gray-200">
                                    {responsibles.map(resp => (
                                        <li key={resp.id} className="p-4 flex justify-between items-center">
                                            <span className="font-medium">{resp.name}</span>
                                            <div>
                                                <button onClick={() => { setEditingItem(resp); setIsResponsibleModalOpen(true); }} className="p-4 bg-teal-50 text-teal-500 rounded-[20px] hover:bg-teal-500 hover:text-white transition-all shadow-sm active:scale-90"><Pencil size={22}/></button>
                                                <button onClick={() => handleDelete(resp, 'responsible')} className="p-4 bg-red-50 text-red-400 rounded-[20px] hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90"><Trash2 size={22}/></button>                                                
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default ResponsiblesPage;