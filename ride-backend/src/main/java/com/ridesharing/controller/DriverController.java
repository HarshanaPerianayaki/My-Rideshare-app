package com.ridesharing.controller;

import com.ridesharing.dto.StatsResponse;

import com.ridesharing.dto.RidePostRequest;
import com.ridesharing.model.Ride;
import com.ridesharing.model.User;
import com.ridesharing.model.Vehicle;
import com.ridesharing.model.Booking;
import com.ridesharing.service.DriverService;
import com.ridesharing.repository.UserRepository;
import com.ridesharing.repository.BookingRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/driver")
public class DriverController {

    @Autowired
    private DriverService driverService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/trips")
    public ResponseEntity<List<Ride>> getDriverTrips(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).get();
        return ResponseEntity.ok(driverService.getRidesByDriverId(user.getId()));
    }

    @GetMapping("/earnings/summary")
    public ResponseEntity<StatsResponse> getEarningsSummary(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).get();
        return ResponseEntity.ok(driverService.getEarningsSummary(user.getId()));
    }

    @GetMapping("/trips/stats")
    public ResponseEntity<StatsResponse> getTripStats(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).get();
        return ResponseEntity.ok(driverService.getTripStats(user.getId()));
    }

    @GetMapping("/trips/weekly")
    public ResponseEntity<StatsResponse> getWeeklyTrips(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).get();
        return ResponseEntity.ok(driverService.getWeeklyTrips(user.getId()));
    }

    @GetMapping("/rating")
    public ResponseEntity<StatsResponse> getRating(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).get();
        return ResponseEntity.ok(driverService.getRatingStats(user.getId()));
    }

    @GetMapping("/vehicles")
    public ResponseEntity<List<Vehicle>> getVehicles(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).get();
        return ResponseEntity.ok(driverService.getVehiclesByDriverId(user.getId()));
    }

    @PostMapping("/vehicles")
    public ResponseEntity<Vehicle> addVehicle(
            Authentication authentication,
            @RequestParam("company") String company,
            @RequestParam("model") String model,
            @RequestParam("yearOfModel") Integer year,
            @RequestParam("carNumber") String number,
            @RequestParam("colour") String colour,
            @RequestParam(value = "kmsDriven", required = false) Integer kms,
            @RequestParam("hasAC") boolean ac,
            @RequestParam("hasAudio") boolean audio,
            @RequestParam("capacity") Integer capacity,
            @RequestParam("licenseNumber") String license,
            @RequestParam(value = "insuranceExpiry", required = false) String insuranceExpiry,
            @RequestParam(value = "rcDocument", required = false) MultipartFile rc,
            @RequestParam(value = "insuranceDocument", required = false) MultipartFile insurance,
            @RequestParam(value = "carImages", required = false) MultipartFile[] images) throws IOException {

        User user = userRepository.findByEmail(authentication.getName()).get();
        try {
            return ResponseEntity.ok(driverService.addVehicle(user.getId(), company, model, year, number,
                    colour, kms, ac, audio, capacity, license, insuranceExpiry, rc, insurance, images));
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/vehicles/{vehicleId}")
    public ResponseEntity<Vehicle> getVehicleById(
            @PathVariable Long vehicleId,
            Authentication authentication) throws Exception {
        User user = userRepository.findByEmail(authentication.getName()).get();
        return ResponseEntity.ok(driverService.getVehicleById(vehicleId, user.getId()));
    }

    @PutMapping("/vehicles/{vehicleId}")
    public ResponseEntity<Vehicle> updateVehicle(
            @PathVariable Long vehicleId,
            Authentication authentication,
            @RequestParam(value = "company", required = false) String company,
            @RequestParam(value = "model", required = false) String model,
            @RequestParam(value = "yearOfModel", required = false) Integer year,
            @RequestParam(value = "carNumber", required = false) String number,
            @RequestParam(value = "colour", required = false) String colour,
            @RequestParam(value = "kmsDriven", required = false) Integer kms,
            @RequestParam("hasAC") boolean ac,
            @RequestParam("hasAudio") boolean audio,
            @RequestParam(value = "capacity", required = false) Integer capacity,
            @RequestParam(value = "licenseNumber", required = false) String license,
            @RequestParam(value = "insuranceExpiry", required = false) String insuranceExpiry,
            @RequestParam(value = "rcDocument", required = false) MultipartFile rc,
            @RequestParam(value = "insuranceDocument", required = false) MultipartFile insurance,
            @RequestParam(value = "carImages", required = false) MultipartFile[] images) throws Exception {

        User user = userRepository.findByEmail(authentication.getName()).get();
        return ResponseEntity.ok(driverService.updateVehicle(vehicleId, user.getId(), company, model, year, number,
                colour, kms, ac, audio, capacity, license, insuranceExpiry, rc, insurance, images));
    }

    @DeleteMapping("/vehicles/{vehicleId}")
    public ResponseEntity<?> deleteVehicle(
            @PathVariable Long vehicleId,
            @AuthenticationPrincipal UserDetails userDetails) throws Exception {
        Long driverId = driverService.getDriverIdByEmail(userDetails.getUsername());
        driverService.deleteVehicle(vehicleId, driverId);
        return ResponseEntity.ok(Map.of("message", "Vehicle deleted successfully"));
    }

    @GetMapping("/dashboard-stats")
    public ResponseEntity<Map<String, Object>> getStats(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).get();
        return ResponseEntity.ok(driverService.getDashboardStats(user.getId()));
    }

    @PostMapping("/rides")
    public ResponseEntity<Ride> postRide(
            @Valid @RequestBody RidePostRequest request,
            Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        try {
            Ride ride = driverService.postRide(user.getId(), request);
            return ResponseEntity.ok(ride);
        } catch (Exception e) {
            throw new RuntimeException("Failed to post ride: " + e.getMessage());
        }
    }

    @GetMapping("/rides")
    public ResponseEntity<List<Ride>> getMyRides(Authentication auth) {
        try {
            User user = userRepository.findByEmail(auth.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if user is a driver
            if (user.getRole() != com.ridesharing.model.Role.DRIVER) {
                throw new RuntimeException("Access denied: User is not a driver");
            }

            List<Ride> rides = driverService.getRidesByDriverId(user.getId());
            return ResponseEntity.ok(rides);
        } catch (Exception e) {
            System.err.println("Error fetching driver rides: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @PutMapping("/rides/{rideId}")
    public ResponseEntity<Ride> updateRide(
            @PathVariable Long rideId,
            @RequestBody Map<String, Object> updates,
            Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        try {
            Ride ride = driverService.updateRide(rideId, user.getId(), updates);
            return ResponseEntity.ok(ride);
        } catch (Exception e) {
            throw new RuntimeException("Failed to update ride: " + e.getMessage());
        }
    }

    @DeleteMapping("/rides/{rideId}")
    public ResponseEntity<?> cancelRide(
            @PathVariable Long rideId,
            Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        try {
            driverService.cancelRide(rideId, user.getId());
            return ResponseEntity.ok("Ride cancelled");
        } catch (Exception e) {
            throw new RuntimeException("Failed to cancel ride: " + e.getMessage());
        }
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<Booking>> getBookingRequests(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Booking> bookings = bookingRepository
                .findPendingBookingsForDriver(user.getId());
        return ResponseEntity.ok(bookings);
    }

    @PutMapping("/bookings/{bookingId}/approve")
    public ResponseEntity<?> approveBooking(
            @PathVariable Long bookingId,
            Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        try {
            driverService.approveBooking(bookingId, user.getId());
            return ResponseEntity.ok("Booking approved");
        } catch (Exception e) {
            // log full stack trace for debugging
            e.printStackTrace();
            String msg = e.getMessage();
            return ResponseEntity.status(500).body("Failed to approve booking: " + msg);
        }
    }

    @PutMapping("/bookings/{bookingId}/reject")
    public ResponseEntity<?> rejectBooking(
            @PathVariable Long bookingId,
            Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        try {
            driverService.rejectBooking(bookingId, user.getId());
            return ResponseEntity.ok("Booking rejected");
        } catch (Exception e) {
            throw new RuntimeException("Failed to reject booking: " + e.getMessage());
        }
    }
}
