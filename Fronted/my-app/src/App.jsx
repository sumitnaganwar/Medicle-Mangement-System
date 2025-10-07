import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import DashboardPage from './components/pages/DashboardPage';
import MedicinePage from './components/pages/MedicinePage';
import BillingPage from './components/pages/BillingPage';
import ReportsPage from './components/pages/ReportsPage';
import CustomersPage from './components/pages/CustomersPage';
import ProfilePage from './components/pages/ProfilePage';
import LoginPage from './components/pages/LoginPage';
import RegisterPage from './components/pages/RegisterPage';
import { AuthProvider, useAuth } from './components/common/AuthContext';
import './App.css';

function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  
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

function AppLayout() {
  return (
    <>
      <Header />
      <div className="main-content d-flex">
        <Sidebar />
        <div className="content-area flex-grow-1 p-4">
          <Outlet />
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
            <Route path="/profile" element={<ProfilePage />} />
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