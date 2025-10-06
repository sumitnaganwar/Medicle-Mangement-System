import React, { useState, useEffect } from 'react';
import { saleService } from '../services/api';
import BillItem from './BillItem';
import { formatCurrency, formatDate } from '../utils/helpers';

const BillHistory = () => {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadSales();
  }, []);

  useEffect(() => {
    filterSales();
  }, [sales, dateFilter]);

  const loadSales = async () => {
    try {
      console.log('Loading sales data...');
      const response = await saleService.getAllSales();
      const payload = response?.data;
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.content)
            ? payload.content
            : [];
      console.log('Loaded sales:', list.length, 'items');
      setSales(list);
    } catch (error) {
      console.error('Error loading sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaleDeleted = (deletedSaleId) => {
    setSales(prevSales => prevSales.filter(sale => sale.id !== deletedSaleId));
  };

  const handleSaleUpdated = () => {
    console.log('Sale updated, refreshing data...');
    setLoading(true);
    setRefreshKey(prev => prev + 1);
    loadSales();
  };

  const filterSales = () => {
    let filtered = Array.isArray(sales) ? [...sales] : [];

    if (dateFilter) {
      const filterDate = new Date(dateFilter).toDateString();
      filtered = filtered.filter(sale => 
        new Date(sale.saleDate).toDateString() === filterDate
      );
    }

    // Sort by date descending (safe if array)
    filtered = Array.isArray(filtered)
      ? filtered.sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate))
      : [];
    
    setFilteredSales(filtered);
  };

  const getTotalRevenue = () => {
    return filteredSales.reduce((total, sale) => total + sale.totalAmount, 0);
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
    <div className="bill-history">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h2>Sales History</h2>
            <div className="d-flex gap-3 align-items-center">
              <div>
                <label className="form-label me-2">Filter by Date:</label>
                <input
                  type="date"
                  className="form-control"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
              <button
                className="btn btn-outline-secondary"
                onClick={() => setDateFilter('')}
              >
                Clear Filter
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-12">
          <div className="card bg-light">
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-4">
                  <h4>{filteredSales.length}</h4>
                  <p className="text-muted mb-0">Total Bills</p>
                </div>
                <div className="col-md-4">
                  <h4 className="text-success">{formatCurrency(getTotalRevenue())}</h4>
                  <p className="text-muted mb-0">Total Revenue</p>
                </div>
                <div className="col-md-4">
                  <h4 className="text-primary">
                    {filteredSales.length > 0 ? formatCurrency(getTotalRevenue() / filteredSales.length) : 0}
                  </h4>
                  <p className="text-muted mb-0">Average per Bill</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          {filteredSales.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-receipt fa-3x text-muted mb-3"></i>
              <p className="text-muted">No sales found for the selected criteria.</p>
            </div>
          ) : (
            <div className="sales-list" key={refreshKey}>
              {filteredSales.map(sale => (
                <BillItem 
                  key={`${sale.id}-${sale.items?.length || 0}-${refreshKey}`} 
                  sale={sale} 
                  onSaleDeleted={handleSaleDeleted}
                  onSaleUpdated={handleSaleUpdated}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillHistory;