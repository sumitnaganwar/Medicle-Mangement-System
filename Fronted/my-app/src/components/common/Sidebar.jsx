import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { medicineService } from '../services/api';

const Sidebar = () => {
  const { user } = useAuth();
  const [zeroStockCount, setZeroStockCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (medicineService.getZeroStockMedicines) {
          const res = await medicineService.getZeroStockMedicines();
          if (!cancelled) setZeroStockCount(Array.isArray(res.data) ? res.data.length : 0);
        } else if (medicineService.getLowStockMedicines) {
          const res = await medicineService.getLowStockMedicines();
          if (!cancelled) setZeroStockCount((res.data || []).filter(m => (m.stock || m.stockQuantity || 0) === 0).length);
        } else {
          const res = await medicineService.getAllMedicines();
          if (!cancelled) setZeroStockCount((res.data || []).filter(m => (m.stock || m.stockQuantity || 0) === 0).length);
        }
      } catch (e) {
        if (!cancelled) setZeroStockCount(0);
      }
    })();
    return () => { cancelled = true; };
  }, []);


  // Role-based menus
  const isOwner = user?.role === 'Owner';
  const isEmployee = user?.role === 'Employee';
  const isSupplier = user?.role === 'Supplier';

  // Owner gets full access to all features
  const ownerMenu = [
    { path: '/', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
    { path: '/medicines', icon: 'fas fa-pills', label: 'Medicines' },
    { path: '/customers', icon: 'fas fa-user-friends', label: 'Customers' },
    { path: '/billing', icon: 'fas fa-receipt', label: 'Billing' },
    { path: '/reports', icon: 'fas fa-chart-bar', label: 'Reports' },
    { path: '/transactions', icon: 'fas fa-exchange-alt', label: 'Transactions' },
    { path: '/profit-analysis', icon: 'fas fa-chart-line', label: 'Profit Analysis' },
    { path: '/purchase', icon: 'fas fa-warehouse', label: 'Purchases' },
    { path: '/top-medicines', icon: 'fas fa-capsules', label: 'Top 10 Medicines' },
    { path: '/near-expiry', icon: 'fas fa-hourglass-half', label: 'Near Expiry Medicines' },
    { path: '/expired-medicines', icon: 'fas fa-calendar-times', label: 'Expired Medicines History' },
  ];

  // Employees get limited access to basic operations
  const employeeMenu = [
    { path: '/', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
    { path: '/medicines', icon: 'fas fa-pills', label: 'Medicines' },
    { path: '/customers', icon: 'fas fa-user-friends', label: 'Customers' },
    { path: '/billing', icon: 'fas fa-receipt', label: 'Billing' },
    { path: '/reports', icon: 'fas fa-chart-bar', label: 'Reports' },
  ];

  // Suppliers get access to supplier portal features
  const supplierMenu = [
    { path: '/supplier/portal', icon: 'fas fa-home', label: 'Dashboard' },
    { path: '/profile', icon: 'fas fa-id-card', label: 'My Profile' },
    { path: '/supplier/owner', icon: 'fas fa-user-tie', label: 'Medical Owner' },
  ];

  // Add out-of-stock alert to owner menu if there are zero stock items
  const finalOwnerMenu = zeroStockCount > 0
    ? [
        ...ownerMenu.slice(0, 8),
        { path: '/out-of-stock', icon: 'fas fa-exclamation-triangle', label: `Out-of-Stock (${zeroStockCount})` },
        ...ownerMenu.slice(8)
      ]
    : ownerMenu;

  // Determine which menu to show based on role
  const getMenuForRole = () => {
    if (isSupplier) return supplierMenu;
    if (isOwner) return finalOwnerMenu;
    if (isEmployee) return employeeMenu;
    return [];
  };

  const currentMenu = getMenuForRole();

  return (
    <nav className="sidebar bg-light border-end" style={{ width: '250px', minHeight: 'calc(100vh - 60px)' }}>
      <div className="sidebar-sticky pt-3">
        <ul className="nav flex-column">
          {/* Role indicator */}
          {(isOwner || isEmployee || isSupplier) && (
            <li className="nav-item mt-1 px-3 text-muted" style={{ fontSize: 12 }}>
              {isOwner ? 'Owner' : isEmployee ? 'Employee' : 'Supplier'}
            </li>
          )}
          
          {/* Main menu items */}
          {currentMenu.map((item) => (
            <li className="nav-item" key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center ${isActive ? 'active text-primary' : 'text-dark'}`
                }
              >
                {item.icon && <i className={`${item.icon} me-3`}></i>}
                {item.label}
              </NavLink>
            </li>
          ))}
          
          {/* Profile link for Owner/Employee */}
          {!isSupplier && (
            <>
              <li className="nav-item mt-3 px-3 text-muted" style={{ fontSize: 12 }}>Account</li>
              <li className="nav-item">
                <NavLink
                  to={'/profile'}
                  className={({ isActive }) => `nav-link d-flex align-items-center ${isActive ? 'active text-primary' : 'text-dark'}`}
                >
                  <i className="fas fa-user me-3"></i>
                  Profile
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};


export default Sidebar;