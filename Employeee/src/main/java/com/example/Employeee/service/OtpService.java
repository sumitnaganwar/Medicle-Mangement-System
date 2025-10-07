package com.example.Employeee.service;

import org.springframework.stereotype.Service;

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
        if (rec == null) return false;
        if (Instant.now().toEpochMilli() > rec.expiresAt) {
            sessionIdToOtp.remove(sessionId);
            return false;
        }
        if (!rec.code.equals(code)) return false;
        sessionIdToOtp.remove(sessionId);
        return true;
    }
}


