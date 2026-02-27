package com.ridesharing.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "vehicles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "driver_id", nullable = false)
    private Long driverId;

    @Column(name = "company", nullable = false)
    private String company;

    @Column(name = "model", nullable = false)
    private String model;

    @Column(name = "year_of_model", nullable = false)
    private Integer yearOfModel;

    @Column(name = "car_number", nullable = false, unique = true)
    private String carNumber;

    @Column(name = "colour", nullable = false)
    private String colour;

    @Column(name = "kms_driven")
    private Integer kmsDriven;

    @Builder.Default
    @Column(name = "hasac")
    private boolean hasAC = false;

    @Builder.Default
    @Column(name = "has_audio")
    private boolean hasAudio = false;

    @Column(name = "capacity")
    private Integer capacity;

    @Column(name = "seats", nullable = false)
    private Integer seats;

    @Column(name = "license_number")
    private String licenseNumber;

    @Column(name = "rc_document_path")
    private String rcDocumentPath;

    @Column(name = "insurance_document_path")
    private String insuranceDocumentPath;

    @Column(name = "car_image_paths", columnDefinition = "TEXT")
    private String carImagePaths; // Comma-separated paths

    @Column(name = "insurance_expiry", nullable = true)
    private LocalDate insuranceExpiry;

    @Builder.Default
    @Column(name = "is_active")
    private boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
