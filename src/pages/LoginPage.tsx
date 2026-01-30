import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from '../components/Logo';

const BRAND_NAME = "Meu Bolso";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await signIn({ email, password });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao fazer login. Tente novamente.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-teal-50/30 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-[48px] shadow-2xl p-12 border border-teal-100 animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="text-center mb-12">
          <Logo size={64} className="mx-auto mb-8 shadow-xl shadow-teal-50 rounded-full p-2 bg-white" />
          <h2 className="text-4xl font-black text-teal-800 tracking-tight">Oi de novo!</h2>
          <p className="text-gray-400 mt-3 font-medium">Acesse seu {BRAND_NAME} digital.</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-8">
          <div>
            <label className="block text-[10px] font-black text-teal-700 uppercase tracking-[0.2em] mb-3 ml-1">E-mail</label>
            <input 
              type="email" 
              placeholder="seu@email.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl focus:ring-4 focus:ring-teal-100 outline-none transition-all placeholder:text-gray-300 font-bold" 
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-teal-700 uppercase tracking-[0.2em] mb-3 ml-1">Senha</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl focus:ring-4 focus:ring-teal-100 outline-none transition-all placeholder:text-gray-300 font-bold" 
              required
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-teal-500 text-white font-black py-6 rounded-[24px] text-xl hover:bg-teal-600 shadow-2xl shadow-teal-200 transition-all transform active:scale-95"
          >
            Abrir Meu Bolso
          </button>
        </form>
        {/* <p className="text-center mt-10 text-sm font-bold text-gray-400">
          Esqueceu a senha? <span className="text-teal-500 cursor-pointer hover:underline font-black">Recuperar</span>
        </p> */}
      </div>
    </div>
  );
};

export default LoginPage;