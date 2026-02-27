package com.ridesharing.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String phone;

    // New Registration Fields
    private String dateOfBirth;
    private String gender;
    private String streetAddress;
    private String area;
    private String city;
    private String state;
    private String pinCode;

    // Education Details
    private String school10Name;
    private String school10Year;
    private String school10Percentage;
    private String school12Name;
    private String school12Year;
    private String school12Percentage;
    private String collegeName;
    private String graduationYear;
    private String graduationPercentage;

    // Verification Documents
    private String documentType;
    private String documentFilePath;

    // Vehicle Details (for Drivers)
    private String vehicleType;
    private String vehicleNumber;
    private String licenseNumber;
    private String vehicleCapacity;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(nullable = false)
    @Builder.Default
    @JsonProperty("isVerified")
    private boolean isVerified = false;

    @Column(nullable = false)
    @Builder.Default
    @JsonProperty("isTemporaryPassword")
    private Boolean isTemporaryPassword = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean needsPasswordChange = true;

    @Column
    private String verificationToken;

    private LocalDateTime createdAt;

    private LocalDateTime passwordChangedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
