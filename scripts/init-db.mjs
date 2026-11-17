import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDatabase() {
  console.log('🚀 Starting OTS Taxi MySQL Database Initialization...\n');

  const databaseUrl = process.env.DATABASE_URL;
  let host = process.env.MYSQL_HOST || '127.0.0.1';
  let port = process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306;
  let user = process.env.MYSQL_USER || 'root';
  let password = process.env.MYSQL_PASSWORD || '';
  let database = process.env.MYSQL_DATABASE || 'otstaxi_db';

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
  try {
    // 1. Connect without database to ensure DB can be created if needed
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true,
    });
    console.log('✅ Connected to MySQL server successfully!\n');
  } catch (err) {
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

  try {
    // 2. Read and run schema.sql
    const schemaPath = path.join(__dirname, '..', 'lib', 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log(`📦 Creating database "${database}" and tables from schema.sql...`);
    await connection.query(sql);
    console.log('✅ Database and all tables (users, drivers, bookings, contact_inquiries, reviews) created successfully!\n');

    // 3. Switch to target database
    await connection.query(`USE \`${database}\``);

    // 4. Seed or update initial default admin
    const adminHash = '$2a$10$tZ2c69e2zGg7d4zI4Q46ve013qgQ6Q1198f3kU4wJ61.F3qL7C5V.'; // Admin@123
    await connection.query(`
      INSERT INTO users (id, name, email, phone, password_hash, role)
      VALUES ('usr_admin_1', 'OTS Administrator', 'admin@otstaxi.co.uk', '+44 20 8123 4567', '${adminHash}', 'admin')
      ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = 'admin'
    `);
    console.log('✅ Admin user ready: admin@otstaxi.co.uk (Password: Admin@123)\n');

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
