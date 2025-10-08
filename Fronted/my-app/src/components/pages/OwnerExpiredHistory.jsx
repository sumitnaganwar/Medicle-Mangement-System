import React, { useEffect, useState } from 'react';
import { medicineService } from '../services/api';
import { formatDate } from '../utils/helpers';

export default function OwnerExpiredHistory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      // If backend has a dedicated endpoint, swap here; otherwise derive from all medicines
      const res = await medicineService.getAllMedicines();
      const today = new Date();
      const expired = (res.data || []).filter(m => m.expiryDate && new Date(m.expiryDate) < today);
      setItems(expired.sort((a, b) => new Date(b.expiryDate) - new Date(a.expiryDate)));
    } catch (e) {
      console.error('Failed to fetch expired medicines', e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="container">
      <h2 className="mb-3">Expired Medicines History</h2>
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Category</th>
                  <th>Batch</th>
                  <th>Expiry Date</th>
                </tr>
              </thead>
              <tbody>
                {items.map(m => (
                  <tr key={m.id}>
                    <td><strong>{m.name}</strong></td>
                    <td>{m.category}</td>
                    <td>{m.batchNumber || '-'}</td>
                    <td>{m.expiryDate ? formatDate(m.expiryDate) : '-'}</td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center text-muted">No expired medicines found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


