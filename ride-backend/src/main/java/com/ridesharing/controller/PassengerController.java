package com.ridesharing.controller;

import com.ridesharing.dto.StatsResponse;

import com.ridesharing.dto.BookingRequest;
import com.ridesharing.dto.RideSearchRequest;
import com.ridesharing.dto.RideSearchResult;
import com.ridesharing.model.Booking;
import com.ridesharing.model.Ride;
import com.ridesharing.model.User;
import com.ridesharing.model.Vehicle;
import com.ridesharing.repository.RideRepository;
import com.ridesharing.repository.UserRepository;
import com.ridesharing.repository.VehicleRepository;
import com.ridesharing.security.CustomUserDetails;
import com.ridesharing.service.PassengerService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/passenger")
public class PassengerController {

    @Autowired
    private PassengerService passengerService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication auth) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
            User user = userRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Failed to fetch profile: " + e.getMessage()));
        }
    }

    @GetMapping("/dashboard-stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(passengerService.getDashboardStats(user.getId()));
    }

    @PostMapping("/search-rides")
    public ResponseEntity<?> searchRides(@RequestBody RideSearchRequest request) {
        try {
            // Log the search request
            System.out.println("=== SEARCH REQUEST ===");
            System.out.println("From City: '" + request.getFromCity() + "'");
            System.out.println("To City: '" + request.getToCity() + "'");
            System.out.println("Travel Date: " + request.getTravelDate());

            // Diagnostic: Check total rides in DB regardless of date/status.
            long totalRidesInDb = rideRepository.count();
            System.out.println("Total rides in system (regardless of date/status): " + totalRidesInDb);

            // Validate inputs
            if (request.getFromCity() == null || request.getFromCity().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "From city is required"));
            }
            if (request.getToCity() == null || request.getToCity().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "To city is required"));
            }
            if (request.getTravelDate() == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Travel date is required"));
            }

            // Search for rides using the custom query
            List<Ride> rides = rideRepository.searchRides(
                    request.getFromCity().trim(),
                    request.getToCity().trim(),
                    request.getTravelDate(),
                    "SCHEDULED");

            System.out.println("Found " + rides.size() + " rides");

            // Build response with full details
            List<Map<String, Object>> results = new ArrayList<>();
            ObjectMapper mapper = new ObjectMapper();

            for (Ride ride : rides) {
                System.out.println("Processing ride ID: " + ride.getId());

                // Get driver details
                User driver = userRepository.findById(ride.getDriverId())
                        .orElse(null);

                if (driver == null) {
                    System.out.println("Driver not found for ride: " + ride.getId());
                    continue;
                }

                // Get vehicle details
                Vehicle vehicle = vehicleRepository.findById(ride.getVehicleId())
                        .orElse(null);

                if (vehicle == null) {
                    System.out.println("Vehicle not found for ride: " + ride.getId());
                    continue;
                }

                Map<String, Object> result = new HashMap<>();

                // Add ride data
                result.put("ride", ride);

                // Add driver data (without sensitive info)
                Map<String, Object> driverData = new HashMap<>();
                driverData.put("id", driver.getId());
                driverData.put("firstName", driver.getFirstName());
                driverData.put("lastName", driver.getLastName());
                driverData.put("phone", driver.getPhone());
                result.put("driver", driverData);

                // Add vehicle data
                result.put("vehicle", vehicle);

                // Parse pickup/drop locations
                try {
                    List<String> pickups = mapper.readValue(
                            ride.getPickupLocations(),
                            new TypeReference<List<String>>() {
                            });
                    List<String> drops = mapper.readValue(
                            ride.getDropLocations(),
                            new TypeReference<List<String>>() {
                            });
                    result.put("pickupLocations", pickups);
                    result.put("dropLocations", drops);
                } catch (Exception e) {
                    System.out.println("Error parsing locations: " + e.getMessage());
                    result.put("pickupLocations", new ArrayList<>());
                    result.put("dropLocations", new ArrayList<>());
                }

                results.add(result);
            }

            System.out.println("Returning " + results.size() + " results");
            return ResponseEntity.ok(results);

        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Search error: " + e.getMessage());
            return ResponseEntity.status(500)
                    .body(Map.of(
                            "message", "Search failed: " + e.getMessage(),
                            "error", e.getClass().getName()));
        }
    }

    @GetMapping("/rides/search")
    public ResponseEntity<?> searchRidesByQuery(
            @RequestParam String startCity,
            @RequestParam String endCity,
            @RequestParam String date) {
        try {
            java.time.LocalDate travelDate = java.time.LocalDate.parse(date);
            List<RideSearchResult> results = passengerService
                    .searchRides(startCity, endCity, travelDate);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            throw new RuntimeException("Invalid date format. Use YYYY-MM-DD");
        }
    }

    @PostMapping("/bookings")
    public ResponseEntity<Booking> createBooking(
            @Valid @RequestBody BookingRequest request,
            Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        try {
            Booking booking = passengerService.createBooking(
                    user.getId(), request);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create booking: " + e.getMessage());
        }
    }

    @GetMapping("/bookings")
    public ResponseEntity<?> getMyBookings(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Booking> bookings = passengerService.getPassengerBookings(user.getId());

        List<Map<String, Object>> results = new ArrayList<>();
        ObjectMapper mapper = new ObjectMapper();

        for (Booking booking : bookings) {
            Map<String, Object> result = new HashMap<>();
            result.put("booking", booking);

            // Fetch ride details
            Ride ride = rideRepository.findById(booking.getRideId()).orElse(null);
            if (ride != null) {
                result.put("ride", ride);

                // Fetch driver details
                User driver = userRepository.findById(ride.getDriverId()).orElse(null);
                if (driver != null) {
                    result.put("driver", Map.of(
                            "id", driver.getId(),
                            "firstName", driver.getFirstName(),
                            "lastName", driver.getLastName(),
                            "phone", driver.getPhone()));
                }

                // Fetch vehicle details
                Vehicle vehicle = vehicleRepository.findById(ride.getVehicleId()).orElse(null);
                if (vehicle != null) {
                    result.put("vehicle", vehicle);
                }
            }
            results.add(result);
        }
        return ResponseEntity.ok(results);
    }

    @DeleteMapping("/bookings/{bookingId}")
    public ResponseEntity<?> cancelBooking(
            @PathVariable Long bookingId,
            Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        try {
            passengerService.cancelBooking(bookingId, user.getId());
            return ResponseEntity.ok(Map.of("message", "Booking cancelled"));
        } catch (Exception e) {
            // Return a 400 Bad Request with the error message instead of throwing 500
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/trips/history")
    public ResponseEntity<StatsResponse> getTripHistory(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).get();
        return ResponseEntity.ok(passengerService.getTripHistoryStats(user.getId()));
    }

    @GetMapping("/spending/monthly")
    public ResponseEntity<StatsResponse> getSpendingMonthly(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).get();
        return ResponseEntity.ok(passengerService.getSpendingStats(user.getId()));
    }

    @GetMapping("/routes/frequent")
    public ResponseEntity<StatsResponse> getFrequentRoutes(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).get();
        return ResponseEntity.ok(passengerService.getFrequentRoutes(user.getId()));
    }

    @GetMapping("/trips/breakdown")
    public ResponseEntity<StatsResponse> getTripBreakdown(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).get();
        return ResponseEntity.ok(passengerService.getTripBreakdownStats(user.getId()));
    }

    @GetMapping("/saved-rides")
    public ResponseEntity<List<Object>> getSavedRides(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(passengerService.getSavedRides(user.getId()));
    }

    @PostMapping("/saved-rides")
    public ResponseEntity<Map<String, String>> saveRide(Authentication authentication,
            @RequestBody Map<String, Object> rideData) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(passengerService.saveRide(user.getId(), rideData));
    }

    @DeleteMapping("/saved-rides/{rideId}")
    public ResponseEntity<Map<String, String>> removeSavedRide(Authentication authentication,
            @PathVariable Long rideId) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(passengerService.removeSavedRide(user.getId(), rideId));
    }
}
