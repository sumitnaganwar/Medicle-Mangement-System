package com.example.Employeee.service;

import com.example.Employeee.entity.Medicine;
import com.example.Employeee.repository.MedicineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MedicineService {

    @Autowired
    private MedicineRepository medicineRepository;

    public List<Medicine> getAllMedicines() {
        return medicineRepository.findByIsActiveTrue();
    }

    public Optional<Medicine> getMedicineById(Long id) {
        return medicineRepository.findById(id);
    }

    public Medicine createMedicine(Medicine medicine) {
        return medicineRepository.save(medicine);
    }

    public Medicine updateMedicine(Long id, Medicine medicineDetails) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + id));

        medicine.setName(medicineDetails.getName());
        medicine.setGenericName(medicineDetails.getGenericName());
        medicine.setCategory(medicineDetails.getCategory());
        medicine.setManufacturer(medicineDetails.getManufacturer());
        medicine.setPrice(medicineDetails.getPrice());
        medicine.setCostPrice(medicineDetails.getCostPrice());
        medicine.setStockQuantity(medicineDetails.getStockQuantity());
        medicine.setMinStockLevel(medicineDetails.getMinStockLevel());
        medicine.setExpiryDate(medicineDetails.getExpiryDate());
        medicine.setBatchNumber(medicineDetails.getBatchNumber());

        return medicineRepository.save(medicine);
    }

    public void deleteMedicine(Long id) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + id));

        medicine.setIsActive(false);
        medicineRepository.save(medicine);
    }

    public List<Medicine> getMedicinesByCategory(String category) {
        return medicineRepository.findByCategoryAndIsActiveTrue(category);
    }

    public List<Medicine> searchMedicines(String name) {
        return medicineRepository.findByNameContainingIgnoreCase(name);
    }

    public List<Medicine> getLowStockMedicines() {
        return medicineRepository.findLowStockMedicines();
    }
}