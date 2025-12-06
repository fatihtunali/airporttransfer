-- Migration: Customer Accounts System
-- Version: 004
-- Date: 2025-12-06
-- Description: Adds customer accounts with social login support

-- =====================================================
-- CUSTOMERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS customers (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NULL COMMENT 'Null for social login only users',
  first_name      VARCHAR(100),
  last_name       VARCHAR(100),
  phone           VARCHAR(50),
  phone_country   VARCHAR(5),
  avatar_url      VARCHAR(500),

  -- Social login providers
  google_id       VARCHAR(255) UNIQUE NULL,
  facebook_id     VARCHAR(255) UNIQUE NULL,
  apple_id        VARCHAR(255) UNIQUE NULL,

  -- Preferences
  preferred_currency VARCHAR(3) DEFAULT 'EUR',
  preferred_language VARCHAR(5) DEFAULT 'en',

  -- Marketing
  marketing_consent BOOLEAN DEFAULT FALSE,
  newsletter_subscribed BOOLEAN DEFAULT FALSE,

  -- Status
  is_email_verified BOOLEAN DEFAULT FALSE,
  is_active       BOOLEAN DEFAULT TRUE,

  -- Loyalty/Stats
  total_bookings  INT DEFAULT 0,
  total_spent     DECIMAL(12,2) DEFAULT 0.00,
  loyalty_points  INT DEFAULT 0,

  -- Timestamps
  last_login_at   DATETIME NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_email (email),
  INDEX idx_google (google_id),
  INDEX idx_phone (phone)
);

-- =====================================================
-- CUSTOMER SESSIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS customer_sessions (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  customer_id     BIGINT NOT NULL,
  token           VARCHAR(255) UNIQUE NOT NULL,
  user_agent      VARCHAR(500),
  ip_address      VARCHAR(45),
  expires_at      DATETIME NOT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_customer (customer_id),
  INDEX idx_expires (expires_at)
);

-- =====================================================
-- CUSTOMER SAVED ADDRESSES
-- =====================================================

CREATE TABLE IF NOT EXISTS customer_addresses (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  customer_id     BIGINT NOT NULL,
  label           VARCHAR(50) NOT NULL COMMENT 'Home, Work, Hotel, etc.',
  address         TEXT NOT NULL,
  city            VARCHAR(100),
  country         VARCHAR(100),
  postal_code     VARCHAR(20),
  latitude        DECIMAL(10,7) NULL,
  longitude       DECIMAL(10,7) NULL,
  is_default      BOOLEAN DEFAULT FALSE,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  INDEX idx_customer (customer_id)
);

-- =====================================================
-- EMAIL VERIFICATION TOKENS
-- =====================================================

CREATE TABLE IF NOT EXISTS customer_verification_tokens (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  customer_id     BIGINT NOT NULL,
  token           VARCHAR(255) UNIQUE NOT NULL,
  type            ENUM('EMAIL_VERIFY', 'PASSWORD_RESET') NOT NULL,
  expires_at      DATETIME NOT NULL,
  used_at         DATETIME NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_expires (expires_at)
);

-- =====================================================
-- UPDATE BOOKINGS TABLE TO LINK CUSTOMERS
-- =====================================================

-- Add customer_id column to bookings if not exists
-- This links bookings to registered customer accounts
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_account_id BIGINT NULL;
ALTER TABLE bookings ADD CONSTRAINT fk_booking_customer_account
  FOREIGN KEY (customer_account_id) REFERENCES customers(id) ON DELETE SET NULL;

-- =====================================================
-- CUSTOMER LOYALTY/POINTS TRANSACTIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS customer_points_transactions (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  customer_id     BIGINT NOT NULL,
  booking_id      BIGINT NULL,
  type            ENUM('EARN', 'REDEEM', 'EXPIRE', 'BONUS') NOT NULL,
  points          INT NOT NULL COMMENT 'Positive for earn, negative for redeem',
  balance_after   INT NOT NULL,
  description     VARCHAR(255),
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  INDEX idx_customer (customer_id)
);

SELECT 'Customer accounts tables created successfully!' AS Result;
