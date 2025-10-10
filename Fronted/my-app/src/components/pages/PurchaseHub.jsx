import React, { useState, useEffect } from 'react';
import { purchaseService, medicineService } from '../services/api';

function PurchaseHub() {
  const [activeTab, setActiveTab] = useState('create');
  const [medicines, setMedicines] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Create Order State
  const [orderForm, setOrderForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    deliveryAddress: '',
    items: []
  });
  
  // Track Delivery State
  const [trackingId, setTrackingId] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  
  // Order History State
  const [orderHistory, setOrderHistory] = useState([]);
  
  // Pay Order State
  const [paymentForm, setPaymentForm] = useState({
    orderId: '',
    amount: '',
    paymentMethod: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  useEffect(() => {
    loadMedicines();
    loadOrderHistory();
  }, []);

  const loadMedicines = async () => {
    try {
      const response = await medicineService.getAllMedicines();
      setMedicines(response.data || []);
    } catch (error) {
      console.error('Failed to load medicines:', error);
    }
  };

  const loadOrderHistory = async () => {
    try {
      const response = await purchaseService.listOrders();
      setOrderHistory(response.data || []);
    } catch (error) {
      console.error('Failed to load order history:', error);
    }
  };

  // Create Order Functions
  const addItemToOrder = (medicine) => {
    const existingItem = orderForm.items.find(item => item.medicineId === medicine.id);
    if (existingItem) {
      setOrderForm(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.medicineId === medicine.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }));
    } else {
      setOrderForm(prev => ({
        ...prev,
        items: [...prev.items, {
          medicineId: medicine.id,
          medicineName: medicine.name,
          price: medicine.price,
          quantity: 1
        }]
      }));
    }
  };

  const updateItemQuantity = (medicineId, quantity) => {
    if (quantity <= 0) {
      setOrderForm(prev => ({
        ...prev,
        items: prev.items.filter(item => item.medicineId !== medicineId)
      }));
    } else {
      setOrderForm(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.medicineId === medicineId
            ? { ...item, quantity }
            : item
        )
      }));
    }
  };

  const calculateTotal = () => {
    return orderForm.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (orderForm.items.length === 0) {
      alert('Please add at least one item to the order');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        ...orderForm,
        total: calculateTotal(),
        status: 'PENDING'
      };
      
      await purchaseService.createOrder(orderData);
      alert('Order created successfully!');
      setOrderForm({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        deliveryAddress: '',
        items: []
      });
      loadOrderHistory();
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Track Delivery Functions
  const handleTrackOrder = async (e) => {
    e.preventDefault();
    if (!trackingId.trim()) {
      alert('Please enter a tracking ID');
      return;
    }

    setLoading(true);
    try {
      const response = await purchaseService.getOrderById(trackingId);
      setTrackedOrder(response.data);
    } catch (error) {
      console.error('Failed to track order:', error);
      alert('Order not found. Please check your tracking ID.');
      setTrackedOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusProgress = (status) => {
    const statusSteps = [
      { key: 'PENDING', label: 'Order Placed', icon: '📝' },
      { key: 'ACCEPTED', label: 'Order Accepted', icon: '✅' },
      { key: 'PAID', label: 'Payment Received', icon: '💳' },
      { key: 'SHIPPED', label: 'Order Shipped', icon: '🚚' },
      { key: 'DELIVERED', label: 'Delivered', icon: '📦' }
    ];

    const currentIndex = statusSteps.findIndex(step => step.key === status);
    
    return statusSteps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex
    }));
  };

  // Pay Order Functions
  const handlePayment = async (e) => {
    e.preventDefault();
    if (!paymentForm.orderId || !paymentForm.amount) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await purchaseService.processPayment(paymentForm);
      alert('Payment processed successfully!');
      setPaymentForm({
        orderId: '',
        amount: '',
        paymentMethod: 'card',
        cardNumber: '',
        expiryDate: '',
        cvv: ''
      });
      loadOrderHistory();
    } catch (error) {
      console.error('Failed to process payment:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4">Purchase Hub</h2>
          
          {/* Navigation Tabs */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'create' ? 'active' : ''}`}
                onClick={() => setActiveTab('create')}
              >
                Create Order
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'track' ? 'active' : ''}`}
                onClick={() => setActiveTab('track')}
              >
                Track Delivery
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                Order History
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'pay' ? 'active' : ''}`}
                onClick={() => setActiveTab('pay')}
              >
                Pay Order
              </button>
            </li>
          </ul>

          {/* Create Order Tab */}
          {activeTab === 'create' && (
            <div className="row">
              <div className="col-md-8">
                <div className="card">
                  <div className="card-header">
                    <h5>Create New Order</h5>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleCreateOrder}>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label className="form-label">Customer Name *</label>
                          <input
                            type="text"
                            className="form-control"
                            value={orderForm.customerName}
                            onChange={(e) => setOrderForm(prev => ({ ...prev, customerName: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Phone Number *</label>
                          <input
                            type="tel"
                            className="form-control"
                            value={orderForm.customerPhone}
                            onChange={(e) => setOrderForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label className="form-label">Email</label>
                          <input
                            type="email"
                            className="form-control"
                            value={orderForm.customerEmail}
                            onChange={(e) => setOrderForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Delivery Address *</label>
                          <input
                            type="text"
                            className="form-control"
                            value={orderForm.deliveryAddress}
                            onChange={(e) => setOrderForm(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                            required
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Add Medicines</label>
                        <div className="row">
                          {medicines.map(medicine => (
                            <div key={medicine.id} className="col-md-4 mb-2">
                              <div className="card">
                                <div className="card-body p-2">
                                  <h6 className="card-title">{medicine.name}</h6>
                                  <p className="card-text small">${medicine.price}</p>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-primary"
                                    onClick={() => addItemToOrder(medicine)}
                                  >
                                    Add to Order
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Order'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="card">
                  <div className="card-header">
                    <h5>Order Summary</h5>
                  </div>
                  <div className="card-body">
                    {orderForm.items.length === 0 ? (
                      <p className="text-muted">No items in order</p>
                    ) : (
                      <div>
                        {orderForm.items.map(item => (
                          <div key={item.medicineId} className="d-flex justify-content-between align-items-center mb-2">
                            <div>
                              <small>{item.medicineName}</small>
                              <br />
                              <small className="text-muted">${item.price} x {item.quantity}</small>
                            </div>
                            <div className="d-flex align-items-center">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary me-1"
                                onClick={() => updateItemQuantity(item.medicineId, item.quantity - 1)}
                              >
                                -
                              </button>
                              <span className="mx-2">{item.quantity}</span>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary ms-1"
                                onClick={() => updateItemQuantity(item.medicineId, item.quantity + 1)}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                        <hr />
                        <div className="d-flex justify-content-between">
                          <strong>Total:</strong>
                          <strong>${calculateTotal().toFixed(2)}</strong>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Track Delivery Tab */}
          {activeTab === 'track' && (
            <div className="row">
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header">
                    <h5>Track Your Order</h5>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleTrackOrder}>
                      <div className="mb-3">
                        <label className="form-label">Tracking ID</label>
                        <input
                          type="text"
                          className="form-control"
                          value={trackingId}
                          onChange={(e) => setTrackingId(e.target.value)}
                          placeholder="Enter your order ID"
                          required
                        />
                      </div>
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Tracking...' : 'Track Order'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6">
                {trackedOrder && (
                  <div className="card">
                    <div className="card-header">
                      <h5>Order Status</h5>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        <strong>Order ID:</strong> {trackedOrder.id}
                      </div>
                      <div className="mb-3">
                        <strong>Customer:</strong> {trackedOrder.customerName}
                      </div>
                      <div className="mb-3">
                        <strong>Total:</strong> ${trackedOrder.total?.toFixed(2) || '0.00'}
                      </div>
                      <div className="mb-3">
                        <strong>Status:</strong>
                        <span className={`badge ms-2 ${
                          trackedOrder.status === 'PENDING' ? 'bg-warning' :
                          trackedOrder.status === 'ACCEPTED' ? 'bg-primary' :
                          trackedOrder.status === 'PAID' ? 'bg-info' :
                          trackedOrder.status === 'SHIPPED' ? 'bg-secondary' :
                          trackedOrder.status === 'DELIVERED' ? 'bg-success' : 'bg-secondary'
                        }`}>
                          {trackedOrder.status || 'PENDING'}
                        </span>
                      </div>
                      <div className="mb-3">
                        <strong>Order Date:</strong> {new Date(trackedOrder.createdAt).toLocaleDateString()}
                      </div>
                      {trackedOrder.deliveryAddress && (
                        <div className="mb-3">
                          <strong>Delivery Address:</strong> {trackedOrder.deliveryAddress}
                        </div>
                      )}
                      
                      {/* Status Progress */}
                      <div className="mt-4">
                        <h6>Order Progress</h6>
                        <div className="progress-container">
                          {getStatusProgress(trackedOrder.status).map((step, index) => (
                            <div key={step.key} className="d-flex align-items-center mb-2">
                              <div className={`status-icon me-3 ${
                                step.completed ? 'completed' : step.current ? 'current' : 'pending'
                              }`}>
                                {step.icon}
                              </div>
                              <div className="flex-grow-1">
                                <div className={`status-label ${
                                  step.completed ? 'text-success' : step.current ? 'text-primary' : 'text-muted'
                                }`}>
                                  {step.label}
                                </div>
                                {step.current && (
                                  <small className="text-primary">Current Step</small>
                                )}
                              </div>
                              {index < getStatusProgress(trackedOrder.status).length - 1 && (
                                <div className={`progress-line ${
                                  step.completed ? 'completed' : ''
                                }`}></div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order History Tab */}
          {activeTab === 'history' && (
            <div className="card">
              <div className="card-header">
                <h5>Order History</h5>
              </div>
              <div className="card-body">
                {orderHistory.length === 0 ? (
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
                        {orderHistory.map(order => (
                          <tr key={order.id}>
                            <td>{order.id}</td>
                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td>{order.customerName}</td>
                            <td>{order.items?.length || 0} items</td>
                            <td>${order.total?.toFixed(2) || '0.00'}</td>
                            <td>
                              <span className={`badge ${
                                order.status === 'PENDING' ? 'bg-warning' :
                                order.status === 'ACCEPTED' ? 'bg-primary' :
                                order.status === 'PAID' ? 'bg-info' :
                                order.status === 'SHIPPED' ? 'bg-secondary' :
                                order.status === 'DELIVERED' ? 'bg-success' : 'bg-secondary'
                              }`}>
                                {order.status || 'PENDING'}
                              </span>
                            </td>
                            <td>
                              <button 
                                className="btn btn-sm btn-outline-primary me-2"
                                onClick={() => {
                                  setPaymentForm(prev => ({ ...prev, orderId: order.id, amount: order.total }));
                                  setActiveTab('pay');
                                }}
                              >
                                Pay
                              </button>
                              <button className="btn btn-sm btn-outline-secondary">
                                View Details
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
          )}

          {/* Pay Order Tab */}
          {activeTab === 'pay' && (
            <div className="row">
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header">
                    <h5>Payment Information</h5>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handlePayment}>
                      <div className="mb-3">
                        <label className="form-label">Order ID *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={paymentForm.orderId}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, orderId: e.target.value }))}
                          required
                        />
                      </div>
                      
                      <div className="mb-3">
                        <label className="form-label">Amount *</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          value={paymentForm.amount}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                          required
                        />
                      </div>
                      
                      <div className="mb-3">
                        <label className="form-label">Payment Method</label>
                        <select
                          className="form-select"
                          value={paymentForm.paymentMethod}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                        >
                          <option value="card">Credit/Debit Card</option>
                          <option value="cash">Cash on Delivery</option>
                          <option value="bank">Bank Transfer</option>
                        </select>
                      </div>
                      
                      {paymentForm.paymentMethod === 'card' && (
                        <>
                          <div className="mb-3">
                            <label className="form-label">Card Number</label>
                            <input
                              type="text"
                              className="form-control"
                              value={paymentForm.cardNumber}
                              onChange={(e) => setPaymentForm(prev => ({ ...prev, cardNumber: e.target.value }))}
                              placeholder="1234 5678 9012 3456"
                            />
                          </div>
                          
                          <div className="row mb-3">
                            <div className="col-md-6">
                              <label className="form-label">Expiry Date</label>
                              <input
                                type="text"
                                className="form-control"
                                value={paymentForm.expiryDate}
                                onChange={(e) => setPaymentForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                                placeholder="MM/YY"
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">CVV</label>
                              <input
                                type="text"
                                className="form-control"
                                value={paymentForm.cvv}
                                onChange={(e) => setPaymentForm(prev => ({ ...prev, cvv: e.target.value }))}
                                placeholder="123"
                              />
                            </div>
                          </div>
                        </>
                      )}
                      
                      <button type="submit" className="btn btn-success" disabled={loading}>
                        {loading ? 'Processing...' : 'Process Payment'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header">
                    <h5>Payment Summary</h5>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <strong>Order ID:</strong> {paymentForm.orderId || 'Not specified'}
                    </div>
                    <div className="mb-3">
                      <strong>Amount:</strong> ${paymentForm.amount || '0.00'}
                    </div>
                    <div className="mb-3">
                      <strong>Payment Method:</strong> {paymentForm.paymentMethod?.toUpperCase()}
                    </div>
                    <hr />
                    <div className="alert alert-info">
                      <small>
                        <strong>Note:</strong> This is a demo payment system. 
                        No actual payment will be processed.
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PurchaseHub;
