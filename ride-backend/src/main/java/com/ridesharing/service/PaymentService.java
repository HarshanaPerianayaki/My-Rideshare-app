package com.ridesharing.service;

import com.ridesharing.model.Booking;
import com.ridesharing.repository.BookingRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    private final BookingRepository bookingRepository;
    private final String razorpayKey;
    private final String razorpaySecret;
    private RazorpayClient razorpayClient;

    public PaymentService(@Value("${razorpay.key}") String key,
                          @Value("${razorpay.secret}") String secret,
                          BookingRepository bookingRepository) {
        this.razorpayKey = key;
        this.razorpaySecret = secret;
        this.bookingRepository = bookingRepository;
        initializeRazorpayClient();
    }

    private void initializeRazorpayClient() {
        try {
            if (razorpayKey != null && !razorpayKey.contains("yourkey")) {
                this.razorpayClient = new RazorpayClient(razorpayKey, razorpaySecret);
                System.out.println("✅ Razorpay client initialized successfully");
            } else {
                System.out.println("⚠️  Razorpay test keys not configured. Use real test credentials from dashboard.");
            }
        } catch (Exception e) {
            System.out.println("❌ Failed to initialize Razorpay client: " + e.getMessage());
        }
    }

    public Order createOrder(Double amount, String currency, String receipt) throws Exception {
        if (razorpayClient == null) {
            throw new Exception("Razorpay client not initialized. Configure valid test keys.");
        }
        JSONObject options = new JSONObject();
        // Razorpay expects amount in smallest currency unit (paise)
        options.put("amount", (int) Math.round(amount * 100));
        options.put("currency", currency);
        options.put("receipt", receipt);
        return razorpayClient.Orders.create(options);
    }

    public boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            String payload = orderId + "|" + paymentId;
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            javax.crypto.spec.SecretKeySpec secretKey = new javax.crypto.spec.SecretKeySpec(razorpaySecret.getBytes(), "HmacSHA256");
            mac.init(secretKey);
            byte[] hashBytes = mac.doFinal(payload.getBytes());
            StringBuilder generated = new StringBuilder();
            for (byte b : hashBytes) {
                generated.append(String.format("%02x", b));
            }
            return generated.toString().equals(signature);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public Booking markBookingAsPaid(Long bookingId, String razorpayPaymentId) throws Exception {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new Exception("Booking not found"));
        booking.setStatus("PAID");
        booking.setPaymentId(razorpayPaymentId);
        return bookingRepository.save(booking);
    }
}
