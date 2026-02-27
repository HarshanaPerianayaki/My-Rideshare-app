package com.ridesharing.dto;

import jakarta.validation.constraints.*;

public class BookingRequest {
    
    @NotNull(message = "Ride ID is required")
    private Long rideId;
    
    @NotBlank(message = "Pickup location is required")
    private String pickupLocation;
    
    @NotBlank(message = "Drop location is required")
    private String dropLocation;
    
    @NotNull(message = "Number of seats is required")
    @Min(value = 1, message = "At least 1 seat is required")
    private Integer seatsBooked;
    
    @NotNull(message = "Total fare is required")
    @DecimalMin(value = "0.01", message = "Fare must be greater than 0")
    private Double totalFare;
    
    // Constructors
    public BookingRequest() {}
    
    // Getters and setters
    public Long getRideId() {
        return rideId;
    }
    
    public void setRideId(Long rideId) {
        this.rideId = rideId;
    }
    
    public String getPickupLocation() {
        return pickupLocation;
    }
    
    public void setPickupLocation(String pickupLocation) {
        this.pickupLocation = pickupLocation;
    }
    
    public String getDropLocation() {
        return dropLocation;
    }
    
    public void setDropLocation(String dropLocation) {
        this.dropLocation = dropLocation;
    }
    
    public Integer getSeatsBooked() {
        return seatsBooked;
    }
    
    public void setSeatsBooked(Integer seatsBooked) {
        this.seatsBooked = seatsBooked;
    }
    
    public Double getTotalFare() {
        return totalFare;
    }
    
    public void setTotalFare(Double totalFare) {
        this.totalFare = totalFare;
    }
}
