package com.ridesharing.service;

import com.ridesharing.dto.StatsResponse;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ridesharing.dto.BookingRequest;
import com.ridesharing.dto.RideSearchRequest;
import com.ridesharing.dto.RideSearchResult;
import com.ridesharing.model.Booking;
import com.ridesharing.model.Ride;
import com.ridesharing.model.User;
import com.ridesharing.model.Vehicle;
import com.ridesharing.repository.BookingRepository;
import com.ridesharing.repository.RideRepository;
import com.ridesharing.repository.UserRepository;
import com.ridesharing.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.UUID;

@Service
@Transactional
public class PassengerService {

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private ObjectMapper objectMapper;

    public Map<String, Object> getDashboardStats(Long passengerId) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRides", bookingRepository.findByPassengerIdOrderByBookedAtDesc(passengerId).size());
        stats.put("upcomingRides", 0);
        stats.put("totalSaved", 0);
        stats.put("favoriteRoute", "N/A");
        return stats;
    }

    public StatsResponse getTripHistoryStats(Long passengerId) {
        List<Object[]> results = bookingRepository.getPassengerTripHistory(passengerId,
                LocalDateTime.now().minusMonths(2));
        return formatStats(results);
    }

    public StatsResponse getSpendingStats(Long passengerId) {
        List<Object[]> results = bookingRepository.getPassengerSpendingStats(passengerId);
        return formatStats(results);
    }

    public StatsResponse getFrequentRoutes(Long passengerId) {
        List<Object[]> results = bookingRepository.getPassengerFrequentRoutes(passengerId);
        return formatStats(results).limit(5); // Top 5
    }

    public StatsResponse getTripBreakdownStats(Long passengerId) {
        // Mock data: AC vs Non-AC
        return new StatsResponse(List.of("AC", "Non-AC", "Solo", "Shared"), List.of(45, 20, 30, 5));
    }

    private StatsResponse formatStats(List<Object[]> results) {
        List<String> labels = new ArrayList<>();
        List<Object> data = new ArrayList<>();
        for (Object[] row : results) {
            labels.add(row[0].toString());
            data.add(row[1]);
        }
        return new StatsResponse(labels, data);
    }

    public List<RideSearchResult> searchRides(
            String fromCity, String toCity, LocalDate date) {
        List<Ride> rides = rideRepository
                .findByFromCityAndToCityAndTravelDateAndStatusAndAvailableSeatsGreaterThan(
                        fromCity, toCity, date, "SCHEDULED", 0);

        List<RideSearchResult> results = new ArrayList<>();
        for (Ride ride : rides) {
            User driver = userRepository.findById(
                    ride.getDriverId()).orElse(null);
            Vehicle vehicle = vehicleRepository.findById(
                    ride.getVehicleId()).orElse(null);

            try {
                RideSearchResult result = new RideSearchResult();
                result.setRide(ride);
                result.setDriver(driver);
                result.setVehicle(vehicle);
                result.setPickupLocations(
                        objectMapper.readValue(
                                ride.getPickupLocations(),
                                new TypeReference<List<String>>() {
                                }));
                result.setDropLocations(
                        objectMapper.readValue(
                                ride.getDropLocations(),
                                new TypeReference<List<String>>() {
                                }));
                results.add(result);
            } catch (JsonProcessingException e) {
                // Skip rides with invalid location data
                continue;
            }
        }
        return results;
    }

    public Booking createBooking(
            Long passengerId, BookingRequest request) throws Exception {
        Ride ride = rideRepository.findById(request.getRideId())
                .orElseThrow(() -> new Exception("Ride not found"));

        if (ride.getAvailableSeats() < request.getSeatsBooked()) {
            throw new Exception("Not enough seats available");
        }

        Booking booking = new Booking();
        booking.setRideId(request.getRideId());
        booking.setPassengerId(passengerId);
        booking.setPickupLocation(request.getPickupLocation());
        booking.setDropLocation(request.getDropLocation());
        booking.setSeatsBooked(request.getSeatsBooked());
        booking.setTotalFare(request.getTotalFare());
        booking.setStatus("PENDING");
        booking.setBookedAt(LocalDateTime.now());

        // Reduce available seats
        ride.setAvailableSeats(
                ride.getAvailableSeats() - request.getSeatsBooked());
        rideRepository.save(ride);

        return bookingRepository.save(booking);
    }

        public void cancelBooking(Long bookingId, Long passengerId) throws Exception {
        Booking booking = bookingRepository
            .findByIdAndPassengerId(bookingId, passengerId)
            .orElseThrow(() -> new Exception("Booking not found"));

        String status = booking.getStatus();
        if ("CANCELLED".equals(status) || "COMPLETED".equals(status)) {
            throw new Exception("Booking cannot be cancelled");
        }

        // Allow cancellation for PENDING or APPROVED bookings
        // Return seats to ride only if ride exists
        Ride ride = rideRepository.findById(booking.getRideId())
            .orElseThrow(() -> new Exception("Ride not found"));

        // Only adjust seats if booking was counted against available seats
        // (PENDING and APPROVED both reduce available seats at booking time)
        ride.setAvailableSeats(
            ride.getAvailableSeats() + booking.getSeatsBooked());
        rideRepository.save(ride);

        booking.setStatus("CANCELLED");
        booking.setUpdatedAt(LocalDateTime.now());
        bookingRepository.save(booking);
        }

    public List<Booking> getPassengerBookings(Long passengerId) {
        return bookingRepository
                .findByPassengerIdOrderByBookedAtDesc(passengerId);
    }

    public List<Object> getSavedRides(Long passengerId) {
        return new ArrayList<>();
    }

    public Map<String, String> saveRide(Long passengerId, Map<String, Object> rideData) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Ride saved successfully!");
        return response;
    }

    public Map<String, String> removeSavedRide(Long passengerId, Long rideId) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Ride removed from saved!");
        return response;
    }
}
