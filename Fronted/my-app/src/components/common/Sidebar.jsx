import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const menuItems = [
    { path: '/', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
    { path: '/medicines', icon: 'fas fa-pills', label: 'Medicines' },
    { path: '/customers', icon: 'fas fa-user-friends', label: 'Customers' },
    { path: '/billing', icon: 'fas fa-receipt', label: 'Billing' },
    { path: '/reports', icon: 'fas fa-chart-bar', label: 'Reports' },
    { path: '/profile', icon: 'fas fa-user', label: 'Profile' },
  ];

  return (
    <nav className="sidebar bg-light border-end" style={{ width: '250px', minHeight: 'calc(100vh - 60px)' }}>
      <div className="sidebar-sticky pt-3">
        <ul className="nav flex-column">
          {menuItems.map((item) => (
            <li className="nav-item" key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center ${isActive ? 'active text-primary' : 'text-dark'}`
                }
              >
                <i className={`${item.icon} me-3`}></i>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Sidebar;