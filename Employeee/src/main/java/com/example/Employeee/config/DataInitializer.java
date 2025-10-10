package com.example.Employeee.config;

import com.example.Employeee.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository) {
        return args -> {
            long userCount = userRepository.count();
            System.out.println("==============================================");
            System.out.println("📊 Database initialized");
            System.out.println("   Total users: " + userCount);
            if (userCount == 0) {
                System.out.println("   ⚠️  No users found. Please register a new account.");
            }
            System.out.println("==============================================");
        };
    }
}
