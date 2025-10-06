import React, { useState, useEffect } from 'react';
import { saleService, medicineService } from '../services/api';
import { formatCurrency, formatDate } from '../utils/helpers';

const ReportsPage = () => {
  const [sales, setSales] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [salesResponse, medicinesResponse] = await Promise.all([
        saleService.getAllSales(),
        medicineService.getAllMedicines()
      ]);
      setSales(salesResponse.data);
      setMedicines(medicinesResponse.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredSales = () => {
    return sales.filter(sale => {
      const saleDate = new Date(sale.saleDate).toISOString().split('T')[0];
      return saleDate >= dateRange.start && saleDate <= dateRange.end;
    });
  };

  const getSalesStats = () => {
    const filteredSales = getFilteredSales();
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalItems = filteredSales.reduce((sum, sale) => 
      sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );

    return {
      totalSales: filteredSales.length,
      totalRevenue,
      totalItems,
      averageSale: filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0
    };
  };

  const getTopMedicines = () => {
    const medicineSales = {};
    
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const medicineId = item.medicine.id;
        if (!medicineSales[medicineId]) {
          medicineSales[medicineId] = {
            medicine: item.medicine,
            totalQuantity: 0,
            totalRevenue: 0
          };
        }
        medicineSales[medicineId].totalQuantity += item.quantity;
        medicineSales[medicineId].totalRevenue += item.subtotal;
      });
    });

    return Object.values(medicineSales)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);
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

  const stats = getSalesStats();
  const topMedicines = getTopMedicines();

  return (
    <div className="reports-page">
      <div className="row mb-4">
        <div className="col-12">
          <h2>Sales Reports & Analytics</h2>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Date Range Filter</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <h4>{formatCurrency(stats.totalRevenue)}</h4>
              <p className="mb-0">Total Revenue in Selected Period</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-primary">{stats.totalSales}</h3>
              <p className="text-muted mb-0">Total Bills</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-success">{stats.totalItems}</h3>
              <p className="text-muted mb-0">Items Sold</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-info">{formatCurrency(stats.averageSale)}</h3>
              <p className="text-muted mb-0">Average per Bill</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-warning">{medicines.length}</h3>
              <p className="text-muted mb-0">Total Medicines</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Top Selling Medicines</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Medicine</th>
                      <th>Quantity Sold</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topMedicines.map((item, index) => (
                      <tr key={item.medicine.id}>
                        <td>
                          <strong>{item.medicine.name}</strong>
                          <small className="text-muted d-block">{item.medicine.category}</small>
                        </td>
                        <td>{item.totalQuantity}</td>
                        <td>{formatCurrency(item.totalRevenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Recent Sales</h5>
            </div>
            <div className="card-body">
              <div className="recent-sales">
                {getFilteredSales().slice(0, 5).map(sale => (
                  <div key={sale.id} className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                    <div>
                      <strong>{sale.billNumber}</strong>
                      <small className="text-muted d-block">{formatDate(sale.saleDate)}</small>
                    </div>
                    <div className="text-end">
                      <div className="text-success">{formatCurrency(sale.totalAmount)}</div>
                      <small className="text-muted">{sale.paymentMethod}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;