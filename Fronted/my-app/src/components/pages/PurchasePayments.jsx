import React, { useState, useEffect } from 'react';
import { supplierPaymentService } from '../services/api';

function PurchasePayments() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      const response = await supplierPaymentService.listBills();
      setBills(response.data);
    } catch (error) {
      console.error('Failed to load bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (billId, status) => {
    try {
      await supplierPaymentService.updateBillStatus(billId, status);
      loadBills();
      alert('Bill status updated successfully!');
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'PENDING': 'bg-warning',
      'PAID': 'bg-success',
      'OVERDUE': 'bg-danger',
      'CANCELLED': 'bg-secondary'
    };
    return badges[status] || 'bg-secondary';
  };

  if (loading) {
    return <div className="container"><div className="text-center">Loading...</div></div>;
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4">Purchase Payments</h2>
          
          <div className="card">
            <div className="card-header">
              <h5>Payment Management</h5>
            </div>
            <div className="card-body">
              {bills.length === 0 ? (
                <p className="text-muted">No bills found</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Bill ID</th>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Supplier</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Due Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bills.map(bill => (
                        <tr key={bill.id}>
                          <td>{bill.id}</td>
                          <td>{bill.orderId}</td>
                          <td>{new Date(bill.createdAt).toLocaleDateString()}</td>
                          <td>{bill.supplierName || 'N/A'}</td>
                          <td>${bill.amount?.toFixed(2) || '0.00'}</td>
                          <td>
                            <span className={`badge ${getStatusBadge(bill.status)}`}>
                              {bill.status || 'PENDING'}
                            </span>
                          </td>
                          <td>
                            {bill.dueDate ? 
                              new Date(bill.dueDate).toLocaleDateString() : 
                              'N/A'
                            }
                          </td>
                          <td>
                            <div className="btn-group" role="group">
                              {bill.status === 'PENDING' && (
                                <button 
                                  className="btn btn-success btn-sm"
                                  onClick={() => handleStatusUpdate(bill.id, 'PAID')}
                                >
                                  Mark Paid
                                </button>
                              )}
                              <button 
                                className="btn btn-outline-info btn-sm"
                                onClick={() => {
                                  alert(`Bill Details:\nID: ${bill.id}\nOrder: ${bill.orderId}\nSupplier: ${bill.supplierName}\nAmount: $${bill.amount?.toFixed(2) || '0.00'}\nStatus: ${bill.status}`);
                                }}
                              >
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PurchasePayments;
