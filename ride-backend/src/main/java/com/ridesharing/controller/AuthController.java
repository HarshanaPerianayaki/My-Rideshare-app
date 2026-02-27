package com.ridesharing.controller;

import com.ridesharing.dto.ApiResponse;
import com.ridesharing.dto.LoginRequest;
import com.ridesharing.dto.LoginResponse;
import com.ridesharing.dto.RegisterRequest;
import com.ridesharing.dto.DriverRegisterRequest;
import com.ridesharing.dto.PassengerRegisterRequest;
import com.ridesharing.dto.ChangePasswordRequest;
import com.ridesharing.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok(new ApiResponse(true, "Registration successful! Check your email for verification."));
    }

    @PostMapping("/driver/register")
    public ResponseEntity<ApiResponse> registerDriver(@Valid @ModelAttribute DriverRegisterRequest request)
            throws java.io.IOException {
        authService.registerDriver(request);
        return ResponseEntity.ok(new ApiResponse(true, "Registration successful! Admin will review your application."));
    }

    @PostMapping("/passenger/register")
    public ResponseEntity<ApiResponse> registerPassenger(@Valid @ModelAttribute PassengerRegisterRequest request)
            throws java.io.IOException {
        authService.registerPassenger(request);
        return ResponseEntity.ok(new ApiResponse(true, "Registration successful! Admin will review your application."));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/verify")
    public ResponseEntity<ApiResponse> verify(@RequestParam String token) {
        boolean verified = authService.verifyEmail(token);
        if (verified) {
            return ResponseEntity.ok(new ApiResponse(true, "Email verified successfully!"));
        } else {
            return ResponseEntity.status(400).body(new ApiResponse(false, "Invalid or expired verification token."));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse> changePassword(@RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(401).body(new ApiResponse(false, "Authentication required"));
        }

        String email = authentication.getName();
        authService.changePassword(email, request);
        return ResponseEntity.ok(new ApiResponse(true, "Password changed successfully!"));
    }
}
