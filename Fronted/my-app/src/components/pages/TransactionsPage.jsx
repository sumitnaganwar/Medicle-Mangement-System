import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { saleService } from '../services/api';
import { formatCurrency, formatDate } from '../utils/helpers';

const TransactionsPage = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await loadSales();
      if (cancelled) return;
      const params = new URLSearchParams(location.search || '');
      const p = params.get('period');
      if (p) applyQuickPeriod(p);
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const loadSales = async () => {
    try {
      const res = await saleService.getAllSales();
      setSales(res.data || []);
    } catch (err) {
      console.error('Failed to load sales', err);
    } finally {
      setLoading(false);
    }
  };

  function applyQuickPeriod(period) {
    const now = new Date();
    if (period === 'daily') {
      const d = now.toISOString().split('T')[0];
      setDateRange({ start: d, end: d });
    } else if (period === 'monthly') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      setDateRange({ start, end });
    } else if (period === 'yearly') {
      const start = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
      const end = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
      setDateRange({ start, end });
    }
  }

  const filteredSales = useMemo(() => {
    let list = sales;
    if (dateRange.start && dateRange.end) {
      list = list.filter(s => {
        const d = new Date(s.saleDate).toISOString().split('T')[0];
        return d >= dateRange.start && d <= dateRange.end;
      });
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(s =>
        String(s.billNumber).toLowerCase().includes(q) ||
        (s.customerName && String(s.customerName).toLowerCase().includes(q)) ||
        (s.paymentMethod && String(s.paymentMethod).toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate));
  }, [sales, dateRange, search]);

  const totals = useMemo(() => {
    const revenue = filteredSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    return { count: filteredSales.length, revenue };
  }, [filteredSales]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="transactions-page">
      <div className="row mb-3">
        <div className="col-12 d-flex justify-content-between align-items-center">
          <h2 className="mb-0">Transactions</h2>
          <Link to="/reports" className="btn btn-link">Back to Reports</Link>
        </div>
      </div>

      <div className="row mb-3 g-2">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search by bill, customer, payment method"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <input
            type="date"
            className="form-control"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
          />
        </div>
        <div className="col-md-3">
          <input
            type="date"
            className="form-control"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
          />
        </div>
        <div className="col-md-2 d-flex gap-2">
          <button className="btn btn-outline-secondary flex-grow-1" onClick={() => setDateRange({ start: '', end: '' })}>Clear</button>
        </div>
      </div>

      <div className="row mb-3 g-2">
        <div className="col-12 d-flex gap-2">
          <button className="btn btn-sm btn-outline-primary" onClick={() => applyQuickPeriod('daily')}>Today</button>
          <button className="btn btn-sm btn-outline-success" onClick={() => applyQuickPeriod('monthly')}>This Month</button>
          <button className="btn btn-sm btn-outline-warning" onClick={() => applyQuickPeriod('yearly')}>This Year</button>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <div className="card bg-light">
            <div className="card-body d-flex justify-content-between">
              <div><strong>Total Transactions</strong></div>
              <div>{totals.count}</div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card bg-primary text-white">
            <div className="card-body d-flex justify-content-between">
              <div><strong>Total Revenue</strong></div>
              <div>{formatCurrency(totals.revenue)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">All Transactions</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th>Bill No.</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Payment</th>
                  <th className="text-end">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map(sale => (
                  <tr key={sale.id}>
                    <td><strong>{sale.billNumber}</strong></td>
                    <td>{formatDate(sale.saleDate)}</td>
                    <td>{sale.items?.reduce((acc, it) => acc + (it.quantity || 0), 0) || 0}</td>
                    <td>{sale.paymentMethod}</td>
                    <td className="text-end text-success">{formatCurrency(sale.totalAmount)}</td>
                  </tr>
                ))}
                {filteredSales.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">No transactions found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;


