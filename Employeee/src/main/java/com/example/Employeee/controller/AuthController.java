package com.example.Employeee.controller;

import com.example.Employeee.config.JwtUtil;
import com.example.Employeee.entity.User;
import com.example.Employeee.service.EmailService;
import com.example.Employeee.service.OtpService;
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
    private final OtpService otpService;
    private final EmailService emailService;

    public AuthController(UserService userService, JwtUtil jwtUtil, OtpService otpService, EmailService emailService) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.otpService = otpService;
        this.emailService = emailService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> payload) {
        String name = payload.getOrDefault("name", "");
        String email = payload.getOrDefault("email", "");
        String password = payload.getOrDefault("password", "");
        String address = payload.getOrDefault("address", "");
        String role = payload.getOrDefault("role", "Employee");
        String avatarUrl = payload.getOrDefault("avatarUrl", "");

        if (userService.emailExists(email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already registered"));
        }

        if (avatarUrl == null || avatarUrl.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Photo is required"));
        }

        User user = userService.register(name, email, password, address, role, avatarUrl);
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", user.getId());
        claims.put("role", user.getRole());
        String token = jwtUtil.generateToken(user.getEmail(), claims);
        return ResponseEntity.ok(Map.of("token", token, "user", sanitize(user)));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> payload) {
        String email = payload.getOrDefault("email", "");
        String password = payload.getOrDefault("password", "");

        return userService.findByEmail(email)
                .filter(u -> userService.checkPassword(u, password))
                .map(u -> {
                    // Start OTP flow: generate session + otp and email it
                    String sessionId = otpService.startOtpSession(u.getEmail(), 5 * 60 * 1000);
                    String code = otpService.getOtpForSession(sessionId);
                    emailService.sendOtp(u.getEmail(), code);
                    return ResponseEntity.ok(Map.of(
                            "otpSessionId", sessionId,
                            "message", "OTP sent to email"
                    ));
                })
                .orElseGet(() -> ResponseEntity.status(401).body(Map.of("message", "Invalid credentials")));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> payload) {
        String sessionId = payload.getOrDefault("otpSessionId", "");
        String code = payload.getOrDefault("otp", "");
        // Important: fetch email BEFORE verify because verify deletes the session on success
        String email = otpService.getEmailForSession(sessionId);
        if (email == null) {
            return ResponseEntity.status(400).body(Map.of("message", "Session expired"));
        }
        if (!otpService.verify(sessionId, code)) {
            return ResponseEntity.status(400).body(Map.of("message", "Invalid or expired OTP"));
        }
        User u = userService.findByEmail(email).orElseThrow();
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", u.getId());
        claims.put("role", u.getRole());
        String token = jwtUtil.generateToken(u.getEmail(), claims);
        return ResponseEntity.ok(Map.of("token", token, "user", sanitize(u)));
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


