import React, { useEffect, useMemo, useState } from 'react';
import { medicineService } from '../services/api';

export default function OwnerOutOfStock() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState('zero'); // 'low' | 'zero'
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, [filterMode]);

  const load = async () => {
    try {
      setError('');
      setLoading(true);
      // Prefer dedicated endpoints
      if (filterMode === 'zero' && medicineService.getZeroStockMedicines) {
        const res = await medicineService.getZeroStockMedicines();
        setItems(res.data || []);
      } else if (medicineService.getLowStockMedicines) {
        const res = await medicineService.getLowStockMedicines();
        setItems(res.data || []);
      } else {
        const res = await medicineService.getAllMedicines();
        const list = (res.data || []).filter(m => {
          const stock = readStockValue(m) ?? 0;
          const reorder = readReorderValue(m) ?? 0;
          return filterMode === 'zero' ? stock === 0 : stock <= reorder;
        });
        setItems(list);
      }
    } catch (e) {
      console.error('Failed to fetch low stock list', e);
      setError(e?.response?.data?.message || e?.message || 'Failed to load data');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  function readStockValue(m) {
    // Normalize common backend field names
    const candidates = [
      m.stock,
      m.stockQuantity,
      m.currentStock,
      m.available,
      m.quantity,
      m.inStock
    ];
    const value = candidates.find(v => typeof v === 'number');
    return typeof value === 'number' ? value : undefined;
  }

  function readReorderValue(m) {
    const candidates = [
      m.reorderLevel,
      m.minStockLevel,
      m.minStock,
      m.threshold,
      m.reorder_level
    ];
    const value = candidates.find(v => typeof v === 'number');
    return typeof value === 'number' ? value : undefined;
  }

  const normalizedItems = useMemo(() => items.map(m => ({
    ...m,
    _stock: readStockValue(m),
    _reorder: readReorderValue(m)
  })), [items]);

  const displayed = (filterMode === 'zero')
    ? normalizedItems.filter(m => (m._stock ?? -1) === 0)
    : normalizedItems;

  const sorted = displayed.slice().sort((a, b) => (a._stock ?? Number.POSITIVE_INFINITY) - (b._stock ?? Number.POSITIVE_INFINITY));

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
      <h2 className="mb-3">Out-of-Stock List</h2>
      {error && (
        <div className="alert alert-danger" role="alert">{error}</div>
      )}
      <div className="d-flex gap-2 mb-3">
        <button
          className={`btn btn-sm ${filterMode === 'low' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setFilterMode('low')}
        >
          Low Stock (≤ Reorder)
        </button>
        <button
          className={`btn btn-sm ${filterMode === 'zero' ? 'btn-danger' : 'btn-outline-danger'}`}
          onClick={() => setFilterMode('zero')}
        >
          Zero Stock Only
        </button>
      </div>
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Category</th>
                  <th className="text-end">Stock</th>
                  <th className="text-end">Reorder Level</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((m, idx) => (
                  <tr key={m.id || m._id || idx}>
                    <td><strong>{m.name}</strong></td>
                    <td>{m.category}</td>
                    <td className="text-end text-danger">{m._stock ?? '-'}</td>
                    <td className="text-end">{m._reorder ?? '-'}</td>
                  </tr>
                ))}
                {sorted.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center text-muted">{filterMode === 'zero' ? 'No zero-stock medicines' : 'All items are sufficiently stocked'}</td>
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


