import mysql from 'mysql2/promise';
import '@/lib/env'; // Validate env vars at startup
import { products as initialProducts } from './data';

declare global {
  var _mysqlPool: mysql.Pool | undefined;
}

const pool = globalThis._mysqlPool || mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

if (process.env.NODE_ENV !== 'production') {
  globalThis._mysqlPool = pool;
}

let dbInitialized = false;

export async function initDB() {
  if (dbInitialized) return;
  const connection = await pool.getConnection();
  try {
    // Admin Roles
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        permissions JSON DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Migrate existing admin_users.role column from ENUM to VARCHAR
    try {
      await connection.query(`
        ALTER TABLE admin_users MODIFY COLUMN role VARCHAR(255) NOT NULL DEFAULT 'employee'
      `);
    } catch (e: any) {
      console.warn('[initDB] Failed to modify admin_users.role column:', e.message);
    }

    // Seed default roles if empty
    try {
      const [rolesCheck] = await connection.query('SELECT COUNT(*) as count FROM admin_roles');
      const rolesCount = (rolesCheck as any[])[0].count;
      if (rolesCount === 0) {
        await connection.query(
          "INSERT IGNORE INTO admin_roles (name, permissions) VALUES (?, ?), (?, ?)",
          [
            'employee', 
            JSON.stringify([]), 
            'sales', 
            JSON.stringify(['inquiries', 'sales', 'sales-team'])
          ]
        );
        console.log('[initDB] Seeded default roles: employee, sales');
      }
    } catch (e: any) {
      console.warn('[initDB] Failed to seed default roles:', e.message);
    }

    // Admin Users
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        mobile_number VARCHAR(20) DEFAULT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL DEFAULT 'employee',
        permissions JSON DEFAULT NULL,
        last_login TIMESTAMP NULL,
        failed_login_attempts INT DEFAULT 0,
        lockout_until TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Migrate existing admin_users table to add failed_login_attempts and lockout_until columns
    for (const ddl of [
      `ALTER TABLE admin_users ADD COLUMN failed_login_attempts INT DEFAULT 0`,
      `ALTER TABLE admin_users ADD COLUMN lockout_until TIMESTAMP NULL`,
    ]) {
      try { await connection.query(ddl); } catch (e: any) { if (e.code !== 'ER_DUP_FIELDNAME') throw e; }
    }

    // Admin Audit Logs
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admin_id INT NULL,
        admin_email VARCHAR(255) NULL,
        action VARCHAR(255) NOT NULL,
        details JSON DEFAULT NULL,
        ip_address VARCHAR(45) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed first admin from env vars if table is empty
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM admin_users');
    const count = (rows as Array<{ count: number }>)[0].count;
    if (count === 0 && process.env.ADMIN_INITIAL_USERNAME && process.env.ADMIN_INITIAL_PASSWORD) {
      const bcrypt = await import('bcryptjs');
      const hash = await bcrypt.hash(process.env.ADMIN_INITIAL_PASSWORD, 12);
      await connection.query(
        'INSERT INTO admin_users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['Superadmin', process.env.ADMIN_INITIAL_USERNAME, hash, 'superadmin']
      );
      console.log(`[initDB] Seeded initial admin user: ${process.env.ADMIN_INITIAL_USERNAME}`);
    }

    // Contact Messages
    await connection.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        subject VARCHAR(255),
        message TEXT NOT NULL,
        status ENUM('new','in_progress','resolved','closed','spam') NOT NULL DEFAULT 'new',
        lead_status ENUM('new_lead','contacted','qualified','proposal_sent','converted','lost','not_a_lead') NOT NULL DEFAULT 'new_lead',
        priority ENUM('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
        is_read TINYINT(1) NOT NULL DEFAULT 0,
        notes TEXT NULL,
        assigned_to VARCHAR(255) NULL,
        follow_up_date DATE NULL,
        tags VARCHAR(500) NULL,
        gstin VARCHAR(15) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    // Migrate existing contact_messages table (safe, idempotent — ER_DUP_FIELDNAME ignored)
    for (const ddl of [
      `ALTER TABLE contact_messages ADD COLUMN status ENUM('new','in_progress','resolved','closed','spam') NOT NULL DEFAULT 'new'`,
      `ALTER TABLE contact_messages ADD COLUMN lead_status ENUM('new_lead','contacted','qualified','proposal_sent','converted','lost','not_a_lead') NOT NULL DEFAULT 'new_lead'`,
      `ALTER TABLE contact_messages ADD COLUMN priority ENUM('low','medium','high','urgent') NOT NULL DEFAULT 'medium'`,
      `ALTER TABLE contact_messages ADD COLUMN is_read TINYINT(1) NOT NULL DEFAULT 0`,
      `ALTER TABLE contact_messages ADD COLUMN notes TEXT NULL`,
      `ALTER TABLE contact_messages ADD COLUMN assigned_to VARCHAR(255) NULL`,
      `ALTER TABLE contact_messages ADD COLUMN follow_up_date DATE NULL`,
      `ALTER TABLE contact_messages ADD COLUMN tags VARCHAR(500) NULL`,
      `ALTER TABLE contact_messages ADD COLUMN gstin VARCHAR(15) DEFAULT NULL`,
    ]) {
      try { await connection.query(ddl); } catch (e: any) { if (e.code !== 'ER_DUP_FIELDNAME') throw e; }
    }

     // Inquiries
    await connection.query(`
      CREATE TABLE IF NOT EXISTS inquiries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        subject VARCHAR(255),
        message TEXT NOT NULL,
        ai_category VARCHAR(100),
        ai_intent VARCHAR(100),
        status ENUM('new','in_progress','resolved','closed','spam','enquiry_generation','follow_up','wants_to_meet','meeting_done','quotation_sent','quotation_followup','order_confirmed','delivery_in_progress','delivered') NOT NULL DEFAULT 'enquiry_generation',
        agreed_price DECIMAL(10,2) NULL,
        delivered_at TIMESTAMP NULL,
        meeting_date DATE NULL,
        meeting_time VARCHAR(20) NULL,
        meeting_type ENUM('office', 'custom') NULL,
        meeting_location TEXT NULL,
        gstin VARCHAR(15) DEFAULT NULL,
        quote_number VARCHAR(100) DEFAULT NULL,
        latitude DECIMAL(10, 8) NULL,
        longitude DECIMAL(11, 8) NULL,
        location_accuracy DECIMAL(10, 2) NULL,
        logged_by_name VARCHAR(255) NULL,
        logged_by_email VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    // Migrate existing inquiries table to add AI triage columns (safe, idempotent)
    // Note: ADD COLUMN IF NOT EXISTS is MariaDB syntax; use try/catch for MySQL 8.x compatibility
    for (const ddl of [
      `ALTER TABLE inquiries ADD COLUMN ai_category VARCHAR(100)`,
      `ALTER TABLE inquiries ADD COLUMN ai_urgency ENUM('critical', 'high', 'medium', 'low')`,
      `ALTER TABLE inquiries ADD COLUMN ai_intent VARCHAR(100)`,
      `ALTER TABLE inquiries MODIFY COLUMN status ENUM('new','in_progress','resolved','closed','spam','enquiry_generation','follow_up','wants_to_meet','meeting_done','quotation_sent','quotation_followup','order_confirmed','delivery_in_progress','delivered') NOT NULL DEFAULT 'enquiry_generation'`,
      `ALTER TABLE inquiries ADD COLUMN agreed_price DECIMAL(10,2) NULL`,
      `ALTER TABLE inquiries ADD COLUMN delivered_at TIMESTAMP NULL`,
      `ALTER TABLE inquiries ADD COLUMN meeting_date DATE NULL`,
      `ALTER TABLE inquiries ADD COLUMN meeting_time VARCHAR(20) NULL`,
      `ALTER TABLE inquiries ADD COLUMN meeting_type ENUM('office', 'custom') NULL`,
      `ALTER TABLE inquiries ADD COLUMN meeting_location TEXT NULL`,
      `ALTER TABLE inquiries ADD COLUMN client_id INT DEFAULT NULL`,
      `ALTER TABLE inquiries ADD COLUMN gstin VARCHAR(15) DEFAULT NULL`,
      `ALTER TABLE inquiries ADD COLUMN quote_number VARCHAR(100) DEFAULT NULL`,
      `ALTER TABLE inquiries ADD COLUMN latitude DECIMAL(10, 8) NULL`,
      `ALTER TABLE inquiries ADD COLUMN longitude DECIMAL(11, 8) NULL`,
      `ALTER TABLE inquiries ADD COLUMN location_accuracy DECIMAL(10, 2) NULL`,
      `ALTER TABLE inquiries ADD COLUMN logged_by_name VARCHAR(255) NULL`,
      `ALTER TABLE inquiries ADD COLUMN logged_by_email VARCHAR(255) NULL`,
    ]) {
      try { await connection.query(ddl); } catch (e: any) { if (e.code !== 'ER_DUP_FIELDNAME') throw e; }
    }
    // Migrate old statuses to new CRM statuses
    await connection.query(`UPDATE inquiries SET status = 'enquiry_generation' WHERE status = 'new'`);
    await connection.query(`UPDATE inquiries SET status = 'follow_up' WHERE status = 'in_progress'`);
    await connection.query(`UPDATE inquiries SET status = 'delivered' WHERE status = 'resolved'`);
    await connection.query(`UPDATE inquiries SET delivered_at = COALESCE(delivered_at, created_at) WHERE status = 'delivered' AND agreed_price IS NOT NULL AND delivered_at IS NULL`);

    // Orders
    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        firstName VARCHAR(255) NOT NULL,
        lastName VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        products TEXT,
        total DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Registrations
    await connection.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        firstName VARCHAR(255) NOT NULL,
        lastName VARCHAR(255) NOT NULL,
        phone VARCHAR(20) UNIQUE,
        gstin VARCHAR(15) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    // Migrate existing registrations table
    for (const ddl of [
      `ALTER TABLE registrations ADD COLUMN gstin VARCHAR(15) DEFAULT NULL`
    ]) {
      try { await connection.query(ddl); } catch (e: any) { if (e.code !== 'ER_DUP_FIELDNAME') throw e; }
    }

    // Product Inquiries
    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_inquiries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(255),
        product_name VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(255),
        message TEXT NOT NULL,
        status ENUM('new','in_progress','resolved','closed','spam','enquiry_generation','follow_up','wants_to_meet','meeting_done','quotation_sent','quotation_followup','order_confirmed','delivery_in_progress','delivered') NOT NULL DEFAULT 'enquiry_generation',
        agreed_price DECIMAL(10,2) NULL,
        delivered_at TIMESTAMP NULL,
        meeting_date DATE NULL,
        meeting_time VARCHAR(20) NULL,
        meeting_type ENUM('office', 'custom') NULL,
        meeting_location TEXT NULL,
        gstin VARCHAR(15) DEFAULT NULL,
        quote_number VARCHAR(100) DEFAULT NULL,
        latitude DECIMAL(10, 8) NULL,
        longitude DECIMAL(11, 8) NULL,
        location_accuracy DECIMAL(10, 2) NULL,
        logged_by_name VARCHAR(255) NULL,
        logged_by_email VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Migrate existing product_inquiries table
    for (const ddl of [
      `ALTER TABLE product_inquiries MODIFY COLUMN status ENUM('new','in_progress','resolved','closed','spam','enquiry_generation','follow_up','wants_to_meet','meeting_done','quotation_sent','quotation_followup','order_confirmed','delivery_in_progress','delivered') NOT NULL DEFAULT 'enquiry_generation'`,
      `ALTER TABLE product_inquiries ADD COLUMN agreed_price DECIMAL(10,2) NULL`,
      `ALTER TABLE product_inquiries ADD COLUMN delivered_at TIMESTAMP NULL`,
      `ALTER TABLE product_inquiries ADD COLUMN meeting_date DATE NULL`,
      `ALTER TABLE product_inquiries ADD COLUMN meeting_time VARCHAR(20) NULL`,
      `ALTER TABLE product_inquiries ADD COLUMN meeting_type ENUM('office', 'custom') NULL`,
      `ALTER TABLE product_inquiries ADD COLUMN meeting_location TEXT NULL`,
      `ALTER TABLE product_inquiries ADD COLUMN client_id INT DEFAULT NULL`,
      `ALTER TABLE product_inquiries ADD COLUMN gstin VARCHAR(15) DEFAULT NULL`,
      `ALTER TABLE product_inquiries ADD COLUMN quote_number VARCHAR(100) DEFAULT NULL`,
      `ALTER TABLE product_inquiries ADD COLUMN latitude DECIMAL(10, 8) NULL`,
      `ALTER TABLE product_inquiries ADD COLUMN longitude DECIMAL(11, 8) NULL`,
      `ALTER TABLE product_inquiries ADD COLUMN location_accuracy DECIMAL(10, 2) NULL`,
      `ALTER TABLE product_inquiries ADD COLUMN logged_by_name VARCHAR(255) NULL`,
      `ALTER TABLE product_inquiries ADD COLUMN logged_by_email VARCHAR(255) NULL`,
    ]) {
      try { await connection.query(ddl); } catch (e: any) { if (e.code !== 'ER_DUP_FIELDNAME') throw e; }
    }
    // Migrate old statuses to new CRM statuses
    await connection.query(`UPDATE product_inquiries SET status = 'enquiry_generation' WHERE status = 'new'`);
    await connection.query(`UPDATE product_inquiries SET status = 'follow_up' WHERE status = 'in_progress'`);
    await connection.query(`UPDATE product_inquiries SET status = 'delivered' WHERE status = 'resolved'`);
    await connection.query(`UPDATE product_inquiries SET delivered_at = COALESCE(delivered_at, created_at) WHERE status = 'delivered' AND agreed_price IS NOT NULL AND delivered_at IS NULL`);

    // Clients
    await connection.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        pincode VARCHAR(20),
        company_name VARCHAR(255),
        notes TEXT,
        gstin VARCHAR(15) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Migrate clients table
    for (const ddl of [
      `ALTER TABLE clients ADD COLUMN gstin VARCHAR(15) DEFAULT NULL`,
    ]) {
      try { await connection.query(ddl); } catch (e: any) { if (e.code !== 'ER_DUP_FIELDNAME') throw e; }
    }

    // Client Products (purchased product lifecycle per client)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS client_products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_id INT NOT NULL,
        product_id VARCHAR(255),
        product_name VARCHAR(255) NOT NULL,
        serial_number VARCHAR(255),
        batch_number VARCHAR(100),
        purchase_date DATE,
        install_date DATE,
        warranty_end_date DATE,
        next_service_date DATE,
        notes TEXT,
        price DECIMAL(10, 2) DEFAULT NULL,
        qty INT DEFAULT 1,
        hsn_code VARCHAR(50) DEFAULT NULL,
        sac_code VARCHAR(50) DEFAULT NULL,
        quote_number VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Migrate existing client_products table (safe, idempotent)
    for (const ddl of [
      `ALTER TABLE client_products ADD COLUMN price DECIMAL(10, 2) DEFAULT NULL`,
      `ALTER TABLE client_products ADD COLUMN qty INT DEFAULT 1`,
      `ALTER TABLE client_products ADD COLUMN hsn_code VARCHAR(50) DEFAULT NULL`,
      `ALTER TABLE client_products ADD COLUMN sac_code VARCHAR(50) DEFAULT NULL`,
      `ALTER TABLE client_products ADD COLUMN quote_number VARCHAR(255) DEFAULT NULL`,
    ]) {
      try { await connection.query(ddl); } catch (e: any) { if (e.code !== 'ER_DUP_FIELDNAME' && e.code !== 'ER_DUP_COLUMNNAME') throw e; }
    }

    // AMC Plans
    await connection.query(`
      CREATE TABLE IF NOT EXISTS amc_plans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        duration_months INT NOT NULL,
        coverage_description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        service_interval_days INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Client AMC (links client_products to amc_plans)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS client_amc (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_product_id INT NOT NULL,
        amc_plan_id INT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status ENUM('active', 'expired', 'renewed') NOT NULL DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Client Portal Users (one portal account per client)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS client_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_id INT NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
        reset_token_hash VARCHAR(255),
        reset_token_expires TIMESTAMP NULL,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Client Behavior Events (append-only analytics log)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS client_events (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        client_id INT NOT NULL,
        event_type ENUM('view', 'search') NOT NULL,
        entity_id VARCHAR(255),
        query VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_ce_client (client_id),
        INDEX idx_ce_type (event_type),
        INDEX idx_ce_entity (entity_id),
        INDEX idx_ce_ts (created_at)
      )
    `);

    // Vendors
    await connection.query(`
      CREATE TABLE IF NOT EXISTS vendors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        contact_person VARCHAR(255),
        phone VARCHAR(20),
        email VARCHAR(255),
        address TEXT,
        brand ENUM('V-Guard', 'Zero B', 'Wilo', 'Bluewave India', 'Other'),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Product Pricing
    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_pricing (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(255) NOT NULL UNIQUE,
        dp_price DECIMAL(10,2),
        mrp_price DECIMAL(10,2),
        notes TEXT,
        description LONGTEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    try { await connection.query(`ALTER TABLE product_pricing MODIFY COLUMN description LONGTEXT`); } catch (e: any) { if (e.code !== 'ER_DUP_FIELDNAME') throw e; }
    const [pricingProductIdColumns] = await connection.query(`SHOW FULL COLUMNS FROM product_pricing WHERE Field = 'product_id'`);
    const pricingProductIdColumn = (pricingProductIdColumns as Array<{ Collation?: string }>)[0];
    if (pricingProductIdColumn?.Collation !== 'utf8mb4_general_ci') {
      await connection.query(`
        ALTER TABLE product_pricing
        MODIFY COLUMN product_id VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL
      `);
    }

    // Sales Team
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sales_team (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(255),
        role ENUM('sales_person', 'manager') NOT NULL DEFAULT 'sales_person',
        status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Sales Records
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sales_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sales_team_id INT NOT NULL,
        client_id INT,
        product_id VARCHAR(255) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        unit_price_sold DECIMAL(10,2) NOT NULL,
        dp_price_at_sale DECIMAL(10,2),
        mrp_price_at_sale DECIMAL(10,2),
        notes TEXT,
        sale_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Sales Attendance
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sales_attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        check_in_time TIMESTAMP NULL,
        check_out_time TIMESTAMP NULL,
        check_in_latitude DECIMAL(10, 8) NULL,
        check_in_longitude DECIMAL(11, 8) NULL,
        check_in_accuracy DECIMAL(10, 2) NULL,
        check_in_ip VARCHAR(45) NULL,
        check_in_method ENUM('gps', 'ip') NULL,
        check_out_latitude DECIMAL(10, 8) NULL,
        check_out_longitude DECIMAL(11, 8) NULL,
        check_out_accuracy DECIMAL(10, 2) NULL,
        check_out_ip VARCHAR(45) NULL,
        check_out_method ENUM('gps', 'ip') NULL,
        check_in_address VARCHAR(500) NULL,
        check_out_address VARCHAR(500) NULL,
        work_duration_minutes INT NULL,
        status ENUM('checked_in', 'completed') NOT NULL DEFAULT 'checked_in',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
      )
    `);

    // Marketing Visits
    await connection.query(`
      CREATE TABLE IF NOT EXISTS marketing_visits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        attendance_id INT NULL,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        location_accuracy DECIMAL(10, 2) NULL,
        location_method ENUM('gps', 'ip') NOT NULL DEFAULT 'gps',
        visit_title VARCHAR(255) NOT NULL,
        notes TEXT NULL,
        image_url VARCHAR(500) NOT NULL,
        visit_address VARCHAR(500) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE,
        FOREIGN KEY (attendance_id) REFERENCES sales_attendance(id) ON DELETE CASCADE
      )
    `);

    // Run migrations to add columns on existing tables
    try {
      await connection.query(`ALTER TABLE sales_attendance ADD COLUMN check_in_address VARCHAR(500) NULL`);
    } catch (_) {}
    try {
      await connection.query(`ALTER TABLE sales_attendance ADD COLUMN check_out_address VARCHAR(500) NULL`);
    } catch (_) {}
    try {
      await connection.query(`ALTER TABLE marketing_visits ADD COLUMN visit_address VARCHAR(500) NULL`);
    } catch (_) {}

    // Case Studies
    await connection.query(`
      CREATE TABLE IF NOT EXISTS case_studies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        summary TEXT,
        description LONGTEXT,
        category VARCHAR(100),
        client_name VARCHAR(255),
        location_name VARCHAR(255),
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        cover_image VARCHAR(500),
        images JSON,
        status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Testimonials
    await connection.query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(255),
        location VARCHAR(255),
        rating TINYINT NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
        text TEXT NOT NULL,
        image_url VARCHAR(500),
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        display_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Site Settings
    await connection.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        \`key\` VARCHAR(100) NOT NULL UNIQUE,
        value TEXT,
        label VARCHAR(255),
        \`group\` ENUM('hero', 'contact', 'footer', 'general') NOT NULL DEFAULT 'general',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    // Seed site_settings with hardcoded values (INSERT IGNORE = skip if key already exists)
    const siteSettingsSeeds = [
      { key: 'established_year', value: '2015',             label: 'Established Year', group: 'hero' },
      { key: 'total_clients',    value: '1000+',            label: 'Total Clients',    group: 'hero' },
      { key: 'units_installed',  value: '5000+',            label: 'Units Installed',  group: 'hero' },
      { key: 'industry_sectors', value: '10+',              label: 'Industry Sectors', group: 'hero' },
      { key: 'home_hero_badge', value: 'Avegatasta Jal-Urja Solutions - Nashik', label: 'Home Hero Badge', group: 'general' },
      { key: 'home_hero_title', value: '<span class="whitespace-nowrap">Enterprise Water,</span><br/><span class="text-accent-400 whitespace-nowrap">Energy & Pool</span><br/>Solutions', label: 'Home Hero Title HTML', group: 'general' },
      { key: 'home_hero_content', value: 'Authorized channel partner for V-Guard, Wilo, Zero B, and Bluewave India. End-to-end B2B solutions - water heating, pumping, treatment, solar, and swimming pool systems - for industrial, commercial, and large-scale residential projects across Nashik.', label: 'Home Hero Content', group: 'general' },
      { key: 'home_hero_image_1', value: '/hero/solar-field.jpg', label: 'Home Hero Image 1', group: 'general' },
      { key: 'home_hero_image_2', value: '/hero/water-pump.png', label: 'Home Hero Image 2', group: 'general' },
      { key: 'home_hero_image_3', value: '/hero/partner-team.jpg', label: 'Home Hero Image 3', group: 'general' },
      { key: 'home_hero_image_4', value: '/hero/water-solutions.jpg', label: 'Home Hero Image 4', group: 'general' },
      { key: 'home_hero_image_1_label', value: 'Solar', label: 'Home Hero Image 1 Label', group: 'general' },
      { key: 'home_hero_image_2_label', value: 'Pumping', label: 'Home Hero Image 2 Label', group: 'general' },
      { key: 'home_hero_image_3_label', value: 'Partner', label: 'Home Hero Image 3 Label', group: 'general' },
      { key: 'home_hero_image_4_label', value: 'Water', label: 'Home Hero Image 4 Label', group: 'general' },
      { key: 'home_primary_button_text', value: 'Explore Products', label: 'Home Primary Button Text', group: 'general' },
      { key: 'home_primary_button_url', value: '/products', label: 'Home Primary Button URL', group: 'general' },
      { key: 'home_secondary_button_text', value: 'Get Free Advice', label: 'Home Secondary Button Text', group: 'general' },
      { key: 'home_secondary_button_url', value: '/contact', label: 'Home Secondary Button URL', group: 'general' },
      { key: 'home_trust_strip_text', value: 'Enterprise-grade products - B2B project specialists - Multi-sector experience', label: 'Home Trust Strip Text', group: 'general' },
      { key: 'home_why_eyebrow', value: 'Why Choose Us', label: 'Home Why Eyebrow', group: 'general' },
      { key: 'home_why_title', value: 'Your Enterprise\nSolutions Partner', label: 'Home Why Title', group: 'general' },
      { key: 'home_why_benefits', value: JSON.stringify([
        'Authorized partner for V-Guard, Wilo, Zero B & Bluewave India',
        'End-to-end B2B project delivery - supply, install, and support',
        'Serving industrial, commercial, hospitality, and residential sectors',
        'Swimming pool equipment and chemical solutions via Bluewave India',
        'Bulk procurement and enterprise project management capabilities',
        'Energy-efficient systems with certified after-sales service',
      ]), label: 'Home Why Benefits (JSON)', group: 'general' },
      { key: 'home_why_image_1', value: 'https://images.unsplash.com/photo-1581093806997-124204d9fa9d?auto=format&fit=crop&q=80&w=800&h=450', label: 'Home Why Image 1', group: 'general' },
      { key: 'home_why_image_2', value: '/about/b2b-services.jpg', label: 'Home Why Image 2', group: 'general' },
      { key: 'home_enterprise_eyebrow', value: 'Enterprise & Bulk Projects', label: 'Home Enterprise Eyebrow', group: 'general' },
      { key: 'home_enterprise_title', value: "Powering India's", label: 'Home Enterprise Title', group: 'general' },
      { key: 'home_enterprise_highlight', value: 'Enterprises', label: 'Home Enterprise Highlight', group: 'general' },
      { key: 'home_enterprise_copy', value: 'From a single commercial building to an entire industrial estate - Avegatasta delivers end-to-end B2B project execution with authorised equipment, certified installation, and dedicated after-sales support across every major sector.', label: 'Home Enterprise Copy', group: 'general' },
      { key: 'home_enterprise_image', value: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=700&h=875', label: 'Home Enterprise Image', group: 'general' },
      { key: 'home_enterprise_button_text', value: 'Explore Enterprise Solutions', label: 'Home Enterprise Button Text', group: 'general' },
      { key: 'projects_hero_eyebrow', value: 'Projects & Installations', label: 'Projects Hero Eyebrow', group: 'general' },
      { key: 'projects_hero_title', value: 'Proven Solutions.', label: 'Projects Hero Title', group: 'general' },
      { key: 'projects_hero_highlight', value: 'Successful Installations.', label: 'Projects Hero Highlight', group: 'general' },
      { key: 'projects_hero_copy_1', value: 'At Avegatasta Solution, we take pride in delivering reliable and efficient solutions for water heating, pumping systems, water treatment, and solar energy projects. Our experienced team ensures professional installation, system optimization, and long-term performance for every project we undertake.', label: 'Projects Hero Copy 1', group: 'general' },
      { key: 'projects_hero_copy_2', value: 'We work with trusted brands such as V-Guard, Wilo, and Zero B from Ion Exchange (India) Ltd., ensuring high-quality systems and dependable results.', label: 'Projects Hero Copy 2', group: 'general' },
      { key: 'projects_installation_types', value: JSON.stringify([
        { id: 'solar', title: 'Solar System Installations', intro: 'We design and install on-grid solar power systems for residential and commercial customers. Our team manages the entire process from system planning to installation and commissioning.' },
        { id: 'water-heating', title: 'Water Heating System Installations', intro: 'We install modern water heating systems that deliver efficient hot water solutions for various applications.' },
        { id: 'pumping', title: 'Pumping System Installations', intro: 'Our team installs advanced pumping systems designed for efficient water pressure management and water distribution.' },
        { id: 'water-treatment', title: 'Water Treatment Installations', intro: 'We provide professional installation of water treatment systems to ensure clean and safe water for both utility and drinking purposes.' },
      ]), label: 'Projects Installation Types (JSON)', group: 'general' },
      { key: 'projects_process_eyebrow', value: 'How We Work', label: 'Projects Process Eyebrow', group: 'general' },
      { key: 'projects_process_title', value: 'A structured installation process from start to support', label: 'Projects Process Title', group: 'general' },
      { key: 'projects_process_copy', value: 'Every project is planned with technical clarity, professional execution, and dependable after-sales service.', label: 'Projects Process Copy', group: 'general' },
      { key: 'projects_process_steps', value: JSON.stringify([
        'Site inspection and requirement analysis',
        'System design and product selection',
        'Professional installation by trained technicians',
        'Testing and system commissioning',
        'Customer guidance and after-sales support',
      ]), label: 'Projects Process Steps (JSON)', group: 'general' },
      { key: 'projects_trust_eyebrow', value: 'Why Customers Trust Us', label: 'Projects Trust Eyebrow', group: 'general' },
      { key: 'projects_trust_title', value: 'Trusted execution for water and energy infrastructure', label: 'Projects Trust Title', group: 'general' },
      { key: 'projects_trust_copy', value: 'From system selection to commissioning, Avegatasta focuses on delivering reliable performance, clean installation work, and long-term service value.', label: 'Projects Trust Copy', group: 'general' },
      { key: 'projects_trust_items', value: JSON.stringify([
        'Experienced installation team',
        'Trusted technology from leading brands',
        'Customized solutions for every project',
        'Reliable service and technical support',
      ]), label: 'Projects Trust Items (JSON)', group: 'general' },
      { key: 'enterprise_hero_badge', value: 'Enterprise & Bulk Projects - Nashik', label: 'Enterprise Hero Badge', group: 'general' },
      { key: 'enterprise_hero_title', value: 'Infrastructure-Scale', label: 'Enterprise Hero Title', group: 'general' },
      { key: 'enterprise_hero_highlight', value: 'Water, Energy', label: 'Enterprise Hero Highlight', group: 'general' },
      { key: 'enterprise_hero_copy', value: 'End-to-end B2B project delivery for industrial, commercial, and institutional clients across Nashik. Authorized supply, certified installation, and dedicated after-sales support from a single trusted partner.', label: 'Enterprise Hero Copy', group: 'general' },
      { key: 'enterprise_hero_image', value: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=900&h=675', label: 'Enterprise Hero Image', group: 'general' },
      { key: 'enterprise_primary_button_text', value: 'Submit Enterprise Enquiry', label: 'Enterprise Primary Button Text', group: 'general' },
      { key: 'enterprise_secondary_button_text', value: 'Talk to Our Team', label: 'Enterprise Secondary Button Text', group: 'general' },
      { key: 'enterprise_trust_text', value: 'V-Guard - Wilo - Zero B - Bluewave India - authorized channel partner', label: 'Enterprise Trust Text', group: 'general' },
      { key: 'enterprise_stats', value: JSON.stringify([
        { value: '10+', label: 'Years in Business' },
        { value: '1,000+', label: 'Corporate Clients' },
        { value: '5,000+', label: 'Units Installed' },
        { value: '10+', label: 'Industry Sectors' },
      ]), label: 'Enterprise Stats (JSON)', group: 'general' },
      { key: 'enterprise_client_eyebrow', value: 'Who We Serve', label: 'Enterprise Client Eyebrow', group: 'general' },
      { key: 'enterprise_client_title', value: 'Built for Every', label: 'Enterprise Client Title', group: 'general' },
      { key: 'enterprise_client_highlight', value: 'Enterprise Sector', label: 'Enterprise Client Highlight', group: 'general' },
      { key: 'enterprise_client_copy', value: 'From a single commercial building to a multi-site industrial estate, our B2B solutions are scoped and delivered to match the demands of your sector.', label: 'Enterprise Client Copy', group: 'general' },
      { key: 'enterprise_client_types', value: JSON.stringify([
        { label: 'Industrial', description: 'Large-scale pumping systems, water treatment plants, and solar on-grid installations for factories, industrial estates, and manufacturing units.' },
        { label: 'Hospitality', description: 'Heat pump water heaters, complete swimming pool setups, and bulk chemical supply for hotels, resorts, and service apartments.' },
        { label: 'Commercial', description: 'Booster pump systems, water purifiers, softeners, and energy systems for office buildings, malls, and commercial complexes.' },
        { label: 'Aquatics', description: 'Full-spectrum pool solutions via Bluewave India - filtration equipment, pool chemicals, and ongoing supply contracts.' },
        { label: 'Institutional', description: 'Reliable water and energy infrastructure for schools, hospitals, housing societies, and government projects in Nashik.' },
      ]), label: 'Enterprise Client Types (JSON)', group: 'general' },
      { key: 'enterprise_deliverables_eyebrow', value: 'What We Deliver', label: 'Enterprise Deliverables Eyebrow', group: 'general' },
      { key: 'enterprise_deliverables_title', value: 'Full-Cycle', label: 'Enterprise Deliverables Title', group: 'general' },
      { key: 'enterprise_deliverables_copy', value: 'We handle every stage - from initial scoping to post-installation support - so your project stays on schedule and on budget.', label: 'Enterprise Deliverables Copy', group: 'general' },
      { key: 'enterprise_deliverables', value: JSON.stringify([
        { title: 'Site Assessment & Scoping', body: 'Our team visits your site to evaluate load requirements, infrastructure fit, and optimal product selection - at no cost for Nashik projects.' },
        { title: 'Authorized Equipment Supply', body: 'Factory-fresh stock from V-Guard, Wilo, Zero B, and Bluewave India with full manufacturer warranty on every unit.' },
        { title: 'Certified Installation', body: 'End-to-end installation by trained technicians - from civil prep to commissioning - with safety compliance documentation.' },
        { title: 'Energy & Performance Audits', body: 'Post-install efficiency checks and energy reports to help your project meet sustainability targets and reduce operating costs.' },
        { title: 'After-Sales & AMC', body: 'Dedicated support contracts, spare parts availability, and priority service response for all enterprise accounts.' },
      ]), label: 'Enterprise Deliverables (JSON)', group: 'general' },
      { key: 'enterprise_why_items', value: JSON.stringify([
        'Authorized channel partner for V-Guard, Wilo, Zero B & Bluewave India',
        'Single-vendor B2B project delivery - supply, install, and support',
        'Bulk procurement pricing and flexible payment terms for large orders',
        'Dedicated project manager for every enterprise engagement',
        'Proven track record across 10+ industry sectors in Nashik',
        'Certified technicians with manufacturer-endorsed training',
        'Fast turnaround on site visits and formal project quotations',
      ]), label: 'Enterprise Why Items (JSON)', group: 'general' },
      { key: 'enterprise_why_image', value: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=800&h=1000', label: 'Enterprise Why Image', group: 'general' },
      { key: 'company_phone',    value: '+919689881369',    label: 'Company Phone',    group: 'contact' },
      { key: 'company_email',    value: 'sales@avegatasta.com', label: 'Company Email', group: 'contact' },
      { key: 'company_address',  value: 'Avegatasta Solution, Nashik, Maharashtra', label: 'Company Address', group: 'contact' },
      { key: 'whatsapp_number', value: '',                label: 'WhatsApp Number',        group: 'contact' },
      { key: 'google_maps_url', value: '',                label: 'Google Maps Embed URL',  group: 'contact' },
      { key: 'social_linkedin', value: '',                label: 'LinkedIn URL',           group: 'contact' },
      { key: 'social_instagram',value: '',                label: 'Instagram URL',          group: 'contact' },
      { key: 'social_facebook', value: '',                label: 'Facebook URL',           group: 'contact' },
      { key: 'about_why_choose',value: '["Authorized partner for trusted brands like V-Guard, Wilo, and Zero B","Professional installation and technical support","Energy-efficient and cost-effective systems","Customized solutions for residential and commercial projects","Reliable service and maintenance support"]', label: 'About Why Choose Us (JSON)', group: 'general' },
      { key: 'about_hero_eyebrow', value: 'About Us - Avegatasta Solution', label: 'About Hero Eyebrow', group: 'general' },
      { key: 'about_hero_title', value: 'Your Trusted Partner for Water & Energy Solutions', label: 'About Hero Title', group: 'general' },
      { key: 'about_what_eyebrow', value: 'What We Do', label: 'About What We Do Eyebrow', group: 'general' },
      { key: 'about_what_title', value: 'Complete Solutions for Modern Requirements', label: 'About What We Do Title', group: 'general' },
      { key: 'about_what_description', value: 'At Avegatasta Solution, we offer complete solutions that address modern water and energy requirements. From efficient water heating systems to advanced water purification and solar power generation, our services are designed to deliver long-term value and sustainability.', label: 'About What We Do Description', group: 'general' },
      { key: 'about_service_cards', value: JSON.stringify([
        { title: 'Water Heating Solutions', description: 'We provide modern water heating technologies, including the latest heat pump water heater models and comprehensive solar water heater installation. As a leading solar water heater supplier, we offer energy efficient water heater solutions and commercial heat pump water heater systems suitable for homes, hotels, hospitals, and commercial facilities.', icon: 'Droplets' },
        { title: 'Pumping Solutions', description: 'Our pumping solutions ensure smooth water flow, stable pressure, and efficient water distribution. We specialize in water pressure pump installation and provide robust booster pump system for buildings. As a trusted Wilo pump dealer and inline water pump supplier, we deliver reliable water transfer pump system setups for residential and industrial environments.', icon: 'Waves' },
        { title: 'Water Treatment Systems', description: 'We offer advanced utility water treatment and drinking water purification. Our services include water softener installation, whole house water filter setups, and expert RO water purifier installation. As a certified Zero B water purifier dealer and UV water purifier supplier, we ensure safe and high-quality water for your property.', icon: 'ShieldCheck' },
        { title: 'Solar On-Grid Power Systems', description: 'We design and execute professional solar system installation, including on grid solar system installation and commercial solar installation. If you are looking for solar panel installation near me or a solar power system for home, our experts can help, offering scalable solutions like 3kW solar system installation to reduce dependence on conventional power sources.', icon: 'Sun' },
      ]), label: 'About Service Cards (JSON)', group: 'general' },
      { key: 'about_mission_title', value: 'Our Mission', label: 'About Mission Title', group: 'general' },
      { key: 'about_vision_title', value: 'Our Vision', label: 'About Vision Title', group: 'general' },
      { key: 'about_why_image', value: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200&h=1200', label: 'About Why Choose Image', group: 'general' },
      { key: 'about_why_image_alt', value: 'Modern Home with Solar Panels', label: 'About Why Choose Image Alt', group: 'general' },
      { key: 'about_why_eyebrow', value: 'Why Choose Us', label: 'About Why Choose Eyebrow', group: 'general' },
      { key: 'about_why_title', value: 'Why Choose Avegatasta Solution', label: 'About Why Choose Title', group: 'general' },
      { key: 'about_quote', value: '"We believe in building long-term relationships with our customers by providing trusted products, expert guidance, and dependable service."', label: 'About Quote', group: 'general' },
      { key: 'contact_hero_background_image', value: 'https://images.unsplash.com/photo-1541944743827-e04aa6427c33?auto=format&fit=crop&q=80&w=1920&h=1080&blur=10', label: 'Contact Hero Background Image', group: 'general' },
      { key: 'contact_hero_eyebrow', value: 'Contact Us - Avegatasta Solution', label: 'Contact Hero Eyebrow', group: 'general' },
      { key: 'contact_hero_title', value: 'Get in Touch with', label: 'Contact Hero Title', group: 'general' },
      { key: 'contact_hero_highlight', value: 'Our Experts', label: 'Contact Hero Highlight', group: 'general' },
      { key: 'contact_hero_copy', value: 'At Avegatasta Solution, we are committed to providing reliable support and expert guidance for all your water heating, pumping, water treatment, and solar energy needs. Whether you are planning a new installation or looking for the right solution for your home or business, our team is here to help.', label: 'Contact Hero Copy', group: 'general' },
      { key: 'contact_hero_button_label', value: 'Request a Consultation', label: 'Contact Hero Button Label', group: 'general' },
      { key: 'contact_call_label', value: 'Call us directly', label: 'Contact Call Label', group: 'general' },
      { key: 'company_working_days', value: 'Monday - Saturday', label: 'Company Working Days', group: 'contact' },
      { key: 'company_working_hours', value: '9:30 AM - 6:30 PM', label: 'Company Working Hours', group: 'contact' },
      { key: 'company_address_short', value: 'Nashik, Maharashtra', label: 'Company Short Address', group: 'contact' },
      { key: 'contact_form_eyebrow', value: 'Request a Consultation', label: 'Contact Form Eyebrow', group: 'general' },
      { key: 'contact_form_title', value: 'Planning a new installation?', label: 'Contact Form Title', group: 'general' },
      { key: 'contact_form_highlight', value: 'Let our experts help.', label: 'Contact Form Highlight', group: 'general' },
      { key: 'contact_form_copy', value: 'If you are planning a solar installation, water heating system, pump installation, or water purification solution, our experts can help you choose the right system based on your requirements. Send us your enquiry and our team will contact you with the best solution and quotation.', label: 'Contact Form Copy', group: 'general' },
      { key: 'contact_solutions_title', value: 'Our Solutions', label: 'Contact Solutions Title', group: 'general' },
      { key: 'contact_solutions_copy', value: 'We provide professional consultation and installation services for:', label: 'Contact Solutions Copy', group: 'general' },
      { key: 'contact_solution_items', value: '["Water Heating Solutions","Pumping Solutions","Water Treatment Solutions","Solar On-Grid Systems"]', label: 'Contact Solution Items (JSON)', group: 'general' },
      { key: 'contact_trusted_title', value: 'Trusted Brands', label: 'Contact Trusted Brands Title', group: 'general' },
      { key: 'contact_trusted_copy', value: 'Our solutions are supported by trusted brands such as V-Guard, Wilo, and Zero B from Ion Exchange (India) Ltd.', label: 'Contact Trusted Brands Copy', group: 'general' },
      { key: 'contact_success_title', value: 'Message Received!', label: 'Contact Success Title', group: 'general' },
      { key: 'contact_success_copy', value: 'Our team will contact you soon.', label: 'Contact Success Copy', group: 'general' },
      { key: 'contact_success_button_label', value: 'Send Another Message', label: 'Contact Success Button Label', group: 'general' },
      { key: 'contact_faq_eyebrow', value: 'Common Questions', label: 'Contact FAQ Eyebrow', group: 'general' },
      { key: 'contact_faq_title', value: 'Frequently Asked Questions', label: 'Contact FAQ Title', group: 'general' },
      { key: 'contact_faqs', value: JSON.stringify([
        { question: 'How long does installation take?', answer: 'Most domestic pump and water purifier installations are completed within 4-6 hours. Larger solar or industrial systems may take 1-2 days depending on the complexity.' },
        { question: 'Do you provide after-sales service?', answer: 'Yes, we are authorized service providers for all brands we sell. We offer both on-call repairs and annual maintenance contracts (AMC).' },
        { question: 'What is the warranty period?', answer: 'Warranty varies by product and brand. Typically, V-Guard and Zero B products come with a 1-year comprehensive warranty, while some pump motors have up to 2 years.' },
        { question: 'Do you offer free site visits?', answer: 'For solar water heaters and industrial pumping solutions, we provide free site surveys within Nashik city limits to ensure the right product selection.' },
      ]), label: 'Contact FAQs (JSON)', group: 'general' },
      { key: 'contact_map_title', value: 'Visit our Visitors Area', label: 'Contact Map Title', group: 'general' },
      { key: 'contact_map_copy', value: 'Experience our range of V-Guard, Wilo, and Zero B products in person. Our technical staff is available for live demonstrations.', label: 'Contact Map Copy', group: 'general' },
      { key: 'contact_map_background_image', value: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200&h=800&blur=2', label: 'Contact Map Background Image', group: 'general' },
      { key: 'contact_map_card_title', value: 'Avegatasta Visitors Area', label: 'Contact Map Card Title', group: 'general' },
      { key: 'contact_map_card_copy', value: 'Click below to view our exact location on Google Maps.', label: 'Contact Map Card Copy', group: 'general' },
      { key: 'contact_map_button_label', value: 'Open Maps', label: 'Contact Map Button Label', group: 'general' },
      { key: 'contact_directions_label', value: 'Get Driving Directions', label: 'Contact Directions Label', group: 'general' },
      { key: 'footer_logo_image', value: '/logo.webp', label: 'Footer Logo Image', group: 'general' },
      { key: 'footer_brand_description', value: 'Authorized distributor of V-Guard, Zero B, and Wilo water solutions. Premium heat pumps, pumps, and water treatment for homes and industries across Nashik.', label: 'Footer Brand Description', group: 'general' },
      { key: 'footer_product_links', value: JSON.stringify([
        { name: 'Water Heating Solutions', href: '/products/water-heating-solutions' },
        { name: 'Pumping Solutions', href: '/products/pumping-solutions' },
        { name: 'Water Treatment Solutions', href: '/products/water-treatment-solutions' },
        { name: 'Swimming Pool Solutions', href: '/products/swimming-pool-solutions' },
        { name: 'Solar Power Systems', href: '/products/solar-power-systems' },
      ]), label: 'Footer Product Links (JSON)', group: 'general' },
      { key: 'footer_quick_links', value: JSON.stringify([
        { name: 'Home', href: '/' },
        { name: 'Products', href: '/products' },
        { name: 'Services', href: '/services' },
        { name: 'Projects', href: '/projects' },
        { name: 'Enterprise', href: '/enterprise' },
        { name: 'About Us', href: '/about' },
        { name: 'Contact', href: '/contact' },
      ]), label: 'Footer Quick Links (JSON)', group: 'general' },
      { key: 'footer_distributor_label', value: 'Authorized Distributor', label: 'Footer Distributor Label', group: 'general' },
      { key: 'footer_distributor_brands', value: '["V-Guard","Zero B","Wilo","Bluewave"]', label: 'Footer Distributor Brands (JSON)', group: 'general' },
      { key: 'footer_copyright_name', value: 'Avegatasta Jal Urja Solutions', label: 'Footer Copyright Name', group: 'general' },
      { key: 'footer_map_link_label', value: 'View on Google Maps', label: 'Footer Map Link Label', group: 'general' },
      { key: 'footer_legal_links', value: JSON.stringify([
        { name: 'Privacy Policy', href: '/privacy-policy' },
        { name: 'Terms of Service', href: '/terms-of-service' },
        { name: 'Cookies', href: '/cookies' },
        { name: 'Sitemap', href: '/sitemap' },
      ]), label: 'Footer Legal Links (JSON)', group: 'general' },
      { key: 'services_hero_eyebrow', value: 'Our Services', label: 'Services Hero Eyebrow', group: 'general' },
      { key: 'services_hero_title', value: 'Professional Water & Energy Solutions', label: 'Services Hero Title', group: 'general' },
      { key: 'services_hero_copy', value: 'Avegatasta Solution provides comprehensive services for residential, commercial, and industrial projects. Our experienced team ensures professional installation and reliable service support across all our offerings.', label: 'Services Hero Copy', group: 'general' },
      { key: 'services_installation_hero_eyebrow', value: 'Installation Services', label: 'Services Installation Hero Eyebrow', group: 'general' },
      { key: 'services_installation_hero_title', value: 'Heat Pump Installation Service Nashik', label: 'Services Installation Hero Title', group: 'general' },
      { key: 'services_installation_hero_copy', value: 'Avegatasta provides heat pump installation service Nashik support for homes, hotels, hospitals and commercial projects, along with solar water heater, water purifier and pumping system installation coordination.', label: 'Services Installation Hero Copy', group: 'general' },
      { key: 'services_areas_title', value: 'Service Areas', label: 'Services Areas Title', group: 'general' },
      { key: 'services_areas_copy', value: 'We provide specialized services for various sectors including:', label: 'Services Areas Copy', group: 'general' },
      { key: 'services_areas_items', value: '["Apartments and Villas","Hotels and Hospitals","Commercial Buildings","Industrial Facilities"]', label: 'Services Areas Items (JSON)', group: 'general' },
      { key: 'services_why_title', value: 'Why Choose Avegatasta Solution', label: 'Services Why Choose Title', group: 'general' },
      { key: 'services_contact_button_label', value: 'Contact Us', label: 'Services Contact Button Label', group: 'general' },
      // Integrations / tracking — managed from Admin → Site Settings → Integrations.
      // analytics_enabled defaults to 'false' so trackers stay OFF until explicitly
      // enabled (e.g. disabled on staging/UAT). gtm_id/meta_pixel_id are seeded with
      // the production IDs but only load when analytics_enabled is 'true'.
      { key: 'analytics_enabled',   value: 'false',            label: 'Enable Analytics (GTM & Meta Pixel)', group: 'general' },
      { key: 'gtm_id',              value: 'GTM-KRLD5J4P',     label: 'Google Tag Manager Container ID',     group: 'general' },
      { key: 'meta_pixel_id',       value: '1105969235067039', label: 'Meta Pixel ID',                       group: 'general' },
      { key: 'google_maps_api_key', value: '',                 label: 'Google Maps API Key (server-side)',   group: 'general' },
      { key: 'bank_account_name', value: 'AVEGATASTA SOLUTION', label: 'Bank Account Name', group: 'general' },
      { key: 'bank_account_no',   value: '04750500009935',     label: 'Bank Account Number', group: 'general' },
      { key: 'bank_ifsc',         value: 'BARB0NASIKR',        label: 'Bank IFSC Code', group: 'general' },
      { key: 'bank_name',         value: 'Bank of Baroda',     label: 'Bank Name', group: 'general' },
      { key: 'bank_branch',       value: 'Nashik Road',        label: 'Bank Branch', group: 'general' },
      { key: 'bank_accounts',     value: JSON.stringify([
        {
          id: 'bank_default_seed',
          bankName: 'Bank of Baroda',
          branch: 'Nashik Road',
          accountName: 'AVEGATASTA SOLUTION',
          accountNo: '04750500009935',
          ifsc: 'BARB0NASIKR',
          isPrimary: true
        }
      ]), label: 'Bank Accounts (JSON)', group: 'general' },
    ];
    for (const s of siteSettingsSeeds) {
      await connection.query(
        'INSERT IGNORE INTO site_settings (`key`, value, label, `group`) VALUES (?, ?, ?, ?)',
        [s.key, s.value, s.label, s.group]
      );
    }
    // Migrate existing social settings group from 'footer' to 'contact'
    await connection.query(
      "UPDATE site_settings SET `group` = 'contact' WHERE `key` IN ('social_linkedin', 'social_instagram', 'social_facebook')"
    );

    // About Content
    await connection.query(`
      CREATE TABLE IF NOT EXISTS about_content (
        id INT AUTO_INCREMENT PRIMARY KEY,
        section ENUM('mission', 'vision', 'company_intro') NOT NULL UNIQUE,
        content TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    // Seed about_content
    const aboutSeeds = [
      {
        section: 'mission',
        content: 'Our mission is to provide efficient, sustainable, and reliable water and energy solutions that enhance everyday living while supporting environmentally responsible practices.',
      },
      {
        section: 'vision',
        content: 'To become a trusted leader in water and renewable energy solutions by delivering innovative technologies, dependable service, and customer-focused solutions.',
      },
      {
        section: 'company_intro',
        content: 'Avegatasta Solution is a reliable provider of advanced water heating, pumping systems, water treatment, and solar energy solutions for residential, commercial, and industrial customers. Our goal is to deliver high-quality, energy-efficient solutions that improve everyday comfort while reducing energy and water management costs. We are proud to be an official channel partner of trusted industry brands such as V-Guard, Wilo, and Zero B from Ion Exchange (India) Ltd.',
      },
    ];
    for (const a of aboutSeeds) {
      await connection.query(
        'INSERT IGNORE INTO about_content (section, content) VALUES (?, ?)',
        [a.section, a.content]
      );
    }

    // Services
    await connection.query(`
      CREATE TABLE IF NOT EXISTS services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(255) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        subtitle VARCHAR(500),
        icon_name VARCHAR(100),
        intro LONGTEXT,
        why_choose JSON,
        cta_title VARCHAR(255),
        cta_desc TEXT,
        display_order INT NOT NULL DEFAULT 0,
        is_active TINYINT(1) NOT NULL DEFAULT 1
      )
    `);

    // Service Categories
    await connection.query(`
      CREATE TABLE IF NOT EXISTS service_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        service_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        display_order INT NOT NULL DEFAULT 0
      )
    `);

    // Service Category Lists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS service_category_lists (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT NOT NULL,
        list_title VARCHAR(255) NOT NULL,
        items JSON NOT NULL,
        display_order INT NOT NULL DEFAULT 0
      )
    `);

    // Seed services with hardcoded data from ServicesPageClient.tsx
    type ServiceCategoryList = { title: string; items: string[] };
    type ServiceCategory     = { name: string; desc: string; lists: ServiceCategoryList[] };
    type ServiceSeed = {
      slug: string; title: string; subtitle: string; icon_name: string;
      intro: string; whyChoose: string[]; ctaTitle: string; ctaDesc: string;
      display_order: number; categories: ServiceCategory[];
    };
    const serviceSeeds: ServiceSeed[] = [
      {
        slug: 'water-heating',
        title: 'Water Heating Solutions',
        subtitle: 'Energy-Efficient Water Heating Solutions',
        icon_name: 'Droplets',
        intro: 'Avegatasta Solution provides advanced water heating systems designed for homes, commercial buildings, and industrial facilities. Our solutions focus on energy efficiency, reliability, and long-term performance while ensuring a consistent hot water supply.\n\nWe offer modern heating technologies from trusted brands such as V-Guard, helping customers reduce electricity consumption and operating costs. As a leading solar water heater supplier, we ensure you get the best energy efficient water heater for your needs.',
        whyChoose: [
          'Authorized partner for V-Guard products',
          'Professional installation and technical support',
          'Energy-efficient and cost-effective systems',
          'Customized solutions for residential and commercial projects',
          'Reliable service and maintenance support',
        ],
        ctaTitle: 'Get the Right Water Heating Solution',
        ctaDesc: 'Choosing the right water heating system depends on factors such as usage, building size, and energy requirements. Our experts help you select the most suitable system for your property.\nContact Avegatasta Solution today for consultation, installation, and support for modern water heating systems.',
        display_order: 1,
        categories: [
          {
            name: 'Heat Pump Water Heaters',
            desc: 'Heat pump water heaters use ambient air to heat water, making them one of the most energy-efficient hot water solutions available today. These systems consume significantly less electricity compared to traditional water heaters and are ideal for large hot water requirements. We offer top-tier heat pump water heater models and commercial heat pump water heater systems.',
            lists: [
              { title: 'Applications', items: ['Residential homes and villas', 'Hotels and resorts', 'Hospitals', 'Commercial buildings', 'Swimming pools'] },
              { title: 'Types Available', items: ['Domestic Heat Pump Systems', 'Commercial Heat Pump Systems', 'Swimming Pool Heat Pumps'] },
              { title: 'Benefits', items: ['Up to 70% energy savings', 'Eco-friendly technology', 'Reliable hot water supply', 'Low operating cost'] },
            ],
          },
          {
            name: 'Solar Water Heaters – Tru Hot Series',
            desc: 'Solar water heaters use sunlight to generate hot water, making them an environmentally friendly and cost-effective solution. The Tru Hot Series solar systems from V-Guard are designed for durability, high efficiency, and long service life. We provide professional solar water heater installation to maximize your savings.',
            lists: [
              { title: 'Key Advantages', items: ['Significant reduction in electricity bills', 'Sustainable energy solution', 'Minimal maintenance', 'Long-lasting performance'] },
              { title: 'Suitable For', items: ['Individual homes', 'Apartments', 'Hotels', 'Hostels', 'Commercial establishments'] },
            ],
          },
          {
            name: 'Electric Water Heaters (Geysers)',
            desc: 'Electric water heaters provide instant or storage-based hot water solutions for daily household and commercial use. Modern geysers are designed for safety, energy efficiency, and durability.',
            lists: [
              { title: 'Applications', items: ['Residential apartments', 'Villas', 'Offices', 'Restaurants', 'Small commercial facilities'] },
            ],
          },
        ],
      },
      {
        slug: 'pumping-systems',
        title: 'Pumping Solutions',
        subtitle: 'Advanced Water Pump Solutions for Reliable Water Supply',
        icon_name: 'Waves',
        intro: 'Avegatasta Solution provides high-performance water pumping systems designed to ensure efficient water flow, stable pressure, and reliable water distribution for residential, commercial, and industrial applications.\n\nOur pumping solutions are powered by globally trusted technology from Wilo, a leading manufacturer of advanced pumping systems known for energy efficiency and long-lasting performance. We are a certified Wilo pump dealer.',
        whyChoose: [
          'Authorized solutions partner for Wilo pumping systems',
          'High-efficiency and durable pump technologies',
          'Professional installation and technical support',
          'Reliable performance for residential and commercial applications',
        ],
        ctaTitle: 'Get the Right Pumping Solution',
        ctaDesc: 'Our team ensures proper system selection and installation to achieve optimal water pressure and efficient water management.\nChoosing the right pumping system is essential for maintaining efficient water supply and pressure. Our experts will help you select the best pump based on your building requirements and water demand.\nContact Avegatasta Solution for professional guidance and installation of advanced pumping systems.',
        display_order: 2,
        categories: [
          {
            name: 'Pressure Pumps',
            desc: 'Pressure pumps are designed to increase water pressure in buildings where the supply pressure is low. These pumps ensure smooth and consistent water flow across all outlets. We offer expert water pressure pump installation.',
            lists: [
              { title: 'Applications', items: ['Residential apartments', 'Villas', 'Hotels and guest houses', 'Commercial buildings'] },
              { title: 'Benefits', items: ['Stable water pressure', 'Automatic operation', 'Energy-efficient performance'] },
            ],
          },
          {
            name: 'Booster Pump Systems',
            desc: 'Booster pump systems maintain constant water pressure in large buildings and multi-storey structures. These systems are commonly used where water demand is high. We design and install the perfect booster pump system for buildings.',
            lists: [
              { title: 'Applications', items: ['High-rise residential buildings', 'Hospitals', 'Shopping malls', 'Office complexes'] },
              { title: 'Advantages', items: ['Consistent water pressure across floors', 'High reliability', 'Suitable for large water demand systems'] },
            ],
          },
          {
            name: 'Inline Pumps',
            desc: 'Inline pumps are installed directly within the pipeline to maintain water flow and circulation without the need for additional space. As a premier inline water pump supplier, we ensure top-quality products.',
            lists: [
              { title: 'Applications', items: ['HVAC circulation systems', 'Commercial buildings', 'Industrial water circulation'] },
              { title: 'Benefits', items: ['Compact installation', 'Efficient water flow management', 'Low maintenance requirements'] },
            ],
          },
          {
            name: 'Return Line Pumps',
            desc: 'Return line pumps circulate hot water through pipelines so that hot water is instantly available at outlets. These pumps are commonly used in centralized hot water systems.',
            lists: [
              { title: 'Applications', items: ['Hotels and resorts', 'Hospitals', 'Centralized hot water systems', 'Large residential buildings'] },
            ],
          },
          {
            name: 'Water Transfer Pumps',
            desc: 'Water transfer pumps are used to move water from one storage location to another, such as from underground tanks to overhead tanks. We provide robust water transfer pump system solutions.',
            lists: [
              { title: 'Applications', items: ['Borewell water transfer', 'Tank filling systems', 'Industrial water supply', 'Agricultural water transfer'] },
            ],
          },
        ],
      },
      {
        slug: 'water-treatment',
        title: 'Water Treatment Solutions',
        subtitle: 'Advanced Water Treatment for Homes and Businesses',
        icon_name: 'ShieldCheck',
        intro: 'Avegatasta Solution provides modern water treatment systems designed to improve water quality for residential, commercial, and industrial use. Our solutions ensure clean, safe, and reliable water for everyday applications.\n\nWe offer advanced water purification technologies from Zero B, a trusted brand of Ion Exchange (India) Ltd., known globally for its expertise in water and environmental management solutions. We are your local Zero B water purifier dealer.',
        whyChoose: [
          'Authorized partner for Zero B water purification systems',
          'Advanced purification technologies',
          'Reliable installation and service support',
          'Solutions for residential, commercial, and institutional applications',
        ],
        ctaTitle: 'Get Clean and Safe Water',
        ctaDesc: 'Our team helps customers choose the most suitable water treatment system based on their water quality and usage requirements.\nWhether you need utility water treatment or drinking water purification, Avegatasta Solution provides reliable and efficient systems designed to deliver safe and high-quality water.\nContact our team today to find the right water treatment solution for your home or business.',
        display_order: 3,
        categories: [
          {
            name: 'Utility Water Treatment Solutions',
            desc: 'Utility water treatment focuses on improving water quality used for daily household and commercial purposes such as bathing, washing, and equipment operation.',
            lists: [],
          },
          {
            name: 'Water Softeners',
            desc: 'Hard water contains minerals like calcium and magnesium that can cause scaling in pipes and appliances. Water softeners use ion-exchange technology to remove these minerals and improve water quality. We specialize in professional water softener installation.',
            lists: [
              { title: 'Benefits', items: ['Prevents scale formation in pipelines', 'Extends the life of appliances like geysers and washing machines', 'Improves soap and detergent efficiency', 'Protects plumbing systems'] },
              { title: 'Applications', items: ['Homes and apartments', 'Hotels and hospitals', 'Commercial buildings', 'Industrial facilities'] },
            ],
          },
          {
            name: 'Water Filtration Systems',
            desc: 'Water filtration systems remove suspended particles, sediments, and impurities from water before it is used in homes or commercial environments. We can set up a complete whole house water filter system for you.',
            lists: [
              { title: 'Benefits', items: ['Improves water clarity', 'Protects plumbing systems', 'Acts as pre-treatment for purification systems', 'Enhances overall water quality'] },
              { title: 'Applications', items: ['Residential water supply', 'Commercial properties', 'Industrial processes'] },
            ],
          },
          {
            name: 'Drinking Water Treatment Solutions',
            desc: 'Safe drinking water is essential for health and wellbeing. Avegatasta Solution offers advanced purification technologies that remove contaminants and ensure safe drinking water.',
            lists: [],
          },
          {
            name: 'RO Water Purifiers',
            desc: 'Reverse Osmosis (RO) systems remove dissolved salts, heavy metals, chemicals, and harmful contaminants from water using a semi-permeable membrane. Contact us for expert RO water purifier installation.',
            lists: [
              { title: 'Advantages', items: ['High purification efficiency', 'Removes dissolved impurities and heavy metals', 'Improves taste and odor of water'] },
            ],
          },
          {
            name: 'UV Water Purification',
            desc: 'UV purification uses ultraviolet light to disinfect water and eliminate bacteria and microorganisms without using chemicals. We are a trusted UV water purifier supplier.',
            lists: [
              { title: 'Benefits', items: ['Effective microbial disinfection', 'Chemical-free purification process', 'Maintains natural taste of water'] },
            ],
          },
        ],
      },
      {
        slug: 'solar-systems',
        title: 'Solar On-Grid Systems',
        subtitle: 'Smart Solar Energy Solutions for Homes & Businesses',
        icon_name: 'Sun',
        intro: 'Avegatasta Solution provides complete solar on-grid systems designed to help homes and businesses generate clean electricity while reducing dependence on conventional power sources. Our solar solutions are reliable, energy-efficient, and designed for long-term performance. If you need solar panel installation near me, we are your go-to experts.\n\nWe work with trusted technologies from V-Guard to deliver high-quality solar systems that maximize energy generation and cost savings.\n\nWhat is an On-Grid Solar System?\nAn on-grid solar system is connected directly to the local electricity grid. The solar panels generate electricity during the day, which can be used for your home or business. Any excess power produced can be exported to the grid depending on local net-metering policies.\nThis type of system helps reduce electricity bills while using renewable energy.',
        whyChoose: [
          'Authorized partner for V-Guard solar solutions',
          'Complete solar installation services',
          'Customized system design based on energy needs',
          'Professional installation and technical support',
        ],
        ctaTitle: 'Start Your Solar Journey Today',
        ctaDesc: 'Our team ensures proper system design and installation to maximize solar energy generation and long-term reliability.\nSwitch to solar energy and reduce your electricity costs with a reliable on-grid solar system.\nContact Avegatasta Solution today to get expert consultation and a customized solar solution for your home or business.',
        display_order: 4,
        categories: [
          {
            name: 'Solar Panels',
            desc: 'Solar panels convert sunlight into electricity using photovoltaic (PV) technology. High-efficiency solar panels ensure maximum energy generation even in varying sunlight conditions.',
            lists: [
              { title: 'Benefits', items: ['Clean renewable energy', 'Long lifespan and durability', 'Low maintenance'] },
            ],
          },
          {
            name: 'Solar Inverters',
            desc: 'Solar inverters convert the DC electricity produced by solar panels into usable AC electricity for homes and commercial buildings.',
            lists: [
              { title: 'Features', items: ['Efficient power conversion', 'Smart monitoring options', 'Reliable performance'] },
            ],
          },
          {
            name: 'Complete Solar On-Grid Systems',
            desc: 'Avegatasta Solution provides complete solar system installation, including design, supply, installation, and technical support. We handle everything from 3kW solar system installation to large-scale commercial solar installation and on grid solar system installation.',
            lists: [
              { title: 'System Capacities Available', items: ['3 kW Solar Systems', '5 kW Solar Systems', '10 kW Solar Systems', '20 kW Solar Systems', 'Up to 100 kW systems for commercial and industrial applications'] },
              { title: 'Applications of Solar On-Grid Systems', items: ['Residential homes and villas (Solar power system for home)', 'Apartment buildings', 'Commercial offices', 'Hotels and hospitals', 'Industrial facilities'] },
              { title: 'Benefits of Installing Solar Power', items: ['Significant reduction in electricity bills', 'Clean and renewable energy source', 'Low maintenance and long lifespan', 'Increased property value', 'Supports environmental sustainability'] },
            ],
          },
        ],
      },
    ];

    for (const svc of serviceSeeds) {
      const [existing] = await connection.query(
        'SELECT id FROM services WHERE slug = ?',
        [svc.slug]
      ) as [Array<{ id: number }>, unknown];

      let serviceId: number;
      if (existing.length > 0) {
        serviceId = existing[0].id;
      } else {
        const [result] = await connection.query(
          `INSERT INTO services (slug, title, subtitle, icon_name, intro, why_choose, cta_title, cta_desc, display_order, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          [svc.slug, svc.title, svc.subtitle, svc.icon_name, svc.intro, JSON.stringify(svc.whyChoose), svc.ctaTitle, svc.ctaDesc, svc.display_order]
        ) as [{ insertId: number }, unknown];
        serviceId = result.insertId;

        for (let ci = 0; ci < svc.categories.length; ci++) {
          const cat = svc.categories[ci];
          const [catResult] = await connection.query(
            `INSERT INTO service_categories (service_id, name, description, display_order) VALUES (?, ?, ?, ?)`,
            [serviceId, cat.name, cat.desc, ci + 1]
          ) as [{ insertId: number }, unknown];
          const categoryId = catResult.insertId;

          for (let li = 0; li < cat.lists.length; li++) {
            const lst = cat.lists[li];
            await connection.query(
              `INSERT INTO service_category_lists (category_id, list_title, items, display_order) VALUES (?, ?, ?, ?)`,
              [categoryId, lst.title, JSON.stringify(lst.items), li + 1]
            );
          }
        }
        console.log(`[initDB] Seeded service: ${svc.slug}`);
      }
    }

    // Enterprise Inquiries
    await connection.query(`
      CREATE TABLE IF NOT EXISTS enterprise_inquiries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        designation VARCHAR(255),
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(255) NOT NULL,
        project_type ENUM('hotel', 'industrial', 'commercial', 'healthcare', 'residential_society', 'other'),
        scale VARCHAR(255),
        message TEXT,
        status ENUM('new', 'contacted', 'quoted', 'won', 'lost') NOT NULL DEFAULT 'new',
        gstin VARCHAR(15) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    // Migrate existing enterprise_inquiries table
    for (const ddl of [
      `ALTER TABLE enterprise_inquiries MODIFY COLUMN project_type ENUM('hotel', 'industrial', 'commercial', 'healthcare', 'residential_society', 'other')`,
      `ALTER TABLE enterprise_inquiries ADD COLUMN gstin VARCHAR(15) DEFAULT NULL`
    ]) {
      try { await connection.query(ddl); } catch (e: any) { if (e.code !== 'ER_DUP_FIELDNAME') throw e; }
    }

    // Email Templates
    await connection.query(`
      CREATE TABLE IF NOT EXISTS email_templates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        subject VARCHAR(255) NOT NULL,
        html_body LONGTEXT NOT NULL,
        text_body LONGTEXT NOT NULL,
        variables JSON,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // SMTP Settings
    await connection.query(`
      CREATE TABLE IF NOT EXISTS smtp_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        host VARCHAR(255) NOT NULL,
        port INT NOT NULL DEFAULT 587,
        username VARCHAR(255) NOT NULL,
        password_encrypted VARCHAR(500) NOT NULL,
        from_email VARCHAR(255) NOT NULL,
        from_name VARCHAR(255),
        enabled TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Seed default email templates
    const emailTemplateSeeds = [
      {
        name: 'contact-auto-reply',
        subject: 'Thank You for Contacting Avegatasta Solution',
        html_body: `<html><body>
<h2>Thank You, {{name}}!</h2>
<p>We have received your message and appreciate you reaching out to us.</p>
<p><strong>Your Message Details:</strong></p>
<ul>
  <li>Subject: {{subject}}</li>
  <li>Email: {{email}}</li>
  <li>Phone: {{phone}}</li>
</ul>
<p>Our team will review your inquiry and get back to you shortly.</p>
<p>Best regards,<br/>Avegatasta Solution Team</p>
</body></html>`,
        text_body: `Thank You, {{name}}!\n\nWe have received your message and appreciate you reaching out to us.\n\nYour Message Details:\n- Subject: {{subject}}\n- Email: {{email}}\n- Phone: {{phone}}\n\nOur team will review your inquiry and get back to you shortly.\n\nBest regards,\nAvegatasta Solution Team`,
        variables: JSON.stringify(['name', 'email', 'phone', 'subject', 'message']),
        is_active: 1,
      },
      {
        name: 'inquiry-confirmation',
        subject: 'Inquiry Received - {{company_name}}',
        html_body: `<html><body>
<h2>Thank You for Your Inquiry</h2>
<p>Dear {{name}},</p>
<p>Thank you for submitting an inquiry to {{company_name}}. We have received your request and our team will review the details you provided.</p>
<p><strong>Next Steps:</strong></p>
<ol>
  <li>Our team will contact you within 24 hours</li>
  <li>We'll discuss your specific requirements</li>
  <li>A customized quote will be provided</li>
</ol>
<p>If you have any immediate questions, please reach out to us:</p>
<p>Email: {{company_email}}<br/>Phone: {{company_phone}}</p>
<p>Best regards,<br/>{{company_name}} Team</p>
</body></html>`,
        text_body: `Thank You for Your Inquiry\n\nDear {{name}},\n\nThank you for submitting an inquiry to {{company_name}}. We have received your request and our team will review the details you provided.\n\nNext Steps:\n1. Our team will contact you within 24 hours\n2. We'll discuss your specific requirements\n3. A customized quote will be provided\n\nIf you have any immediate questions, please reach out to us:\nEmail: {{company_email}}\nPhone: {{company_phone}}\n\nBest regards,\n{{company_name}} Team`,
        variables: JSON.stringify(['name', 'company_name', 'company_email', 'company_phone']),
        is_active: 1,
      },
      {
        name: 'team-notification',
        subject: 'New Message: {{subject}}',
        html_body: `<html><body>
<h2>New Message Notification</h2>
<p>A new message has been received from the contact form.</p>
<p><strong>Message Details:</strong></p>
<ul>
  <li>Name: {{name}}</li>
  <li>Email: {{email}}</li>
  <li>Phone: {{phone}}</li>
  <li>Subject: {{subject}}</li>
  <li>Message: {{message}}</li>
</ul>
<p>Please log into the admin dashboard to respond.</p>
</body></html>`,
        text_body: `New Message Notification\n\nA new message has been received from the contact form.\n\nMessage Details:\n- Name: {{name}}\n- Email: {{email}}\n- Phone: {{phone}}\n- Subject: {{subject}}\n- Message: {{message}}\n\nPlease log into the admin dashboard to respond.`,
        variables: JSON.stringify(['name', 'email', 'phone', 'subject', 'message']),
        is_active: 1,
      },
    ];

    for (const tmpl of emailTemplateSeeds) {
      await connection.query(
        'INSERT IGNORE INTO email_templates (name, subject, html_body, text_body, variables, is_active) VALUES (?, ?, ?, ?, ?, ?)',
        [tmpl.name, tmpl.subject, tmpl.html_body, tmpl.text_body, tmpl.variables, tmpl.is_active]
      );
    }
    console.log(`[initDB] Seeded email templates`);

    // Team Members
    await connection.query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role ENUM('Sales', 'Support', 'Technical', 'Management', 'Other') NOT NULL DEFAULT 'Other',
        email VARCHAR(255),
        phone VARCHAR(20),
        avatar_url VARCHAR(500),
        status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
        joined_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Brands
    await connection.query(`
      CREATE TABLE IF NOT EXISTS brands (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        logo_url VARCHAR(500),
        description TEXT,
        website VARCHAR(500),
        status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Product-Brand Assignments (maps static product_id strings to brands)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_brand_assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(255) NOT NULL UNIQUE,
        brand_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_pba_brand (brand_id)
      )
    `);

    // Admin Orders (client purchase orders managed by admin)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_id INT NOT NULL,
        order_date DATE NOT NULL,
        status ENUM('pending', 'active', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
        total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_ao_client (client_id),
        INDEX idx_ao_status (status),
        INDEX idx_ao_date (order_date)
      )
    `);

    // Admin Order Items
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id VARCHAR(255),
        product_name VARCHAR(255) NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        unit_price DECIMAL(10,2) NOT NULL,
        serial_number VARCHAR(255),
        install_date DATE,
        warranty_end DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_aoi_order (order_id)
      )
    `);

    // Migrate existing admin_order_items table (safe, idempotent — ER_DUP_FIELDNAME ignored)
    // Older live databases may have this table without newer columns, which can stop Add Item from saving.
    for (const ddl of [
      `ALTER TABLE admin_order_items ADD COLUMN product_id VARCHAR(255) NULL AFTER order_id`,
      `ALTER TABLE admin_order_items ADD COLUMN product_name VARCHAR(255) NOT NULL DEFAULT '' AFTER product_id`,
      `ALTER TABLE admin_order_items ADD COLUMN quantity INT NOT NULL DEFAULT 1 AFTER product_name`,
      `ALTER TABLE admin_order_items ADD COLUMN unit_price DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER quantity`,
      `ALTER TABLE admin_order_items ADD COLUMN serial_number VARCHAR(255) NULL AFTER unit_price`,
      `ALTER TABLE admin_order_items ADD COLUMN install_date DATE NULL AFTER serial_number`,
      `ALTER TABLE admin_order_items ADD COLUMN warranty_end DATE NULL AFTER install_date`,
      `ALTER TABLE admin_order_items ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER warranty_end`,
      `ALTER TABLE admin_order_items ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at`,
    ]) {
      try { await connection.query(ddl); } catch (e: any) { if (e.code !== 'ER_DUP_FIELDNAME') throw e; }
    }

    // Admin Order Item Addons
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_order_addons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_item_id INT NOT NULL,
        addon_name VARCHAR(255) NOT NULL,
        addon_description TEXT,
        price DECIMAL(10,2) NOT NULL DEFAULT 0,
        active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_aoa_item (order_item_id)
      )
    `);

    // Admin Invoices
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_invoices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL UNIQUE,
        invoice_number VARCHAR(50) NOT NULL UNIQUE,
        invoice_date DATE NOT NULL,
        due_date DATE,
        amount DECIMAL(10,2) NOT NULL,
        status ENUM('draft', 'sent', 'paid') NOT NULL DEFAULT 'draft',
        pdf_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_ai_order (order_id)
      )
    `);

    // Product Lifecycle Events
    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_lifecycle_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_item_id INT NOT NULL,
        event_type ENUM('installed', 'serviced', 'repaired', 'replaced', 'retired') NOT NULL,
        event_date DATE NOT NULL,
        notes TEXT,
        performed_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_ple_item (order_item_id),
        INDEX idx_ple_type (event_type)
      )
    `);

      // Canvas Quotations
      await connection.query(`
        CREATE TABLE IF NOT EXISTS canvas_quotations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          quote_number VARCHAR(50) NOT NULL UNIQUE,
          client_name VARCHAR(255),
          canvas_data LONGTEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_cq_quote_number (quote_number)
        )
      `);

      // Canvas Invoices
      await connection.query(`
        CREATE TABLE IF NOT EXISTS canvas_invoices (
          id INT AUTO_INCREMENT PRIMARY KEY,
          invoice_number VARCHAR(50) NOT NULL UNIQUE,
          client_name VARCHAR(255),
          invoice_data LONGTEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_ci_invoice_number (invoice_number)
        )
      `);

      // Link canvas (GST) invoices to a client. Added dynamically so existing
      // canvas_invoices tables pick up the column without a fresh CREATE.
      try {
        await connection.query(`
          ALTER TABLE canvas_invoices ADD COLUMN client_id INT DEFAULT NULL
        `);
      } catch (e: any) {
        // Ignore if column already exists
      }

      // Products table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS products (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          brand VARCHAR(100) NOT NULL,
          category VARCHAR(100) NOT NULL,
          subCategory VARCHAR(100) DEFAULT NULL,
          description TEXT NOT NULL,
          image VARCHAR(500) NOT NULL,
          features JSON NOT NULL,
          specs JSON NOT NULL,
          inStock TINYINT(1) NOT NULL DEFAULT 1,
          hsn_code VARCHAR(50) DEFAULT NULL,
          sac_code VARCHAR(50) DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_products_brand (brand),
          INDEX idx_products_category (category)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // Add hsn_code and sac_code columns to products table dynamically if they do not exist
      try {
        await connection.query(`
          ALTER TABLE products ADD COLUMN hsn_code VARCHAR(50) DEFAULT NULL AFTER inStock
        `);
      } catch (e: any) {
        // Ignore if column already exists
      }
      try {
        await connection.query(`
          ALTER TABLE products ADD COLUMN sac_code VARCHAR(50) DEFAULT NULL AFTER hsn_code
        `);
      } catch (e: any) {
        // Ignore if column already exists
      }

      // Seed initial products if table is empty
      const [prodCountRows] = await connection.query('SELECT COUNT(*) as count FROM products');
      const prodCount = (prodCountRows as any[])[0].count;
      if (prodCount === 0) {
        for (const p of initialProducts) {
          await connection.query(
            `INSERT INTO products (id, name, brand, category, subCategory, description, image, features, specs, inStock, hsn_code, sac_code)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              p.id,
              p.name,
              p.brand,
              p.category,
              p.subCategory || null,
              p.description,
              p.image,
              JSON.stringify(p.features || []),
              JSON.stringify(p.specs || {}),
              p.inStock ? 1 : 0,
              p.hsn_code || null,
              p.sac_code || null
            ]
          );
        }
        console.log(`[initDB] Seeded ${initialProducts.length} initial products from lib/data.ts`);
      }

      // Pages table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS pages (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL UNIQUE,
          meta_title VARCHAR(255),
          meta_description TEXT,
          meta_keywords TEXT,
          canonical_url VARCHAR(255),
          og_title VARCHAR(255),
          og_description TEXT,
          og_image VARCHAR(255),
          status ENUM('published', 'draft') DEFAULT 'draft',
          show_in_menu BOOLEAN DEFAULT FALSE,
          menu_label VARCHAR(255),
          menu_order INT DEFAULT 0,
          parent_id INT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // Page Sections table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS page_sections (
          id INT AUTO_INCREMENT PRIMARY KEY,
          page_id INT NOT NULL,
          section_type VARCHAR(100) NOT NULL,
          section_key VARCHAR(100) NOT NULL,
          category VARCHAR(100),
          title VARCHAR(255),
          subtitle TEXT,
          content LONGTEXT,
          data_json JSON,
          sort_order INT DEFAULT 0,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // Page FAQs table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS page_faqs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          page_id INT NOT NULL,
          question TEXT NOT NULL,
          answer TEXT NOT NULL,
          sort_order INT DEFAULT 0,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

    // Performance indexes for high-traffic public reads and admin dashboard summaries.
    for (const ddl of [
      `ALTER TABLE contact_messages ADD INDEX idx_contact_created (created_at)`,
      `ALTER TABLE contact_messages ADD INDEX idx_contact_unread (is_read)`,
      `ALTER TABLE testimonials ADD INDEX idx_testimonials_active_order (is_active, display_order, id)`,
      `ALTER TABLE site_settings ADD INDEX idx_site_settings_group_key (\`group\`, \`key\`)`,
      `ALTER TABLE services ADD INDEX idx_services_active_order (is_active, display_order, id)`,
      `ALTER TABLE service_categories ADD INDEX idx_service_categories_service_order (service_id, display_order)`,
      `ALTER TABLE service_category_lists ADD INDEX idx_service_category_lists_category_order (category_id, display_order)`,
      `ALTER TABLE inquiries ADD INDEX idx_inquiries_meeting (status, meeting_date, meeting_time)`,
      `ALTER TABLE product_inquiries ADD INDEX idx_product_inquiries_meeting (status, meeting_date, meeting_time)`,
      `ALTER TABLE inquiries ADD INDEX idx_inquiries_delivered_sales (status, delivered_at, agreed_price)`,
      `ALTER TABLE product_inquiries ADD INDEX idx_product_inquiries_delivered_sales (status, delivered_at, agreed_price)`,
      `CREATE INDEX idx_canvas_invoices_client ON canvas_invoices(client_id)`,
    ]) {
      try { await connection.query(ddl); } catch (e: any) { if (e.code !== 'ER_DUP_KEYNAME') throw e; }
    }

    dbInitialized = true;
  } finally {
    connection.release();
  }
}

export async function query(sql: string, params: any[] = []): Promise<any> {
  const [rows] = await pool.query(sql, params);
  return rows;
}

export default pool;
