package com.example.Employeee.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sales")
public class Sale {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime saleDate = LocalDateTime.now();
    private Double totalAmount = 0.0;
    private String paymentMethod = "CASH"; // CASH, CARD, UPI
    @Column(name = "bill_number", unique = true, nullable = false, length = 16)
    private String billNumber;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<SaleItem> items = new ArrayList<>();

    // Helper methods
    public void addItem(SaleItem item) {
        item.setSale(this);
        this.items.add(item);
        calculateTotal();
    }

    public void calculateTotal() {
        this.totalAmount = items.stream()
                .mapToDouble(SaleItem::getSubtotal)
                .sum();
    }

    // Constructors
    public Sale() {}

    public Sale(Customer customer, String paymentMethod) {
        this.customer = customer;
        this.paymentMethod = paymentMethod;
    }

    @PrePersist
    public void ensureDefaults() {
        if (this.saleDate == null) {
            this.saleDate = LocalDateTime.now();
        }
        if (this.paymentMethod == null || this.paymentMethod.isEmpty()) {
            this.paymentMethod = "CASH";
        }
        calculateTotal();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDateTime getSaleDate() { return saleDate; }
    public void setSaleDate(LocalDateTime saleDate) { this.saleDate = saleDate; }
    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getBillNumber() { return billNumber; }
    public void setBillNumber(String billNumber) { this.billNumber = billNumber; }
    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }
    public List<SaleItem> getItems() { return items; }
    public void setItems(List<SaleItem> items) {
        this.items = items;
        calculateTotal();
    }
}