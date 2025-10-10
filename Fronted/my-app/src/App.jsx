import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import ErrorBoundary from './components/common/ErrorBoundary';
import DashboardPage from './components/pages/DashboardPage';
import MedicinePage from './components/pages/MedicinePage';
import BillingPage from './components/pages/BillingPage';
import ReportsPage from './components/pages/ReportsPage';
import TransactionsPage from './components/pages/TransactionsPage';
import TopMedicinesPage from './components/pages/TopMedicinesPage';
import NearExpiryMedicines from './components/pages/NearExpiryMedicines';
import CustomersPage from './components/pages/CustomersPage';
import ProfilePage from './components/pages/ProfilePage';
import OwnerTopMedicines from './components/pages/OwnerTopMedicines';
import OwnerOutOfStock from './components/pages/OwnerOutOfStock';
import OwnerExpiredHistory from './components/pages/OwnerExpiredHistory';
import ProfitAnalysis from './components/pages/ProfitAnalysis';
import PurchaseCreate from './components/pages/PurchaseCreate';
import PurchaseDeliveries from './components/pages/PurchaseDeliveries';
import PurchaseHistory from './components/pages/PurchaseHistory';
import PurchasePayments from './components/pages/PurchasePayments';
import SupplierRegister from './components/pages/SupplierRegister';
import SupplierPortal from './components/pages/SupplierPortal';
import SupplierProfile from './components/pages/SupplierProfile';
import SupplierOwner from './components/pages/SupplierOwner';
import PurchaseHub from './components/pages/PurchaseHub';
import LoginPage from './components/pages/LoginPage';
import RegisterPage from './components/pages/RegisterPage';
import { AuthProvider, useAuth } from './components/common/AuthContext';
import './App.css';
import './components/styles/components.css';

function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const authDisabled = (import.meta && import.meta.env && import.meta.env.VITE_AUTH_DISABLED === 'true');
  if (authDisabled) return children;
  
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const authDisabled = (import.meta && import.meta.env && import.meta.env.VITE_AUTH_DISABLED === 'true');
  if (authDisabled) return children;
  
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? <Navigate to="/" replace /> : children;
}

function OwnerRoute({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const authDisabled = (import.meta && import.meta.env && import.meta.env.VITE_AUTH_DISABLED === 'true');
  if (authDisabled) return children;
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'Owner') return <Navigate to="/" replace />;
  return children;
}

function EmployeeRoute({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const authDisabled = (import.meta && import.meta.env && import.meta.env.VITE_AUTH_DISABLED === 'true');
  if (authDisabled) return children;
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'Employee') return <Navigate to="/" replace />;
  return children;
}

function SupplierRoute({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const authDisabled = (import.meta && import.meta.env && import.meta.env.VITE_AUTH_DISABLED === 'true');
  if (authDisabled) return children;
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'Supplier') return <Navigate to="/" replace />;
  return children;
}

function OwnerOrEmployeeRoute({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const authDisabled = (import.meta && import.meta.env && import.meta.env.VITE_AUTH_DISABLED === 'true');
  if (authDisabled) return children;
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'Owner' && user?.role !== 'Employee') return <Navigate to="/" replace />;
  return children;
}

function AppLayout() {
  return (
    <>
      <Header />
      <div className="main-content d-flex">
        <Sidebar />
        <div className="content-area flex-grow-1 p-4">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
      <div className="app-container">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/profile/:id" element={<ProfilePage />} />

          {/* Private app layout */}
          <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
            <Route path="/" element={<HomeRoute />} />
            
            {/* Common pages accessible by Owner and Employee */}
            <Route path="/medicines" element={<OwnerOrEmployeeRoute><MedicinePage /></OwnerOrEmployeeRoute>} />
            <Route path="/customers" element={<OwnerOrEmployeeRoute><CustomersPage /></OwnerOrEmployeeRoute>} />
            <Route path="/billing" element={<OwnerOrEmployeeRoute><BillingPage /></OwnerOrEmployeeRoute>} />
            <Route path="/reports" element={<OwnerOrEmployeeRoute><ReportsPage /></OwnerOrEmployeeRoute>} />
            <Route path="/profile" element={<ProfilePage />} />
            
            {/* Owner-only pages */}
            <Route path="/transactions" element={<OwnerRoute><TransactionsPage /></OwnerRoute>} />
            <Route path="/profit-analysis" element={<OwnerRoute><ProfitAnalysis /></OwnerRoute>} />
            <Route path="/top-medicines" element={<OwnerRoute><TopMedicinesPage /></OwnerRoute>} />
            <Route path="/near-expiry" element={<OwnerRoute><NearExpiryMedicines /></OwnerRoute>} />
            <Route path="/out-of-stock" element={<OwnerRoute><OwnerOutOfStock /></OwnerRoute>} />
            <Route path="/expired-medicines" element={<OwnerRoute><OwnerExpiredHistory /></OwnerRoute>} />
            
            {/* Purchase management - Owner only */}
            <Route path="/purchase" element={<OwnerRoute><PurchaseHub /></OwnerRoute>} />
            <Route path="/purchase/create" element={<OwnerRoute><PurchaseCreate /></OwnerRoute>} />
            <Route path="/purchase/deliveries" element={<OwnerRoute><PurchaseDeliveries /></OwnerRoute>} />
            <Route path="/purchase/history" element={<OwnerRoute><PurchaseHistory /></OwnerRoute>} />
            <Route path="/purchase/payments" element={<OwnerRoute><PurchasePayments /></OwnerRoute>} />
            <Route path="/suppliers/register" element={<OwnerRoute><SupplierRegister /></OwnerRoute>} />
            
            {/* Supplier-only pages */}
            <Route path="/supplier/portal" element={<SupplierRoute><SupplierPortal /></SupplierRoute>} />
            <Route path="/supplier/profile" element={<SupplierRoute><SupplierProfile /></SupplierRoute>} />
            <Route path="/supplier/owner" element={<SupplierRoute><SupplierOwner /></SupplierRoute>} />
            
            {/* Owner-only reports */}
            <Route path="/owner/reports/top-medicines" element={<OwnerRoute><OwnerTopMedicines /></OwnerRoute>} />
            <Route path="/owner/reports/out-of-stock" element={<OwnerRoute><OwnerOutOfStock /></OwnerRoute>} />
            <Route path="/owner/reports/expired" element={<OwnerRoute><OwnerExpiredHistory /></OwnerRoute>} />
          </Route>

          {/* Fallback: unauthenticated users go to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
      </AuthProvider>
    </Router>
  );
}

export default App;

// Home route resolver: Supplier → Supplier Portal, others → Dashboard
function HomeRoute() {
  const { user } = useAuth();
  if (user?.role === 'Supplier') {
    return <Navigate to="/supplier/portal" replace />;
  }
  return <DashboardPage />;
}