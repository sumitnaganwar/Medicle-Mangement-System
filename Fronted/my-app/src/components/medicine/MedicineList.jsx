import React, { useState, useEffect } from 'react';
import { medicineService } from '../services/api';
import MedicineCard from './MedicineCard';
import SearchBar from '../common/SearchBar';
import { CATEGORIES } from '../utils/constants';

const MedicineList = ({ onEditMedicine, onAddNew }) => {
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    loadMedicines();
  }, []);

  useEffect(() => {
    filterMedicines();
  }, [medicines, searchTerm, selectedCategory]);

  const loadMedicines = async () => {
    try {
      const response = await medicineService.getAllMedicines();
      setMedicines(response.data);
    } catch (error) {
      console.error('Error loading medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMedicines = () => {
    let filtered = medicines;

    if (searchTerm) {
      filtered = filtered.filter(medicine =>
        medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.genericName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(medicine => medicine.category === selectedCategory);
    }

    setFilteredMedicines(filtered);
  };

  const handleSearch = () => {
    filterMedicines();
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
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
    <div className="medicine-list">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h2>Medicine Inventory</h2>
            <button className="btn btn-primary" onClick={onAddNew}>
              <i className="fas fa-plus me-2"></i>Add New Medicine
            </button>
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <SearchBar
            placeholder="Search medicines by name or generic name..."
            onSearch={handleSearch}
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">Category</span>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <button
              className="btn btn-outline-secondary"
              onClick={() => {
                setSelectedCategory('');
                setSearchTerm('');
              }}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="row">
        {filteredMedicines.length === 0 ? (
          <div className="col-12">
            <div className="text-center py-5">
              <i className="fas fa-pills fa-3x text-muted mb-3"></i>
              <p className="text-muted">No medicines found matching your criteria.</p>
            </div>
          </div>
        ) : (
          filteredMedicines.map(medicine => (
            <div key={medicine.id} className="col-lg-4 col-md-6 mb-4">
              <MedicineCard medicine={medicine} onEdit={onEditMedicine} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MedicineList;