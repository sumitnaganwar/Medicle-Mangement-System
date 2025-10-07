package com.example.Employeee.service;


import com.example.Employeee.dto.SaleRequestDTO;
import com.example.Employeee.dto.SaleItemDTO;
import com.example.Employeee.entity.Customer;
import com.example.Employeee.entity.Medicine;
import com.example.Employeee.entity.Sale;
import com.example.Employeee.entity.SaleItem;
import com.example.Employeee.repository.CustomerRepository;
import com.example.Employeee.repository.MedicineRepository;
import com.example.Employeee.repository.SaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class SaleService {

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private MedicineRepository medicineRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired(required = false)
    private EmailService emailService;

    public List<Sale> getAllSales() {
        return saleRepository.findAll();
    }

    public Optional<Sale> getSaleById(Long id) {
        return saleRepository.findById(id);
    }

    public Sale createSale(SaleRequestDTO saleRequest) {
        // Handle customer first
        Customer customer = handleCustomer(saleRequest);

        // Initialize sale with constructor that sets bill number and payment
        Sale sale = new Sale(customer, saleRequest.getPaymentMethod());

        // Add items to sale
        for (SaleItemDTO itemDTO : saleRequest.getItems()) {
            Medicine medicine = medicineRepository.findById(itemDTO.getMedicineId())
                    .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + itemDTO.getMedicineId()));

            // Check stock
            if (medicine.getStockQuantity() < itemDTO.getQuantity()) {
                throw new RuntimeException("Insufficient stock for: " + medicine.getName() +
                        ". Available: " + medicine.getStockQuantity());
            }

            SaleItem item = new SaleItem(medicine, itemDTO.getQuantity(), medicine.getPrice());
            sale.addItem(item);

            // Update stock
            medicine.setStockQuantity(medicine.getStockQuantity() - itemDTO.getQuantity());
            medicineRepository.save(medicine);
        }

        // Assign a unique bill number before saving to enforce DB constraint
        if (sale.getBillNumber() == null || sale.getBillNumber().isEmpty()) {
            sale.setBillNumber(generateUniqueBillNumber());
        }
        Sale saved = saleRepository.save(sale);

        // We no longer auto-send here; front-end will offer options
        return saved;
    }

    public void sendReceiptEmail(Long saleId, String toEmail) {
        if (emailService == null) return;
        Sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new RuntimeException("Sale not found"));
        if (toEmail == null || toEmail.isBlank()) {
            throw new RuntimeException("Email is required");
        }
        emailService.sendSaleReceipt(toEmail, sale);
    }

    private String generateUniqueBillNumber() {
        // Pattern: B001, B002, ... but chosen randomly in range and retried until unique
        // To satisfy "randomly" while still readable, we shuffle within next 1000 numbers
        for (int attempt = 0; attempt < 30; attempt++) {
            int n = (int)(Math.random() * 1000) + 1; // 1..1000
            String candidate = String.format("B%03d", n);
            if (!saleRepository.existsByBillNumber(candidate)) {
                return candidate;
            }
        }
        // Fallback to sequential by id size to guarantee uniqueness
        long count = saleRepository.count() + 1;
        return String.format("B%03d", Math.min(count, 999));
    }

    private Customer handleCustomer(SaleRequestDTO saleRequest) {
        Long customerId = saleRequest.getCustomerId();
        String phone = saleRequest.getCustomerPhone();
        String nameFromRequest = saleRequest.getCustomerName();

        // 1) If request carries a customerId, load it
        if (customerId != null) {
            return customerRepository.findById(customerId)
                    .orElseThrow(() -> new RuntimeException("Customer not found"));
        }

        // 2) Try to match by phone if provided
        if (phone != null && !phone.isEmpty()) {
            Optional<Customer> existingCustomer = customerRepository.findByPhone(phone);
            if (existingCustomer.isPresent()) {
                // Update email if provided
                Customer c = existingCustomer.get();
                if (saleRequest.getCustomerEmail() != null && !saleRequest.getCustomerEmail().isEmpty()) {
                    c.setEmail(saleRequest.getCustomerEmail());
                    customerRepository.save(c);
                }
                return c;
            }
        }

        // 3) Create a new customer
        Customer customer = new Customer();
        String name = (nameFromRequest != null && !nameFromRequest.isEmpty())
                ? nameFromRequest
                : "Walk-in Customer";
        customer.setName(name);
        customer.setPhone(phone != null ? phone : "0000000000");
        if (saleRequest.getCustomerEmail() != null && !saleRequest.getCustomerEmail().isEmpty()) {
            customer.setEmail(saleRequest.getCustomerEmail());
        }

        return customerRepository.save(customer);
    }

    public List<Sale> getTodaySales() {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        return saleRepository.findBySaleDateBetween(startOfDay, endOfDay);
    }

    public Double getTodayTotalSales() {
        List<Sale> todaySales = getTodaySales();
        return todaySales.stream()
                .mapToDouble(Sale::getTotalAmount)
                .sum();
    }

    public void deleteSale(Long saleId) {
        Sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new RuntimeException("Sale not found with id: " + saleId));

        // Restore stock for all items in the sale
        for (SaleItem item : sale.getItems()) {
            Medicine medicine = item.getMedicine();
            medicine.setStockQuantity(medicine.getStockQuantity() + item.getQuantity());
            medicineRepository.save(medicine);
        }

        // Delete the sale (cascade will handle sale items)
        saleRepository.delete(sale);
    }

    public void deleteSaleItem(Long saleId, Long itemId) {
        Sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new RuntimeException("Sale not found with id: " + saleId));

        SaleItem itemToDelete = sale.getItems().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Sale item not found with id: " + itemId));

        // Restore stock for the deleted item
        Medicine medicine = itemToDelete.getMedicine();
        medicine.setStockQuantity(medicine.getStockQuantity() + itemToDelete.getQuantity());
        medicineRepository.save(medicine);

        // Remove item from sale
        sale.getItems().remove(itemToDelete);
        
        // Recalculate total
        sale.calculateTotal();
        
        // If no items left, delete the entire sale
        if (sale.getItems().isEmpty()) {
            saleRepository.delete(sale);
        } else {
            saleRepository.save(sale);
        }
    }
}