-- AirportTransfer Database Schema
-- Version: 1.1
-- Date: 03 December 2025
-- Aligned with OpenAPI spec v1.1.0

-- =====================================================
-- 1. USERS & AUTHENTICATION
-- =====================================================

CREATE TABLE users (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(255),
  phone         VARCHAR(50),
  role          ENUM('ADMIN','SUPPLIER_OWNER','DISPATCHER','DRIVER','END_CUSTOMER') NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  avatar_url    VARCHAR(500),
  last_login    DATETIME,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- =====================================================
-- 2. SUPPLIERS (Transfer Companies)
-- =====================================================

CREATE TABLE suppliers (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  name            VARCHAR(255) NOT NULL,
  legal_name      VARCHAR(255),
  tax_number      VARCHAR(100),
  contact_name    VARCHAR(255),
  contact_email   VARCHAR(255),
  contact_phone   VARCHAR(50),
  whatsapp        VARCHAR(50),
  country         VARCHAR(100),
  city            VARCHAR(100),
  address         TEXT,
  logo_url        VARCHAR(500),
  description     TEXT,
  is_verified     BOOLEAN DEFAULT FALSE,
  is_active       BOOLEAN DEFAULT TRUE,
  commission_rate DECIMAL(5,2) DEFAULT 15.00,
  rating_avg      DECIMAL(3,2) DEFAULT 0.00,
  rating_count    INT DEFAULT 0,
  response_time_avg INT DEFAULT 0,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_country_city (country, city),
  INDEX idx_verified_active (is_verified, is_active)
);

CREATE TABLE supplier_users (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  supplier_id BIGINT NOT NULL,
  user_id     BIGINT NOT NULL,
  role        ENUM('OWNER','MANAGER','DISPATCHER') NOT NULL,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_supplier_user (supplier_id, user_id),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE supplier_documents (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  supplier_id   BIGINT NOT NULL,
  doc_type      ENUM('LICENSE','INSURANCE','TAX_CERT','ID_CARD','OTHER') NOT NULL,
  doc_name      VARCHAR(255),
  file_url      VARCHAR(500) NOT NULL,
  expiry_date   DATE,
  is_verified   BOOLEAN DEFAULT FALSE,
  verified_at   DATETIME,
  verified_by   BIGINT,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by) REFERENCES users(id)
);

-- =====================================================
-- 3. AIRPORTS & ZONES
-- =====================================================

CREATE TABLE airports (
  id        BIGINT PRIMARY KEY AUTO_INCREMENT,
  code      VARCHAR(10) UNIQUE NOT NULL,
  name      VARCHAR(255) NOT NULL,
  name_local VARCHAR(255),
  city      VARCHAR(100),
  country   VARCHAR(100),
  country_code VARCHAR(3),
  timezone  VARCHAR(100),
  latitude  DECIMAL(10,7),
  longitude DECIMAL(10,7),
  terminals TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_country (country),
  INDEX idx_city (city),
  INDEX idx_active (is_active)
);

CREATE TABLE zones (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(255) NOT NULL,
  name_local  VARCHAR(255),
  city        VARCHAR(100),
  country     VARCHAR(100),
  country_code VARCHAR(3),
  zone_type   ENUM('CITY_CENTER','DISTRICT','RESORT','HOTEL','PORT','STATION','OTHER') DEFAULT 'DISTRICT',
  parent_zone_id BIGINT,
  latitude    DECIMAL(10,7),
  longitude   DECIMAL(10,7),
  is_popular  BOOLEAN DEFAULT FALSE,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_zone_id) REFERENCES zones(id),
  INDEX idx_country_city (country, city),
  INDEX idx_popular (is_popular),
  INDEX idx_active (is_active)
);

CREATE TABLE routes (
  id                  BIGINT PRIMARY KEY AUTO_INCREMENT,
  airport_id          BIGINT NOT NULL,
  zone_id             BIGINT NOT NULL,
  direction           ENUM('FROM_AIRPORT','TO_AIRPORT','BOTH') NOT NULL DEFAULT 'BOTH',
  approx_distance_km  DECIMAL(8,2),
  approx_duration_min INT,
  is_active           BOOLEAN DEFAULT TRUE,
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_airport_zone_direction (airport_id, zone_id, direction),
  FOREIGN KEY (airport_id) REFERENCES airports(id) ON DELETE CASCADE,
  FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE,
  INDEX idx_airport (airport_id),
  INDEX idx_zone (zone_id)
);

-- =====================================================
-- 4. VEHICLES & DRIVERS
-- =====================================================

CREATE TABLE vehicles (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  supplier_id   BIGINT NOT NULL,
  plate_number  VARCHAR(50) NOT NULL,
  brand         VARCHAR(100),
  model         VARCHAR(100),
  year          INT,
  color         VARCHAR(50),
  seat_count    INT NOT NULL,
  luggage_count INT DEFAULT 0,
  vehicle_type  ENUM('SEDAN','VAN','MINIBUS','BUS','VIP') NOT NULL,
  features      JSON,
  images        JSON,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
  INDEX idx_supplier (supplier_id),
  INDEX idx_type (vehicle_type),
  INDEX idx_active (is_active)
);

CREATE TABLE vehicle_documents (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  vehicle_id  BIGINT NOT NULL,
  doc_type    ENUM('REGISTRATION','INSURANCE','INSPECTION','OTHER') NOT NULL,
  doc_name    VARCHAR(255),
  file_url    VARCHAR(500) NOT NULL,
  expiry_date DATE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

CREATE TABLE drivers (
  id             BIGINT PRIMARY KEY AUTO_INCREMENT,
  supplier_id    BIGINT NOT NULL,
  user_id        BIGINT,
  full_name      VARCHAR(255) NOT NULL,
  phone          VARCHAR(50),
  email          VARCHAR(255),
  license_number VARCHAR(100),
  license_expiry DATE,
  photo_url      VARCHAR(500),
  languages      JSON,
  is_active      BOOLEAN DEFAULT TRUE,
  rating_avg     DECIMAL(3,2) DEFAULT 0.00,
  rating_count   INT DEFAULT 0,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_supplier (supplier_id),
  INDEX idx_active (is_active)
);

CREATE TABLE driver_documents (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  driver_id   BIGINT NOT NULL,
  doc_type    ENUM('ID_CARD','LICENSE','PHOTO','OTHER') NOT NULL,
  doc_name    VARCHAR(255),
  file_url    VARCHAR(500) NOT NULL,
  expiry_date DATE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE
);

-- =====================================================
-- 5. SUPPLIER SERVICE ZONES
-- =====================================================

CREATE TABLE supplier_service_zones (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  supplier_id     BIGINT NOT NULL,
  airport_id      BIGINT NOT NULL,
  max_distance_km DECIMAL(8,2),
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_supplier_airport (supplier_id, airport_id),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
  FOREIGN KEY (airport_id) REFERENCES airports(id) ON DELETE CASCADE
);

CREATE TABLE supplier_zone_coverage (
  id                      BIGINT PRIMARY KEY AUTO_INCREMENT,
  supplier_service_zone_id BIGINT NOT NULL,
  zone_id                 BIGINT NOT NULL,
  is_active               BOOLEAN DEFAULT TRUE,
  UNIQUE KEY uk_service_zone (supplier_service_zone_id, zone_id),
  FOREIGN KEY (supplier_service_zone_id) REFERENCES supplier_service_zones(id) ON DELETE CASCADE,
  FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE
);

-- =====================================================
-- 6. PRICING & TARIFFS
-- =====================================================

CREATE TABLE tariffs (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  supplier_id   BIGINT NOT NULL,
  route_id      BIGINT NOT NULL,
  vehicle_type  ENUM('SEDAN','VAN','MINIBUS','BUS','VIP') NOT NULL,
  currency      VARCHAR(3) NOT NULL DEFAULT 'EUR',
  base_price    DECIMAL(10,2) NOT NULL,
  price_per_pax DECIMAL(10,2),
  min_pax       INT DEFAULT 1,
  max_pax       INT,
  valid_from    DATE,
  valid_to      DATE,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_supplier_route_vehicle (supplier_id, route_id, vehicle_type),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
  FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
  INDEX idx_supplier (supplier_id),
  INDEX idx_route (route_id),
  INDEX idx_active (is_active)
);

CREATE TABLE tariff_rules (
  id               BIGINT PRIMARY KEY AUTO_INCREMENT,
  tariff_id        BIGINT NOT NULL,
  rule_type        ENUM('TIME_OF_DAY','DAY_OF_WEEK','SEASON','LAST_MINUTE') NOT NULL,
  rule_name        VARCHAR(100),
  day_of_week      INT,
  start_time       TIME,
  end_time         TIME,
  season_from      DATE,
  season_to        DATE,
  hours_before     INT,
  perc_adjustment  DECIMAL(6,2),
  fixed_adjustment DECIMAL(10,2),
  is_active        BOOLEAN DEFAULT TRUE,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tariff_id) REFERENCES tariffs(id) ON DELETE CASCADE
);

CREATE TABLE extras (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  supplier_id BIGINT NOT NULL,
  name        VARCHAR(100) NOT NULL,
  name_key    VARCHAR(50),
  description TEXT,
  price       DECIMAL(10,2) NOT NULL,
  currency    VARCHAR(3) NOT NULL DEFAULT 'EUR',
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
);

-- =====================================================
-- 7. BOOKINGS & RIDES
-- =====================================================

CREATE TABLE bookings (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  public_code     VARCHAR(20) UNIQUE NOT NULL,
  customer_id     BIGINT,
  supplier_id     BIGINT,
  channel         ENUM('B2C','B2B','AGENCY_API','WIDGET') NOT NULL DEFAULT 'B2C',
  agency_id       BIGINT,
  agency_ref      VARCHAR(100),

  -- Route info
  airport_id      BIGINT NOT NULL,
  zone_id         BIGINT NOT NULL,
  direction       ENUM('FROM_AIRPORT','TO_AIRPORT') NOT NULL,
  pickup_address  TEXT,
  dropoff_address TEXT,

  -- Flight info
  flight_number   VARCHAR(50),
  flight_date     DATE,
  flight_time     TIME,

  -- Pickup info
  pickup_datetime DATETIME NOT NULL,

  -- Passengers
  pax_adults      INT NOT NULL DEFAULT 1,
  pax_children    INT DEFAULT 0,
  pax_infants     INT DEFAULT 0,
  luggage_count   INT DEFAULT 0,

  -- Vehicle
  vehicle_type    ENUM('SEDAN','MINIVAN','VAN','MINIBUS','BUS','VIP','LUXURY') NOT NULL,

  -- Pricing
  currency        VARCHAR(3) NOT NULL DEFAULT 'EUR',
  base_price      DECIMAL(10,2) NOT NULL,
  extras_price    DECIMAL(10,2) DEFAULT 0.00,
  adjustments     DECIMAL(10,2) DEFAULT 0.00,
  total_price     DECIMAL(10,2) NOT NULL,
  commission      DECIMAL(10,2) DEFAULT 0.00,
  supplier_payout DECIMAL(10,2) DEFAULT 0.00,

  -- Status
  status          ENUM('PENDING','AWAITING_PAYMENT','CONFIRMED','ASSIGNED','IN_PROGRESS','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  payment_status  ENUM('UNPAID','PARTIALLY_PAID','PAID','REFUNDED') DEFAULT 'UNPAID',

  -- Notes
  customer_notes  TEXT,
  internal_notes  TEXT,

  -- Timestamps
  confirmed_at    DATETIME,
  completed_at    DATETIME,
  cancelled_at    DATETIME,
  cancel_reason   TEXT,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (customer_id) REFERENCES users(id),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  FOREIGN KEY (airport_id) REFERENCES airports(id),
  FOREIGN KEY (zone_id) REFERENCES zones(id),
  INDEX idx_public_code (public_code),
  INDEX idx_customer (customer_id),
  INDEX idx_supplier (supplier_id),
  INDEX idx_status (status),
  INDEX idx_pickup_date (pickup_datetime),
  INDEX idx_channel (channel)
);

CREATE TABLE booking_passengers (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  booking_id  BIGINT NOT NULL,
  full_name   VARCHAR(255) NOT NULL,
  phone       VARCHAR(50),
  email       VARCHAR(255),
  is_lead     BOOLEAN DEFAULT FALSE,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

CREATE TABLE booking_extras (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  booking_id  BIGINT NOT NULL,
  extra_id    BIGINT,
  name        VARCHAR(100) NOT NULL,
  quantity    INT DEFAULT 1,
  unit_price  DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (extra_id) REFERENCES extras(id)
);

CREATE TABLE rides (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  booking_id      BIGINT NOT NULL,
  supplier_id     BIGINT NOT NULL,
  vehicle_id      BIGINT,
  driver_id       BIGINT,

  status          ENUM('PENDING_ASSIGN','ASSIGNED','ON_WAY','AT_PICKUP','IN_RIDE','FINISHED','NO_SHOW','CANCELLED') NOT NULL DEFAULT 'PENDING_ASSIGN',

  -- Location tracking
  pickup_lat      DECIMAL(10,7),
  pickup_lng      DECIMAL(10,7),
  dropoff_lat     DECIMAL(10,7),
  dropoff_lng     DECIMAL(10,7),
  current_lat     DECIMAL(10,7),
  current_lng     DECIMAL(10,7),

  -- Times
  assigned_at     DATETIME,
  started_at      DATETIME,
  arrived_at      DATETIME,
  picked_up_at    DATETIME,
  completed_at    DATETIME,

  -- Notes
  driver_note     TEXT,

  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
  FOREIGN KEY (driver_id) REFERENCES drivers(id),
  INDEX idx_booking (booking_id),
  INDEX idx_supplier (supplier_id),
  INDEX idx_status (status)
);

-- =====================================================
-- 8. PAYMENTS & PAYOUTS
-- =====================================================

CREATE TABLE payments (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  booking_id    BIGINT NOT NULL,
  amount        DECIMAL(10,2) NOT NULL,
  currency      VARCHAR(3) NOT NULL,
  payment_method ENUM('CARD','BANK_TRANSFER','CASH','WALLET') NOT NULL,
  provider      VARCHAR(50),
  provider_txid VARCHAR(255),
  status        ENUM('PENDING','SUCCESS','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
  refund_amount DECIMAL(10,2),
  refund_reason TEXT,
  metadata      JSON,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  INDEX idx_booking (booking_id),
  INDEX idx_status (status)
);

CREATE TABLE supplier_payouts (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  supplier_id   BIGINT NOT NULL,
  booking_id    BIGINT,
  amount        DECIMAL(10,2) NOT NULL,
  currency      VARCHAR(3) NOT NULL,
  status        ENUM('PENDING','SCHEDULED','PAID','CANCELLED') NOT NULL DEFAULT 'PENDING',
  payout_method ENUM('BANK_TRANSFER','PAYPAL','WISE','OTHER') DEFAULT 'BANK_TRANSFER',
  reference     VARCHAR(255),
  due_date      DATE,
  paid_at       DATETIME,
  notes         TEXT,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id),
  INDEX idx_supplier (supplier_id),
  INDEX idx_status (status)
);

-- =====================================================
-- 9. REVIEWS & RATINGS
-- =====================================================

CREATE TABLE reviews (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  booking_id    BIGINT NOT NULL,
  customer_id   BIGINT NOT NULL,
  supplier_id   BIGINT NOT NULL,
  driver_id     BIGINT,

  rating_overall    INT NOT NULL,
  rating_punctuality INT,
  rating_vehicle    INT,
  rating_driver     INT,

  review_text   TEXT,

  is_published  BOOLEAN DEFAULT TRUE,
  supplier_response TEXT,
  response_at   DATETIME,

  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES users(id),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  FOREIGN KEY (driver_id) REFERENCES drivers(id),
  INDEX idx_supplier (supplier_id),
  INDEX idx_rating (rating_overall)
);

-- =====================================================
-- 10. AGENCIES (B2B Partners)
-- =====================================================

CREATE TABLE agencies (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  name            VARCHAR(255) NOT NULL,
  legal_name      VARCHAR(255),
  contact_name    VARCHAR(255),
  contact_email   VARCHAR(255),
  contact_phone   VARCHAR(50),
  country         VARCHAR(100),
  city            VARCHAR(100),
  address         TEXT,
  logo_url        VARCHAR(500),
  website         VARCHAR(255),
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  credit_limit    DECIMAL(10,2) DEFAULT 0.00,
  credit_used     DECIMAL(10,2) DEFAULT 0.00,
  payment_terms   INT DEFAULT 30,
  is_verified     BOOLEAN DEFAULT FALSE,
  is_active       BOOLEAN DEFAULT TRUE,
  api_key         VARCHAR(255) UNIQUE,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_api_key (api_key)
);

CREATE TABLE agency_users (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  agency_id   BIGINT NOT NULL,
  user_id     BIGINT NOT NULL,
  role        ENUM('OWNER','MANAGER','BOOKER') NOT NULL,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_agency_user (agency_id, user_id),
  FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- 11. NOTIFICATIONS & LOGS
-- =====================================================

CREATE TABLE notifications (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id     BIGINT NOT NULL,
  type        ENUM('BOOKING','PAYMENT','SYSTEM','ALERT') NOT NULL,
  title       VARCHAR(255) NOT NULL,
  message     TEXT,
  link        VARCHAR(500),
  is_read     BOOLEAN DEFAULT FALSE,
  read_at     DATETIME,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_unread (user_id, is_read)
);

CREATE TABLE activity_logs (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id     BIGINT,
  action      VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id   BIGINT,
  old_values  JSON,
  new_values  JSON,
  ip_address  VARCHAR(50),
  user_agent  TEXT,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_created (created_at)
);

-- =====================================================
-- 12. SYSTEM SETTINGS
-- =====================================================

CREATE TABLE settings (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  key_name    VARCHAR(100) UNIQUE NOT NULL,
  value       TEXT,
  description TEXT,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO settings (key_name, value, description) VALUES
('default_commission_rate', '15.00', 'Default commission rate for new suppliers'),
('default_currency', 'EUR', 'Default currency for pricing'),
('booking_auto_expire_hours', '24', 'Hours before unpaid booking expires'),
('free_waiting_minutes', '60', 'Free waiting time at airport in minutes'),
('cancellation_free_hours', '24', 'Free cancellation window in hours'),
('support_email', 'support@airporttransferportal.com', 'Support email address'),
('support_phone', '+90 000 000 0000', 'Support phone number');
