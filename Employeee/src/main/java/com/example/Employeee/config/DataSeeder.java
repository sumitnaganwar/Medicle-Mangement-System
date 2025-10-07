package com.example.Employeee.config;

import com.example.Employeee.entity.User;
import com.example.Employeee.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner seedDefaultUser(UserRepository userRepository) {
        return args -> {
            if (!userRepository.existsByEmail("owner@pharmacy.local")) {
                BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
                User u = new User();
                u.setName("Owner");
                u.setEmail("owner@pharmacy.local");
                u.setPasswordHash(encoder.encode("owner123"));
                u.setRole("Owner");
                u.setAddress("HQ");
                userRepository.save(u);
            }
        };
    }
}


