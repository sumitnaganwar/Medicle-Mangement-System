import React, { useEffect, useMemo, useState } from 'react';
import { medicineService } from '../services/api';
import { formatDate } from '../utils/helpers';

const DAYS_WINDOW = 30; // configurable window

export default function NearExpiryMedicines() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setError('');
        setLoading(true);
        if (medicineService.getNearExpiryMedicines) {
          const res = await medicineService.getNearExpiryMedicines(DAYS_WINDOW);
          if (!cancelled) setItems(res.data || []);
        } else {
          // Fallback: compute near-expiry from all medicines
          const res = await medicineService.getAllMedicines();
          const today = new Date();
          const cutoff = new Date();
          cutoff.setDate(today.getDate() + DAYS_WINDOW);
          const list = (res.data || []).filter(m => {
            const d = m.expiryDate ? new Date(m.expiryDate) : null;
            return d && d >= today && d <= cutoff;
          });
          if (!cancelled) setItems(list);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e?.response?.data?.message || e?.message || 'Failed to load near-expiry list');
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const rows = useMemo(() => {
    return (items || []).map(m => {
      const expiry = m.expiryDate ? new Date(m.expiryDate) : null;
      let daysLeft = undefined;
      if (expiry) {
        const diffMs = expiry.getTime() - new Date().getTime();
        daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      }
    return { ...m, _daysLeft: daysLeft };
    }).sort((a, b) => (a._daysLeft ?? 99999) - (b._daysLeft ?? 99999));
  }, [items]);

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
      <h2 className="mb-3">Near Expiry Medicines</h2>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
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
                  <th className="text-end">Days Left</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((m, idx) => (
                  <tr key={m.id || m._id || idx}>
                    <td><strong>{m.name}</strong></td>
                    <td>{m.category}</td>
                    <td>{m.batchNumber || '-'}</td>
                    <td>{m.expiryDate ? formatDate(m.expiryDate) : '-'}</td>
                    <td className="text-end">{typeof m._daysLeft === 'number' ? m._daysLeft : '-'}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">No near-expiry medicines within {DAYS_WINDOW} days</td>
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


