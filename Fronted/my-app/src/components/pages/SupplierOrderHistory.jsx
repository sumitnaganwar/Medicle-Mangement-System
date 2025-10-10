import React, { useState, useEffect } from 'react';
import { purchaseService } from '../services/api';

function SupplierOrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

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

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.stage === filter;
  });

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
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Order History</h2>
            <div>
              <select 
                className="form-select"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Orders</option>
                <option value="CREATED">Created</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PAID">Paid</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h5>Order History ({filteredOrders.length} orders)</h5>
            </div>
            <div className="card-body">
              {filteredOrders.length === 0 ? (
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
                        <th>Completed Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map(order => (
                        <tr key={order.id}>
                          <td>{order.id}</td>
                          <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td>{order.customerName || 'N/A'}</td>
                          <td>{order.items?.length || 0} items</td>
                          <td>${order.total || 0}</td>
                          <td>
                            <span className={`badge ${getStatusBadge(order.stage)}`}>
                              {order.stage || 'CREATED'}
                            </span>
                          </td>
                          <td>
                            {order.completedDate ? 
                              new Date(order.completedDate).toLocaleDateString() : 
                              '-'
                            }
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

export default SupplierOrderHistory;
