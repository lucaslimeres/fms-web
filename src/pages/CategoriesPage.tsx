import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import AdminModal from '../components/AdminModal';

const CategoriesPage: React.FC = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any | null>(null);
    
    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/categories');
            setCategories(response.data);
        } catch (error) {
            console.error("Erro ao buscar categorias:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleSave = async (name: string) => {
        try {
            if (editingCategory) {
                await api.put(`/categories/${editingCategory.id}`, { name });
            } else {
                await api.post('/categories', { name });
            }
            setIsModalOpen(false);
            setEditingCategory(null);
            fetchCategories();
        } catch (error) {
            console.error("Erro ao salvar categoria:", error);
            alert("Falha ao salvar categoria.");
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Tem certeza que deseja excluir esta categoria?")) {
            try {
                await api.delete(`/categories/${id}`);
                fetchCategories();
            } catch (error) {
                console.error("Erro ao excluir categoria:", error);
                alert("Falha ao excluir categoria.");
            }
        }
    };

    return (
        <>
            <AdminModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                itemToEdit={editingCategory}
                title={editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                label="Nome da Categoria"
            />
            <header className="flex flex-wrap justify-between items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Gerenciar Categorias</h2>
                    <p className="text-gray-500">Adicione, edite ou remova categorias de despesas.</p>
                </div>
                <button onClick={() => { setEditingCategory(null); setIsModalOpen(true); }} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 flex items-center">
                    <Plus size={20} className="mr-2" />
                    Nova Categoria
                </button>
            </header>

            {loading ? <p>Carregando categorias...</p> : (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Nome da Categoria</th>
                                <th scope="col" className="px-6 py-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {categories.map(cat => (
                                <tr key={cat.id} className="bg-white">
                                    <td className="px-6 py-4 font-medium text-gray-900">{cat.name}</td>
                                    <td className="px-6 py-4 text-right space-x-4">
                                        <button onClick={() => { setEditingCategory(cat); setIsModalOpen(true); }} className="text-blue-600 hover:text-blue-800" title="Editar"><Pencil size={18} /></button>
                                        <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-800" title="Excluir"><Trash2 size={18} /></button>
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

export default CategoriesPage;