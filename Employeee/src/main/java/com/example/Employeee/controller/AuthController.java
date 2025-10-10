package com.example.Employeee.controller;

import com.example.Employeee.config.JwtUtil;
import com.example.Employeee.entity.User;
import com.example.Employeee.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {
    private final UserService userService;
    private final JwtUtil jwtUtil;

    public AuthController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> payload) {
        String name = payload.getOrDefault("name", "");
        String email = payload.getOrDefault("email", "");
        String password = payload.getOrDefault("password", "");
        String address = payload.getOrDefault("address", "");
        String role = payload.getOrDefault("role", "Employee");
        String phone = payload.getOrDefault("phone", null);
        String avatarUrl = payload.getOrDefault("avatarUrl", "");

        if (userService.emailExists(email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already registered"));
        }

        if (avatarUrl == null || avatarUrl.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Photo is required"));
        }

        User user = userService.register(name, email, password, address, role, phone, avatarUrl);
        // For security and UX: do NOT auto-login after registration. Client should go to login page.
        return ResponseEntity.ok(Map.of("message", "Registered successfully. Please login."));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> payload) {
        String email = payload.getOrDefault("email", "");
        String password = payload.getOrDefault("password", "");

        return userService.findByEmail(email)
                .filter(u -> userService.checkPassword(u, password))
                .map(u -> {
                    // Direct login - no OTP required
                    Map<String, Object> claims = new HashMap<>();
                    claims.put("id", u.getId());
                    claims.put("role", u.getRole());
                    String token = jwtUtil.generateToken(u.getEmail(), claims);
                    
                    return ResponseEntity.ok(Map.of(
                            "token", token,
                            "user", sanitize(u),
                            "message", "Login successful"
                    ));
                })
                .orElseGet(() -> ResponseEntity.status(401).body(Map.of("message", "Invalid credentials")));
    }



    private Map<String, Object> sanitize(User u) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", u.getId());
        m.put("name", u.getName());
        m.put("email", u.getEmail());
        m.put("address", u.getAddress());
        m.put("role", u.getRole());
        m.put("phone", u.getPhone());
        m.put("avatarUrl", u.getAvatarUrl());
        return m;
    }
}


