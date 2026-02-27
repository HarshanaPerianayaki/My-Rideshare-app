package com.ridesharing.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public class RidePostRequest {

    @NotBlank(message = "From city is required")
    private String fromCity;

    @NotBlank(message = "To city is required")
    private String toCity;

    @NotEmpty(message = "Pickup locations are required")
    @Size(max = 4, message = "Maximum 4 pickup locations allowed")
    private List<String> pickupLocations;

    @NotEmpty(message = "Drop locations are required")
    @Size(max = 4, message = "Maximum 4 drop locations allowed")
    private List<String> dropLocations;

    @NotNull(message = "Travel date is required")
    private LocalDate travelDate;

    @NotNull(message = "Departure time is required")
    private LocalTime departureTime;

    @NotNull(message = "Number of seats is required")
    @Min(value = 1, message = "At least 1 seat is required")
    @Max(value = 10, message = "Maximum 10 seats allowed")
    private Integer totalSeats;

    @NotNull(message = "Base price is required")
    @DecimalMin(value = "0.01", message = "Base price must be greater than 0")
    private Double basePrice;

    @NotNull(message = "Price per km is required")
    @DecimalMin(value = "0.01", message = "Price per km must be greater than 0")
    private Double pricePerKm;

    private Double farePerSeat;

    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;

    // Constructors
    public RidePostRequest() {
    }

    // Getters and setters
    public String getFromCity() {
        return fromCity;
    }

    public void setFromCity(String fromCity) {
        this.fromCity = fromCity;
    }

    public String getToCity() {
        return toCity;
    }

    public void setToCity(String toCity) {
        this.toCity = toCity;
    }

    public List<String> getPickupLocations() {
        return pickupLocations;
    }

    public void setPickupLocations(List<String> pickupLocations) {
        this.pickupLocations = pickupLocations;
    }

    public List<String> getDropLocations() {
        return dropLocations;
    }

    public void setDropLocations(List<String> dropLocations) {
        this.dropLocations = dropLocations;
    }

    public LocalDate getTravelDate() {
        return travelDate;
    }

    public void setTravelDate(LocalDate travelDate) {
        this.travelDate = travelDate;
    }

    public LocalTime getDepartureTime() {
        return departureTime;
    }

    public void setDepartureTime(LocalTime departureTime) {
        this.departureTime = departureTime;
    }

    public Integer getTotalSeats() {
        return totalSeats;
    }

    public void setTotalSeats(Integer totalSeats) {
        this.totalSeats = totalSeats;
    }

    public Double getBasePrice() {
        return basePrice;
    }

    public void setBasePrice(Double basePrice) {
        this.basePrice = basePrice;
    }

    public Double getPricePerKm() {
        return pricePerKm;
    }

    public void setPricePerKm(Double pricePerKm) {
        this.pricePerKm = pricePerKm;
    }

    public Double getFarePerSeat() {
        return farePerSeat;
    }

    public void setFarePerSeat(Double farePerSeat) {
        this.farePerSeat = farePerSeat;
    }

    public Long getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(Long vehicleId) {
        this.vehicleId = vehicleId;
    }
}
