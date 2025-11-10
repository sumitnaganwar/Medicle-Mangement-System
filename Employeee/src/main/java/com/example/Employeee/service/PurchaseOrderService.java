package com.example.Employeee.service;

import com.example.Employeee.entity.*;
import com.example.Employeee.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
public class PurchaseOrderService {
    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;
    @Autowired
    private MedicineRepository medicineRepository;

    // Call this to confirm/deliver an order and update stock
    @Transactional
    public void confirmPurchaseOrder(Long orderId) {
        PurchaseOrder po = purchaseOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Purchase order not found: " + orderId));
        if (po.getStatus() == PurchaseOrder.Status.DELIVERED) {
            throw new IllegalStateException("Order already delivered");
        }
        po.setStatus(PurchaseOrder.Status.DELIVERED);
        for (PurchaseOrderItem item : po.getItems()) {
            Medicine med = item.getMedicine();
            Integer qty = item.getQuantityOrdered();
            if (med != null && qty != null && qty > 0) {
                med.setStockQuantity(med.getStockQuantity() + qty);
                medicineRepository.save(med);
            }
        }
        purchaseOrderRepository.save(po);
    }
}

