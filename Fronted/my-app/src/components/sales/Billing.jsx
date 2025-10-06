import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { medicineService, saleService, customerService } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import { PAYMENT_METHODS } from '../utils/constants';

const Billing = () => {
  const location = useLocation();
  const [medicines, setMedicines] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [loading, setLoading] = useState(false);

  const isValidPhone = (phone) => /^(\d){10}$/.test((phone || '').trim());
  const isCustomerValid = () => customer.name.trim().length > 0 && isValidPhone(customer.phone);

  useEffect(() => {
    loadMedicines();
  }, []);

  // Pre-fill customer if navigated with state from Customers page
  useEffect(() => {
    const navCustomer = location?.state?.customer;
    if (navCustomer?.phone || navCustomer?.name) {
      setCustomer({
        name: navCustomer.name || '',
        phone: navCustomer.phone || ''
      });
    }
  }, [location?.state]);

  useEffect(() => {
    filterMedicines();
  }, [medicines, searchTerm]);

  const loadMedicines = async () => {
    try {
      const response = await medicineService.getAllMedicines();
      setMedicines(response.data);
    } catch (error) {
      console.error('Error loading medicines:', error);
    }
  };

  const filterMedicines = () => {
    if (!searchTerm) {
      setFilteredMedicines(medicines.slice(0, 10));
      return;
    }

    const filtered = medicines.filter(medicine =>
      medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.genericName?.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10);

    setFilteredMedicines(filtered);
  };

  const addToCart = (medicine) => {
    const existingItem = cart.find(item => item.medicine.id === medicine.id);
    
    if (existingItem) {
      if (existingItem.quantity >= medicine.stockQuantity) {
        alert(`Only ${medicine.stockQuantity} items available in stock`);
        return;
      }
      setCart(cart.map(item =>
        item.medicine.id === medicine.id
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * medicine.price }
          : item
      ));
    } else {
      if (medicine.stockQuantity < 1) {
        alert('This medicine is out of stock');
        return;
      }
      setCart([...cart, {
        medicine,
        quantity: 1,
        unitPrice: medicine.price,
        subtotal: medicine.price
      }]);
    }
    setSearchTerm('');
  };

  const updateQuantity = (medicineId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(medicineId);
      return;
    }

    const medicine = medicines.find(m => m.id === medicineId);
    if (newQuantity > medicine.stockQuantity) {
      alert(`Only ${medicine.stockQuantity} items available in stock`);
      return;
    }

    setCart(cart.map(item =>
      item.medicine.id === medicineId
        ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.unitPrice }
        : item
    ));
  };

  const removeFromCart = (medicineId) => {
    setCart(cart.filter(item => item.medicine.id !== medicineId));
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + item.subtotal, 0);
  };

  const handleCheckCustomer = async () => {
    if (!isValidPhone(customer.phone)) return;

    try {
      const response = await customerService.getCustomerByPhone(customer.phone);
      if (response.data) {
        setCustomer(prev => ({ ...prev, name: response.data.name }));
      }
    } catch (error) {
      // Customer not found, continue with new customer
    }
  };

  const processSale = async () => {
    if (cart.length === 0) {
      alert('Please add items to the cart');
      return;
    }

    if (!isCustomerValid()) {
      alert('Please enter customer name and a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      const saleData = {
        customerName: customer.name || 'Walk-in Customer',
        customerPhone: customer.phone || '0000000000',
        paymentMethod,
        items: cart.map(item => ({
          medicineId: item.medicine.id,
          quantity: item.quantity
        }))
      };

      const res = await saleService.createSale(saleData);
      const createdSale = res?.data || {};

      if (paymentMethod === 'CASH' && createdSale) {
        printReceipt(createdSale);
      } else {
        alert('Sale completed successfully!');
      }
      setCart([]);
      setCustomer({ name: '', phone: '' });
      setPaymentMethod('CASH');
      await loadMedicines(); // Refresh stock
    } catch (error) {
      alert(error.response?.data || 'Error processing sale');
    } finally {
      setLoading(false);
    }
  };

  const printReceipt = (sale) => {
    try {
      const receiptWindow = window.open('', 'PRINT', 'height=600,width=400');
      if (!receiptWindow) return;
      const itemsRows = (sale.items || cart.map(ci => ({
        medicine: { name: ci.medicine.name },
        quantity: ci.quantity,
        unitPrice: ci.unitPrice,
        subtotal: ci.subtotal
      })))
        .map((it) => `
          <tr>
            <td style="padding:4px 0;">${it.medicine?.name || ''}</td>
            <td style="text-align:center;">${it.quantity}</td>
            <td style="text-align:right;">${Number(it.unitPrice || 0).toFixed(2)}</td>
            <td style="text-align:right;">${Number(it.subtotal || (it.quantity * it.unitPrice) || 0).toFixed(2)}</td>
          </tr>`)
        .join('');

      const total = Number(sale.totalAmount || getTotalAmount()).toFixed(2);
      const billNo = sale.billNumber
        || (sale.id ? `B${String(sale.id).padStart(3, '0')}`
        : `B${String(Date.now()).slice(-6)}`);
      const when = sale.saleDate ? new Date(sale.saleDate) : new Date();
      const pay = sale.paymentMethod || paymentMethod;
      const custName = sale.customer?.name || sale.customerName || customer.name || 'Walk-in Customer';
      const custPhone = sale.customer?.phone || sale.customerPhone || customer.phone || '';

      receiptWindow.document.write(`
        <html>
          <head>
            <title>Bill ${billNo}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 16px; }
              .header { margin-bottom: 8px; }
              .row { display: flex; justify-content: space-between; }
              .label { font-weight: bold; }
              .spacer { height: 12px; }
              table { width: 100%; border-collapse: collapse; margin-top: 8px; }
              th, td { font-size: 12px; }
              th { text-align: left; border-bottom: 1px dashed #999; padding-bottom: 6px; }
              tbody tr td { padding: 6px 0; border-bottom: 1px solid #eee; }
              tfoot td { border-top: 1px dashed #999; padding-top: 6px; font-weight: bold; }
              .footer { margin-top: 18px; text-align: center; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2 style="margin:0 0 6px 0;">Pharmacy Bill</h2>
              <div class="row"><span class="label">Bill No:</span> <span>${billNo}</span></div>
              <div class="row"><span class="label">Date:</span> <span>${when.toLocaleString()}</span></div>
              <div class="row"><span class="label">Customer:</span> <span>${custName}</span></div>
              <div class="row"><span class="label">Phone:</span> <span>${custPhone}</span></div>
              <div class="row"><span class="label">Payment:</span> <span>${pay}</span></div>
            </div>
            <div class="spacer"></div>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align:center;">Qty</th>
                  <th style="text-align:right;">Price</th>
                  <th style="text-align:right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3">Total</td>
                  <td style="text-align:right;">${total}</td>
                </tr>
              </tfoot>
            </table>
            <div class="footer">
              <p style="margin: 16px 0 40px 0;">Thank you. Get well soon!</p>
            </div>
            <script>window.onload = function(){ window.focus(); window.print(); window.close(); }<\/script>
          </body>
        </html>
      `);
      receiptWindow.document.close();
    } catch (_) {
      alert('Sale completed. Unable to open print dialog.');
    }
  };

  return (
    <div className="billing">
      <div className="row">
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Customer & Payment</h5>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Customer Phone</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter phone number"
                      value={customer.phone}
                      onChange={(e) => setCustomer(prev => ({ ...prev, phone: e.target.value }))}
                      onBlur={handleCheckCustomer}
                    />
                    <button className="btn btn-outline-secondary" onClick={handleCheckCustomer}>
                      Check
                    </button>
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Customer Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Customer name"
                    value={customer.name}
                    onChange={(e) => setCustomer(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <label className="form-label">Payment Method</label>
                  <select
                    className="form-select"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    {PAYMENT_METHODS.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">Add Medicines to Bill</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search medicines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="row">
                {filteredMedicines.map(medicine => (
                  <div key={medicine.id} className="col-lg-4 col-md-6 mb-3">
                    <div className="card h-100">
                      <div className="card-body">
                        <h6 className="card-title">{medicine.name}</h6>
                        {medicine.genericName && (
                          <p className="text-muted small mb-1">{medicine.genericName}</p>
                        )}
                        <p className="mb-1">
                          <strong>Price:</strong> {formatCurrency(medicine.price)}
                        </p>
                        <p className="mb-2">
                          <strong>Stock:</strong> {medicine.stockQuantity}
                        </p>
                        <button
                          className="btn btn-primary btn-sm w-100"
                          onClick={() => addToCart(medicine)}
                          disabled={medicine.stockQuantity === 0}
                        >
                          {medicine.stockQuantity === 0 ? 'Out of Stock' : 'Add to Bill'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card sticky-top" style={{ top: '20px' }}>
            <div className="card-header bg-warning">
              <h5 className="mb-0">Current Bill</h5>
            </div>
            <div className="card-body">
              {cart.length === 0 ? (
                <p className="text-muted text-center">No items added</p>
              ) : (
                <div className="bill-items">
                  {cart.map((item, index) => (
                    <div key={item.medicine.id} className="bill-item mb-2 pb-2 border-bottom">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">{item.medicine.name}</h6>
                          <small className="text-muted">
                            {formatCurrency(item.unitPrice)} × {item.quantity}
                          </small>
                        </div>
                        <div className="text-end">
                          <div className="d-flex align-items-center mb-1">
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => updateQuantity(item.medicine.id, item.quantity - 1)}
                            >
                              -
                            </button>
                            <span className="mx-2">{item.quantity}</span>
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => updateQuantity(item.medicine.id, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                          <strong>{formatCurrency(item.subtotal)}</strong>
                          <button
                            className="btn btn-sm btn-outline-danger ms-2"
                            onClick={() => removeFromCart(item.medicine.id)}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="total-section mt-3 pt-3 border-top">
                <div className="d-flex justify-content-between">
                  <strong>Total Amount:</strong>
                  <strong className="text-success">{formatCurrency(getTotalAmount())}</strong>
                </div>
              </div>

              <button
                className="btn btn-success w-100 mt-3"
                onClick={processSale}
                disabled={cart.length === 0 || loading || !isCustomerValid()}
              >
                {loading ? 'Processing...' : `Process ${paymentMethod} Payment`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;