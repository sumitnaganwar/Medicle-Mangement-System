import React, { useState } from 'react';
import Billing from '../sales/Billing';
import BillHistory from '../sales/BillHistory';

const BillingPage = () => {
  const [activeTab, setActiveTab] = useState('billing');

  return (
    <div className="billing-page">
      <div className="row mb-4">
        <div className="col-12">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'billing' ? 'active' : ''}`}
                onClick={() => setActiveTab('billing')}
              >
                <i className="fas fa-cash-register me-2"></i>
                Create Bill
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                <i className="fas fa-history me-2"></i>
                Bill History
              </button>
            </li>
          </ul>
        </div>
      </div>

      {activeTab === 'billing' ? <Billing /> : <BillHistory />}
    </div>
  );
};

export default BillingPage;