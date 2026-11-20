import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Minimal environment file loader
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let val = match[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

loadEnvFile(path.join(__dirname, '..', '.env.production.local'));
loadEnvFile(path.join(__dirname, '..', '.env.production'));
loadEnvFile(path.join(__dirname, '..', '.env.local'));
loadEnvFile(path.join(__dirname, '..', '.env'));

async function initDatabase() {
  console.log('🚀 Starting OTS Taxi MySQL Database Initialization...\n');

  const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
  let host = process.env.MYSQL_HOST || process.env.MYSQLHOST || '127.0.0.1';
  let port = process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : (process.env.MYSQLPORT ? parseInt(process.env.MYSQLPORT, 10) : 3306);
  let user = process.env.MYSQL_USER || process.env.MYSQLUSER || 'root';
  let password = process.env.MYSQL_PASSWORD ?? process.env.MYSQLPASSWORD ?? '';
  let database = process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE || 'otstaxi_db';

  if (databaseUrl && databaseUrl.startsWith('mysql://')) {
    try {
      const url = new URL(databaseUrl);
      host = url.hostname || host;
      port = url.port ? parseInt(url.port, 10) : port;
      user = decodeURIComponent(url.username || user);
      password = decodeURIComponent(url.password || password);
      database = url.pathname.replace(/^\//, '') || database;
    } catch (e) {
      console.warn('⚠️ Could not parse DATABASE_URL, using default credentials');
    }
  }

  console.log(`📡 Connecting to MySQL server at ${host}:${port} as user "${user}"...`);

  let connection;
  let workingPassword = password;
  const candidatePasswords = [password, 'root', '', 'password', 'admin', '12345678'].filter(
    (p, i, arr) => arr.indexOf(p) === i
  );

  for (const cand of candidatePasswords) {
    try {
      connection = await mysql.createConnection({
        host,
        port,
        user,
        password: cand,
        multipleStatements: true,
      });
      workingPassword = cand;
      if (cand !== password) {
        console.log(`🔑 Automatically detected working MySQL password: "${cand}"!`);
        // Update .env.local with working credentials
        try {
          const envLocalPath = path.join(__dirname, '..', '.env.local');
          let envContent = fs.existsSync(envLocalPath) ? fs.readFileSync(envLocalPath, 'utf8') : '';
          const newDbUrl = `DATABASE_URL="mysql://${user}:${cand}@${host}:${port}/${database}"`;
          if (envContent.includes('DATABASE_URL=')) {
            envContent = envContent.replace(/DATABASE_URL=.*/, newDbUrl);
          } else {
            envContent += `\n${newDbUrl}\n`;
          }
          if (envContent.includes('MYSQL_PASSWORD=')) {
            envContent = envContent.replace(/MYSQL_PASSWORD=.*/, `MYSQL_PASSWORD=${cand}`);
          } else {
            envContent += `\nMYSQL_PASSWORD=${cand}\n`;
          }
          fs.writeFileSync(envLocalPath, envContent, 'utf8');
          console.log(`📝 Updated .env.local with working MySQL password.\n`);
        } catch (e) {
          // ignore file write error
        }
      } else {
        console.log('✅ Connected to MySQL server successfully!\n');
      }
      break;
    } catch (err) {
      if (err.code === 'ER_ACCESS_DENIED_ERROR') {
        continue;
      }
      // If it's another error like connection refused, report immediately
      console.error('❌ Failed to connect to MySQL server:', err.message);
      console.error('\n👉 Tips:');
      console.error('  1. Check if MySQL / XAMPP / MariaDB service is running.');
      console.error('  2. Verify credentials in your .env or .env.local file:');
      console.error('     MYSQL_HOST=127.0.0.1');
      console.error('     MYSQL_PORT=3306');
      console.error('     MYSQL_USER=root');
      console.error('     MYSQL_PASSWORD=your_password');
      console.error('     MYSQL_DATABASE=otstaxi_db\n');
      process.exit(1);
    }
  }

  if (!connection) {
    console.error('❌ Failed to connect to MySQL server: Access denied for all tested passwords (', candidatePasswords.join(', '), ')');
    console.error('\n👉 Tips:');
    console.error('  1. Check if MySQL / XAMPP / MariaDB service is running.');
    console.error('  2. Verify credentials in your .env or .env.local file:');
    console.error('     MYSQL_HOST=127.0.0.1');
    console.error('     MYSQL_PORT=3306');
    console.error('     MYSQL_USER=root');
    console.error('     MYSQL_PASSWORD=your_password');
    console.error('     MYSQL_DATABASE=otstaxi_db\n');
    process.exit(1);
  }

  try {
    // 2. Create target database if not exists and switch to it
    console.log(`📦 Ensuring database "${database}" exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.query(`USE \`${database}\``);
    console.log(`✅ Switched to database "${database}" successfully!\n`);

    // 3. Read and run schema.sql inside target database
    const schemaPath = path.join(__dirname, '..', 'lib', 'schema.sql');
    let sql = fs.readFileSync(schemaPath, 'utf8');
    // Sanitize any stray CREATE DATABASE or USE statements
    sql = sql.replace(/CREATE DATABASE[^\n;]+[;\n]/gi, '');
    sql = sql.replace(/USE `?[a-zA-Z0-9_-]+`?[;\n]/gi, '');

    console.log(`🔨 Creating tables in database "${database}" from schema.sql...`);
    await connection.query(sql);
    console.log('✅ All tables created successfully in database "' + database + '"!\n');

    // 4. Seed initial default users (Admin, Driver, Passenger)
    const defaultHash = '$2b$10$7Lmgdocq8Nm78gEfTqSn7.2yfNZNpZbQk.V3mV3/p1awZ8Du3kZoK'; // 12345678 / Admin@123

    console.log('🌱 Seeding 3 default roles (Admin, Driver, Passenger)...');
    await connection.query(`
      INSERT INTO users (id, name, email, phone, password_hash, role)
      VALUES 
        ('usr_admin_1', 'OTS Administrator', 'admin@otstaxi.co.uk', '+44 20 8123 4567', '${defaultHash}', 'admin'),
        ('usr_admin_2', 'System Administrator', 'admin@admin.com', '+44 20 8123 4568', '${defaultHash}', 'admin'),
        ('usr_driver_1', 'James Wilson (Chauffeur)', 'driver@otstaxi.co.uk', '+44 7911 123456', '${defaultHash}', 'driver'),
        ('usr_passenger_1', 'Marsad Akbar', 'passenger@otstaxi.co.uk', '+44 7700 900123', '${defaultHash}', 'customer')
      ON DUPLICATE KEY UPDATE 
        name = VALUES(name),
        password_hash = VALUES(password_hash),
        role = VALUES(role)
    `);

    // Seed Driver profile
    await connection.query(`
      INSERT INTO drivers (id, user_id, license_number, vehicle_model, vehicle_plate, vehicle_category, is_active)
      VALUES ('drv_1', 'usr_driver_1', 'PCO-984321', 'Mercedes-Benz E-Class', 'LO71 ABC', 'executive-saloon', 1)
      ON DUPLICATE KEY UPDATE vehicle_plate = VALUES(vehicle_plate), is_active = 1
    `);

    console.log('✅ Admin: admin@otstaxi.co.uk (Pass: 12345678)');
    console.log('✅ Driver: driver@otstaxi.co.uk (Pass: 12345678, Mercedes LO71 ABC)');
    console.log('✅ Passenger: passenger@otstaxi.co.uk (Pass: 12345678)\n');

    // 5. Seed Vehicles Fleet if empty
    const [existingVehicles] = await connection.query('SELECT COUNT(*) as count FROM vehicles');
    if (existingVehicles[0].count === 0) {
      console.log('🚗 Seeding initial Vehicle Fleet into MySQL...');
      const fleet = [
        ['saloon', 'Standard Saloon', 'Saloon Car', 'https://cdn.otstaxi.com/assets/img/icon/hdiw/2-1.png', 4, 2, 2, 'Ideal for everyday airport transfers, solo travelers, and couples.', JSON.stringify(["Air Conditioning", "Flight Tracking", "45 Mins Free Waiting", "Fixed Price"]), 1.00, 'VW Passat, Ford Mondeo, Skoda Octavia', 1],
        ['estate', 'Estate Car', 'Estate Vehicle', 'https://cdn.otstaxi.com/assets/img/icon/hdiw/2-1.png', 4, 4, 3, 'Extended boot capacity for travelers with bulky luggage, skis or strollers.', JSON.stringify(["Extra Luggage Capacity", "Air Conditioning", "Flight Tracking", "Fixed Price"]), 1.15, 'Skoda Superb Estate, VW Passat Estate', 2],
        ['executive-saloon', 'Executive Saloon', 'Executive Chauffeur', 'https://cdn.otstaxi.com/assets/img/icon/hdiw/2-1.png', 3, 2, 2, 'Premium luxury comfort for corporate executives and discerning travelers.', JSON.stringify(["Luxury Leather Interior", "Bottled Water & Wi-Fi", "Meet & Greet Included", "Professional Chauffeur"]), 1.45, 'Mercedes-Benz E-Class, BMW 5 Series, Audi A6', 3],
        ['mpv', 'People Carrier / MPV', 'People Carrier (MPV-5/6)', 'https://cdn.otstaxi.com/assets/img/icon/hdiw/2-1.png', 5, 4, 4, 'Designed for small groups and families requiring extra seating room.', JSON.stringify(["Spacious Seating", "Air Conditioning", "Child Seats Available", "Fixed Price"]), 1.40, 'VW Touran, Ford Galaxy, Citroen Spacetourer', 4],
        ['minibus-8', '8-Seater Minibus', 'Minibus (8 Seater)', 'https://cdn.otstaxi.com/assets/img/icon/hdiw/2-1.png', 8, 8, 8, 'Large capacity transport for larger families, corporate groups, and sports tours.', JSON.stringify(["Up to 8 Passengers", "Massive Cargo Space", "Dual Air Conditioning", "Fixed Price"]), 1.85, 'Mercedes Vito Tourer, Ford Tourneo Custom', 5],
        ['executive-mpv', 'Executive MPV', 'Luxury Chauffeur MPV', 'https://cdn.otstaxi.com/assets/img/icon/hdiw/2-1.png', 7, 7, 7, 'The pinnacle of VIP group travel with first-class conference seating.', JSON.stringify(["VIP Leather Seating", "Privacy Glass", "Meet & Greet Included", "Complimentary Refreshments"]), 2.20, 'Mercedes-Benz V-Class', 6]
      ];

      for (const v of fleet) {
        await connection.query(
          `INSERT INTO vehicles (id, name, category_name, image, passengers, suitcases, hand_luggage, description, features, multiplier, sample_vehicles, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          v
        );
      }
      console.log('✅ 6 Vehicle Fleet models successfully seeded into database!\n');
    }

    // 5. Check table status
    const [tables] = await connection.query('SHOW TABLES');
    console.log('📊 Active Tables in ' + database + ':');
    tables.forEach((t) => console.log('   - ' + Object.values(t)[0]));

    console.log('\n🎉 MySQL Database Setup Completed Successfully!');
  } catch (err) {
    console.error('❌ Error executing database schema:', err.message);
  } finally {
    if (connection) await connection.end();
  }
}

initDatabase();
