import React, { useEffect, useMemo, useState } from 'react';
import { saleService, medicineService } from '../services/api';
import { formatCurrency } from '../utils/helpers';

const ProfitAnalysis = () => {
  const [sales, setSales] = useState([]);
  const [medicinesById, setMedicinesById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [granularity, setGranularity] = useState('day'); // 'day' | 'month' | 'year'
  const [series, setSeries] = useState([]); // [{ label, value }]

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [salesRes, medicinesRes] = await Promise.all([
          saleService.getAllSales(),
          medicineService.getAllMedicines(),
        ]);
        if (cancelled) return;
        setSales(salesRes.data || []);
        const map = {};
        (medicinesRes.data || []).forEach(m => { map[m.id] = m; });
        setMedicinesById(map);
      } catch (e) {
        if (!cancelled) setError('Failed to load data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredSales = useMemo(() => {
    const start = dateRange.start;
    const end = dateRange.end;
    return (sales || []).filter(s => {
      const d = new Date(s.saleDate).toISOString().split('T')[0];
      return d >= start && d <= end;
    });
  }, [sales, dateRange]);

  const summary = useMemo(() => {
    let revenue = 0;
    let cost = 0;
    (filteredSales || []).forEach(sale => {
      revenue += sale.totalAmount || 0;
      (sale.items || []).forEach(item => {
        const med = item.medicine || medicinesById[item.medicineId];
        const costPrice = (med && (med.costPrice ?? med.cost_price)) || 0;
        const quantity = item.quantity || 0;
        cost += costPrice * quantity;
      });
    });
    const profit = revenue - cost;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    return { revenue, cost, profit, margin };
  }, [filteredSales, medicinesById]);

  function analyze() {
    // group profit by selected granularity
    const groups = {};
    (filteredSales || []).forEach(sale => {
      let key;
      const d = new Date(sale.saleDate);
      if (granularity === 'year') {
        key = String(d.getFullYear());
      } else if (granularity === 'month') {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      } else {
        key = new Date(d).toISOString().split('T')[0];
      }

      let saleCost = 0;
      (sale.items || []).forEach(item => {
        const med = item.medicine || medicinesById[item.medicineId];
        const costPrice = (med && (med.costPrice ?? med.cost_price)) || 0;
        saleCost += costPrice * (item.quantity || 0);
      });
      const saleProfit = (sale.totalAmount || 0) - saleCost;
      groups[key] = (groups[key] || 0) + saleProfit;
    });

    const sorted = Object.entries(groups)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([label, value]) => ({ label, value }));
    setSeries(sorted);
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12 d-flex align-items-end gap-3">
          <div>
            <label className="form-label">Start Date</label>
            <input type="date" className="form-control" value={dateRange.start} onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">End Date</label>
            <input type="date" className="form-control" value={dateRange.end} onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Granularity</label>
            <select className="form-select" value={granularity} onChange={(e) => setGranularity(e.target.value)}>
              <option value="day">Day</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          </div>
          <div className="ms-auto">
            <button className="btn btn-primary" onClick={analyze}>Analyze</button>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <div className="text-muted">Revenue</div>
              <div className="h4 mb-0">{formatCurrency(summary.revenue)}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <div className="text-muted">Cost</div>
              <div className="h4 mb-0">{formatCurrency(summary.cost)}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <div className="text-muted">Profit</div>
              <div className="h4 mb-0">{formatCurrency(summary.profit)}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <div className="text-muted">Margin</div>
              <div className="h4 mb-0">{summary.margin.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      {series.length > 0 && (
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">Profit Trend ({granularity})</h5>
          </div>
          <div className="card-body">
            <SimpleLineChart data={series} height={260} yFormatter={formatCurrency} />
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Profit by Medicine</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th className="text-end">Qty</th>
                  <th className="text-end">Revenue</th>
                  <th className="text-end">Cost</th>
                  <th className="text-end">Profit</th>
                </tr>
              </thead>
              <tbody>
                {Object.values((() => {
                  const map = {};
                  filteredSales.forEach(sale => {
                    (sale.items || []).forEach(item => {
                      const med = item.medicine || medicinesById[item.medicineId];
                      if (!med) return;
                      const id = med.id;
                      if (!map[id]) map[id] = { id, name: med.name, qty: 0, revenue: 0, cost: 0 };
                      const costPrice = (med.costPrice ?? med.cost_price) || 0;
                      const qty = item.quantity || 0;
                      const revenue = item.subtotal || (qty * (item.price || med.price || 0));
                      map[id].qty += qty;
                      map[id].revenue += revenue;
                      map[id].cost += costPrice * qty;
                    });
                  });
                  return map;
                })())
                .sort((a, b) => (b.revenue - b.cost) - (a.revenue - a.cost))
                .map(row => (
                  <tr key={row.id}>
                    <td>{row.name}</td>
                    <td className="text-end">{row.qty}</td>
                    <td className="text-end">{formatCurrency(row.revenue)}</td>
                    <td className="text-end">{formatCurrency(row.cost)}</td>
                    <td className="text-end">{formatCurrency(row.revenue - row.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitAnalysis;

// Lightweight inline SVG line chart to avoid extra deps
function SimpleLineChart({ data, height = 260, yFormatter }) {
  const padding = { left: 60, right: 20, top: 10, bottom: 30 };
  const width = 800; // container will scroll if smaller
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const values = data.map(d => d.value);
  const minY = Math.min(0, Math.min(...values));
  const maxY = Math.max(...values);
  const rangeY = maxY - minY || 1;

  const stepX = data.length > 1 ? innerW / (data.length - 1) : innerW;
  const points = data.map((d, i) => {
    const x = padding.left + i * stepX;
    const y = padding.top + innerH - ((d.value - minY) / rangeY) * innerH;
    return { x, y };
  });

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const yTicks = 4;
  const yLines = new Array(yTicks + 1).fill(0).map((_, i) => {
    const y = padding.top + (innerH / yTicks) * i;
    const value = maxY - (rangeY / yTicks) * i;
    return { y, value };
  });

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={width} height={height}>
        {/* axes */}
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + innerH} stroke="#ccc" />
        <line x1={padding.left} y1={padding.top + innerH} x2={padding.left + innerW} y2={padding.top + innerH} stroke="#ccc" />

        {/* horizontal grid and labels */}
        {yLines.map((l, idx) => (
          <g key={idx}>
            <line x1={padding.left} y1={l.y} x2={padding.left + innerW} y2={l.y} stroke="#eee" />
            <text x={padding.left - 8} y={l.y + 4} textAnchor="end" fontSize="10">
              {yFormatter ? yFormatter(l.value) : l.value.toFixed(0)}
            </text>
          </g>
        ))}

        {/* x labels */}
        {data.map((d, i) => (
          <text key={i} x={padding.left + i * stepX} y={padding.top + innerH + 16} textAnchor="middle" fontSize="10">
            {d.label}
          </text>
        ))}

        {/* line */}
        <path d={path} fill="none" stroke="#0d6efd" strokeWidth="2" />

        {/* points */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} fill="#0d6efd" />
        ))}
      </svg>
    </div>
  );
}


