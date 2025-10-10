import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { medicineService, saleService, notificationService } from '../services/api';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const firstName = (user?.name || '').trim().split(' ')[0] || 'Employee';

  const [now, setNow] = useState(new Date());
  const [alerts, setAlerts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000 * 60);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [medsRes, salesRes] = await Promise.all([
          medicineService.getAllMedicines(),
          saleService.getTodaySales().catch(() => ({ data: [] }))
        ]);
        if (cancelled) return;
        const meds = medsRes.data || [];
        const todaySales = salesRes.data || [];

        const soon = meds.filter(m => m.expiryDate && (new Date(m.expiryDate) - new Date()) / (1000*60*60*24) <= 30);
        const expired = meds.filter(m => m.expiryDate && new Date(m.expiryDate) < new Date());
        const totalToday = todaySales.reduce((s, x) => s + (x.totalAmount || 0), 0);

        const a = [];
        if (expired.length) a.push({ type: 'danger', text: `${expired.length} medicines expired` });
        if (soon.length) a.push({ type: 'warning', text: `${soon.length} medicines expiring within 30 days` });
        if (user?.role === 'Owner') a.push({ type: 'info', text: `Today's revenue: ₹${totalToday.toLocaleString('en-IN')}` });
        setAlerts(a);
      } catch {
        setAlerts([]);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-primary text-white shadow-sm">
      <div className="container-fluid">
        <div className="row align-items-center py-2">
          <div className="col">
            <h1 className="h4 mb-0">
              <i className="fas fa-clinic-medical me-2"></i>
              Pharmacy Management System
            </h1>
          </div>
          <div className="col-auto">
            <div className="d-flex align-items-center">
              <div className="dropdown me-3">
                <button className="btn btn-outline-light btn-sm position-relative" onClick={() => setShowDropdown(v => !v)}>
                  <i className="fas fa-bell"></i>
                  {alerts.length > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">{alerts.length}</span>
                  )}
                </button>
                {showDropdown && (
                  <div className="dropdown-menu dropdown-menu-end show" style={{ minWidth: 320 }}>
                    <h6 className="dropdown-header">Notifications</h6>
                    {alerts.length === 0 && <div className="dropdown-item text-muted">No notifications</div>}
                    {alerts.map((a, idx) => (
                      <div key={idx} className="dropdown-item">
                        <span className={`badge bg-${a.type} me-2`}>●</span>{a.text}
                      </div>
                    ))}
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item" onClick={() => notificationService.sendDailySummary({ at: new Date().toISOString() })}>Send Daily Summary (Owner)</button>
                    <button className="dropdown-item" onClick={() => notificationService.notifySupplierDelay({ at: new Date().toISOString() })}>Supplier Delay Reminder</button>
                  </div>
                )}
              </div>
              <Link to={'/profile'} className="me-3 text-white text-decoration-none">
                <i className="fas fa-user me-1"></i>
                {firstName}
              </Link>
              <button 
                onClick={handleLogout}
                className="btn btn-outline-light btn-sm me-3"
                title="Logout"
              >
                <i className="fas fa-sign-out-alt me-1"></i>
                Logout
              </button>
              <span className="badge bg-light text-dark">
                <i className="fas fa-clock me-1"></i>
                {now.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;