package com.example.Employeee.service;

import com.example.Employeee.entity.Medicine;
import com.example.Employeee.entity.Sale;
import com.example.Employeee.repository.MedicineRepository;
import com.example.Employeee.repository.SaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    @Autowired
    private MedicineRepository medicineRepository;

    @Autowired
    private SaleRepository saleRepository;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        // Total medicines
        List<Medicine> activeMedicines = medicineRepository.findByIsActiveTrue();
        stats.put("totalMedicines", activeMedicines.size());

        // Low stock medicines
        List<Medicine> lowStockMedicines = medicineRepository.findLowStockMedicines();
        stats.put("lowStockCount", lowStockMedicines.size());

        // Today's sales
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        List<Sale> todaySales = saleRepository.findBySaleDateBetween(startOfDay, endOfDay);
        stats.put("todaySalesCount", todaySales.size());

        // Today's total revenue
        Double todayRevenue = saleRepository.getTotalSalesAmount(startOfDay, endOfDay);
        stats.put("todayRevenue", todayRevenue != null ? todayRevenue : 0.0);

        // Total revenue (all time)
        Double totalRevenue = saleRepository.getTotalSalesAmount(
                LocalDateTime.of(2020, 1, 1, 0, 0),
                LocalDateTime.now()
        );
        stats.put("totalRevenue", totalRevenue != null ? totalRevenue : 0.0);

        return stats;
    }
}