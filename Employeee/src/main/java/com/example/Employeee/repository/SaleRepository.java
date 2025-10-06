package com.example.Employeee.repository;

import com.example.Employeee.entity.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {

    // Find sales by date range
    List<Sale> findBySaleDateBetween(LocalDateTime start, LocalDateTime end);

    // Find sales by payment method
    List<Sale> findByPaymentMethod(String paymentMethod);

    // Get total sales amount for a period
    @Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM Sale s WHERE s.saleDate BETWEEN ?1 AND ?2")
    Double getTotalSalesAmount(LocalDateTime start, LocalDateTime end);

    boolean existsByBillNumber(String billNumber);
}