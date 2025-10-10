import React, { useState, useEffect } from 'react';
import { purchaseService } from '../services/api';

function SupplierOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await purchaseService.listOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await purchaseService.updateDeliveryStage(orderId, status);
      loadOrders();
      alert('Status updated successfully!');
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    }
  };

  if (loading) {
    return <div className="container"><div className="text-center">Loading...</div></div>;
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4">My Orders</h2>
          
          <div className="card">
            <div className="card-header">
              <h5>Order Management</h5>
            </div>
            <div className="card-body">
              {orders.length === 0 ? (
                <p className="text-muted">No orders found</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
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
                      {orders.map(order => (
                        <tr key={order.id}>
                          <td>{order.id}</td>
                          <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td>{order.customerName || 'N/A'}</td>
                          <td>{order.items?.length || 0} items</td>
                          <td>${order.total || 0}</td>
                          <td>
                            <span className={`badge ${
                              order.stage === 'CREATED' ? 'bg-secondary' :
                              order.stage === 'CONFIRMED' ? 'bg-primary' :
                              order.stage === 'PAID' ? 'bg-warning' :
                              order.stage === 'DELIVERED' ? 'bg-success' : 'bg-secondary'
                            }`}>
                              {order.stage || 'CREATED'}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group" role="group">
                              {order.stage === 'CREATED' && (
                                <button 
                                  className="btn btn-primary btn-sm"
                                  onClick={() => handleStatusUpdate(order.id, 'CONFIRMED')}
                                >
                                  Confirm
                                </button>
                              )}
                              {order.stage === 'CONFIRMED' && (
                                <button 
                                  className="btn btn-warning btn-sm"
                                  onClick={() => handleStatusUpdate(order.id, 'PAID')}
                                >
                                  Mark Paid
                                </button>
                              )}
                              {order.stage === 'PAID' && (
                                <button 
                                  className="btn btn-success btn-sm"
                                  onClick={() => handleStatusUpdate(order.id, 'DELIVERED')}
                                >
                                  Mark Delivered
                                </button>
                              )}
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

export default SupplierOrders;
