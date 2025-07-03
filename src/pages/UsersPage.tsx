import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Plus, Trash2 } from 'lucide-react';
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
            <header className="flex flex-wrap justify-between items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Gerenciar Acessos</h2>
                    <p className="text-gray-500">Convide e gerencie os usuários da sua conta.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 flex items-center">
                    <Plus size={20} className="mr-2" />
                    Convidar Usuário
                </button>
            </header>

            {loading ? <p>Carregando usuários...</p> : (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Nome</th>
                                <th scope="col" className="px-6 py-3">Email</th>
                                <th scope="col" className="px-6 py-3">Perfil</th>
                                <th scope="col" className="px-6 py-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {users.map(user => (
                                <tr key={user.user_id} className="bg-white">
                                    <td className="px-6 py-4 font-medium text-gray-900">{user.name} {user.email === currentUser?.email && '(Você)'}</td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <select defaultValue={user.role} className="border-gray-300 rounded-md shadow-sm" disabled={user.email === currentUser?.email}>
                                            <option value="user">Usuário Padrão</option>
                                            <option value="admin">Administrador</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {user.email !== currentUser?.email && (
                                            <button onClick={() => handleDelete(user.user_id)} className="text-red-600 hover:text-red-800" title="Remover Usuário"><Trash2 size={18} /></button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
};

export default UsersPage;