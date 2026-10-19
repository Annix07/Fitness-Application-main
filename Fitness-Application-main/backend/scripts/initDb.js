import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function initDatabase() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'macropace_db';

  console.log(`Connecting to MySQL server at ${host}:${port}...`);

  let connection;
  try {
    // 1. Initial connection without database to ensure database exists
    connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`Database '${database}' ready.`);
    await connection.changeUser({ database });

    // 2. Create Users Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`name\` VARCHAR(100) NOT NULL,
        \`email\` VARCHAR(150) NOT NULL UNIQUE,
        \`password_hash\` VARCHAR(255) NOT NULL,
        \`role\` ENUM('user', 'admin', 'trainer') NOT NULL DEFAULT 'user',
        \`status\` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
        \`avatar_color\` VARCHAR(20) DEFAULT '#0284c7',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. Create Health Profiles Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`health_profiles\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`user_id\` VARCHAR(36) NOT NULL UNIQUE,
        \`age\` INT DEFAULT 26,
        \`gender\` ENUM('male', 'female', 'other') DEFAULT 'male',
        \`height_cm\` DECIMAL(5,2) DEFAULT 178.00,
        \`weight_kg\` DECIMAL(5,2) DEFAULT 71.00,
        \`activity_level\` VARCHAR(50) DEFAULT 'moderate',
        \`fitness_goal\` VARCHAR(50) DEFAULT 'muscle_gain',
        \`target_calories\` INT DEFAULT 2250,
        \`target_protein\` INT DEFAULT 150,
        \`target_carbs\` INT DEFAULT 200,
        \`target_fat\` INT DEFAULT 65,
        \`bmi\` DECIMAL(4,2) DEFAULT 22.40,
        \`bmi_category\` VARCHAR(50) DEFAULT 'Normal',
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Create Store Products Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`products\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`name\` VARCHAR(150) NOT NULL,
        \`category\` VARCHAR(50) NOT NULL,
        \`price\` DECIMAL(10,2) NOT NULL,
        \`stock\` INT NOT NULL DEFAULT 0,
        \`description\` TEXT,
        \`image_url\` VARCHAR(500),
        \`status\` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
        \`sales_count\` INT NOT NULL DEFAULT 0,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5. Create Orders Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`orders\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`user_id\` VARCHAR(36) NULL,
        \`customer_name\` VARCHAR(100) NOT NULL,
        \`customer_email\` VARCHAR(150) NOT NULL,
        \`total_amount\` DECIMAL(10,2) NOT NULL,
        \`status\` ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled') NOT NULL DEFAULT 'Pending',
        \`shipping_address\` TEXT NOT NULL,
        \`phone\` VARCHAR(30),
        \`payment_method\` VARCHAR(50) DEFAULT 'Credit Card',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 6. Create Order Items Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`order_items\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`order_id\` VARCHAR(36) NOT NULL,
        \`product_id\` VARCHAR(36) NULL,
        \`product_name\` VARCHAR(150) NOT NULL,
        \`price\` DECIMAL(10,2) NOT NULL,
        \`quantity\` INT NOT NULL DEFAULT 1,
        \`subtotal\` DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE CASCADE,
        FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 7. Create Meal Logs Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`meal_logs\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`user_id\` VARCHAR(36) NOT NULL,
        \`log_date\` DATE NOT NULL,
        \`meal_type\` ENUM('breakfast', 'lunch', 'dinner', 'snacks') NOT NULL,
        \`food_name\` VARCHAR(150) NOT NULL,
        \`quantity\` DECIMAL(6,2) NOT NULL DEFAULT 1.0,
        \`unit\` VARCHAR(50) DEFAULT 'serving',
        \`calories\` INT NOT NULL DEFAULT 0,
        \`protein\` DECIMAL(6,2) NOT NULL DEFAULT 0,
        \`carbs\` DECIMAL(6,2) NOT NULL DEFAULT 0,
        \`fat\` DECIMAL(6,2) NOT NULL DEFAULT 0,
        \`fiber\` DECIMAL(6,2) NOT NULL DEFAULT 0,
        \`log_time\` VARCHAR(20),
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 8. Create Workout Logs Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`workout_logs\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`user_id\` VARCHAR(36) NOT NULL,
        \`log_date\` DATE NOT NULL,
        \`title\` VARCHAR(100) NOT NULL,
        \`duration_mins\` INT DEFAULT 45,
        \`calories_burned\` INT DEFAULT 300,
        \`notes\` TEXT,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('All MySQL tables created successfully.');

    // 9. Seed Predefined Admin & Users
    const adminPasswordHash = await bcrypt.hash('admin@mp123', 10);
    const userPasswordHash = await bcrypt.hash('password123', 10);

    await connection.query(`
      INSERT INTO \`users\` (\`id\`, \`name\`, \`email\`, \`password_hash\`, \`role\`, \`status\`, \`avatar_color\`)
      VALUES 
        ('USR-ADMIN-001', 'Tirth Admin', 'tirth@macropace.in', ?, 'admin', 'Active', '#ea580c'),
        ('USR-101', 'Alex Morgan', 'alex@macropace.com', ?, 'user', 'Active', '#0284c7')
      ON DUPLICATE KEY UPDATE \`password_hash\` = VALUES(\`password_hash\`);
    `, [adminPasswordHash, userPasswordHash]);

    // Seed Health Profile for Alex
    await connection.query(`
      INSERT INTO \`health_profiles\` (\`user_id\`, \`age\`, \`gender\`, \`height_cm\`, \`weight_kg\`, \`fitness_goal\`, \`target_calories\`)
      VALUES ('USR-101', 26, 'male', 178.00, 71.00, 'muscle_gain', 2250)
      ON DUPLICATE KEY UPDATE \`age\` = VALUES(\`age\`);
    `);

    // Seed Products
    await connection.query(`
      INSERT INTO \`products\` (\`id\`, \`name\`, \`category\`, \`price\`, \`stock\`, \`description\`, \`image_url\`, \`status\`, \`sales_count\`)
      VALUES
        ('PRD-101', 'HydraWhey Isolate Protein 2kg', 'Supplements', 64.99, 45, 'Ultra-pure micro-filtered whey protein isolate with 27g protein per scoop.', 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=300&q=80', 'Active', 142),
        ('PRD-102', 'Pure Creatine Monohydrate 500g', 'Supplements', 29.99, 120, '100% micronized Creapure formula for explosive ATP muscular energy.', 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=300&q=80', 'Active', 218),
        ('PRD-103', 'Pro Grip Adjustable Dumbbells (Pair)', 'Equipment', 189.99, 8, 'Quick-dial selector mechanism from 2.5kg to 24kg per dumbbell.', 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=300&q=80', 'Active', 64),
        ('PRD-104', 'Pre-Workout Ignition Powder (Sour Apple)', 'Supplements', 39.99, 6, 'Clinical 6g L-Citrulline, 3.2g Beta-Alanine with natural caffeine kick.', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&q=80', 'Active', 89),
        ('PRD-105', 'Heavy Duty Pull-Up & Dip Tower', 'Equipment', 249.99, 14, 'Reinforced alloy steel multi-grip station for bodyweight training.', 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=300&q=80', 'Active', 31)
      ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`);
    `);

    // Seed Sample Orders
    await connection.query(`
      INSERT INTO \`orders\` (\`id\`, \`user_id\`, \`customer_name\`, \`customer_email\`, \`total_amount\`, \`status\`, \`shipping_address\`, \`phone\`, \`payment_method\`)
      VALUES
        ('ORD-9021', 'USR-101', 'Alex Morgan', 'alex@macropace.com', 94.98, 'Delivered', '120 Market St, San Francisco, CA', '+1 555-0199', 'Credit Card'),
        ('ORD-9022', NULL, 'Sarah Connor', 'sarah.c@sky.net', 189.99, 'Processing', '45 Ocean Dr, Santa Monica, CA', '+1 555-0182', 'PayPal'),
        ('ORD-9023', NULL, 'David Miller', 'david.m@apex.io', 64.99, 'Shipped', '78 Elm St, Austin, TX', '+1 555-0144', 'Credit Card')
      ON DUPLICATE KEY UPDATE \`customer_name\` = VALUES(\`customer_name\`);
    `);

    console.log('Database initialization & seed complete!');
  } catch (error) {
    console.error('Database Initialization Failed:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

initDatabase();
