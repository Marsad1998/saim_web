import { dbQuery, testDbConnection } from './db';
import { DEFAULT_VEHICLE_FLEET } from '@/models/Vehicle';

export interface InitDbResult {
  success: boolean;
  message: string;
  tablesCreated: string[];
  existingTables: string[];
  seededItems: string[];
  error?: string;
}

export async function initDatabaseSchema(): Promise<InitDbResult> {
  const connTest = await testDbConnection();
  if (!connTest.connected) {
    return {
      success: false,
      message: `Cannot initialize database: ${connTest.message}`,
      tablesCreated: [],
      existingTables: [],
      seededItems: [],
      error: connTest.error,
    };
  }

  const tablesCreated: string[] = [];
  const seededItems: string[] = [];

  try {
    // 1. Users Table
    await dbQuery(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,
        \`name\` VARCHAR(150) NOT NULL,
        \`email\` VARCHAR(150) NOT NULL UNIQUE,
        \`phone\` VARCHAR(50) DEFAULT NULL,
        \`password_hash\` VARCHAR(255) DEFAULT NULL,
        \`role\` ENUM('customer', 'admin', 'driver') NOT NULL DEFAULT 'customer',
        \`is_verified\` BOOLEAN NOT NULL DEFAULT TRUE,
        \`verification_code\` VARCHAR(10) DEFAULT NULL,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_users_email\` (\`email\`),
        INDEX \`idx_users_role\` (\`role\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    tablesCreated.push('users');

    // 2. Drivers Table
    await dbQuery(`
      CREATE TABLE IF NOT EXISTS \`drivers\` (
        \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,
        \`user_id\` VARCHAR(50) NOT NULL,
        \`address\` VARCHAR(255) DEFAULT NULL,
        \`ni_number\` VARCHAR(50) DEFAULT NULL,
        \`emergency_contact\` VARCHAR(150) DEFAULT NULL,
        \`license_number\` VARCHAR(100) DEFAULT NULL,
        \`pco_expiry\` VARCHAR(50) DEFAULT NULL,
        \`dvla_license_number\` VARCHAR(50) DEFAULT NULL,
        \`vehicle_model\` VARCHAR(100) DEFAULT NULL,
        \`vehicle_plate\` VARCHAR(50) DEFAULT NULL,
        \`vehicle_year\` VARCHAR(10) DEFAULT NULL,
        \`vehicle_category\` VARCHAR(50) NOT NULL DEFAULT 'saloon',
        \`insurance_number\` VARCHAR(100) DEFAULT NULL,
        \`insurance_expiry\` VARCHAR(50) DEFAULT NULL,
        \`bank_name\` VARCHAR(100) DEFAULT NULL,
        \`sort_code\` VARCHAR(20) DEFAULT NULL,
        \`account_number\` VARCHAR(30) DEFAULT NULL,
        \`doc_pco_badge\` VARCHAR(255) DEFAULT NULL,
        \`doc_dvla_license\` VARCHAR(255) DEFAULT NULL,
        \`doc_phv_mot\` VARCHAR(255) DEFAULT NULL,
        \`doc_insurance\` VARCHAR(255) DEFAULT NULL,
        \`completion_score\` INT NOT NULL DEFAULT 0,
        \`verification_status\` ENUM('incomplete', 'pending_approval', 'approved', 'rejected') NOT NULL DEFAULT 'incomplete',
        \`admin_notes\` TEXT DEFAULT NULL,
        \`is_active\` BOOLEAN NOT NULL DEFAULT FALSE,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    tablesCreated.push('drivers');

    // 3. Bookings Table
    await dbQuery(`
      CREATE TABLE IF NOT EXISTS \`bookings\` (
        \`quote_ref\` VARCHAR(50) NOT NULL PRIMARY KEY,
        \`user_id\` VARCHAR(50) DEFAULT NULL,
        \`from_location\` VARCHAR(255) NOT NULL,
        \`to_location\` VARCHAR(255) NOT NULL,
        \`from_location_type\` INT NOT NULL DEFAULT 1,
        \`to_location_type\` INT NOT NULL DEFAULT 2,
        \`from_lat\` DECIMAL(10, 8) DEFAULT NULL,
        \`from_lng\` DECIMAL(11, 8) DEFAULT NULL,
        \`to_lat\` DECIMAL(10, 8) DEFAULT NULL,
        \`to_lng\` DECIMAL(11, 8) DEFAULT NULL,
        \`pickup_date\` VARCHAR(20) NOT NULL,
        \`pickup_time\` VARCHAR(20) NOT NULL,
        \`book_return\` BOOLEAN NOT NULL DEFAULT FALSE,
        \`return_date\` VARCHAR(20) DEFAULT NULL,
        \`return_time\` VARCHAR(20) DEFAULT NULL,
        \`passengers\` INT NOT NULL DEFAULT 1,
        \`suitcases\` INT NOT NULL DEFAULT 1,
        \`distance_miles\` DECIMAL(8, 2) NOT NULL DEFAULT 0.00,
        \`estimated_time_mins\` INT NOT NULL DEFAULT 0,
        \`waypoints\` TEXT DEFAULT NULL,
        \`selected_vehicle_id\` VARCHAR(50) NOT NULL DEFAULT 'saloon',
        \`selected_extras\` TEXT DEFAULT NULL,
        \`passenger_name\` VARCHAR(150) DEFAULT NULL,
        \`passenger_email\` VARCHAR(150) DEFAULT NULL,
        \`passenger_phone\` VARCHAR(50) DEFAULT NULL,
        \`flight_number\` VARCHAR(50) DEFAULT NULL,
        \`terminal\` VARCHAR(50) DEFAULT NULL,
        \`pickup_buffer_mins\` INT DEFAULT 45,
        \`special_notes\` TEXT DEFAULT NULL,
        \`pricing_details\` LONGTEXT DEFAULT NULL,
        \`total_price\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        \`currency\` VARCHAR(10) NOT NULL DEFAULT 'GBP',
        \`payment_status\` ENUM('unpaid', 'completed', 'cancelled', 'refunded') NOT NULL DEFAULT 'unpaid',
        \`payment_method\` VARCHAR(50) DEFAULT NULL,
        \`stripe_payment_id\` VARCHAR(150) DEFAULT NULL,
        \`driver_id\` VARCHAR(50) DEFAULT NULL,
        \`booking_status\` ENUM('quoted', 'confirmed', 'assigned', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'quoted',
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_bookings_user_id\` (\`user_id\`),
        INDEX \`idx_bookings_status\` (\`booking_status\`),
        INDEX \`idx_bookings_payment\` (\`payment_status\`),
        INDEX \`idx_bookings_date\` (\`pickup_date\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    tablesCreated.push('bookings');

    // 4. Vehicles Fleet Table
    await dbQuery(`
      CREATE TABLE IF NOT EXISTS \`vehicles\` (
        \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,
        \`name\` VARCHAR(100) NOT NULL,
        \`category_name\` VARCHAR(100) NOT NULL,
        \`image\` VARCHAR(255) NOT NULL,
        \`passengers\` INT NOT NULL DEFAULT 4,
        \`suitcases\` INT NOT NULL DEFAULT 2,
        \`hand_luggage\` INT NOT NULL DEFAULT 2,
        \`description\` TEXT NOT NULL,
        \`features\` TEXT NOT NULL,
        \`multiplier\` DECIMAL(5, 2) NOT NULL DEFAULT 1.00,
        \`sample_vehicles\` VARCHAR(255) NOT NULL,
        \`is_active\` BOOLEAN NOT NULL DEFAULT TRUE,
        \`sort_order\` INT NOT NULL DEFAULT 0,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    tablesCreated.push('vehicles');

    // 5. System Settings Table
    await dbQuery(`
      CREATE TABLE IF NOT EXISTS \`system_settings\` (
        \`key_name\` VARCHAR(100) NOT NULL PRIMARY KEY,
        \`key_value\` TEXT NOT NULL,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    tablesCreated.push('system_settings');

    // 6. Contact Inquiries Table
    await dbQuery(`
      CREATE TABLE IF NOT EXISTS \`contact_inquiries\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(150) NOT NULL,
        \`email\` VARCHAR(150) NOT NULL,
        \`phone\` VARCHAR(50) DEFAULT NULL,
        \`subject\` VARCHAR(255) DEFAULT NULL,
        \`message\` TEXT NOT NULL,
        \`status\` ENUM('new', 'in_progress', 'resolved') NOT NULL DEFAULT 'new',
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    tablesCreated.push('contact_inquiries');

    // 7. Customer Reviews Table
    await dbQuery(`
      CREATE TABLE IF NOT EXISTS \`reviews\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`quote_ref\` VARCHAR(50) DEFAULT NULL,
        \`author_name\` VARCHAR(150) NOT NULL,
        \`route\` VARCHAR(255) DEFAULT NULL,
        \`rating\` INT NOT NULL DEFAULT 5,
        \`comment\` TEXT NOT NULL,
        \`is_approved\` BOOLEAN NOT NULL DEFAULT TRUE,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    tablesCreated.push('reviews');

    // 8. Partner Applications Table
    await dbQuery(`
      CREATE TABLE IF NOT EXISTS \`partner_applications\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`company_name\` VARCHAR(150) NOT NULL,
        \`contact_name\` VARCHAR(150) NOT NULL,
        \`email\` VARCHAR(150) NOT NULL,
        \`phone\` VARCHAR(50) DEFAULT NULL,
        \`partner_type\` VARCHAR(100) NOT NULL,
        \`fleet_size\` VARCHAR(50) DEFAULT NULL,
        \`message\` TEXT DEFAULT NULL,
        \`status\` ENUM('new', 'under_review', 'approved', 'rejected') NOT NULL DEFAULT 'new',
        \`admin_notes\` TEXT DEFAULT NULL,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_partner_status\` (\`status\`),
        INDEX \`idx_partner_email\` (\`email\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    tablesCreated.push('partner_applications');

    // Seed default admin user if none exists
    const adminCheck = await dbQuery<any[]>("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    if (!adminCheck || adminCheck.length === 0) {
      await dbQuery(
        `INSERT IGNORE INTO users (id, name, email, phone, password_hash, role, is_verified)
         VALUES (?, ?, ?, ?, ?, 'admin', 1)`,
        [
          'usr_admin_1',
          'QUICK CAR MIDLANDS LTD',
          'qcm023@gmail.com',
          '00447892609314',
          '$2b$10$7Lmgdocq8Nm78gEfTqSn7.2yfNZNpZbQk.V3mV3/p1awZ8Du3kZoK',
        ]
      );
      seededItems.push('Default Admin User (qcm023@gmail.com / admin)');
    }

    // Seed default chauffeur if drivers table is empty
    const driverCheck = await dbQuery<any[]>("SELECT id FROM drivers LIMIT 1");
    if (!driverCheck || driverCheck.length === 0) {
      await dbQuery(
        `INSERT IGNORE INTO users (id, name, email, phone, password_hash, role, is_verified)
         VALUES (?, ?, ?, ?, ?, 'driver', 1)`,
        [
          'usr_driver_1',
          'James Wilson (Executive Chauffeur)',
          'driver@quickcarmidlands.co.uk',
          '+44 7911 123456',
          '$2b$10$7Lmgdocq8Nm78gEfTqSn7.2yfNZNpZbQk.V3mV3/p1awZ8Du3kZoK',
        ]
      );
      await dbQuery(
        `INSERT IGNORE INTO drivers 
         (id, user_id, license_number, vehicle_model, vehicle_plate, vehicle_year, vehicle_category, verification_status, is_active, completion_score)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'approved', 1, 100)`,
        [
          'drv_1',
          'usr_driver_1',
          'PCO-984321',
          'Mercedes-Benz E-Class AMG Line',
          'LO71 ABC',
          '2023',
          'executive-saloon',
        ]
      );
      seededItems.push('Default Chauffeur (James Wilson - Mercedes LO71 ABC)');
    }

    // Seed default fleet vehicles if empty
    const vehicleCheck = await dbQuery<any[]>("SELECT id FROM vehicles LIMIT 1");
    if (!vehicleCheck || vehicleCheck.length === 0) {
      for (const v of DEFAULT_VEHICLE_FLEET) {
        await dbQuery(
          `INSERT IGNORE INTO vehicles 
           (id, name, category_name, image, passengers, suitcases, hand_luggage, description, features, multiplier, sample_vehicles, is_active, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            v.id,
            v.name,
            v.categoryName,
            v.image,
            v.passengers,
            v.suitcases,
            v.handLuggage,
            v.description,
            JSON.stringify(v.features),
            v.multiplier,
            v.sampleVehicles,
            v.isActive ? 1 : 0,
            v.sortOrder || 0,
          ]
        );
      }
      seededItems.push(`Default Vehicle Fleet (${DEFAULT_VEHICLE_FLEET.length} vehicle tiers)`);
    }

    // Seed default system & website settings
    const defaultSettings: [string, string][] = [
      ['brand_name', 'QUICK CAR MIDLANDS LTD'],
      ['brand_tagline', 'Airport Transfers & Private Hire | Based in Birmingham'],
      ['support_email', 'qcm023@gmail.com'],
      ['admin_email', 'qcm023@gmail.com'],
      ['support_phone', '01212433112'],
      ['emergency_whatsapp', '00447892609314'],
      ['office_address', 'Birmingham, West Midlands, United Kingdom'],
      ['account_name', 'QUICK CAR MIDLANDS LTD'],
      ['account_type', 'Business'],
      ['account_number', '50470328'],
      ['sort_code', '82-19-74'],
      ['bank_name', 'Clydesdale Bank / Virgin Money UK'],
      ['iban', 'GB91CLYD82197450470328'],
      ['bic', 'CLYDGB21974'],
      ['company_number', '12345678'],
      ['vat_number', 'GB 123 4567 89'],
      ['copyright_text', '© 2026 QUICK CAR MIDLANDS LTD. All Rights Reserved.'],
      ['primary_color', '#FFCC00'],
      ['primary_hover_color', '#E6B800'],
      ['secondary_color', '#141720'],
      ['require_email_verification', 'false'],
      ['require_driver_approval', 'true'],
    ];

    for (const [key, val] of defaultSettings) {
      await dbQuery(
        `INSERT INTO system_settings (key_name, key_value)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE key_value = VALUES(key_value)`,
        [key, val]
      );
    }
    seededItems.push('Official Business & Website Settings (QUICK CAR MIDLANDS LTD, 50470328, 82-19-74)');

    // Query all existing tables in database
    const existingTablesRows = await dbQuery<any[]>("SHOW TABLES");
    const existingTables: string[] = (existingTablesRows || []).map((r) => Object.values(r)[0] as string);

    return {
      success: true,
      message: 'Database schema and tables initialized successfully!',
      tablesCreated,
      existingTables,
      seededItems,
    };
  } catch (error: any) {
    console.error('initDatabaseSchema error:', error);
    return {
      success: false,
      message: `Failed to initialize schema: ${error.message}`,
      tablesCreated,
      existingTables: [],
      seededItems,
      error: error.message,
    };
  }
}
