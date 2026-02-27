package com.ridesharing.repository;

import com.ridesharing.model.User;
import com.ridesharing.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findByVerificationToken(String token);

    Boolean existsByEmail(String email);

    long countByRole(Role role);

    @Query("SELECT CAST(u.createdAt AS LocalDate) as label, u.role as role, COUNT(u) as value FROM User u GROUP BY label, u.role ORDER BY label ASC")
    List<Object[]> getUserGrowthStats();
}
