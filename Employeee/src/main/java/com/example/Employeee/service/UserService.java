package com.example.Employeee.service;

import com.example.Employeee.entity.User;
import com.example.Employeee.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    public User register(String name, String email, String password, String address, String role) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setAddress(address);
        user.setRole(role);
        return userRepository.save(user);
    }

    public User register(String name, String email, String password, String address, String role, String phone, String avatarUrl) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setAddress(address);
        user.setRole(role);
        user.setPhone(phone);
        user.setAvatarUrl(avatarUrl);
        return userRepository.save(user);
    }

    // Backward-compatible overload (without phone)
    public User register(String name, String email, String password, String address, String role, String avatarUrl) {
        return register(name, email, password, address, role, null, avatarUrl);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public boolean checkPassword(User user, String rawPassword) {
        return passwordEncoder.matches(rawPassword, user.getPasswordHash());
    }

    public User updateProfile(Long id, String name, String email, String phone, String address) {
        User user = userRepository.findById(id).orElseThrow();
        user.setName(name);
        user.setEmail(email);
        user.setPhone(phone);
        user.setAddress(address);
        return userRepository.save(user);
    }
}


