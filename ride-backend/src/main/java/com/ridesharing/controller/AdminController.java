package com.ridesharing.controller;

import com.ridesharing.dto.StatsResponse;
import com.ridesharing.model.User;
import com.ridesharing.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Long>> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return adminService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/users/{id}/verify")
    public ResponseEntity<String> verifyUser(@PathVariable Long id) {
        adminService.verifyUser(id);
        return ResponseEntity.ok("User approved!");
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/revenue/monthly")
    public ResponseEntity<StatsResponse> getRevenueMonthly() {
        return ResponseEntity.ok(adminService.getRevenueMonthly());
    }

    @GetMapping("/users/growth")
    public ResponseEntity<StatsResponse> getUserGrowth() {
        return ResponseEntity.ok(adminService.getUserGrowth());
    }

    @GetMapping("/trips/active")
    public ResponseEntity<StatsResponse> getActiveTrips() {
        return ResponseEntity.ok(adminService.getActiveTrips());
    }

    @GetMapping("/trips/completion-rate")
    public ResponseEntity<StatsResponse> getCompletionRate() {
        return ResponseEntity.ok(adminService.getCompletionRate());
    }

    @GetMapping("/drivers/top")
    public ResponseEntity<StatsResponse> getTopDrivers() {
        return ResponseEntity.ok(adminService.getTopDrivers());
    }

    @GetMapping("/trips/by-city")
    public ResponseEntity<StatsResponse> getTripsByCity() {
        return ResponseEntity.ok(adminService.getTripsByCity());
    }
}
