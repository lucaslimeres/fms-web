import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import UserModal from '../components/UserModal'; // NOVO

const UsersPage: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { user: currentUser } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false); // NOVO

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);
    
    const handleDelete = async (userId: string) => {
        if (window.confirm("Tem certeza que deseja remover este usuário?")) {
            try {
                await api.delete(`/users/${userId}`);
                fetchUsers();
            } catch (error: any) {
                console.error("Erro ao remover usuário:", error);
                alert(error.response?.data?.message || "Falha ao remover usuário.");
            }
        }
    };

    const handleSaveUser = () => {
        setIsModalOpen(false);
        fetchUsers();
    };

    return (
        <>
            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveUser}
            />

            <div className="space-y-12 animate-in fade-in duration-500 text-left">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-left">
                    <div>
                    <h2 className="text-5xl font-black text-gray-900 tracking-tight italic text-left">Equipe</h2>
                    <p className="text-teal-600 font-black uppercase text-[10px] tracking-[0.3em] mt-2 ml-1 text-left">Acessos administrativos</p>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto bg-teal-500 text-white px-10 py-5 rounded-[24px] font-black text-lg hover:bg-teal-600 shadow-2xl italic flex items-center justify-center gap-3"><Plus size={24}/> Novo Membro</button>
                </header>            

                {loading ? <p>Carregando usuários...</p> : (
                    <div className="bg-white rounded-[56px] shadow-sm border border-teal-50 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-teal-50/30 text-[10px] font-black text-teal-800 uppercase tracking-[0.3em]">
                                <th className="py-8 px-12">Usuário</th>
                                <th className="py-8 px-12">E-mail</th>
                                <th className="py-8 px-12 text-center">Nível</th>
                                <th className="py-8 px-12 text-right">Controles</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    // <tr key={user.user_id} className="bg-white">
                                    //     <td className="px-6 py-4 font-medium text-gray-900">{user.name} {user.email === currentUser?.email && '(Você)'}</td>
                                    //     <td className="px-6 py-4">{user.email}</td>
                                    //     <td className="px-6 py-4">
                                    //         <select defaultValue={user.role} className="border-gray-300 rounded-md shadow-sm" disabled={user.email === currentUser?.email}>
                                    //             <option value="user">Usuário Padrão</option>
                                    //             <option value="admin">Administrador</option>
                                    //         </select>
                                    //     </td>
                                    //     <td className="px-6 py-4 text-right">
                                    //         {user.email !== currentUser?.email && (
                                    //             <button onClick={() => handleDelete(user.user_id)} className="text-red-600 hover:text-red-800" title="Remover Usuário"><Trash2 size={18} /></button>
                                    //         )}
                                    //     </td>
                                    // </tr>
                                    <tr key={user.user_id} className="border-b border-teal-50/50 hover:bg-teal-50/10 transition-colors group">
                                        <td className="py-8 px-12 font-black text-gray-800 text-xl tracking-tight italic">{user.name} {user.email === currentUser?.email && '(Você)'}</td>
                                        <td className="py-8 px-12 font-black text-gray-800 text-xl tracking-tight italic">{user.email}</td>
                                        <td className="py-8 px-12 text-center"><span className="px-5 py-2 bg-teal-50 text-teal-500 rounded-full text-[10px] font-black uppercase tracking-widest italic">{user.role}</span></td>
                                        <td className="py-8 px-12 text-right">
                                        {/* <div className="flex justify-end gap-4"><button onClick={() => handleDelete(user.user_id)} className="p-4 bg-teal-50 text-teal-500 rounded-[20px] hover:bg-teal-500 hover:text-white transition-all"><Pencil size={22}/></button></div> */}
                                        <div className="flex justify-end gap-4"><button onClick={() => handleDelete(user.user_id)} className="p-4 bg-red-50 text-red-400 rounded-[20px] hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90"><Trash2 size={22}/></button></div>
                                        </td>
                                    </tr>                                    
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
};

export default UsersPage;