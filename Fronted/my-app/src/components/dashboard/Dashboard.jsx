import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';
import StatsCard from './StatsCard';
import LowStockAlert from './LowStockAlert';
import { formatCurrency } from '../utils/helpers';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const response = await dashboardService.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="row mb-4">
        <div className="col-12">
          <h2>Dashboard Overview</h2>
          <p className="text-muted">Welcome to Pharmacy Management System</p>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-3">
          <StatsCard
            title="Total Medicines"
            value={stats?.totalMedicines || 0}
            icon="fas fa-pills"
            color="primary"
          />
        </div>
        <div className="col-md-3">
          <StatsCard
            title="Low Stock Alerts"
            value={stats?.lowStockCount || 0}
            icon="fas fa-exclamation-triangle"
            color="warning"
          />
        </div>
        <div className="col-md-3">
          <StatsCard
            title="Today's Sales"
            value={stats?.todaySalesCount || 0}
            icon="fas fa-shopping-cart"
            color="success"
          />
        </div>
        <div className="col-md-3">
          <StatsCard
            title="Today's Revenue"
            value={formatCurrency(stats?.todayRevenue || 0)}
            icon="fas fa-rupee-sign"
            color="info"
          />
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <LowStockAlert />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;