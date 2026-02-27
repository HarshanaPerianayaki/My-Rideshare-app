package com.ridesharing.repository;

import com.ridesharing.model.Ride;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RideRepository extends JpaRepository<Ride, Long> {

        List<Ride> findByFromCityAndToCityAndTravelDateAndStatusAndAvailableSeatsGreaterThan(
                        String fromCity,
                        String toCity,
                        LocalDate date,
                        String status,
                        Integer seats);

        List<Ride> findByFromCityAndToCityAndTravelDateAndStatus(
                        String fromCity,
                        String toCity,
                        LocalDate travelDate,
                        String status);

        List<Ride> findByDriverIdOrderByTravelDateDesc(Long driverId);

        // CRITICAL: This query must match EXACTLY
        @Query("SELECT r FROM Ride r WHERE " +
                        "LOWER(r.fromCity) = LOWER(:fromCity) AND " +
                        "LOWER(r.toCity) = LOWER(:toCity) AND " +
                        "r.travelDate = :travelDate AND " +
                        "r.status = :status AND " +
                        "r.availableSeats > 0")
        List<Ride> searchRides(
                        @Param("fromCity") String fromCity,
                        @Param("toCity") String toCity,
                        @Param("travelDate") LocalDate travelDate,
                        @Param("status") String status);

        @Query("SELECT r FROM Ride r WHERE r.driverId = :driverId AND r.status != 'CANCELLED' ORDER BY r.travelDate DESC")
        List<Ride> findActiveRidesByDriverId(@Param("driverId") Long driverId);

        @Query("SELECT r FROM Ride r WHERE r.travelDate >= :date AND r.status = 'SCHEDULED' ORDER BY r.travelDate ASC")
        List<Ride> findUpcomingRides(@Param("date") LocalDate date);

        @Query("SELECT r.travelDate as label, SUM(r.baseFare) as value FROM Ride r WHERE r.driverId = :driverId AND r.status = 'COMPLETED' GROUP BY r.travelDate ORDER BY r.travelDate ASC")
        List<Object[]> getEarningsStats(@Param("driverId") Long driverId);

        @Query("SELECT r.status as label, COUNT(r) as value FROM Ride r WHERE r.driverId = :driverId GROUP BY r.status")
        List<Object[]> getTripStatusStats(@Param("driverId") Long driverId);

        @Query("SELECT r.travelDate as label, COUNT(r) as value FROM Ride r WHERE r.driverId = :driverId AND r.travelDate >= :startDate GROUP BY r.travelDate ORDER BY r.travelDate ASC")
        List<Object[]> getWeeklyTripStats(@Param("driverId") Long driverId, @Param("startDate") LocalDate startDate);
}
