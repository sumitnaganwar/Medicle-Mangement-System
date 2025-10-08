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

  const menuItems = [
    { path: '/', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
    { path: '/medicines', icon: 'fas fa-pills', label: 'Medicines' },
    { path: '/customers', icon: 'fas fa-user-friends', label: 'Customers' },
    { path: '/billing', icon: 'fas fa-receipt', label: 'Billing' },
    { path: '/reports', icon: 'fas fa-chart-bar', label: 'Reports' },
    { path: '/profit-analysis', icon: 'fas fa-chart-line', label: 'Profit Analysis' },
    { path: '/transactions', icon: 'fas fa-exchange-alt', label: 'Transactions' },
    // Out-of-Stock will be injected below when dynamic count > 0
    { path: '/expired-medicines', icon: 'fas fa-calendar-times', label: 'Expired Medicines History' },
    { path: '/near-expiry', icon: 'fas fa-hourglass-half', label: 'Near Expiry Medicines' },
    { path: '/top-medicines', icon: 'fas fa-capsules', label: 'Top 10 Medicines' },
    { path: '/profile', icon: 'fas fa-user', label: 'Profile' },
  ];

  const enhancedMenuItems = zeroStockCount > 0
    ? [
        ...menuItems.slice(0, 6),
        { path: '/out-of-stock', icon: 'fas fa-exclamation-triangle', label: `Out-of-Stock (${zeroStockCount})` },
        ...menuItems.slice(6)
      ]
    : menuItems;

  // Hide certain sections for Owner role
  const isOwner = user?.role === 'Owner';
  const filteredMenuItems = isOwner
    ? menuItems.filter((item) => !['/medicines', '/customers', '/billing'].includes(item.path))
    : menuItems;

  // Build owner combined section (dynamic if provided by backend via user)
  const dynamicOwnerLinks = Array.isArray(user?.ownerLinks)
    ? user.ownerLinks
    : Array.isArray(user?.menu?.owner)
      ? user.menu.owner
      : null;

  const ownerExtraLinks = dynamicOwnerLinks && dynamicOwnerLinks.length > 0
    ? dynamicOwnerLinks
    : [
        { path: '/owner/reports/top-medicines', label: 'Top 10 Medicines' },
        { path: '/owner/reports/out-of-stock', label: 'Out-of-Stock List' },
        { path: '/owner/reports/expired', label: 'Expired Medicines History' },
      ];
  const ownerCombinedItems = [...filteredMenuItems, ...ownerExtraLinks];

  return (
    <nav className="sidebar bg-light border-end" style={{ width: '250px', minHeight: 'calc(100vh - 60px)' }}>
      <div className="sidebar-sticky pt-3">
        <ul className="nav flex-column">
          {isOwner && (
            <li className="nav-item mt-1 px-3 text-muted" style={{ fontSize: 12 }}>Owner</li>
          )}
          {(isOwner ? ownerCombinedItems : enhancedMenuItems).map((item) => (
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
          {/* Owner-only links (only when not merged) */}
          {!isOwner && <OwnerLinks />}
        </ul>
      </div>
    </nav>
  );
};

const OwnerLinks = () => {
  const { user } = useAuth();
  if (user?.role !== 'Owner') return null;
  const links = [
    { path: '/owner/reports/top-medicines', label: 'Top 10 Medicines' },
    { path: '/owner/reports/out-of-stock', label: 'Out-of-Stock List' },
    { path: '/owner/reports/expired', label: 'Expired Medicines History' },
  ];
  return (
    <>
      <li className="nav-item mt-3 px-3 text-muted" style={{ fontSize: 12 }}>Owner</li>
      {links.map(l => (
        <li className="nav-item" key={l.path}>
          <NavLink to={l.path} className={({ isActive }) => `nav-link ${isActive ? 'active text-primary' : 'text-dark'}`}>
            {l.label}
          </NavLink>
        </li>
      ))}
    </>
  );
};

export default Sidebar;