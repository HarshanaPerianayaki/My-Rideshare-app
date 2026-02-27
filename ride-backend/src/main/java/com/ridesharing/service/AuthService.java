package com.ridesharing.service;

import com.ridesharing.dto.ChangePasswordRequest;
import com.ridesharing.dto.LoginRequest;
import com.ridesharing.dto.LoginResponse;
import com.ridesharing.dto.RegisterRequest;
import com.ridesharing.exception.UserAlreadyExistsException;
import com.ridesharing.model.Role;
import com.ridesharing.model.User;
import com.ridesharing.repository.UserRepository;
import com.ridesharing.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Random;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private EmailService emailService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Value("${app.admin.secret-code:}")
    private String adminSecretCode;

    public void approveUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);

        emailService.sendAccountApprovedEmail(user);
    }

    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email already registered: " + request.getEmail());
        }

        Role requestedRole = Role.valueOf(request.getRole().toUpperCase());
        if (requestedRole == Role.ADMIN) {
            if (adminSecretCode == null || adminSecretCode.isBlank()) {
                throw new RuntimeException("Admin registration is disabled. Configure app.admin.secret-code.");
            }
            if (request.getSecretCode() == null || !adminSecretCode.equals(request.getSecretCode().trim())) {
                throw new RuntimeException("Invalid admin secret code");
            }
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(requestedRole)
                .verificationToken(UUID.randomUUID().toString())
                .isVerified(false)
                .isTemporaryPassword(false)
                .needsPasswordChange(true)
                .build();

        userRepository.save(user);
        emailService.sendWelcomeEmail(user.getEmail(), user.getFirstName(), request.getPassword());
    }

    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid old password");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new RuntimeException("New password cannot be same as old password");
        }

        if (!isStrongPassword(request.getNewPassword())) {
            throw new RuntimeException(
                    "Password must be at least 8 characters and include one uppercase letter, one number, and one special character");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setIsTemporaryPassword(false);
        user.setNeedsPasswordChange(false);
        user.setPasswordChangedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isVerified() && user.getRole() != Role.ADMIN) {
            throw new RuntimeException("Your account is pending admin approval");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtTokenProvider.generateToken(userDetails);

        boolean requiresPasswordChange = Boolean.TRUE.equals(user.getIsTemporaryPassword()) || user.isNeedsPasswordChange();
        user.setPassword(null); // Clear password before sending in response

        return new LoginResponse(token, user, requiresPasswordChange, user.getRole().name());
    }

    public boolean verifyEmail(String token) {
        return userRepository.findByVerificationToken(token)
                .map(user -> {
                    user.setVerified(true);
                    user.setVerificationToken(null);
                    userRepository.save(user);
                    return true;
                }).orElse(false);
    }

    public void registerDriver(com.ridesharing.dto.DriverRegisterRequest request) throws IOException {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new com.ridesharing.exception.UserAlreadyExistsException(
                    "Email already registered: " + request.getEmail());
        }

        String filePath = saveFile(request.getDocumentFile(), "documents");
        String tempPassword = generateTempPassword();

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(tempPassword))
                .phone(request.getPhone())
                .role(Role.DRIVER)
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .streetAddress(request.getStreetAddress())
                .area(request.getArea())
                .city(request.getCity())
                .state(request.getState())
                .pinCode(request.getPinCode())
                .school10Name(request.getSchool10Name())
                .school10Year(request.getSchool10Year())
                .school10Percentage(request.getSchool10Percentage())
                .school12Name(request.getSchool12Name())
                .school12Year(request.getSchool12Year())
                .school12Percentage(request.getSchool12Percentage())
                .collegeName(request.getCollegeName())
                .graduationYear(request.getGraduationYear())
                .graduationPercentage(request.getGraduationPercentage())
                .documentType(request.getDocumentType())
                .documentFilePath(filePath)
                .vehicleType(request.getVehicleType())
                .vehicleNumber(request.getVehicleNumber())
                .licenseNumber(request.getLicenseNumber())
                .vehicleCapacity(request.getVehicleCapacity())
                .verificationToken(UUID.randomUUID().toString())
                .isVerified(false)
                .isTemporaryPassword(true)
                .needsPasswordChange(true)
                .build();

        User savedUser = userRepository.save(user);
        emailService.sendAdminRegistrationNotification(savedUser);
        emailService.sendWelcomeEmailWithCredentials(savedUser, tempPassword);
    }

    public void registerPassenger(com.ridesharing.dto.PassengerRegisterRequest request) throws IOException {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new com.ridesharing.exception.UserAlreadyExistsException(
                    "Email already registered: " + request.getEmail());
        }

        String filePath = saveFile(request.getDocumentFile(), "documents");
        String tempPassword = generateTempPassword();

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(tempPassword))
                .phone(request.getPhone())
                .role(Role.PASSENGER)
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .streetAddress(request.getStreetAddress())
                .area(request.getArea())
                .city(request.getCity())
                .state(request.getState())
                .pinCode(request.getPinCode())
                .school10Name(request.getSchool10Name())
                .school10Year(request.getSchool10Year())
                .school10Percentage(request.getSchool10Percentage())
                .school12Name(request.getSchool12Name())
                .school12Year(request.getSchool12Year())
                .school12Percentage(request.getSchool12Percentage())
                .collegeName(request.getCollegeName())
                .graduationYear(request.getGraduationYear())
                .graduationPercentage(request.getGraduationPercentage())
                .documentType(request.getDocumentType())
                .documentFilePath(filePath)
                .verificationToken(UUID.randomUUID().toString())
                .isVerified(false)
                .isTemporaryPassword(true)
                .needsPasswordChange(true)
                .build();

        User savedUser = userRepository.save(user);
        emailService.sendAdminRegistrationNotification(savedUser);
        emailService.sendWelcomeEmailWithCredentials(savedUser, tempPassword);
    }

    private String saveFile(MultipartFile file, String subDir) throws IOException {
        if (file == null || file.isEmpty())
            return null;

        String uploadDir = "uploads/" + subDir + "/";
        Path uploadPath = Paths.get(uploadDir);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return uploadDir + fileName;
    }

    private String generateTempPassword() {
        String chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
        StringBuilder sb = new StringBuilder();
        Random random = new SecureRandom();
        for (int i = 0; i < 10; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    private boolean isStrongPassword(String password) {
        if (password == null || password.length() < 8) {
            return false;
        }
        boolean hasUppercase = password.matches(".*[A-Z].*");
        boolean hasDigit = password.matches(".*\\d.*");
        boolean hasSpecial = password.matches(".*[!@#$%^&*].*");
        return hasUppercase && hasDigit && hasSpecial;
    }
}
