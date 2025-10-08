import React, { useMemo, useState, useEffect } from 'react';
// Removed Transactions navigation links
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
  const [month, setMonth] = useState(new Date().getMonth() + 1); // 1..12
  const [year, setYear] = useState(new Date().getFullYear());

  const monthOptions = useMemo(() => (
    [
      'January','February','March','April','May','June','July','August','September','October','November','December'
    ].map((name, idx) => ({ value: idx + 1, label: name }))
  ), []);

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

  function setMonthRange(y, m) {
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0);
    setDateRange({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    });
  }

  useEffect(() => {
    // initialize to current month range
    setMonthRange(year, month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const getMonthlySummary = () => {
    // Group by month of saleDate
    const summary = {};
    sales.forEach(sale => {
      const d = new Date(sale.saleDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!summary[key]) summary[key] = { year: d.getFullYear(), month: d.getMonth() + 1, totalRevenue: 0, totalItems: 0, totalSales: 0 };
      summary[key].totalRevenue += sale.totalAmount;
      summary[key].totalItems += sale.items.reduce((acc, it) => acc + it.quantity, 0);
      summary[key].totalSales += 1;
    });
    return Object.values(summary).sort((a, b) => (a.year - b.year) || (a.month - b.month));
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

  // Transactions summary removed from Reports page

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

      {/* Transactions cards removed */}

      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Date Range Filter</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-12 mb-2">
                  <div className="d-flex align-items-end gap-2">
                    <div style={{ minWidth: 180 }}>
                      <label className="form-label">Quick Month</label>
                      <div className="d-flex gap-2">
                        <select className="form-select" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                          {monthOptions.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
                        <input type="number" className="form-control" value={year} onChange={(e) => setYear(Number(e.target.value))} />
                        <button className="btn btn-outline-primary" onClick={() => setMonthRange(year, month)}>Apply</button>
                      </div>
                    </div>
                  </div>
                </div>
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
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Monthly Summary (All Data)</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Total Bills</th>
                      <th>Total Items</th>
                      <th>Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getMonthlySummary().map(row => (
                      <tr key={`${row.year}-${row.month}`}>
                        <td>{monthOptions[row.month - 1].label} {row.year}</td>
                        <td>{row.totalSales}</td>
                        <td>{row.totalItems}</td>
                        <td>{formatCurrency(row.totalRevenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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

      {/* Top Selling Medicines section removed; moved to dedicated page */}
    </div>
  );
};

export default ReportsPage;