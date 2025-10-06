import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import DashboardPage from './components/pages/DashboardPage';
import MedicinePage from './components/pages/MedicinePage';
import BillingPage from './components/pages/BillingPage';
import ReportsPage from './components/pages/ReportsPage';
import CustomersPage from './components/pages/CustomersPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <div className="main-content d-flex">
          <Sidebar />
          <div className="content-area flex-grow-1 p-4">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/medicines" element={<MedicinePage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/billing" element={<BillingPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;