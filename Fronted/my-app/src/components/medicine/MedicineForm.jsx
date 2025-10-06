import React, { useState, useEffect } from 'react';
import { medicineService } from '../services/api';
import { CATEGORIES } from '../utils/constants';

const MedicineForm = ({ medicine, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    category: '',
    manufacturer: '',
    price: '',
    costPrice: '',
    stockQuantity: '',
    minStockLevel: '',
    expiryDate: '',
    batchNumber: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (medicine) {
      setFormData({
        name: medicine.name || '',
        genericName: medicine.genericName || '',
        category: medicine.category || '',
        manufacturer: medicine.manufacturer || '',
        price: medicine.price || '',
        costPrice: medicine.costPrice || '',
        stockQuantity: medicine.stockQuantity || '',
        minStockLevel: medicine.minStockLevel || '',
        expiryDate: medicine.expiryDate || '',
        batchNumber: medicine.batchNumber || ''
      });
    }
  }, [medicine]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Normalize payload: convert empty strings to null and parse numbers safely
      // Normalize date to yyyy-MM-dd if user entered dd-MM-yyyy
      let normalizedDate = formData.expiryDate;
      if (normalizedDate && /^\d{2}-\d{2}-\d{4}$/.test(normalizedDate)) {
        const [dd, mm, yyyy] = normalizedDate.split('-');
        normalizedDate = `${yyyy}-${mm}-${dd}`;
      }

      const medicineData = {
        name: formData.name.trim(),
        genericName: formData.genericName?.trim() || null,
        category: formData.category,
        manufacturer: formData.manufacturer?.trim() || null,
        batchNumber: formData.batchNumber?.trim() || null,
        price: formData.price === '' ? null : parseFloat(formData.price),
        costPrice: formData.costPrice === '' ? null : parseFloat(formData.costPrice),
        stockQuantity: formData.stockQuantity === '' ? null : parseInt(formData.stockQuantity, 10),
        minStockLevel: formData.minStockLevel === '' ? null : parseInt(formData.minStockLevel, 10),
        // Backends with LocalDate cannot parse empty string; send null instead
        expiryDate: normalizedDate && normalizedDate !== '' ? normalizedDate : null,
      };

      if (medicine) {
        await medicineService.updateMedicine(medicine.id, medicineData);
      } else {
        await medicineService.createMedicine(medicineData);
      }

      onSave();
    } catch (error) {
      console.error('Error saving medicine:', error);
      const serverMessage =
        error?.response?.data?.message ||
        (typeof error?.response?.data === 'string' ? error.response.data : null) ||
        error?.message ||
        'Unknown error';
      alert(`Error saving medicine: ${serverMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="medicine-form">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">
            {medicine ? 'Edit Medicine' : 'Add New Medicine'}
          </h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Medicine Name *</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Generic Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="genericName"
                  value={formData.genericName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Category *</label>
                <select
                  className="form-select"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Manufacturer</label>
                <input
                  type="text"
                  className="form-control"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label">Selling Price *</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Cost Price</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  name="costPrice"
                  value={formData.costPrice}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Batch Number</label>
                <input
                  type="text"
                  className="form-control"
                  name="batchNumber"
                  value={formData.batchNumber}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label">Stock Quantity *</label>
                <input
                  type="number"
                  className="form-control"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Min Stock Level *</label>
                <input
                  type="number"
                  className="form-control"
                  name="minStockLevel"
                  value={formData.minStockLevel}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Expiry Date</label>
                <input
                  type="date"
                  className="form-control"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : (medicine ? 'Update' : 'Save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MedicineForm;