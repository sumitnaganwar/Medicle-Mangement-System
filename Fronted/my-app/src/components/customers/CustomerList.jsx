import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerService } from '../services/api';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await customerService.getAllCustomers();
        setCustomers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch customers', err);
        const msg = err?.response?.data || err?.message || 'Failed to fetch';
        setError(typeof msg === 'string' ? msg : 'Failed to fetch');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(c =>
      (c.name || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q)
    );
  }, [customers, search]);

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Customers</h5>
        <div style={{ width: 280 }}>
          <input
            className="form-control"
            placeholder="Search name, phone, email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="card-body p-0">
        {loading && (
          <div className="p-3">Loading...</div>
        )}
        {error && (
          <div className="alert alert-danger m-3">{error}</div>
        )}
        {!loading && !error && (
          <div className="table-responsive">
            <table className="table table-striped mb-0">
              <thead>
                <tr>
                  <th style={{width: 70}}>ID</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th style={{width: 140}}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-3">No customers found</td>
                  </tr>
                ) : (
                  filtered.map(c => (
                    <tr key={c.id}>
                      <td>{c.id}</td>
                      <td>{c.name}</td>
                      <td>{c.phone}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => navigate('/billing', { state: { customer: { name: c.name, phone: c.phone } } })}
                        >
                          Create Bill
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerList;


