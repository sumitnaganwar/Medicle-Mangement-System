import React, { useEffect, useMemo, useState } from 'react';
import { saleService } from '../services/api';
import { formatCurrency } from '../utils/helpers';

const TopMedicinesPage = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await saleService.getAllSales();
      setSales(res.data || []);
    } catch (e) {
      console.error('Failed to fetch sales', e);
    } finally {
      setLoading(false);
    }
  };

  const topMedicines = useMemo(() => {
    const medicineSales = {};
    sales.forEach(sale => {
      sale.items?.forEach(item => {
        const id = item.medicine?.id || item.medicineId;
        if (!id) return;
        if (!medicineSales[id]) {
          medicineSales[id] = {
            medicine: item.medicine,
            totalQuantity: 0,
            totalRevenue: 0
          };
        }
        medicineSales[id].totalQuantity += item.quantity || 0;
        medicineSales[id].totalRevenue += item.subtotal || 0;
      });
    });
    return Object.values(medicineSales)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);
  }, [sales]);

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
      <div className="row mb-3">
        <div className="col-12">
          <h2 className="mb-0">Top 10 Medicines</h2>
        </div>
      </div>
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Medicine</th>
                  <th>Category</th>
                  <th>Quantity Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topMedicines.map((item, index) => (
                  <tr key={item.medicine?.id || index}>
                    <td>{index + 1}</td>
                    <td><strong>{item.medicine?.name || 'Unknown'}</strong></td>
                    <td>{item.medicine?.category || '-'}</td>
                    <td>{item.totalQuantity}</td>
                    <td>{formatCurrency(item.totalRevenue)}</td>
                  </tr>
                ))}
                {topMedicines.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">No data</td>
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

export default TopMedicinesPage;


