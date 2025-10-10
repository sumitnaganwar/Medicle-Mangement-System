package com.example.Employeee.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private static class OtpRecord {
        final String email;
        final String code;
        final long expiresAt;
        OtpRecord(String email, String code, long expiresAt) {
            this.email = email;
            this.code = code;
            this.expiresAt = expiresAt;
        }
    }

    private final Map<String, OtpRecord> sessionIdToOtp = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();

    @Value("${otp.bypass.enabled:false}")
    private boolean bypassEnabled;

    @Value("${otp.bypass.email:}")
    private String bypassEmail;

    // Expose configuration so controllers can safely check bypass settings
    public boolean isBypassEnabled() {
        return bypassEnabled;
    }

    public String getBypassEmail() {
        return bypassEmail;
    }

    public String startOtpSession(String email, long ttlMillis) {
        String sessionId = UUID.randomUUID().toString();
        String code = String.format("%06d", random.nextInt(1_000_000));
        long expiresAt = Instant.now().toEpochMilli() + ttlMillis;
        sessionIdToOtp.put(sessionId, new OtpRecord(email, code, expiresAt));
        return sessionId;
    }

    public String getOtpForSession(String sessionId) {
        OtpRecord rec = sessionIdToOtp.get(sessionId);
        if (rec == null) return null;
        if (Instant.now().toEpochMilli() > rec.expiresAt) {
            sessionIdToOtp.remove(sessionId);
            return null;
        }
        return rec.code;
    }

    public String getEmailForSession(String sessionId) {
        OtpRecord rec = sessionIdToOtp.get(sessionId);
        if (rec == null) return null;
        if (Instant.now().toEpochMilli() > rec.expiresAt) {
            sessionIdToOtp.remove(sessionId);
            return null;
        }
        return rec.email;
    }

    public boolean verify(String sessionId, String code) {
        OtpRecord rec = sessionIdToOtp.get(sessionId);
        if (rec == null) {
            System.out.println("DEBUG: OTP session not found for ID: " + sessionId);
            return false;
        }
        
        long currentTime = Instant.now().toEpochMilli();
        if (currentTime > rec.expiresAt) {
            System.out.println("DEBUG: OTP expired. Current: " + currentTime + ", Expires: " + rec.expiresAt);
            sessionIdToOtp.remove(sessionId);
            return false;
        }
        
        System.out.println("DEBUG: Comparing codes - Expected: " + rec.code + ", Received: " + code);
        if (!rec.code.equals(code)) {
            System.out.println("DEBUG: OTP codes do not match");
            // Configurable development bypass: only accept when explicitly enabled and email matches
            if (bypassEnabled && bypassEmail != null && !bypassEmail.isBlank() && bypassEmail.equalsIgnoreCase(rec.email)) {
                System.out.println("WARNING: OTP bypass enabled for " + rec.email + ". Accepting OTP despite mismatch.");
                sessionIdToOtp.remove(sessionId);
                return true;
            }
            return false;
        }
        
        System.out.println("DEBUG: OTP verification successful");
        sessionIdToOtp.remove(sessionId);
        return true;
    }
}


