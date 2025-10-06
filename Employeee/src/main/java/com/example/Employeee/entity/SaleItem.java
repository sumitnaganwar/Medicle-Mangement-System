package com.example.Employeee.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "sale_items")
public class SaleItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "sale_id", nullable = false)
    @JsonBackReference
    private Sale sale;

    @ManyToOne
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;

    private Integer quantity;
    private Double unitPrice;
    private Double subtotal;

    // For requests: allow passing just medicineId instead of nested Medicine
    @Transient
    private Long medicineId;

    // Constructors
    public SaleItem() {}

    public SaleItem(Medicine medicine, Integer quantity, Double unitPrice) {
        this.medicine = medicine;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.subtotal = quantity * unitPrice;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Sale getSale() { return sale; }
    public void setSale(Sale sale) { this.sale = sale; }
    public Medicine getMedicine() { return medicine; }
    public void setMedicine(Medicine medicine) { this.medicine = medicine; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
        this.subtotal = this.quantity * this.unitPrice;
    }
    public Double getUnitPrice() { return unitPrice; }
    public void setUnitPrice(Double unitPrice) {
        this.unitPrice = unitPrice;
        this.subtotal = this.quantity * this.unitPrice;
    }
    public Double getSubtotal() { return subtotal; }
    public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }

    // Convenience accessors for ID-based requests
    public Long getMedicineId() {
        return (medicine != null && medicine.getId() != null) ? medicine.getId() : medicineId;
    }

    public void setMedicineId(Long medicineId) {
        this.medicineId = medicineId;
    }


}