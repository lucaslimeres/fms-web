import React, { type JSX } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { user } = useAuth();
  
  // Se o usuário não for admin, redireciona para a página inicial (Dashboard)
  if (user?.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return children;
};

export default AdminRoute;