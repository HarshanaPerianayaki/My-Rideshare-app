package com.ridesharing.repository;

import com.ridesharing.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByPassengerIdOrderByBookedAtDesc(Long passengerId);

    List<Booking> findByRideId(Long rideId);

    Optional<Booking> findByIdAndPassengerId(Long id, Long passengerId);

    @Query("SELECT b FROM Booking b WHERE b.rideId = :rideId AND b.status != 'CANCELLED'")
    List<Booking> findActiveBookingsByRideId(@Param("rideId") Long rideId);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.rideId = :rideId AND b.status != 'CANCELLED'")
    Integer countActiveBookingsByRideId(@Param("rideId") Long rideId);

    @Query("SELECT b FROM Booking b JOIN Ride r ON b.rideId = r.id WHERE r.driverId = :driverId AND b.status = 'PENDING'")
    List<Booking> findPendingBookingsForDriver(@Param("driverId") Long driverId);

    @Query("SELECT CAST(b.bookedAt AS LocalDate) as label, COUNT(b) as value FROM Booking b WHERE b.passengerId = :passengerId AND b.bookedAt >= :since GROUP BY label ORDER BY label ASC")
    List<Object[]> getPassengerTripHistory(@Param("passengerId") Long passengerId, @Param("since") LocalDateTime since);

    @Query("SELECT CAST(b.bookedAt AS LocalDate) as label, SUM(b.totalFare) as value FROM Booking b WHERE b.passengerId = :passengerId AND b.status = 'APPROVED' GROUP BY label ORDER BY label ASC")
    List<Object[]> getPassengerSpendingStats(@Param("passengerId") Long passengerId);

    @Query("SELECT b.pickupLocation || ' to ' || b.dropLocation as label, COUNT(b) as value FROM Booking b WHERE b.passengerId = :passengerId GROUP BY label ORDER BY value DESC")
    List<Object[]> getPassengerFrequentRoutes(@Param("passengerId") Long passengerId);
}
