import React from 'react';

const Header = () => {
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
              <span className="me-3">
                <i className="fas fa-user me-1"></i>
                Employee
              </span>
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