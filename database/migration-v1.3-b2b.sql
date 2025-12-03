-- AirportTransfer B2B & White-Label Migration
-- Version: 1.3
-- Date: 03 December 2025
-- Phase 5: B2B & White-Label Infrastructure

-- =====================================================
-- 1. UPDATE USERS TABLE FOR AGENCY ROLES
-- =====================================================

ALTER TABLE users MODIFY COLUMN role
ENUM('ADMIN','SUPPLIER_OWNER','DISPATCHER','DRIVER','END_CUSTOMER','AGENCY_OWNER','AGENCY_MANAGER','AGENCY_BOOKER') NOT NULL;

-- =====================================================
-- 2. WHITE-LABEL CONFIGURATION
-- =====================================================

CREATE TABLE IF NOT EXISTS agency_whitelabel (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  agency_id       BIGINT NOT NULL UNIQUE,

  -- Domain & Branding
  custom_domain   VARCHAR(255),
  subdomain       VARCHAR(100),
  logo_url        VARCHAR(500),
  favicon_url     VARCHAR(500),

  -- Colors
  primary_color   VARCHAR(7) DEFAULT '#0EA5E9',
  secondary_color VARCHAR(7) DEFAULT '#64748B',
  accent_color    VARCHAR(7) DEFAULT '#F59E0B',

  -- Content
  company_name    VARCHAR(255),
  tagline         VARCHAR(255),
  footer_text     TEXT,
  contact_email   VARCHAR(255),
  contact_phone   VARCHAR(50),

  -- Features
  show_powered_by BOOLEAN DEFAULT TRUE,
  show_reviews    BOOLEAN DEFAULT TRUE,
  show_suppliers  BOOLEAN DEFAULT FALSE,

  -- SEO
  meta_title      VARCHAR(255),
  meta_description TEXT,

  -- Tracking
  google_analytics VARCHAR(50),
  facebook_pixel  VARCHAR(50),

  is_active       BOOLEAN DEFAULT TRUE,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE
);

-- =====================================================
-- 3. AGENCY INVOICES
-- =====================================================

CREATE TABLE IF NOT EXISTS agency_invoices (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  agency_id       BIGINT NOT NULL,
  invoice_number  VARCHAR(50) UNIQUE NOT NULL,

  -- Period
  period_start    DATE NOT NULL,
  period_end      DATE NOT NULL,

  -- Amounts
  subtotal        DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  tax_rate        DECIMAL(5,2) DEFAULT 0.00,
  tax_amount      DECIMAL(10,2) DEFAULT 0.00,
  total_amount    DECIMAL(10,2) NOT NULL,
  currency        VARCHAR(3) NOT NULL DEFAULT 'EUR',

  -- Status
  status          ENUM('DRAFT','SENT','PAID','OVERDUE','CANCELLED') NOT NULL DEFAULT 'DRAFT',
  due_date        DATE NOT NULL,
  paid_at         DATETIME,

  -- Details
  booking_count   INT DEFAULT 0,
  notes           TEXT,
  pdf_url         VARCHAR(500),

  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE,
  INDEX idx_agency (agency_id),
  INDEX idx_status (status),
  INDEX idx_due_date (due_date)
);

-- =====================================================
-- 4. AGENCY INVOICE LINE ITEMS
-- =====================================================

CREATE TABLE IF NOT EXISTS agency_invoice_items (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  invoice_id      BIGINT NOT NULL,
  booking_id      BIGINT NOT NULL,

  description     VARCHAR(500),
  booking_date    DATE,
  route_info      VARCHAR(255),

  gross_amount    DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  net_amount      DECIMAL(10,2) NOT NULL,

  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (invoice_id) REFERENCES agency_invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- =====================================================
-- 5. WIDGET EMBED CODES
-- =====================================================

CREATE TABLE IF NOT EXISTS agency_widgets (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  agency_id       BIGINT NOT NULL,
  widget_key      VARCHAR(64) UNIQUE NOT NULL,

  -- Configuration
  widget_type     ENUM('SEARCH_FORM','FULL_BOOKING','QUOTE_ONLY') NOT NULL DEFAULT 'SEARCH_FORM',
  allowed_domains TEXT,

  -- Styling
  theme           ENUM('LIGHT','DARK','AUTO') DEFAULT 'LIGHT',
  border_radius   INT DEFAULT 8,
  show_logo       BOOLEAN DEFAULT TRUE,

  -- Tracking
  impressions     INT DEFAULT 0,
  conversions     INT DEFAULT 0,

  is_active       BOOLEAN DEFAULT TRUE,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE
);

-- =====================================================
-- 6. API REQUEST LOGS
-- =====================================================

CREATE TABLE IF NOT EXISTS agency_api_logs (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  agency_id       BIGINT NOT NULL,

  endpoint        VARCHAR(255) NOT NULL,
  method          VARCHAR(10) NOT NULL,
  request_body    JSON,
  response_status INT,
  response_time_ms INT,
  ip_address      VARCHAR(50),

  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE,
  INDEX idx_agency_date (agency_id, created_at),
  INDEX idx_endpoint (endpoint)
);

-- =====================================================
-- 7. AGENCY CREDIT TRANSACTIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS agency_credit_transactions (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  agency_id       BIGINT NOT NULL,

  type            ENUM('CREDIT_ADD','CREDIT_USE','REFUND','ADJUSTMENT') NOT NULL,
  amount          DECIMAL(10,2) NOT NULL,
  balance_after   DECIMAL(10,2) NOT NULL,
  currency        VARCHAR(3) NOT NULL DEFAULT 'EUR',

  reference       VARCHAR(255),
  booking_id      BIGINT,
  invoice_id      BIGINT,
  notes           TEXT,

  created_by      BIGINT,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id),
  FOREIGN KEY (invoice_id) REFERENCES agency_invoices(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_agency (agency_id),
  INDEX idx_type (type)
);

-- =====================================================
-- 8. UPDATE AGENCIES TABLE (run each separately if column exists)
-- =====================================================

-- Check and add columns if they don't exist
-- Run these one by one, ignore errors if column already exists

ALTER TABLE agencies ADD COLUMN markup_rate DECIMAL(5,2) DEFAULT 0.00 AFTER commission_rate;
-- If error "Duplicate column name", ignore and continue

ALTER TABLE agencies ADD COLUMN billing_email VARCHAR(255) AFTER contact_phone;
-- If error "Duplicate column name", ignore and continue

ALTER TABLE agencies ADD COLUMN vat_number VARCHAR(50) AFTER billing_email;
-- If error "Duplicate column name", ignore and continue

ALTER TABLE agencies ADD COLUMN default_currency VARCHAR(3) DEFAULT 'EUR' AFTER credit_used;
-- If error "Duplicate column name", ignore and continue

-- =====================================================
-- 9. GENERATE API KEY FUNCTION (stored as view/helper)
-- =====================================================

-- Default API key format: atp_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
-- Generate using: CONCAT('atp_live_', LOWER(REPLACE(UUID(), '-', '')))

-- =====================================================
-- 10. SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert test agency (commented for production)
/*
INSERT INTO agencies (name, legal_name, contact_name, contact_email, contact_phone, country, city, commission_rate, is_verified, is_active, api_key) VALUES
('Demo Travel Agency', 'Demo Travel Ltd.', 'John Demo', 'demo@example.com', '+1234567890', 'United Kingdom', 'London', 10.00, TRUE, TRUE, 'atp_live_demo1234567890abcdef1234567890ab');
*/
