import React, { useState, useEffect } from 'react';
import { purchaseService } from '../services/api';

function PurchaseDeliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeliveries();
  }, []);

  const loadDeliveries = async () => {
    try {
      const response = await purchaseService.listDeliveries();
      setDeliveries(response.data);
    } catch (error) {
      console.error('Failed to load deliveries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (deliveryId, status) => {
    try {
      await purchaseService.updateDeliveryStatus(deliveryId, status);
      loadDeliveries();
      alert('Delivery status updated successfully!');
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    }
  };

  const getStatusBadge = (stage) => {
    const badges = {
      'CREATED': 'bg-secondary',
      'CONFIRMED': 'bg-primary',
      'PAID': 'bg-warning',
      'DELIVERED': 'bg-success',
      'CANCELLED': 'bg-danger'
    };
    return badges[stage] || 'bg-secondary';
  };

  if (loading) {
    return <div className="container"><div className="text-center">Loading...</div></div>;
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4">Purchase Deliveries</h2>
          
          <div className="card">
            <div className="card-header">
              <h5>Delivery Management</h5>
            </div>
            <div className="card-body">
              {deliveries.length === 0 ? (
                <p className="text-muted">No deliveries found</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Delivery ID</th>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deliveries.map(delivery => (
                        <tr key={delivery.id}>
                          <td>{delivery.id}</td>
                          <td>{delivery.orderId}</td>
                          <td>{new Date(delivery.createdAt).toLocaleDateString()}</td>
                          <td>{delivery.customerName || 'N/A'}</td>
                          <td>{delivery.items?.length || 0} items</td>
                          <td>${delivery.total?.toFixed(2) || '0.00'}</td>
                          <td>
                            <span className={`badge ${getStatusBadge(delivery.stage)}`}>
                              {delivery.stage || 'CREATED'}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group" role="group">
                              {delivery.stage === 'CREATED' && (
                                <button 
                                  className="btn btn-primary btn-sm"
                                  onClick={() => handleStatusUpdate(delivery.id, 'CONFIRMED')}
                                >
                                  Confirm
                                </button>
                              )}
                              {delivery.stage === 'CONFIRMED' && (
                                <button 
                                  className="btn btn-warning btn-sm"
                                  onClick={() => handleStatusUpdate(delivery.id, 'PAID')}
                                >
                                  Mark Paid
                                </button>
                              )}
                              {delivery.stage === 'PAID' && (
                                <button 
                                  className="btn btn-success btn-sm"
                                  onClick={() => handleStatusUpdate(delivery.id, 'DELIVERED')}
                                >
                                  Mark Delivered
                                </button>
                              )}
                              <button 
                                className="btn btn-outline-info btn-sm"
                                onClick={() => {
                                  alert(`Delivery Details:\nID: ${delivery.id}\nOrder: ${delivery.orderId}\nCustomer: ${delivery.customerName}\nStatus: ${delivery.stage}`);
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

export default PurchaseDeliveries;
