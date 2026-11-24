-- Quick Car Midlands Ltd - MySQL Database Schema

-- 1. Users Table (Customers, Admins, Drivers)
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `phone` VARCHAR(50) DEFAULT NULL,
  `password_hash` VARCHAR(255) DEFAULT NULL,
  `role` ENUM('customer', 'admin', 'driver') NOT NULL DEFAULT 'customer',
  `is_verified` BOOLEAN NOT NULL DEFAULT TRUE,
  `verification_code` VARCHAR(10) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Drivers Table
CREATE TABLE IF NOT EXISTS `drivers` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(50) NOT NULL,
  `address` VARCHAR(255) DEFAULT NULL,
  `ni_number` VARCHAR(50) DEFAULT NULL,
  `emergency_contact` VARCHAR(150) DEFAULT NULL,
  `license_number` VARCHAR(100) DEFAULT NULL,
  `pco_expiry` VARCHAR(50) DEFAULT NULL,
  `dvla_license_number` VARCHAR(50) DEFAULT NULL,
  `vehicle_model` VARCHAR(100) DEFAULT NULL,
  `vehicle_plate` VARCHAR(50) DEFAULT NULL,
  `vehicle_year` VARCHAR(10) DEFAULT NULL,
  `vehicle_category` VARCHAR(50) NOT NULL DEFAULT 'saloon',
  `insurance_number` VARCHAR(100) DEFAULT NULL,
  `insurance_expiry` VARCHAR(50) DEFAULT NULL,
  `bank_name` VARCHAR(100) DEFAULT NULL,
  `sort_code` VARCHAR(20) DEFAULT NULL,
  `account_number` VARCHAR(30) DEFAULT NULL,
  `doc_pco_badge` VARCHAR(255) DEFAULT NULL,
  `doc_dvla_license` VARCHAR(255) DEFAULT NULL,
  `doc_phv_mot` VARCHAR(255) DEFAULT NULL,
  `doc_insurance` VARCHAR(255) DEFAULT NULL,
  `completion_score` INT NOT NULL DEFAULT 0,
  `verification_status` ENUM('incomplete', 'pending_approval', 'approved', 'rejected') NOT NULL DEFAULT 'incomplete',
  `admin_notes` TEXT DEFAULT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Quotes & Bookings Table (Core Business Model)
CREATE TABLE IF NOT EXISTS `bookings` (
  `quote_ref` VARCHAR(50) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(50) DEFAULT NULL,
  `from_location` VARCHAR(255) NOT NULL,
  `to_location` VARCHAR(255) NOT NULL,
  `from_location_type` INT NOT NULL DEFAULT 1,
  `to_location_type` INT NOT NULL DEFAULT 2,
  `from_lat` DECIMAL(10, 8) DEFAULT NULL,
  `from_lng` DECIMAL(11, 8) DEFAULT NULL,
  `to_lat` DECIMAL(10, 8) DEFAULT NULL,
  `to_lng` DECIMAL(11, 8) DEFAULT NULL,
  `pickup_date` VARCHAR(20) NOT NULL,
  `pickup_time` VARCHAR(20) NOT NULL,
  `book_return` BOOLEAN NOT NULL DEFAULT FALSE,
  `return_date` VARCHAR(20) DEFAULT NULL,
  `return_time` VARCHAR(20) DEFAULT NULL,
  `passengers` INT NOT NULL DEFAULT 1,
  `suitcases` INT NOT NULL DEFAULT 1,
  `distance_miles` DECIMAL(8, 2) NOT NULL DEFAULT 0.00,
  `estimated_time_mins` INT NOT NULL DEFAULT 0,
  `waypoints` TEXT DEFAULT NULL,
  `selected_vehicle_id` VARCHAR(50) NOT NULL DEFAULT 'saloon',
  `selected_extras` TEXT DEFAULT NULL,
  `passenger_name` VARCHAR(150) DEFAULT NULL,
  `passenger_email` VARCHAR(150) DEFAULT NULL,
  `passenger_phone` VARCHAR(50) DEFAULT NULL,
  `flight_number` VARCHAR(50) DEFAULT NULL,
  `terminal` VARCHAR(50) DEFAULT NULL,
  `pickup_buffer_mins` INT DEFAULT 45,
  `special_notes` TEXT DEFAULT NULL,
  `pricing_details` LONGTEXT DEFAULT NULL,
  `total_price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'GBP',
  `payment_status` ENUM('unpaid', 'completed', 'cancelled', 'refunded') NOT NULL DEFAULT 'unpaid',
  `payment_method` VARCHAR(50) DEFAULT NULL,
  `stripe_payment_id` VARCHAR(150) DEFAULT NULL,
  `driver_id` VARCHAR(50) DEFAULT NULL,
  `booking_status` ENUM('quoted', 'confirmed', 'assigned', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'quoted',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_bookings_user_id` (`user_id`),
  INDEX `idx_bookings_status` (`booking_status`),
  INDEX `idx_bookings_payment` (`payment_status`),
  INDEX `idx_bookings_date` (`pickup_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Contact Inquiries Table
CREATE TABLE IF NOT EXISTS `contact_inquiries` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `subject` VARCHAR(255) DEFAULT NULL,
  `message` TEXT NOT NULL,
  `status` ENUM('new', 'in_progress', 'resolved') NOT NULL DEFAULT 'new',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Customer Reviews Table
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `quote_ref` VARCHAR(50) DEFAULT NULL,
  `author_name` VARCHAR(150) NOT NULL,
  `route` VARCHAR(255) DEFAULT NULL,
  `rating` INT NOT NULL DEFAULT 5,
  `comment` TEXT NOT NULL,
  `is_approved` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Vehicles Fleet Table (Dynamic Car Models & Pricing Multipliers)
CREATE TABLE IF NOT EXISTS `vehicles` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `category_name` VARCHAR(100) NOT NULL,
  `image` VARCHAR(255) NOT NULL,
  `passengers` INT NOT NULL DEFAULT 4,
  `suitcases` INT NOT NULL DEFAULT 2,
  `hand_luggage` INT NOT NULL DEFAULT 2,
  `description` TEXT NOT NULL,
  `features` TEXT NOT NULL,
  `multiplier` DECIMAL(5, 2) NOT NULL DEFAULT 1.00,
  `rate_per_mile` DECIMAL(6, 2) NOT NULL DEFAULT 1.50,
  `minimum_fare` DECIMAL(6, 2) NOT NULL DEFAULT 38.00,
  `sample_vehicles` VARCHAR(255) NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. System Settings Table (SMTP Config & Global Policies)
CREATE TABLE IF NOT EXISTS `system_settings` (
  `key_name` VARCHAR(100) NOT NULL PRIMARY KEY,
  `key_value` TEXT NOT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Partner Applications Table (B2B, Travel Agents, Corporate, Fleets)
CREATE TABLE IF NOT EXISTS `partner_applications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_name` VARCHAR(150) NOT NULL,
  `contact_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `partner_type` VARCHAR(100) NOT NULL,
  `fleet_size` VARCHAR(50) DEFAULT NULL,
  `message` TEXT DEFAULT NULL,
  `status` ENUM('new', 'under_review', 'approved', 'rejected') NOT NULL DEFAULT 'new',
  `admin_notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_partner_status` (`status`),
  INDEX `idx_partner_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Default Website & System Settings Seed
INSERT INTO `system_settings` (`key_name`, `key_value`) VALUES
  ('brand_name', 'QUICK CAR MIDLANDS LTD'),
  ('brand_tagline', 'Airport Transfers & Private Hire | Based in Birmingham'),
  ('support_email', 'qcm023@gmail.com'),
  ('admin_email', 'qcm023@gmail.com'),
  ('support_phone', '01212433112'),
  ('emergency_whatsapp', '00447892609314'),
  ('office_address', 'Birmingham, West Midlands, United Kingdom'),
  ('account_name', 'QUICK CAR MIDLANDS LTD'),
  ('account_type', 'Business'),
  ('account_number', '50470328'),
  ('sort_code', '82-19-74'),
  ('bank_name', 'QUICK CAR MIDLANDS LTD'),
  ('company_number', '12345678'),
  ('vat_number', 'GB 123 4567 89'),
  ('copyright_text', '© 2026 QUICK CAR MIDLANDS LTD. All Rights Reserved.'),
  ('primary_color', '#FFCC00'),
  ('primary_hover_color', '#E6B800'),
  ('secondary_color', '#141720'),
  ('require_email_verification', 'false'),
  ('require_driver_approval', 'true')
ON DUPLICATE KEY UPDATE `key_value` = VALUES(`key_value`);


