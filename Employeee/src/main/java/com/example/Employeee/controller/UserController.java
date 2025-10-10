package com.example.Employeee.controller;

import com.example.Employeee.entity.User;
import com.example.Employeee.repository.UserRepository;
import com.example.Employeee.service.UserService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin
public class UserController {
    private final UserRepository userRepository;
    private final UserService userService;

    public UserController(UserRepository userRepository, UserService userService) {
        this.userRepository = userRepository;
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Principal principal) {
        // For now Principal name is email (with Basic or later with JWT filter)
        String email = principal != null ? principal.getName() : null;
        if (email == null) return ResponseEntity.status(401).build();
        User u = userRepository.findByEmail(email).orElse(null);
        if (u == null) return ResponseEntity.status(404).build();
        java.util.Map<String, Object> me = new java.util.LinkedHashMap<>();
        me.put("id", u.getId());
        me.put("name", u.getName());
        me.put("email", u.getEmail());
        me.put("address", u.getAddress());
        me.put("role", u.getRole());
        me.put("phone", u.getPhone());
        me.put("avatarUrl", u.getAvatarUrl());
        return ResponseEntity.ok(me);
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<?> publicProfile(@PathVariable("id") Long id) {
        User u = userRepository.findById(id).orElse(null);
        if (u == null) return ResponseEntity.status(404).build();
        java.util.Map<String, Object> me = new java.util.LinkedHashMap<>();
        me.put("id", u.getId());
        me.put("name", u.getName());
        me.put("email", u.getEmail());
        me.put("address", u.getAddress());
        me.put("role", u.getRole());
        me.put("phone", u.getPhone());
        me.put("avatarUrl", u.getAvatarUrl());
        return ResponseEntity.ok(me);
    }

    @GetMapping("/owner")
    public ResponseEntity<?> getOwner() {
        User owner = userRepository.findFirstByRoleIgnoreCaseOrderByIdAsc("Owner").orElse(null);
        if (owner == null) return ResponseEntity.status(404).body(java.util.Map.of("message", "Owner not found"));
        java.util.Map<String, Object> me = new java.util.LinkedHashMap<>();
        me.put("id", owner.getId());
        me.put("name", owner.getName());
        me.put("email", owner.getEmail());
        me.put("address", owner.getAddress());
        me.put("role", owner.getRole());
        me.put("phone", owner.getPhone());
        me.put("avatarUrl", owner.getAvatarUrl());
        return ResponseEntity.ok(me);
    }

    @GetMapping("/owners")
    public ResponseEntity<?> listOwners() {
        java.util.List<User> owners = userRepository.findByRoleIgnoreCase("Owner");
        java.util.List<java.util.Map<String, Object>> list = new java.util.ArrayList<>();
        for (User u : owners) {
            java.util.Map<String, Object> m = new java.util.LinkedHashMap<>();
            m.put("id", u.getId());
            m.put("name", u.getName());
            m.put("email", u.getEmail());
            m.put("address", u.getAddress());
            m.put("phone", u.getPhone());
            m.put("avatarUrl", u.getAvatarUrl());
            list.add(m);
        }
        return ResponseEntity.ok(list);
    }

    @GetMapping("/suppliers")
    public ResponseEntity<?> listSuppliersUsers() {
        java.util.List<User> suppliers = userRepository.findByRoleIgnoreCase("Supplier");
        java.util.List<java.util.Map<String, Object>> list = new java.util.ArrayList<>();
        for (User u : suppliers) {
            java.util.Map<String, Object> m = new java.util.LinkedHashMap<>();
            m.put("id", u.getId());
            m.put("name", u.getName());
            m.put("email", u.getEmail());
            m.put("phone", u.getPhone());
            list.add(m);
        }
        return ResponseEntity.ok(list);
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMe(Principal principal, @RequestBody Map<String, String> body) {
        String email = principal != null ? principal.getName() : null;
        if (email == null) return ResponseEntity.status(401).build();
        User u = userRepository.findByEmail(email).orElseThrow();
        User updated = userService.updateProfile(u.getId(),
                body.getOrDefault("name", u.getName()),
                body.getOrDefault("email", u.getEmail()),
                body.getOrDefault("phone", u.getPhone()),
                body.getOrDefault("address", u.getAddress())
        );
        java.util.Map<String, Object> me = new java.util.LinkedHashMap<>();
        me.put("id", updated.getId());
        me.put("name", updated.getName());
        me.put("email", updated.getEmail());
        me.put("address", updated.getAddress());
        me.put("role", updated.getRole());
        me.put("phone", updated.getPhone());
        me.put("avatarUrl", updated.getAvatarUrl());
        return ResponseEntity.ok(me);
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadAvatar(Principal principal, @RequestParam("file") MultipartFile file) {
        String email = principal != null ? principal.getName() : null;
        if (email == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized: no principal"));
        if (file == null || file.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "File is required"));

        User u = userRepository.findByEmail(email).orElse(null);
        if (u == null) return ResponseEntity.status(404).body(Map.of("error", "User not found for email", "email", email));
        try {
            byte[] bytes = file.getBytes();
            String contentType = file.getContentType() != null ? file.getContentType() : "image/png";
            String base64 = java.util.Base64.getEncoder().encodeToString(bytes);
            String dataUrl = "data:" + contentType + ";base64," + base64;
            u.setAvatarUrl(dataUrl);
            userRepository.save(u);
            return ResponseEntity.ok(Map.of(
                    "message", "Avatar updated",
                    "size", bytes.length,
                    "contentType", contentType,
                    "avatarUrl", dataUrl
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to upload avatar", "message", e.getMessage()));
        }
    }
}


