-- =============================================================================
-- schema.sql — Avegatasta MySQL Schema Backup
-- Database: avegatasta
-- Generated: 2026-04-11
--
-- Usage (restore on server):
--   mysql -u avegatasta_app -p avegatasta < schema.sql
--
-- Notes:
--   - Schema only. Reference/seed data is populated automatically by the app
--     on first startup via initDB() in lib/db.ts.
--   - Run this AFTER the database and user are created by setup-vps.sh.
-- =============================================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;

-- -----------------------------------------------------------------------------
-- Admin Users
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('admin', 'superadmin') NOT NULL DEFAULT 'admin',
  last_login    TIMESTAMP NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Contact Messages
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_messages (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  phone      VARCHAR(20),
  subject    VARCHAR(255),
  message    TEXT NOT NULL,
  gstin      VARCHAR(15) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Inquiries (with AI triage columns)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inquiries (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  phone       VARCHAR(20),
  subject     VARCHAR(255),
  message     TEXT NOT NULL,
  ai_category VARCHAR(100),
  ai_urgency  ENUM('critical', 'high', 'medium', 'low'),
  ai_intent   VARCHAR(100),
  status      ENUM('new','in_progress','resolved','closed','spam','enquiry_generation','follow_up','wants_to_meet','meeting_done','quotation_sent','quotation_followup','order_confirmed','delivery_in_progress','delivered') NOT NULL DEFAULT 'enquiry_generation',
  agreed_price DECIMAL(10,2) NULL,
  delivered_at TIMESTAMP NULL,
  meeting_date DATE NULL,
  meeting_time VARCHAR(20) NULL,
  meeting_type ENUM('office', 'custom') NULL,
  meeting_location TEXT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Orders
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  firstName  VARCHAR(255) NOT NULL,
  lastName   VARCHAR(255) NOT NULL,
  phone      VARCHAR(20),
  products   TEXT,
  total      DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Registrations
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS registrations (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  firstName  VARCHAR(255) NOT NULL,
  lastName   VARCHAR(255) NOT NULL,
  phone      VARCHAR(20) UNIQUE,
  gstin      VARCHAR(15) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Product Inquiries
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_inquiries (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  product_id   VARCHAR(255),
  product_name VARCHAR(255) NOT NULL,
  name         VARCHAR(255) NOT NULL,
  phone        VARCHAR(20) NOT NULL,
  email        VARCHAR(255),
  message      TEXT NOT NULL,
  status       ENUM('new','in_progress','resolved','closed','spam','enquiry_generation','follow_up','wants_to_meet','meeting_done','quotation_sent','quotation_followup','order_confirmed','delivery_in_progress','delivered') NOT NULL DEFAULT 'enquiry_generation',
  agreed_price DECIMAL(10,2) NULL,
  delivered_at TIMESTAMP NULL,
  meeting_date DATE NULL,
  meeting_time VARCHAR(20) NULL,
  meeting_type ENUM('office', 'custom') NULL,
  meeting_location TEXT NULL,
  gstin        VARCHAR(15) DEFAULT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Clients
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clients (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(255) NOT NULL,
  email        VARCHAR(255),
  phone        VARCHAR(20),
  address      TEXT,
  city         VARCHAR(100),
  state        VARCHAR(100),
  pincode      VARCHAR(20),
  company_name VARCHAR(255),
  notes        TEXT,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Client Products (purchased product lifecycle per client)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS client_products (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  client_id        INT NOT NULL,
  product_id       VARCHAR(255),
  product_name     VARCHAR(255) NOT NULL,
  serial_number    VARCHAR(255),
  batch_number     VARCHAR(100),
  purchase_date    DATE,
  install_date     DATE,
  warranty_end_date DATE,
  next_service_date DATE,
  notes            TEXT,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- AMC Plans
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS amc_plans (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  name                 VARCHAR(255) NOT NULL,
  duration_months      INT NOT NULL,
  coverage_description TEXT,
  price                DECIMAL(10, 2) NOT NULL,
  service_interval_days INT NOT NULL,
  created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Client AMC (links client_products to amc_plans)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS client_amc (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  client_product_id INT NOT NULL,
  amc_plan_id       INT NOT NULL,
  start_date        DATE NOT NULL,
  end_date          DATE NOT NULL,
  status            ENUM('active', 'expired', 'renewed') NOT NULL DEFAULT 'active',
  notes             TEXT,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Client Portal Users (one portal account per client)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS client_users (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  client_id           INT NOT NULL UNIQUE,
  email               VARCHAR(255) NOT NULL UNIQUE,
  password_hash       VARCHAR(255) NOT NULL,
  status              ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  reset_token_hash    VARCHAR(255),
  reset_token_expires TIMESTAMP NULL,
  last_login          TIMESTAMP NULL,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Client Behavior Events (append-only analytics log)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS client_events (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  client_id  INT NOT NULL,
  event_type ENUM('view', 'search') NOT NULL,
  entity_id  VARCHAR(255),
  query      VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ce_client (client_id),
  INDEX idx_ce_type   (event_type),
  INDEX idx_ce_entity (entity_id),
  INDEX idx_ce_ts     (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Vendors
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vendors (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  phone          VARCHAR(20),
  email          VARCHAR(255),
  address        TEXT,
  brand          ENUM('V-Guard', 'Zero B', 'Wilo', 'Bluewave India', 'Other'),
  notes          TEXT,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Products
-- -----------------------------------------------------------------------------
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Product Pricing
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_pricing (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(255) NOT NULL UNIQUE,
  dp_price   DECIMAL(10, 2),
  mrp_price  DECIMAL(10, 2),
  notes      TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Sales Team
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sales_team (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  phone      VARCHAR(20),
  email      VARCHAR(255),
  role       ENUM('sales_person', 'manager') NOT NULL DEFAULT 'sales_person',
  status     ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Sales Records
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sales_records (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  sales_team_id     INT NOT NULL,
  client_id         INT,
  product_id        VARCHAR(255) NOT NULL,
  product_name      VARCHAR(255) NOT NULL,
  quantity          INT NOT NULL DEFAULT 1,
  unit_price_sold   DECIMAL(10, 2) NOT NULL,
  dp_price_at_sale  DECIMAL(10, 2),
  mrp_price_at_sale DECIMAL(10, 2),
  notes             TEXT,
  sale_date         DATE NOT NULL,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Case Studies
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS case_studies (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(255) NOT NULL,
  slug          VARCHAR(255) NOT NULL UNIQUE,
  summary       TEXT,
  description   LONGTEXT,
  category      VARCHAR(100),
  client_name   VARCHAR(255),
  location_name VARCHAR(255),
  latitude      DECIMAL(10, 8),
  longitude     DECIMAL(11, 8),
  cover_image   VARCHAR(500),
  images        JSON,
  status        ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Testimonials
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS testimonials (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  role          VARCHAR(255),
  location      VARCHAR(255),
  rating        TINYINT NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  text          TEXT NOT NULL,
  image_url     VARCHAR(500),
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  display_order INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Site Settings (key-value store for editable site content)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_settings (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  `key`      VARCHAR(100) NOT NULL UNIQUE,
  value      TEXT,
  label      VARCHAR(255),
  `group`    ENUM('hero', 'contact', 'footer', 'general') NOT NULL DEFAULT 'general',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- About Content
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS about_content (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  section    ENUM('mission', 'vision', 'company_intro') NOT NULL UNIQUE,
  content    TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Services
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  slug          VARCHAR(255) NOT NULL UNIQUE,
  title         VARCHAR(255) NOT NULL,
  subtitle      VARCHAR(500),
  icon_name     VARCHAR(100),
  intro         LONGTEXT,
  why_choose    JSON,
  cta_title     VARCHAR(255),
  cta_desc      TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_active     TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Service Categories
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS service_categories (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  service_id    INT NOT NULL,
  name          VARCHAR(255) NOT NULL,
  description   TEXT,
  display_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Service Category Lists
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS service_category_lists (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  category_id   INT NOT NULL,
  list_title    VARCHAR(255) NOT NULL,
  items         JSON NOT NULL,
  display_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Enterprise Inquiries
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS enterprise_inquiries (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  company      VARCHAR(255) NOT NULL,
  name         VARCHAR(255) NOT NULL,
  designation  VARCHAR(255),
  phone        VARCHAR(20) NOT NULL,
  email        VARCHAR(255) NOT NULL,
  project_type ENUM('hotel', 'industrial', 'commercial', 'healthcare', 'residential_society', 'other'),
  scale        VARCHAR(255),
  message      TEXT,
  status       ENUM('new', 'contacted', 'quoted', 'won', 'lost') NOT NULL DEFAULT 'new',
  gstin        VARCHAR(15) DEFAULT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- End of schema
-- NOTE: Reference/seed data (site_settings, about_content, services, etc.)
-- is populated automatically by the app on first startup via initDB().
-- =============================================================================
