import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
    { path: '/medicines', icon: 'fas fa-pills', label: 'Medicines' },
    { path: '/customers', icon: 'fas fa-user-friends', label: 'Customers' },
    { path: '/billing', icon: 'fas fa-receipt', label: 'Billing' },
    { path: '/reports', icon: 'fas fa-chart-bar', label: 'Reports' },
  ];

  return (
    <nav className="sidebar bg-light border-end" style={{ width: '250px', minHeight: 'calc(100vh - 60px)' }}>
      <div className="sidebar-sticky pt-3">
        <ul className="nav flex-column">
          {menuItems.map((item) => (
            <li className="nav-item" key={item.path}>
              <Link
                to={item.path}
                className={`nav-link d-flex align-items-center ${
                  location.pathname === item.path ? 'active text-primary' : 'text-dark'
                }`}
              >
                <i className={`${item.icon} me-3`}></i>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Sidebar;