import React, { useState, useEffect } from 'react';
import { purchaseService } from '../services/api';

function PurchaseHistory() {
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
    return order.status === filter;
  });

  const getStatusBadge = (status) => {
    const badges = {
      'PENDING': 'bg-warning',
      'CONFIRMED': 'bg-primary',
      'PAID': 'bg-info',
      'DELIVERED': 'bg-success',
      'CANCELLED': 'bg-danger'
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
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Purchase History</h2>
            <div>
              <select 
                className="form-select"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Orders</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PAID">Paid</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h5>Purchase Orders ({filteredOrders.length} orders)</h5>
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
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map(order => (
                        <tr key={order.id}>
                          <td>{order.id}</td>
                          <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div>
                              <strong>{order.customerName}</strong><br/>
                              <small className="text-muted">{order.customerEmail}</small>
                            </div>
                          </td>
                          <td>
                            <div>
                              {order.items?.length || 0} items
                              {order.items && order.items.length > 0 && (
                                <div className="small text-muted">
                                  {order.items.slice(0, 2).map(item => item.name).join(', ')}
                                  {order.items.length > 2 && '...'}
                                </div>
                              )}
                            </div>
                          </td>
                          <td>${order.total?.toFixed(2) || '0.00'}</td>
                          <td>
                            <span className={`badge ${getStatusBadge(order.status)}`}>
                              {order.status || 'PENDING'}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => {
                                // Show order details
                                alert(`Order Details:\nID: ${order.id}\nCustomer: ${order.customerName}\nItems: ${order.items?.length || 0}\nTotal: $${order.total?.toFixed(2) || '0.00'}\nStatus: ${order.status}`);
                              }}
                            >
                              View
                            </button>
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

export default PurchaseHistory;
