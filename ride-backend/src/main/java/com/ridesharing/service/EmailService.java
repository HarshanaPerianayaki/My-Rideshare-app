package com.ridesharing.service;

import com.ridesharing.model.Role;
import com.ridesharing.model.User;
import com.ridesharing.repository.UserRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public void sendWelcomeEmail(String to, String name, String password) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("Welcome to RideShare - Your Credentials");

            String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;'>"
                    +
                    "<h2 style='color: #0ea5e9; text-align: center;'>Welcome to RideShare!</h2>" +
                    "<p>Hi <strong>" + name + "</strong>,</p>" +
                    "<p>Thank you for joining our platform. Your account has been successfully created.</p>" +
                    "<div style='background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;'>" +
                    "<p style='margin: 0;'><strong>Email/Username:</strong> " + to + "</p>" +
                    "<p style='margin: 10px 0 0 0;'><strong>Temporary Password:</strong> " + password + "</p>" +
                    "</div>" +
                    "<p>Please log in and change your password for security purposes.</p>" +
                    "<p style='text-align: center; margin-top: 30px;'>" +
                    "<a href='http://localhost:5173/login' style='background-color: #0ea5e9; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;'>Log In to Dashboard</a>"
                    +
                    "</p>" +
                    "<p style='font-size: 12px; color: #64748b; margin-top: 40px; text-align: center;'>&copy; 2024 RideShare Platform. All rights reserved.</p>"
                    +
                    "</div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);

        } catch (MessagingException e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }

    public void sendAdminRegistrationNotification(User user) {
        String adminEmail = userRepository.findAll().stream()
                .filter(existingUser -> existingUser.getRole() == Role.ADMIN)
                .map(User::getEmail)
                .findFirst()
                .orElse("admin@smartride.com");

        String role = user.getRole() != null ? user.getRole().name() : "USER";
        String roleColor = "DRIVER".equals(role) ? "#2563eb" : "#16a34a";
        String registeredAt = (user.getCreatedAt() != null ? user.getCreatedAt() : LocalDateTime.now())
                .format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"));

        String html = "<!doctype html><html><head><meta name='viewport' content='width=device-width, initial-scale=1.0'></head>"
                + "<body style='margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;'>"
                + "<table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='padding:24px;'><tr><td align='center'>"
                + "<table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;'>"
                + "<tr><td style='background:#111827;padding:24px;text-align:center;color:#ffffff;'>"
                + "<h2 style='margin:0;font-size:22px;'>SmartRide Admin Alert</h2>"
                + "<p style='margin:8px 0 0;color:#d1d5db;'>New Registration Pending Approval</p></td></tr>"
                + "<tr><td style='padding:24px;'>"
                + "<p style='margin:0 0 16px;font-size:15px;color:#111827;'>A new <strong>" + role + "</strong> has registered.</p>"
                + "<table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='border-collapse:collapse;'>"
                + "<tr><td style='padding:10px;border:1px solid #e5e7eb;background:#f9fafb;'>Name</td><td style='padding:10px;border:1px solid #e5e7eb;'>"
                + user.getFirstName() + " " + user.getLastName() + "</td></tr>"
                + "<tr><td style='padding:10px;border:1px solid #e5e7eb;background:#f9fafb;'>Email</td><td style='padding:10px;border:1px solid #e5e7eb;'>"
                + user.getEmail() + "</td></tr>"
                + "<tr><td style='padding:10px;border:1px solid #e5e7eb;background:#f9fafb;'>Phone</td><td style='padding:10px;border:1px solid #e5e7eb;'>"
                + (user.getPhone() == null ? "-" : user.getPhone()) + "</td></tr>"
                + "<tr><td style='padding:10px;border:1px solid #e5e7eb;background:#f9fafb;'>Role</td><td style='padding:10px;border:1px solid #e5e7eb;'><span style='display:inline-block;padding:4px 10px;border-radius:999px;background:"
                + roleColor + ";color:#fff;font-size:12px;font-weight:700;'>" + role + "</span></td></tr>"
                + "<tr><td style='padding:10px;border:1px solid #e5e7eb;background:#f9fafb;'>Registered At</td><td style='padding:10px;border:1px solid #e5e7eb;'>"
                + registeredAt + "</td></tr></table>"
                + "<p style='margin:20px 0 0;text-align:center;'><a href='http://localhost:5173/admin/dashboard' style='display:inline-block;background:linear-gradient(135deg,#f97316,#ef4444);color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:700;'>Approve User</a></p>"
                + "<p style='margin:16px 0 0;color:#4b5563;font-size:13px;text-align:center;'>Please login to admin panel to approve or reject this account.</p>"
                + "</td></tr>"
                + "<tr><td style='padding:16px 24px;background:#f9fafb;color:#6b7280;font-size:12px;text-align:center;'>Admin Panel: http://localhost:5173/admin/login</td></tr>"
                + "</table></td></tr></table></body></html>";

        sendHtmlEmail(adminEmail, "New Registration Pending Approval - " + role, html);
    }

    public void sendWelcomeEmailWithCredentials(User user, String tempPassword) {
        String html = "<!doctype html><html><head><meta name='viewport' content='width=device-width, initial-scale=1.0'></head>"
                + "<body style='margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;'>"
                + "<table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='padding:24px;'><tr><td align='center'>"
                + "<table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;'>"
                + "<tr><td style='background:#16a34a;padding:24px;text-align:center;color:#fff;'>"
                + "<h2 style='margin:0;font-size:24px;'>Welcome to SmartRide!</h2>"
                + "<p style='margin:10px 0 0;color:#dcfce7;'>Your account has been created successfully</p></td></tr>"
                + "<tr><td style='padding:24px;'>"
                + "<p style='margin:0 0 12px;color:#111827;'>Hi <strong>" + user.getFirstName() + "</strong>, your account is pending admin approval.</p>"
                + "<div style='margin:16px 0;padding:14px;border-radius:12px;background:#f3f4f6;border:1px solid #e5e7eb;'>"
                + "<p style='margin:0 0 8px;color:#111827;'><strong>Username:</strong> " + user.getEmail() + "</p>"
                + "<p style='margin:0;color:#111827;'><strong>Temporary Password:</strong> <span style='font-family:Consolas,monospace;font-weight:700;'>"
                + tempPassword + "</span></p></div>"
                + "<div style='margin:16px 0;padding:14px;border-radius:12px;background:#fff7ed;border:1px solid #fdba74;'>"
                + "<p style='margin:0 0 8px;color:#9a3412;font-weight:700;'>Keep these credentials safe.</p>"
                + "<p style='margin:0;color:#9a3412;'>Do NOT share this password. You will need it after approval and must change it on first login.</p>"
                + "</div>"
                + "<p style='margin:0;color:#4b5563;'>We will notify you once your account is approved.</p>"
                + "</td></tr></table></td></tr></table></body></html>";

        sendHtmlEmail(user.getEmail(), "Welcome to SmartRide - Account Created!", html);
    }

    public void sendAccountApprovedEmail(User user) {
        String newTempPassword = generateTempPassword();
        user.setPassword(passwordEncoder.encode(newTempPassword));
        user.setIsTemporaryPassword(true);
        user.setNeedsPasswordChange(true);
        userRepository.save(user);

        String loginUrl = user.getRole() == Role.DRIVER
                ? "http://localhost:5173/driver/login"
                : "http://localhost:5173/passenger/login";

        String html = "<!doctype html><html><head><meta name='viewport' content='width=device-width, initial-scale=1.0'></head>"
                + "<body style='margin:0;padding:0;background:#ecfdf5;font-family:Arial,sans-serif;'>"
                + "<table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='padding:24px;'><tr><td align='center'>"
                + "<table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #bbf7d0;'>"
                + "<tr><td style='padding:28px;text-align:center;background:linear-gradient(135deg,#16a34a,#22c55e);color:#fff;'>"
                + "<div style='font-size:44px;line-height:1;'>&#10003;</div>"
                + "<h2 style='margin:8px 0 0;font-size:24px;'>Account Approved!</h2>"
                + "<p style='margin:10px 0 0;color:#dcfce7;'>Your SmartRide account has been approved by admin.</p></td></tr>"
                + "<tr><td style='padding:24px;'>"
                + "<p style='margin:0 0 14px;color:#111827;'>You can now login with your credentials:</p>"
                + "<div style='margin:0 0 14px;padding:14px;border-radius:12px;background:#f3f4f6;border:1px solid #d1d5db;'>"
                + "<p style='margin:0 0 8px;color:#111827;'><strong>Username:</strong> " + user.getEmail() + "</p>"
                + "<p style='margin:0;color:#111827;'><strong>Temporary Password:</strong> <span style='font-family:Consolas,monospace;font-weight:700;'>"
                + newTempPassword + "</span></p></div>"
                + "<p style='margin:0 0 16px;color:#b45309;'><strong>IMPORTANT:</strong> You will be required to change this password immediately after first login.</p>"
                + "<p style='margin:0 0 18px;'><a href='" + loginUrl
                + "' style='display:inline-block;background:linear-gradient(135deg,#16a34a,#22c55e);color:#fff;text-decoration:none;padding:12px 26px;border-radius:10px;font-weight:700;'>Login Now</a></p>"
                + "<ol style='margin:0;padding-left:20px;color:#374151;'>"
                + "<li>Enter email and temporary password</li>"
                + "<li>Change password when prompted</li>"
                + "<li>Login again with your new password</li>"
                + "<li>Access your full dashboard</li></ol>"
                + "</td></tr></table></td></tr></table></body></html>";

        sendHtmlEmail(user.getEmail(), "✅ Your SmartRide Account is Approved!", html);
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }

    public void sendRideCancellationNotice(String toEmail, String driverName, String fromLocation, String toLocation, LocalDate date, LocalTime time) {
        try {
            String dateStr = date != null ? date.toString() : "-";
            String timeStr = time != null ? (time.toString().length() == 8 ? time.toString().substring(0,5) : time.toString()) : "-";
            String subject = "Ride Cancellation Notice";
            String html = "<!doctype html><html><head><meta name='viewport' content='width=device-width, initial-scale=1.0'></head>"
                    + "<body style='margin:0;padding:24px;font-family:Arial,sans-serif;background:#f3f4f6;'>"
                    + "<div style='max-width:640px;margin:0 auto;background:#fff;padding:20px;border-radius:12px;border:1px solid #e5e7eb;'>"
                    + "<h2 style='color:#ef4444;text-align:center;margin-top:0;'>Ride Cancellation Notice</h2>"
                    + "<p>Dear Passenger,</p>"
                    + "<p>This is to inform you that your booking has been declined by the driver.</p>"
                    + "<table style='width:100%;border-collapse:collapse;margin-top:12px;'>"
                    + "<tr><td style='padding:8px;border:1px solid #e5e7eb;background:#f9fafb;'><strong>Driver Name</strong></td><td style='padding:8px;border:1px solid #e5e7eb;'>" + driverName + "</td></tr>"
                    + "<tr><td style='padding:8px;border:1px solid #e5e7eb;background:#f9fafb;'><strong>From</strong></td><td style='padding:8px;border:1px solid #e5e7eb;'>" + fromLocation + "</td></tr>"
                    + "<tr><td style='padding:8px;border:1px solid #e5e7eb;background:#f9fafb;'><strong>To</strong></td><td style='padding:8px;border:1px solid #e5e7eb;'>" + toLocation + "</td></tr>"
                    + "<tr><td style='padding:8px;border:1px solid #e5e7eb;background:#f9fafb;'><strong>Date</strong></td><td style='padding:8px;border:1px solid #e5e7eb;'>" + dateStr + "</td></tr>"
                    + "<tr><td style='padding:8px;border:1px solid #e5e7eb;background:#f9fafb;'><strong>Time</strong></td><td style='padding:8px;border:1px solid #e5e7eb;'>" + timeStr + "</td></tr>"
                    + "</table>"
                    + "<p style='margin-top:14px;'>If you have already made a payment, you will receive a full refund within 7 working days.</p>"
                    + "<p style='margin-top:18px;color:#6b7280;font-size:13px;'>Regards,<br/>RideShare Team</p>"
                    + "</div></body></html>";

            sendHtmlEmail(toEmail, subject, html);
        } catch (Exception e) {
            System.err.println("Failed to send cancellation email: " + e.getMessage());
        }
    }

    public void sendRideAcceptedEmail(String toEmail, String driverName, String fromLocation, String toLocation, LocalDate date, LocalTime time, Double fare) {
        try {
            String dateStr = date != null ? date.toString() : "-";
            String timeStr = time != null ? (time.toString().length() == 8 ? time.toString().substring(0,5) : time.toString()) : "-";
            String fareStr = fare != null ? "₹" + String.format("%.2f", fare) : "-";
            String subject = "Ride Booking Accepted - Please Complete Payment";
            
            StringBuilder html = new StringBuilder();
            html.append("<!doctype html><html><head><meta name='viewport' content='width=device-width, initial-scale=1.0'></head>");
            html.append("<body style='margin:0;padding:24px;font-family:Arial,sans-serif;background:#f3f4f6;'>");
            html.append("<div style='max-width:640px;margin:0 auto;background:#fff;padding:20px;border-radius:12px;border:1px solid #e5e7eb;'>");
            html.append("<h2 style='color:#22c55e;text-align:center;margin-top:0;'>Ride Booking Accepted</h2>");
            html.append("<p>Dear Passenger,</p>");
            html.append("<p>Your booking has been accepted by the driver. Please complete the payment to confirm your ride.</p>");
            html.append("<table style='width:100%;border-collapse:collapse;margin-top:12px;'>");
            html.append("<tr><td style='padding:8px;border:1px solid #e5e7eb;background:#f9fafb;'><strong>Driver Name</strong></td><td style='padding:8px;border:1px solid #e5e7eb;'>").append(driverName).append("</td></tr>");
            html.append("<tr><td style='padding:8px;border:1px solid #e5e7eb;background:#f9fafb;'><strong>From</strong></td><td style='padding:8px;border:1px solid #e5e7eb;'>").append(fromLocation).append("</td></tr>");
            html.append("<tr><td style='padding:8px;border:1px solid #e5e7eb;background:#f9fafb;'><strong>To</strong></td><td style='padding:8px;border:1px solid #e5e7eb;'>").append(toLocation).append("</td></tr>");
            html.append("<tr><td style='padding:8px;border:1px solid #e5e7eb;background:#f9fafb;'><strong>Date</strong></td><td style='padding:8px;border:1px solid #e5e7eb;'>").append(dateStr).append("</td></tr>");
            html.append("<tr><td style='padding:8px;border:1px solid #e5e7eb;background:#f9fafb;'><strong>Time</strong></td><td style='padding:8px;border:1px solid #e5e7eb;'>").append(timeStr).append("</td></tr>");
            html.append("<tr><td style='padding:8px;border:1px solid #e5e7eb;background:#f9fafb;'><strong>Fare</strong></td><td style='padding:8px;border:1px solid #e5e7eb;'>").append(fareStr).append("</td></tr>");
            html.append("</table>");
            html.append("<p style='margin-top:18px;color:#6b7280;font-size:13px;'>Regards,<br/>RideShare Team</p>");
            html.append("</div></body></html>");

            sendHtmlEmail(toEmail, subject, html.toString());
        } catch (Exception e) {
            System.err.println("Failed to send acceptance email: " + e.getMessage());
        }
    }

    private String generateTempPassword() {
        String chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
        StringBuilder sb = new StringBuilder();
        Random random = new SecureRandom();
        for (int i = 0; i < 10; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
