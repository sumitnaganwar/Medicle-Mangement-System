import React, { useState, useEffect } from 'react';
import { purchaseService } from '../services/api';

function SupplierPortal() {
  const [orders, setOrders] = useState([]);
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const [activeResponse, deliveredResponse] = await Promise.all([
        purchaseService.getActiveOrders(),
        purchaseService.getDeliveredOrders()
      ]);
      setOrders(activeResponse.data);
      setDeliveredOrders(deliveredResponse.data);
      console.log('Loaded active orders:', activeResponse.data);
      console.log('Loaded delivered orders:', deliveredResponse.data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTestOrder = () => {
    const testOrder = {
      customerName: "Test Customer",
      customerPhone: "1234567890",
      customerEmail: "test@example.com",
      deliveryAddress: "123 Test Street, Test City",
      items: [
        {
          medicineId: "med-1",
          medicineName: "Paracetamol 500mg",
          price: 0.50,
          quantity: 1
        }
      ],
      total: 0.50,
      status: "PENDING"
    };
    
    purchaseService.createOrder(testOrder).then(() => {
      loadOrders();
      alert('Test order created successfully!');
    }).catch(error => {
      console.error('Failed to create test order:', error);
      alert('Failed to create test order');
    });
  };

  const handleOrderResponse = async (orderId, response) => {
    try {
      console.log('Updating order response:', { orderId, response });
      const result = await purchaseService.updateSupplierResponse(orderId, response);
      console.log('Update result:', result);
      loadOrders();
      alert(`Order ${response.toLowerCase()} successfully!`);
    } catch (error) {
      console.error('Failed to submit response:', error);
      alert(`Failed to submit response: ${error.message}`);
    }
  };

  const handleShipping = async (orderId) => {
    try {
      console.log('Marking order as shipped:', orderId);
      const result = await purchaseService.updateOrderStatus(orderId, 'SHIPPED');
      console.log('Shipping result:', result);
      loadOrders();
      alert('Order marked as shipped successfully!');
    } catch (error) {
      console.error('Failed to mark as shipped:', error);
      alert(`Failed to mark as shipped: ${error.message}`);
    }
  };

  const handleDeliveryConfirmation = async (orderId) => {
    try {
      console.log('Confirming delivery for order:', orderId);
      const result = await purchaseService.updateOrderStatus(orderId, 'DELIVERED');
      console.log('Delivery confirmation result:', result);
      loadOrders();
      alert('Delivery confirmed successfully!');
    } catch (error) {
      console.error('Failed to confirm delivery:', error);
      alert(`Failed to confirm delivery: ${error.message}`);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'PENDING': 'bg-warning',
      'ACCEPTED': 'bg-primary',
      'PAID': 'bg-info',
      'SHIPPED': 'bg-secondary',
      'DELIVERED': 'bg-success',
      'REJECTED': 'bg-danger'
    };
    return statusConfig[status] || 'bg-secondary';
  };

  const getStatusActions = (order) => {
    switch (order.status) {
      case 'PENDING':
        return (
          <div>
            <button 
              className="btn btn-success btn-sm me-2"
              onClick={() => handleOrderResponse(order.id, 'ACCEPTED')}
            >
              Accept
            </button>
            <button 
              className="btn btn-danger btn-sm"
              onClick={() => handleOrderResponse(order.id, 'REJECTED')}
            >
              Reject
            </button>
          </div>
        );
      case 'ACCEPTED':
        return (
          <div>
            <small className="text-muted">Waiting for payment</small>
          </div>
        );
      case 'PAID':
        return (
          <button 
            className="btn btn-info btn-sm"
            onClick={() => handleShipping(order.id)}
          >
            Mark as Shipped
          </button>
        );
      case 'SHIPPED':
        return (
          <button 
            className="btn btn-success btn-sm"
            onClick={() => handleDeliveryConfirmation(order.id)}
          >
            Confirm Delivery
          </button>
        );
      case 'DELIVERED':
        return (
          <div>
            <span className="badge bg-success">Completed</span>
            <br />
            <small className="text-muted">Order delivered successfully</small>
          </div>
        );
      case 'REJECTED':
        return (
          <div>
            <span className="badge bg-danger">Rejected</span>
            <br />
            <small className="text-muted">Order was rejected</small>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="container"><div className="text-center">Loading...</div></div>;
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4">Supplier Portal</h2>
          
          {/* Navigation Tabs */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                Orders
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                Order History ({deliveredOrders.length})
              </button>
            </li>
          </ul>

          {/* Orders Tab - All Active Orders */}
          {activeTab === 'orders' && (
            <div>
              {/* Create Test Order Button */}
              <div className="mb-3">
                <button 
                  className="btn btn-primary"
                  onClick={createTestOrder}
                >
                  Create Test Order
                </button>
              </div>

              {/* Active Orders */}
              <div className="card">
                <div className="card-header">
                  <h5>Active Orders</h5>
                  <small className="text-muted">Orders that need action (not yet delivered)</small>
                </div>
                <div className="card-body">
                  {orders.length === 0 ? (
                    <div className="text-center py-4">
                      <i className="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
                      <p className="text-muted">No active orders</p>
                      <small className="text-muted">Create a test order to get started</small>
                    </div>
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
                              <td>
                                <code>{order.id}</code>
                              </td>
                              <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                              <td>
                                <div>
                                  <strong>{order.customerName}</strong>
                                  {order.customerPhone ? (
                                    <>
                                      <br />
                                      <small className="text-muted">{order.customerPhone}</small>
                                    </>
                                  ) : null}
                                </div>
                              </td>
                              <td>
                                <span className="badge bg-info">
                                  {order.items?.length || 0} items
                                </span>
                              </td>
                              <td>
                                <strong>${order.total?.toFixed(2) || '0.00'}</strong>
                              </td>
                              <td>
                                <span className={`badge ${getStatusBadge(order.status)}`}>
                                  {order.status || 'PENDING'}
                                </span>
                              </td>
                              <td>
                                {getStatusActions(order)}
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
          )}


          {/* Order History Tab */}
          {activeTab === 'history' && (
            <div className="card">
              <div className="card-header">
                <div>
                  <h5>Order History</h5>
                  <small className="text-muted">Orders that have been successfully delivered and removed from dashboard</small>
                </div>
              </div>
              <div className="card-body">
                {deliveredOrders.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="fas fa-history fa-3x text-muted mb-3"></i>
                    <p className="text-muted">No order history found</p>
                    <small className="text-muted">Orders will appear here after successful delivery confirmation</small>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Items</th>
                          <th>Total</th>
                          <th>Order Date</th>
                          <th>Delivered Date</th>
                          <th>Delivery Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deliveredOrders.map(order => (
                          <tr key={order.id}>
                            <td>
                              <code>{order.id}</code>
                            </td>
                            <td>
                              <div>
                                <strong>{order.customerName}</strong>
                                {order.customerPhone ? (
                                  <>
                                    <br />
                                    <small className="text-muted">{order.customerPhone}</small>
                                  </>
                                ) : null}
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-info">
                                {order.items?.length || 0} items
                              </span>
                            </td>
                            <td>
                              <strong className="text-success">
                                ${order.total?.toFixed(2) || '0.00'}
                              </strong>
                            </td>
                            <td>
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                            <td>
                              <span className="text-success">
                                {order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : 'N/A'}
                              </span>
                            </td>
                            <td>
                              <span className="badge bg-success">
                                <i className="fas fa-check-circle me-1"></i>
                                Order Successfully Delivered
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SupplierPortal;
