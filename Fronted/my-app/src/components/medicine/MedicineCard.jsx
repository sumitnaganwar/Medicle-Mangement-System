import React from 'react';
import { formatCurrency, formatDate } from '../utils/helpers';

const MedicineCard = ({ medicine, onEdit }) => {
  const isLowStock = medicine.stockQuantity <= medicine.minStockLevel;

  return (
    <div className={`card h-100 ${isLowStock ? 'border-warning' : ''}`}>
      <div className={`card-header ${isLowStock ? 'bg-warning text-dark' : 'bg-light'}`}>
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">{medicine.name}</h6>
          {isLowStock && (
            <span className="badge bg-danger">
              <i className="fas fa-exclamation-circle me-1"></i>
              Low Stock
            </span>
          )}
        </div>
      </div>
      <div className="card-body">
        {medicine.genericName && (
          <p className="text-muted small mb-2">{medicine.genericName}</p>
        )}
        <div className="row small mb-2">
          <div className="col-6">
            <strong>Category:</strong>
          </div>
          <div className="col-6">{medicine.category}</div>
        </div>
        <div className="row small mb-2">
          <div className="col-6">
            <strong>Manufacturer:</strong>
          </div>
          <div className="col-6">{medicine.manufacturer}</div>
        </div>
        <div className="row small mb-2">
          <div className="col-6">
            <strong>Stock:</strong>
          </div>
          <div className="col-6">
            <span className={isLowStock ? 'text-danger fw-bold' : ''}>
              {medicine.stockQuantity} / {medicine.minStockLevel}
            </span>
          </div>
        </div>
        <div className="row small mb-2">
          <div className="col-6">
            <strong>Price:</strong>
          </div>
          <div className="col-6">{formatCurrency(medicine.price)}</div>
        </div>
        {medicine.expiryDate && (
          <div className="row small mb-3">
            <div className="col-6">
              <strong>Expiry:</strong>
            </div>
            <div className="col-6">{formatDate(medicine.expiryDate)}</div>
          </div>
        )}
      </div>
      <div className="card-footer bg-transparent">
        <button
          className="btn btn-outline-primary btn-sm w-100"
          onClick={() => onEdit(medicine)}
        >
          <i className="fas fa-edit me-1"></i>Edit
        </button>
      </div>
    </div>
  );
};

export default MedicineCard;