import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import InvoicesPage from './pages/InvoicesPage';
import CreditCardsPage from './pages/CreditCardsPage';
import ReportsPage from './pages/ReportsPage';
import CategoriesPage from './pages/CategoriesPage';
import ResponsiblesPage from './pages/ResponsiblesPage';
import UsersPage from './pages/UsersPage';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute'; // NOVO
import MainLayout from './components/MainLayout';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route 
            path="/"
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >

            {/* Rotas Públicas (para usuários logados) */}
            <Route index element={<DashboardPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/cards" element={<CreditCardsPage />} />
            <Route path="/reports" element={<ReportsPage />} />

            {/* Rotas Administrativas */}
            <Route path="/categories" element={<AdminRoute><CategoriesPage /></AdminRoute>} />
            <Route path="/responsibles" element={<AdminRoute><ResponsiblesPage /></AdminRoute>} />
            <Route path="/users" element={<AdminRoute><UsersPage /></AdminRoute>} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;