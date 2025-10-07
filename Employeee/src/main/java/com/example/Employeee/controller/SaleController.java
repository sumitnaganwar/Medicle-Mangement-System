package com.example.Employeee.controller;

import com.example.Employeee.dto.SaleRequestDTO;
import com.example.Employeee.entity.Sale;
import com.example.Employeee.service.SaleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
 

@RestController
@RequestMapping("/api/sales")
@CrossOrigin(origins = "*")
public class SaleController {

    @Autowired
    private SaleService saleService;

    @GetMapping
    public List<Sale> getAllSales() {
        return saleService.getAllSales();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sale> getSaleById(@PathVariable Long id) {
        Optional<Sale> sale = saleService.getSaleById(id);
        return sale.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createSale(@RequestBody SaleRequestDTO saleRequest) {
        try {
            Sale createdSale = saleService.createSale(saleRequest);
            return ResponseEntity.ok(createdSale);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{saleId}/send-receipt")
    public ResponseEntity<?> sendReceipt(@PathVariable Long saleId, @RequestParam("email") String email) {
        try {
            saleService.sendReceiptEmail(saleId, email);
            return ResponseEntity.ok(java.util.Map.of("message", "Receipt sent"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/today")
    public List<Sale> getTodaySales() {
        return saleService.getTodaySales();
    }

    @GetMapping("/today/total")
    public Double getTodayTotalSales() {
        return saleService.getTodayTotalSales();
    }

    

    @DeleteMapping("/{saleId}")
    public ResponseEntity<?> deleteSale(@PathVariable Long saleId) {
        try {
            saleService.deleteSale(saleId);
            return ResponseEntity.ok().body("Sale deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{saleId}/items/{itemId}")
    public ResponseEntity<?> deleteSaleItem(@PathVariable Long saleId, @PathVariable Long itemId) {
        try {
            saleService.deleteSaleItem(saleId, itemId);
            return ResponseEntity.ok().body("Sale item deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}