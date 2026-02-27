-- Ride-Sharing Platform Schema
CREATE DATABASE IF NOT EXISTS ride_sharing_db;
USE ride_sharing_db;

-- Disable foreign key checks to allow dropping tables with dependencies
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL,
    date_of_birth VARCHAR(100),
    gender VARCHAR(50),
    street_address VARCHAR(255),
    area VARCHAR(255),
    city VARCHAR(255),
    state VARCHAR(255),
    pin_code VARCHAR(20),
    school10_name VARCHAR(255),
    school10_year VARCHAR(20),
    school10_percentage VARCHAR(20),
    school12_name VARCHAR(255),
    school12_year VARCHAR(20),
    school12_percentage VARCHAR(20),
    college_name VARCHAR(255),
    graduation_year VARCHAR(20),
    graduation_percentage VARCHAR(20),
    document_type VARCHAR(100),
    document_file_path VARCHAR(255),
    vehicle_type VARCHAR(100),
    vehicle_number VARCHAR(100),
    license_number VARCHAR(100),
    vehicle_capacity VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    needs_password_change BOOLEAN DEFAULT TRUE NOT NULL,
    verification_token VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_email (email)
);

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
