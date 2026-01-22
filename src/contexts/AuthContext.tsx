import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface User {
  name: string;
  email: string;
  accountId: string;
  role: 'admin' | 'user';
}

interface AuthContextData {
  isAuthenticated: boolean;
  user: User | null;
  signIn(credentials: any): Promise<void>;
  signOut(): void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storagedToken = localStorage.getItem('@FinancasApp:token');
    const storagedUser = localStorage.getItem('@FinancasApp:user');

    if (storagedToken && storagedUser) {
      api.defaults.headers.common['Authorization'] = `Bearer ${storagedToken}`;
      setUser(JSON.parse(storagedUser));
    }
    setLoading(false);
  }, []);

  const signIn = async (credentials: any) => {
    const { data } = await api.post('/users/login', credentials);
    const { token, user: userData } = data;

    localStorage.setItem('@FinancasApp:token', token);
    localStorage.setItem('@FinancasApp:user', JSON.stringify(userData)); // Armazena o objeto do usuário
    
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    setUser(userData);
    navigate('/dashboard');
  };

  const signOut = () => {
    localStorage.removeItem('@FinancasApp:token');
    localStorage.removeItem('@FinancasApp:user'); // Limpa o usuário também
    setUser(null);
    navigate('/login');
  };
  
  if (loading) {
    return <p>Carregando...</p>;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}