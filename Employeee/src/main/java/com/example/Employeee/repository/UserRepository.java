package com.example.Employeee.repository;

import com.example.Employeee.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findFirstByRoleIgnoreCaseOrderByIdAsc(String role);
    List<User> findByRoleIgnoreCase(String role);
}


