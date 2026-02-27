package com.ridesharing.service;

import com.ridesharing.dto.StatsResponse;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ridesharing.dto.RidePostRequest;
import com.ridesharing.exception.DuplicateResourceException;
import com.ridesharing.model.Booking;
import com.ridesharing.model.Ride;
import com.ridesharing.model.Vehicle;
import com.ridesharing.repository.BookingRepository;
import com.ridesharing.repository.RideRepository;
import com.ridesharing.repository.UserRepository;
import com.ridesharing.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
public class DriverService {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final String UPLOAD_DIR = "uploads/vehicles/";

    public List<Vehicle> getVehiclesByDriverId(Long driverId) {
        return vehicleRepository.findByDriverId(driverId);
    }

    public Long getDriverIdByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(user -> user.getId())
                .orElseThrow(() -> new RuntimeException("Driver not found with email: " + email));
    }

    public Vehicle addVehicle(Long driverId, String company, String model, Integer year, String number,
            String colour, Integer kms, boolean ac, boolean audio, Integer capacity,
            String license, String insuranceExpiry, MultipartFile rc, MultipartFile insurance, MultipartFile[] images)
            throws IOException {

        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));
        } catch (IOException e) {
            System.err.println("Could not create upload directory: " + e.getMessage());
            throw new IOException("Server error: Could not initialize storage");
        }

        String rcPath = null;
        try {
            rcPath = saveFile(rc);
        } catch (Exception e) {
            System.err.println("Error saving RC file: " + e.getMessage());
        }

        String insPath = null;
        try {
            insPath = saveFile(insurance);
        } catch (Exception e) {
            System.err.println("Error saving Insurance file: " + e.getMessage());
        }

        List<String> imagePaths = new ArrayList<>();
        if (images != null) {
            for (MultipartFile img : images) {
                if (img != null && !img.isEmpty()) {
                    try {
                        String savedPath = saveFile(img);
                        if (savedPath != null) {
                            imagePaths.add(savedPath);
                        }
                    } catch (Exception e) {
                        System.err.println("Error saving car image: " + e.getMessage());
                    }
                }
            }
        }

        Vehicle vehicle = Vehicle.builder()
                .driverId(driverId)
                .company(company != null ? company : "Unknown")
                .model(model != null ? model : "Unknown")
                .yearOfModel(year != null ? year : 0)
                .carNumber(number != null ? number : "Unknown")
                .colour(colour != null ? colour : "Unknown")
                .kmsDriven(kms != null ? kms : 0)
                .hasAC(ac)
                .hasAudio(audio)
                .capacity(capacity != null ? capacity : 1)
                .seats(capacity != null ? capacity : 1)
                .licenseNumber(license != null ? license : "Unknown")
                .rcDocumentPath(rcPath)
                .insuranceDocumentPath(insPath)
                .carImagePaths(imagePaths.isEmpty() ? "" : String.join(",", imagePaths))
                .insuranceExpiry(
                        insuranceExpiry != null && !insuranceExpiry.isEmpty() ? LocalDate.parse(insuranceExpiry) : null)
                .isActive(true)
                .build();

        try {
            return vehicleRepository.save(vehicle);
        } catch (DataIntegrityViolationException e) {
            throw new DuplicateResourceException(
                    "A vehicle with car number '" + vehicle.getCarNumber() + "' is already registered.");
        }
    }

    public Vehicle getVehicleById(Long vehicleId, Long driverId) throws Exception {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new Exception("Vehicle not found"));
        if (!vehicle.getDriverId().equals(driverId)) {
            throw new Exception("Unauthorized access to vehicle");
        }
        return vehicle;
    }

    public Vehicle updateVehicle(Long vehicleId, Long driverId, String company, String model, Integer year,
            String number,
            String colour, Integer kms, boolean ac, boolean audio, Integer capacity,
            String license, String insuranceExpiry, MultipartFile rc, MultipartFile insurance, MultipartFile[] images)
            throws Exception {

        Vehicle vehicle = getVehicleById(vehicleId, driverId);

        // Update basic fields
        if (company != null)
            vehicle.setCompany(company);
        if (model != null)
            vehicle.setModel(model);
        if (year != null)
            vehicle.setYearOfModel(year);
        if (number != null)
            vehicle.setCarNumber(number);
        if (colour != null)
            vehicle.setColour(colour);
        if (kms != null)
            vehicle.setKmsDriven(kms);
        vehicle.setHasAC(ac);
        vehicle.setHasAudio(audio);
        if (capacity != null) {
            vehicle.setCapacity(capacity);
            vehicle.setSeats(capacity);
        }
        if (license != null)
            vehicle.setLicenseNumber(license);
        if (insuranceExpiry != null && !insuranceExpiry.isEmpty()) {
            vehicle.setInsuranceExpiry(LocalDate.parse(insuranceExpiry));
        }

        // Handle file updates (only if new files are provided)
        if (rc != null && !rc.isEmpty()) {
            safeDeleteFile(vehicle.getRcDocumentPath());
            vehicle.setRcDocumentPath(saveFile(rc));
        }

        if (insurance != null && !insurance.isEmpty()) {
            safeDeleteFile(vehicle.getInsuranceDocumentPath());
            vehicle.setInsuranceDocumentPath(saveFile(insurance));
        }

        if (images != null && images.length > 0) {
            // If new images are uploaded, we append or replace?
            // User requested to "Update all editable fields". Usually for images it's
            // simpler to replace or manage separately.
            // Let's replace for simplicity if any images are sent, or append if desired.
            // The prompt says "Handle file updates". Let's append new images to existing
            // ones.
            List<String> currentImages = new ArrayList<>();
            if (vehicle.getCarImagePaths() != null && !vehicle.getCarImagePaths().isEmpty()) {
                currentImages.addAll(Arrays.asList(vehicle.getCarImagePaths().split(",")));
            }

            for (MultipartFile img : images) {
                if (img != null && !img.isEmpty()) {
                    String savedPath = saveFile(img);
                    if (savedPath != null) {
                        currentImages.add(savedPath);
                    }
                }
            }
            vehicle.setCarImagePaths(String.join(",", currentImages));
        }

        try {
            return vehicleRepository.save(vehicle);
        } catch (DataIntegrityViolationException e) {
            throw new DuplicateResourceException(
                    "A vehicle with car number '" + vehicle.getCarNumber() + "' is already registered.");
        }
    }

    public void deleteVehicle(Long id, Long driverId) {
        Vehicle vehicle = vehicleRepository.findByIdAndDriverId(id, driverId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found or unauthorized"));

        // Delete associated files safely in try-catch
        try {
            safeDeleteFile(vehicle.getRcDocumentPath());
            safeDeleteFile(vehicle.getInsuranceDocumentPath());
            if (vehicle.getCarImagePaths() != null && !vehicle.getCarImagePaths().isEmpty()) {
                String[] images = vehicle.getCarImagePaths().split(",");
                for (String img : images) {
                    safeDeleteFile(img);
                }
            }
        } catch (Exception e) {
            System.err.println("Warning: Physical file deletion failed: " + e.getMessage());
        }

        vehicleRepository.delete(vehicle);
    }

    private void safeDeleteFile(String filePath) {
        if (filePath == null || filePath.isEmpty())
            return;
        try {
            // Standardize path for file system lookup
            String standardizedPath = filePath.replace("\\", "/");
            Path path = Paths.get(standardizedPath);
            Files.deleteIfExists(path);
        } catch (Exception e) {
            System.err.println("Could not delete file: " + filePath + ". Error: " + e.getMessage());
        }
    }

    public Map<String, Object> getDashboardStats(Long driverId) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRides", rideRepository.getTripStatusStats(driverId).stream().count());
        stats.put("totalEarnings", rideRepository.getEarningsStats(driverId).stream()
                .mapToDouble(e -> (Double) e[1]).sum());
        stats.put("upcomingRides", rideRepository.findUpcomingRides(LocalDate.now()).size());
        stats.put("avgRating", 4.8); // Mock rating
        return stats;
    }

    public StatsResponse getEarningsSummary(Long driverId) {
        List<Object[]> results = rideRepository.getEarningsStats(driverId);
        return formatStats(results);
    }

    public StatsResponse getTripStats(Long driverId) {
        List<Object[]> results = rideRepository.getTripStatusStats(driverId);
        return formatStats(results);
    }

    public StatsResponse getWeeklyTrips(Long driverId) {
        List<Object[]> results = rideRepository.getWeeklyTripStats(driverId, LocalDate.now().minusDays(7));
        return formatStats(results);
    }

    public StatsResponse getRatingStats(Long driverId) {
        // Mock rating data for radial chart
        return new StatsResponse(List.of("5 Stars", "4 Stars", "3 Stars", "2 Stars", "1 Star"),
                List.of(80, 15, 3, 1, 1));
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

    public Ride postRide(Long driverId, RidePostRequest request) throws JsonProcessingException {
        Ride ride = new Ride();
        ride.setDriverId(driverId);
        ride.setVehicleId(request.getVehicleId());
        ride.setFromCity(request.getFromCity());
        ride.setToCity(request.getToCity());
        ride.setFromLocation(request.getFromCity()); // Set from_location to match database
        ride.setToLocation(request.getToCity()); // Set to_location to match database
        ride.setDestination(request.getToCity()); // Set destination to match database
        ride.setOrigin(request.getFromCity()); // Set origin to match database
        ride.setPickupLocations(
                objectMapper.writeValueAsString(
                        request.getPickupLocations()));
        ride.setDropLocations(
                objectMapper.writeValueAsString(
                        request.getDropLocations()));
        ride.setTravelDate(request.getTravelDate());
        ride.setDepartureTime(request.getDepartureTime());
        ride.setDepartureDate(request.getTravelDate()); // Set departure_date to match database
        ride.setTotalSeats(request.getTotalSeats());
        ride.setAvailableSeats(request.getTotalSeats());
        ride.setBaseFare(request.getBasePrice());
        ride.setFarePerKm(request.getPricePerKm());
        ride.setPricePerSeat(request.getFarePerSeat() != null ? request.getFarePerSeat() : request.getBasePrice());
        ride.setStatus("SCHEDULED");
        ride.setCreatedAt(LocalDateTime.now());
        return rideRepository.save(ride);
    }

    public List<Ride> getRidesByDriverId(Long driverId) {
        return rideRepository.findByDriverIdOrderByTravelDateDesc(
                driverId);
    }

    public void cancelRide(Long rideId, Long driverId) throws Exception {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new Exception("Ride not found"));
        if (!ride.getDriverId().equals(driverId)) {
            throw new Exception("Unauthorized");
        }
        // Return seats to all bookings
        List<Booking> bookings = bookingRepository.findByRideId(
                rideId);
        for (Booking booking : bookings) {
            booking.setStatus("CANCELLED");
            bookingRepository.save(booking);
        }
        ride.setStatus("CANCELLED");
        rideRepository.save(ride);
    }

    public void approveBooking(Long bookingId, Long driverId) throws Exception {
        try {
            System.out.println("approveBooking called with bookingId=" + bookingId + " driverId=" + driverId);
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new Exception("Booking not found"));

            Ride ride = rideRepository.findById(booking.getRideId())
                    .orElseThrow(() -> new Exception("Ride not found"));

            if (ride.getDriverId() == null) {
                throw new Exception("Ride has no driver assigned");
            }
            if (!ride.getDriverId().equals(driverId)) {
                throw new Exception("Unauthorized: ride.driverId=" + ride.getDriverId() + " but driverId=" + driverId);
            }

            booking.setStatus("APPROVED");
            booking.setUpdatedAt(LocalDateTime.now());
            bookingRepository.save(booking);

            // send acceptance email to passenger
            try {
                final String driverName = userRepository.findById(driverId)
                        .map(drv -> drv.getFirstName() + " " + drv.getLastName())
                        .orElse("Unknown");

                userRepository.findById(booking.getPassengerId()).ifPresent(passenger -> {
                    String passengerEmail = passenger.getEmail();
                    emailService.sendRideAcceptedEmail(passengerEmail, driverName,
                            booking.getPickupLocation(), booking.getDropLocation(),
                            ride.getDepartureDate(), ride.getDepartureTime(),
                            booking.getTotalFare());
                });
            } catch (Exception e) {
                System.err.println("Failed to send ride acceptance email: " + e.getMessage());
            }
        } catch (Exception e) {
            // log and rethrow
            System.err.println("Error in approveBooking: " + e.getMessage());
            throw e;
        }
    }

    public void rejectBooking(Long bookingId, Long driverId) throws Exception {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new Exception("Booking not found"));

        Ride ride = rideRepository.findById(booking.getRideId())
                .orElseThrow(() -> new Exception("Ride not found"));

        if (!ride.getDriverId().equals(driverId)) {
            throw new Exception("Unauthorized");
        }

        // Return seats to ride
        ride.setAvailableSeats(ride.getAvailableSeats() + booking.getSeatsBooked());
        rideRepository.save(ride);

        booking.setStatus("REJECTED");
        booking.setUpdatedAt(LocalDateTime.now());
        bookingRepository.save(booking);

        try {
            // Send cancellation email to passenger
            final String driverName = userRepository.findById(driverId)
                    .map(drv -> drv.getFirstName() + " " + drv.getLastName())
                    .orElse("Unknown");

            userRepository.findById(booking.getPassengerId()).ifPresent(passenger -> {
                String passengerEmail = passenger.getEmail();
                emailService.sendRideCancellationNotice(passengerEmail, driverName, booking.getPickupLocation(), booking.getDropLocation(), ride.getDepartureDate(), ride.getDepartureTime());
            });
        } catch (Exception e) {
            System.err.println("Failed to send ride cancellation notice: " + e.getMessage());
        }
    }

    public Ride updateRide(Long rideId, Long driverId, Map<String, Object> updates) throws Exception {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new Exception("Ride not found"));

        if (!ride.getDriverId().equals(driverId)) {
            throw new Exception("Unauthorized");
        }

        if (updates.containsKey("travelDate")) {
            ride.setTravelDate(LocalDate.parse((String) updates.get("travelDate")));
            ride.setDepartureDate(ride.getTravelDate());
        }
        if (updates.containsKey("departureTime")) {
            String timeStr = (String) updates.get("departureTime");
            // If time is HH:mm, add :00
            if (timeStr.length() == 5) {
                timeStr += ":00";
            }
            ride.setDepartureTime(LocalTime.parse(timeStr));
        }

        ride.setUpdatedAt(LocalDateTime.now());
        return rideRepository.save(ride);
    }

    private String saveFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty())
            return null;

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            originalFilename = "unnamed_file";
        }

        String fileName = UUID.randomUUID().toString() + "_" + originalFilename.replaceAll("\\s+", "_");
        Path path = Paths.get(UPLOAD_DIR).resolve(fileName);

        Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);

        // Return path with forward slashes for consistent serving
        return UPLOAD_DIR + fileName;
    }
}
