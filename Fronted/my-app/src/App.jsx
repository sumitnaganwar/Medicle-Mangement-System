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
import LoginPage from './components/pages/LoginPage';
import RegisterPage from './components/pages/RegisterPage';
import { AuthProvider, useAuth } from './components/common/AuthContext';
import './App.css';

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
            <Route path="/" element={<DashboardPage />} />
            <Route path="/medicines" element={<MedicinePage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/top-medicines" element={<TopMedicinesPage />} />
            <Route path="/near-expiry" element={<NearExpiryMedicines />} />
            <Route path="/out-of-stock" element={<OwnerOutOfStock />} />
            <Route path="/expired-medicines" element={<OwnerExpiredHistory />} />
            <Route path="/profile" element={<ProfilePage />} />
            {/* Owner-only */}
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