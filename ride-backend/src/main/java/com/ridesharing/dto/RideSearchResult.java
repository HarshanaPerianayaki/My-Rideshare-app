package com.ridesharing.dto;

import com.ridesharing.model.Ride;
import com.ridesharing.model.User;
import com.ridesharing.model.Vehicle;
import java.util.List;

public class RideSearchResult {
    private Ride ride;
    private User driver;
    private Vehicle vehicle;
    private List<String> pickupLocations;
    private List<String> dropLocations;
    
    // Constructors
    public RideSearchResult() {}
    
    // Getters and setters
    public Ride getRide() {
        return ride;
    }
    
    public void setRide(Ride ride) {
        this.ride = ride;
    }
    
    public User getDriver() {
        return driver;
    }
    
    public void setDriver(User driver) {
        this.driver = driver;
    }
    
    public Vehicle getVehicle() {
        return vehicle;
    }
    
    public void setVehicle(Vehicle vehicle) {
        this.vehicle = vehicle;
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
}
