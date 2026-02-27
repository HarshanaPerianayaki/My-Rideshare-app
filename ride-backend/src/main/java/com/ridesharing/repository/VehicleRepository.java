package com.ridesharing.repository;

import com.ridesharing.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    List<Vehicle> findByDriverId(Long driverId);

    Optional<Vehicle> findByIdAndDriverId(Long id, Long driverId);
}
