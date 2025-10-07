import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const firstName = (user?.name || '').trim().split(' ')[0] || 'Employee';

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
              <Link to={user?.id ? `/profile/${user.id}` : '/profile'} className="me-3 text-white text-decoration-none">
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
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;