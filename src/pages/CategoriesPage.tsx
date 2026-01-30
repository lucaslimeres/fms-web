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
                title={editingCategory ? 'Editar Tag' : 'Nova Tag'}
                label="Nome da Categoria"
            />

            <div className="space-y-12 animate-in fade-in duration-500">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                    <h2 className="text-5xl font-black text-gray-900 tracking-tight italic">Tags</h2>
                    <p className="text-teal-600 font-black uppercase text-[10px] tracking-[0.3em] mt-2 ml-1">Categorização e filtros de gastos</p>
                    </div>
                    <button 
                    onClick={() => { setEditingCategory(null); setIsModalOpen(true); }}
                    className="w-full md:w-auto bg-teal-500 text-white px-10 py-5 rounded-[24px] font-black text-lg hover:bg-teal-600 shadow-2xl shadow-teal-200 transition-all flex items-center justify-center gap-3 active:scale-95 italic"
                    >
                    <Plus size={24}/> Nova Tag
                    </button>
                </header>

                {loading ? <p>Carregando categorias...</p> : (
                    <div className="bg-white rounded-[56px] shadow-sm border border-teal-50 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-teal-50/30 text-[10px] font-black text-teal-800 uppercase tracking-[0.3em]">
                                <th className="py-8 px-12">Nome da Tag</th>
                                <th className="py-8 px-12 text-right">Controles</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map(cat => (
                                    <tr key={cat.id} className="border-b border-teal-50/50 hover:bg-teal-50/10 transition-colors group">
                                        <td className="py-8 px-12">
                                        <div className="flex items-center gap-5">
                                            <div className="w-4 h-4 rounded-full bg-emerald-400 group-hover:scale-125 transition-transform shadow-emerald-100 shadow-xl"></div>
                                            <span className="font-black text-gray-800 text-2xl tracking-tight">{cat.name}</span>
                                        </div>
                                        </td>
                                        <td className="py-8 px-12 text-right">
                                        <div className="flex justify-end gap-4 opacity-0 group-hover:opacity-100 transition-all">
                                            <button 
                                                onClick={() => { setEditingCategory(cat); setIsModalOpen(true); }}
                                                className="p-4 bg-teal-50 text-teal-500 rounded-[20px] hover:bg-teal-500 hover:text-white transition-all shadow-sm active:scale-90"
                                            >
                                                <Pencil size={22}/>
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(cat.id)}
                                                className="p-4 bg-red-50 text-red-400 rounded-[20px] hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90"
                                            >
                                                <Trash2 size={22}/></button>
                                        </div>
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

export default CategoriesPage;