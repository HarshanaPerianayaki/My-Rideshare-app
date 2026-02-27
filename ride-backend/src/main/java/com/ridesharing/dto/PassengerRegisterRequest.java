package com.ridesharing.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PassengerRegisterRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String phone;
    private String role; // "PASSENGER"

    // Personal & Address
    private String dateOfBirth;
    private String gender;
    private String streetAddress;
    private String area;
    private String city;
    private String state;
    private String pinCode;

    // Education
    private String school10Name;
    private String school10Year;
    private String school10Percentage;
    private String school12Name;
    private String school12Year;
    private String school12Percentage;
    private String collegeName;
    private String graduationYear;
    private String graduationPercentage;

    // Identity
    private String documentType;
    private MultipartFile documentFile;
}
