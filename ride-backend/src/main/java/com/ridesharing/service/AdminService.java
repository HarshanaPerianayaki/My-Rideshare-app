package com.ridesharing.service;

import com.ridesharing.dto.StatsResponse;
import com.ridesharing.model.Role;
import com.ridesharing.model.User;
import com.ridesharing.repository.UserRepository;
import com.ridesharing.repository.RideRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private AuthService authService;

    public Map<String, Long> getDashboardStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalDrivers", userRepository.countByRole(Role.DRIVER));
        stats.put("totalPassengers", userRepository.countByRole(Role.PASSENGER));
        return stats;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public void verifyUser(Long id) {
        authService.approveUser(id);
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setVerified(false);
        userRepository.save(user);
    }

    public StatsResponse getRevenueMonthly() {
        return new StatsResponse(List.of("Jan", "Feb", "Mar", "Apr", "May", "Jun"),
                List.of(45000, 52000, 48000, 61000, 59000, 72000));
    }

    public StatsResponse getUserGrowth() {
        List<Object[]> results = userRepository.getUserGrowthStats();
        List<String> labels = new ArrayList<>();
        List<Object> data = new ArrayList<>();
        for (Object[] row : results) {
            labels.add(row[0].toString() + " (" + row[1].toString() + ")");
            data.add(row[2]);
        }
        return new StatsResponse(labels, data);
    }

    public StatsResponse getActiveTrips() {
        long count = rideRepository.count();
        return new StatsResponse(List.of("Current"), List.of(count));
    }

    public StatsResponse getCompletionRate() {
        return new StatsResponse(List.of("Completed", "Incomplete"), List.of(85, 15));
    }

    public StatsResponse getTopDrivers() {
        return new StatsResponse(List.of("Driver A", "Driver B", "Driver C"), List.of(120, 110, 95));
    }

    public StatsResponse getTripsByCity() {
        return new StatsResponse(List.of("Mumbai", "Pune", "Delhi", "Bangalore"), List.of(300, 150, 200, 180));
    }
}
