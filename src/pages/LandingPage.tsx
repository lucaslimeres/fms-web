import React, { useState } from 'react';
import { 
  CheckCircle, 
  PieChart, 
  ShieldCheck, 
  Smartphone, 
  ArrowRight,
  TrendingUp,
  Users
} from 'lucide-react';
import api from '../services/api';

const LandingPage = () => {
  const [formData, setFormData] = useState({
    accountName: '',
    userName: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Conta Criada!</h2>
          <p className="text-gray-600 mb-8">
            Parabéns, {formData.userName}! Sua conta de administrador para a <strong>{formData.accountName}</strong> foi criada com sucesso.
          </p>
          <a 
            href="/login" 
            className="block w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ir para o Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <TrendingUp className="text-white" size={24} />
          </div>
          <span className="text-2xl font-black tracking-tighter text-blue-900">Finanças+</span>
        </div>
        <div className="hidden md:flex items-center gap-8 font-medium text-gray-600">
          <a href="#features" className="hover:text-blue-600 transition-colors">Funcionalidades</a>
          {/* <a href="#pricing" className="hover:text-blue-600 transition-colors">Preços</a> */}
          <a href="/login" className="bg-gray-100 px-6 py-2 rounded-full hover:bg-gray-200 transition-colors">Entrar</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-16 md:py-24 max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div className="space-y-8 text-center md:text-left">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] text-gray-900 tracking-tight">
            Controle suas finanças com <span className="text-blue-600">precisão absoluta.</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
            Gerencie faturas, cartões de crédito e despesas compartilhadas em um só lugar. Feito para famílias e pequenos grupos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <a href="#register" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2">
              Começar Agora <ArrowRight size={20} />
            </a>
            <a href="#features" className="border border-gray-200 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all text-center">
              Ver Detalhes
            </a>
          </div>
        </div>
        <div className="relative">
          <div className="bg-blue-100 rounded-3xl w-full h-[400px] md:h-[500px] overflow-hidden shadow-2xl relative transform rotate-2">
             <div className="absolute inset-4 bg-white rounded-2xl shadow-inner border border-blue-50 p-6 transform -rotate-2">
                {/* Mockup UI */}
                <div className="h-4 w-32 bg-gray-100 rounded mb-6"></div>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="h-24 bg-red-50 rounded-xl border border-red-100"></div>
                  <div className="h-24 bg-green-50 rounded-xl border border-green-100"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-12 bg-gray-50 rounded-lg"></div>
                  <div className="h-12 bg-gray-50 rounded-lg"></div>
                  <div className="h-12 bg-gray-50 rounded-lg"></div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 py-24 px-6">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Tudo o que você precisa</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Desenvolvido para simplificar o caos financeiro do dia a dia.</p>
        </div>
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { icon: PieChart, title: "Relatórios Inteligentes", desc: "Visualize exatamente para onde seu dinheiro está indo com gráficos claros." },
            { icon: Users, title: "Gastos Compartilhados", desc: "Divida contas com pesos diferentes entre os membros da família ou grupo." },
            { icon: Smartphone, title: "Totalmente Responsivo", desc: "Acesse e controle suas faturas de qualquer dispositivo, em qualquer lugar." },
            { icon: ShieldCheck, title: "Segurança de Dados", desc: "Seus dados estão protegidos com criptografia de ponta a ponta." },
            { icon: CheckCircle, title: "Gestão de Faturas", desc: "Controle datas de vencimento e evite juros esquecidos." },
            { icon: ArrowRight, title: "Muito Mais", desc: "Categorias personalizáveis, múltiplos cartões e histórico completo." },
          ].map((feature, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Registration Section */}
      <section id="register" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="bg-blue-900 rounded-[32px] overflow-hidden flex flex-col lg:flex-row shadow-2xl">
          <div className="lg:w-1/2 p-12 lg:p-20 text-white flex flex-col justify-center">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">Pronto para assumir o controle?</h2>
            <p className="text-blue-100 text-xl mb-8 leading-relaxed">
              Crie sua conta em menos de 1 minuto e comece a organizar sua vida financeira hoje mesmo.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-blue-400" />
                <span>Sem necessidade de cartão de crédito para testar.</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="text-blue-400" />
                <span>Acesso imediato a todas as funcionalidades.</span>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2 bg-white p-12 lg:p-20">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-medium">{error}</div>}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Nome da Organização/Família</label>
                <input 
                  type="text" 
                  name="accountName"
                  required
                  placeholder="Ex: Família Silva"
                  className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Seu Nome</label>
                <input 
                  type="text" 
                  name="userName"
                  required
                  placeholder="Seu nome completo"
                  className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">E-mail Administrativo</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  placeholder="seu@email.com"
                  className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Senha</label>
                <input 
                  type="password" 
                  name="password"
                  required
                  placeholder="Mínimo 8 caracteres"
                  className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  onChange={handleInputChange}
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 text-white font-black py-5 rounded-xl text-lg hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-100"
              >
                {loading ? 'Criando sua conta...' : 'Criar Minha Conta Grátis'}
              </button>
              <p className="text-center text-sm text-gray-400 mt-6">
                Ao clicar em criar conta, você concorda com nossos termos de serviço.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <TrendingUp className="text-white" size={20} />
            </div>
            <span className="text-xl font-black">Finanças+</span>
          </div>
          <div className="text-gray-400 text-sm">
            © 2024 Finanças+ System. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;