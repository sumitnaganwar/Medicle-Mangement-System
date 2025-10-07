package com.example.Employeee.service;

import com.example.Employeee.entity.Sale;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    public void sendSaleReceipt(String toEmail, Sale sale) {
        if (mailSender == null) return; // Mail not configured
        if (toEmail == null || toEmail.isBlank()) return;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        if (fromEmail != null && !fromEmail.isBlank()) {
            message.setFrom(fromEmail);
        }
        message.setSubject("Your Pharmacy Bill - " + (sale.getBillNumber() != null ? sale.getBillNumber() : "Receipt"));

        StringBuilder body = new StringBuilder();
        body.append("Dear ")
            .append(sale.getCustomer() != null ? sale.getCustomer().getName() : "Customer")
            .append(",\n\n")
            .append("Thank you for your purchase. Here are your bill details:\n");

        sale.getItems().forEach(it -> {
            body.append(" - ")
                .append(it.getMedicine().getName())
                .append(" x")
                .append(it.getQuantity())
                .append(" = ")
                .append(String.format("%.2f", it.getQuantity() * it.getUnitPrice()))
                .append("\n");
        });

        body.append("\nTotal: ")
            .append(String.format("%.2f", sale.getTotalAmount()))
            .append("\nPayment: ")
            .append(sale.getPaymentMethod())
            .append("\n\nRegards,\nPharmacy");

        message.setText(body.toString());
        mailSender.send(message);
    }

    public void sendOtp(String toEmail, String code) {
        if (mailSender == null) return;
        if (toEmail == null || toEmail.isBlank()) return;
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        if (fromEmail != null && !fromEmail.isBlank()) {
            message.setFrom(fromEmail);
        }
        message.setSubject("Your Login OTP");
        message.setText("Your OTP code is: " + code + "\nIt expires in 5 minutes.");
        mailSender.send(message);
    }
}


