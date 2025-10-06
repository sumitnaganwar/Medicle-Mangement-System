import React, { useState } from 'react';
import MedicineList from '../medicine/MedicineList';
import MedicineForm from '../medicine/MedicineForm';

const MedicinePage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);

  const handleAddNew = () => {
    setEditingMedicine(null);
    setShowForm(true);
  };

  const handleEditMedicine = (medicine) => {
    setEditingMedicine(medicine);
    setShowForm(true);
  };

  const handleSave = () => {
    setShowForm(false);
    setEditingMedicine(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMedicine(null);
  };

  return (
    <div className="medicine-page">
      {showForm ? (
        <MedicineForm
          medicine={editingMedicine}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        <MedicineList
          onEditMedicine={handleEditMedicine}
          onAddNew={handleAddNew}
        />
      )}
    </div>
  );
};

export default MedicinePage;