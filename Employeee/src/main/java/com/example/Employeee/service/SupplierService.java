package com.example.Employeee.service;

import com.example.Employeee.entity.Supplier;
import com.example.Employeee.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SupplierService {

    @Autowired
    private SupplierRepository supplierRepository;

    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }

    public Optional<Supplier> getSupplierById(Long id) {
        return supplierRepository.findById(id);
    }

    public Optional<Supplier> getSupplierByEmail(String email) {
        return supplierRepository.findByEmail(email);
    }

    public Supplier createSupplier(Supplier supplier) {
        return supplierRepository.save(supplier);
    }

    public Supplier updateSupplier(Long id, Supplier supplierDetails) {
        Optional<Supplier> supplierOptional = supplierRepository.findById(id);
        if (supplierOptional.isPresent()) {
            Supplier supplier = supplierOptional.get();
            supplier.setName(supplierDetails.getName());
            supplier.setEmail(supplierDetails.getEmail());
            supplier.setPhone(supplierDetails.getPhone());
            supplier.setAddress(supplierDetails.getAddress());
            supplier.setCompany(supplierDetails.getCompany());
            supplier.setGst(supplierDetails.getGst());
            supplier.setNotes(supplierDetails.getNotes());
            supplier.setAvatarUrl(supplierDetails.getAvatarUrl());
            return supplierRepository.save(supplier);
        }
        return null;
    }

    public void deleteSupplier(Long id) {
        supplierRepository.deleteById(id);
    }

    public boolean emailExists(String email) {
        return supplierRepository.existsByEmail(email);
    }
}
