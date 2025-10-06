package com.example.Employeee.controller;


import com.example.Employeee.entity.Medicine;
import com.example.Employeee.service.MedicineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medicines")
@CrossOrigin(origins = "http://localhost:3000")
public class MedicineController {

    @Autowired
    private MedicineService medicineService;

    @GetMapping
    public List<Medicine> getAllMedicines() {
        return medicineService.getAllMedicines();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Medicine> getMedicineById(@PathVariable Long id) {
        return medicineService.getMedicineById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Medicine createMedicine(@RequestBody Medicine medicine) {
        return medicineService.createMedicine(medicine);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Medicine> updateMedicine(@PathVariable Long id, @RequestBody Medicine medicineDetails) {
        try {
            Medicine updatedMedicine = medicineService.updateMedicine(id, medicineDetails);
            return ResponseEntity.ok(updatedMedicine);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedicine(@PathVariable Long id) {
        try {
            medicineService.deleteMedicine(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/category/{category}")
    public List<Medicine> getMedicinesByCategory(@PathVariable String category) {
        return medicineService.getMedicinesByCategory(category);
    }

    @GetMapping("/search")
    public List<Medicine> searchMedicines(@RequestParam String name) {
        return medicineService.searchMedicines(name);
    }

    @GetMapping("/low-stock")
    public List<Medicine> getLowStockMedicines() {
        return medicineService.getLowStockMedicines();
    }
}