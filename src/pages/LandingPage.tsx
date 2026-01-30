import React, { useState } from 'react';
import { 
  CheckCircle, PieChart, Smartphone, ArrowRight, Users,
} from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';

const BRAND_NAME = "Meu Bolso";
// const SLOGAN = "Simples como tem que ser.";

const LandingPage = () => {
  const [formData, setFormData] = useState({ accountName: '', userName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleClick = () => {
    // Redireciona para a página /login
    navigate('/login');
  };  

  const handleInputChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post(`/accounts`, formData);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-teal-50/30 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-10 text-center border border-teal-100">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-3xl font-black text-teal-800 mb-4">Conta Criada!</h2>
          <p className="text-gray-500 mb-8 font-medium">Parabéns! Sua conta de administrador para a <strong>{formData.accountName}</strong> foi criada com sucesso.</p>
          <button onClick={handleClick} className="block w-full bg-teal-500 text-white font-black py-4 rounded-2xl hover:bg-teal-600 transition-all shadow-lg shadow-teal-100 italic">Ir para o Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-teal-100">
      <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto border-b border-teal-50">
        <div className="flex items-center gap-3">
          <Logo size={32} />
          <span className="text-2xl font-black tracking-tighter text-teal-700">{BRAND_NAME}</span>
        </div>
        <div className="hidden md:flex items-center gap-8 font-black text-[10px] uppercase tracking-widest text-gray-400">
          <a href="#features" className="hover:text-teal-500 transition-colors">Funcionalidades</a>
          <button onClick={handleClick} className="bg-teal-500 text-white px-8 py-2 rounded-full hover:bg-teal-600 transition-all shadow-lg shadow-teal-50">Entrar</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-16 md:py-24 max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div className="space-y-8 text-center md:text-left">
          <h1 className="text-6xl md:text-8xl font-black leading-[0.9] text-gray-900 tracking-tight italic">
            Dinheiro sob <span className="text-teal-500">controle.</span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-lg font-medium">
            Gerencie faturas, cartões e despesas compartilhadas com a simplicidade que você sempre quis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <a href="#register" className="bg-teal-500 text-white px-10 py-5 rounded-[24px] font-black text-xl hover:bg-teal-600 shadow-2xl shadow-teal-200 transition-all flex items-center justify-center gap-2 italic">
              Começar Agora <ArrowRight size={24} />
            </a>
          </div>
        </div>
        <div className="relative hidden md:block">
           <div className="bg-teal-50 rounded-[56px] p-8 aspect-square border-4 border-white shadow-2xl">
              <div className="bg-white w-full h-full rounded-[40px] shadow-inner p-8 border border-teal-50 flex flex-col justify-between">
                <div className="flex justify-between items-center"><div className="h-4 w-32 bg-gray-100 rounded-full"></div><Logo size={40}/></div>
                <div className="grid grid-cols-2 gap-6"><div className="h-32 bg-teal-50 rounded-3xl"></div><div className="h-32 bg-emerald-50 rounded-3xl"></div></div>
                <div className="space-y-3"><div className="h-12 bg-gray-50 rounded-2xl w-full"></div><div className="h-12 bg-gray-50 rounded-2xl w-3/4"></div></div>
              </div>
           </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-teal-50/30 py-24 px-6">
        <div className="max-w-7xl mx-auto text-center mb-16 space-y-4">
          <h2 className="text-4xl font-black text-teal-800 italic">Tudo o que você precisa</h2>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em]">Desenvolvido para simplificar o caos</p>
        </div>
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { icon: PieChart, title: "Relatórios Claros", desc: "Visualize para onde seu dinheiro vai com gráficos intuitivos." },
            { icon: Users, title: "Gastos em Grupo", desc: "Divida contas com pesos diferentes entre membros da família." },
            { icon: Smartphone, title: "100% Responsivo", desc: "Acesse e controle suas faturas de qualquer dispositivo." },
          ].map((f, i) => (
            <div key={i} className="bg-white p-10 rounded-[40px] border border-teal-50 shadow-sm hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-teal-50 text-teal-500 rounded-[20px] flex items-center justify-center mb-6 group-hover:bg-teal-500 group-hover:text-white transition-all">
                <f.icon size={32} />
              </div>
              <h3 className="text-2xl font-black text-gray-800 mb-3 italic">{f.title}</h3>
              <p className="text-gray-400 font-medium leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Register */}
      <section id="register" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="bg-teal-900 rounded-[56px] overflow-hidden flex flex-col lg:flex-row shadow-2xl border-8 border-teal-800">
          <div className="lg:w-1/2 p-12 lg:p-20 text-white flex flex-col justify-center space-y-8">
            <h2 className="text-5xl lg:text-6xl font-black leading-tight italic">Assuma o controle.</h2>
            <p className="text-teal-200 text-xl font-medium leading-relaxed">Crie sua conta em segundos e comece a organizar sua vida financeira hoje mesmo.</p>
            <div className="space-y-4 font-black text-[10px] uppercase tracking-widest text-teal-400">
              <div className="flex items-center gap-3"><CheckCircle size={18} className="text-emerald-400"/> Grátis para testar</div>
              <div className="flex items-center gap-3"><CheckCircle size={18} className="text-emerald-400"/> Sem letras miúdas</div>
            </div>
          </div>
          <div className="lg:w-1/2 bg-white p-12 lg:p-20">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-xs font-black uppercase tracking-widest">{error}</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-teal-700 uppercase tracking-widest mb-2 ml-1">Organização/Família</label>
                  <input type="text" name="accountName" required placeholder="Ex: Família Silva" className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-4 focus:ring-teal-100 outline-none transition-all font-bold" onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-teal-700 uppercase tracking-widest mb-2 ml-1">Seu Nome</label>
                  <input type="text" name="userName" required placeholder="Seu nome completo" className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-4 focus:ring-teal-100 outline-none transition-all font-bold" onChange={handleInputChange} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-teal-700 uppercase tracking-widest mb-2 ml-1">E-mail Administrativo</label>
                <input type="email" name="email" required placeholder="seu@email.com" className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-4 focus:ring-teal-100 outline-none transition-all font-bold" onChange={handleInputChange} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-teal-700 uppercase tracking-widest mb-2 ml-1">Senha</label>
                <input type="password" name="password" required placeholder="Mínimo 8 caracteres" className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-4 focus:ring-teal-100 outline-none transition-all font-bold" onChange={handleInputChange} />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-teal-500 text-white font-black py-6 rounded-3xl text-xl hover:bg-teal-600 transition-all transform active:scale-95 shadow-xl shadow-teal-100 italic">
                {loading ? 'Criando...' : 'Criar Minha Conta'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;