package com.ridesharing.controller;

import com.ridesharing.dto.PaymentOrderRequest;
import com.ridesharing.dto.PaymentVerifyRequest;
import com.ridesharing.model.Booking;
import com.ridesharing.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final String razorpayKey;

    @Autowired
    public PaymentController(PaymentService paymentService,
                             @Value("${razorpay.key}") String razorpayKey) {
        this.paymentService = paymentService;
        this.razorpayKey = razorpayKey;
    }

    @PostMapping("/order")
    public ResponseEntity<?> createOrder(@RequestBody PaymentOrderRequest req) {
        try {
            // If Razorpay keys are not configured (contains placeholder), generate mock order for testing
            if (razorpayKey == null || razorpayKey.contains("yourkey")) {
                System.out.println("📌 Using TEST MODE - generating mock Razorpay order");
                String mockOrderId = "order_" + UUID.randomUUID().toString().substring(0, 12);
                Map<String, String> testResp = new HashMap<>();
                testResp.put("order_id", mockOrderId);
                testResp.put("currency", "INR");
                testResp.put("amount", String.valueOf((int) Math.round(req.getAmount() * 100)));
                testResp.put("message", "TEST MODE - Use test Razorpay credentials to go live");
                return ResponseEntity.ok(testResp);
            }
            
            String receipt = "booking_" + req.getBookingId();
            var order = paymentService.createOrder(req.getAmount(), "INR", receipt);
            Map<String, String> resp = new HashMap<>();
            resp.put("order_id", order.get("id"));
            resp.put("currency", order.get("currency"));
            resp.put("amount", String.valueOf(order.get("amount")));
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to create order: " + e.getMessage());
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody PaymentVerifyRequest req) {
        try {
            // In test mode, accept any signature
            if (razorpayKey == null || razorpayKey.contains("yourkey")) {
                System.out.println("📌 TEST MODE - accepting payment without signature verification");
                Booking updated = paymentService.markBookingAsPaid(req.getBookingId(), req.getRazorpayPaymentId());
                return ResponseEntity.ok(updated);
            }
            
            boolean ok = paymentService.verifySignature(req.getRazorpayOrderId(),
                    req.getRazorpayPaymentId(),
                    req.getRazorpaySignature());
            if (!ok) {
                return ResponseEntity.status(400).body("Signature mismatch");
            }
            Booking updated = paymentService.markBookingAsPaid(req.getBookingId(), req.getRazorpayPaymentId());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Verification error: " + e.getMessage());
        }
    }
}
