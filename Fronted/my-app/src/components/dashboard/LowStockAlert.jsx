import React, { useState, useEffect } from 'react';
import { medicineService } from '../services/api';
import { formatCurrency } from '../utils/helpers';

const LowStockAlert = () => {
  const [lowStockMedicines, setLowStockMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLowStockMedicines();
  }, []);

  const loadLowStockMedicines = async () => {
    try {
      const response = await medicineService.getLowStockMedicines();
      setLowStockMedicines(response.data);
    } catch (error) {
      console.error('Error loading low stock medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-3">Loading alerts...</div>;
  }

  return (
    <div className="card border-warning">
      <div className="card-header bg-warning text-dark">
        <h5 className="mb-0">
          <i className="fas fa-exclamation-triangle me-2"></i>
          Low Stock Alerts ({lowStockMedicines.length})
        </h5>
      </div>
      <div className="card-body">
        {lowStockMedicines.length === 0 ? (
          <p className="text-muted mb-0">No low stock alerts. All medicines are sufficiently stocked.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm table-hover">
              <thead>
                <tr>
                  <th>Medicine Name</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Minimum Required</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {lowStockMedicines.map((medicine) => (
                  <tr key={medicine.id} className="table-warning">
                    <td>
                      <strong>{medicine.name}</strong>
                      {medicine.genericName && (
                        <small className="text-muted d-block">{medicine.genericName}</small>
                      )}
                    </td>
                    <td>{medicine.category}</td>
                    <td>
                      <span className="badge bg-danger">{medicine.stockQuantity}</span>
                    </td>
                    <td>{medicine.minStockLevel}</td>
                    <td>{formatCurrency(medicine.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LowStockAlert;