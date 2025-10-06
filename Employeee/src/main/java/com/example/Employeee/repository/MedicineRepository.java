package com.example.Employeee.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.Employeee.entity.Medicine;

import java.util.List;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {
    
    // Find all active medicines
    List<Medicine> findByIsActiveTrue();
    
    // Find by category
    List<Medicine> findByCategory(String category);
    
    // Search by name (case insensitive)
    List<Medicine> findByNameContainingIgnoreCase(String name);
    
    // Find low stock medicines
    @Query("SELECT m FROM Medicine m WHERE m.stockQuantity <= m.minStockLevel AND m.isActive = true")
    List<Medicine> findLowStockMedicines();
    
    // Find by category and active status
    List<Medicine> findByCategoryAndIsActiveTrue(String category);
}