-- AirportTransfer Operations & Dispatch Migration
-- Version: 1.4
-- Date: 03 December 2025
-- Phase 6: Operations & Dispatch System

-- =====================================================
-- 1. DRIVER LOCATION TRACKING
-- =====================================================

CREATE TABLE IF NOT EXISTS driver_locations (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  driver_id       BIGINT NOT NULL,

  -- Location
  latitude        DECIMAL(10,7) NOT NULL,
  longitude       DECIMAL(10,7) NOT NULL,
  accuracy        DECIMAL(6,2),
  heading         DECIMAL(5,2),
  speed           DECIMAL(6,2),

  -- Status
  status          ENUM('ONLINE','OFFLINE','ON_TRIP','BREAK') NOT NULL DEFAULT 'OFFLINE',
  battery_level   TINYINT,

  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE,
  INDEX idx_driver (driver_id),
  INDEX idx_status (status),
  INDEX idx_updated (updated_at)
);

-- =====================================================
-- 2. RIDE TRACKING / LIVE UPDATES
-- =====================================================

CREATE TABLE IF NOT EXISTS ride_tracking (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  ride_id         BIGINT NOT NULL,

  -- Event type
  event_type      ENUM(
    'DRIVER_ASSIGNED',
    'DRIVER_EN_ROUTE',
    'DRIVER_ARRIVED',
    'PASSENGER_PICKED_UP',
    'IN_TRANSIT',
    'APPROACHING_DESTINATION',
    'ARRIVED_DESTINATION',
    'COMPLETED',
    'CANCELLED',
    'DELAY_REPORTED',
    'ISSUE_REPORTED'
  ) NOT NULL,

  -- Location at event
  latitude        DECIMAL(10,7),
  longitude       DECIMAL(10,7),

  -- ETA
  eta_minutes     INT,
  distance_km     DECIMAL(8,2),

  -- Additional data
  notes           TEXT,
  reported_by     ENUM('SYSTEM','DRIVER','DISPATCHER') DEFAULT 'SYSTEM',

  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE,
  INDEX idx_ride (ride_id),
  INDEX idx_event (event_type),
  INDEX idx_created (created_at)
);

-- =====================================================
-- 3. FLIGHT TRACKING
-- =====================================================

CREATE TABLE IF NOT EXISTS flight_tracking (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  booking_id      BIGINT NOT NULL,

  -- Flight info
  flight_number   VARCHAR(20) NOT NULL,
  flight_date     DATE NOT NULL,

  -- Scheduled
  scheduled_departure   DATETIME,
  scheduled_arrival     DATETIME,

  -- Actual/Estimated
  estimated_arrival     DATETIME,
  actual_arrival        DATETIME,

  -- Status
  status          ENUM(
    'SCHEDULED',
    'DEPARTED',
    'EN_ROUTE',
    'LANDED',
    'ARRIVED_GATE',
    'CANCELLED',
    'DIVERTED',
    'DELAYED',
    'UNKNOWN'
  ) NOT NULL DEFAULT 'SCHEDULED',

  -- Delay info
  delay_minutes   INT DEFAULT 0,
  delay_reason    VARCHAR(255),

  -- Airport info
  departure_airport     VARCHAR(10),
  arrival_airport       VARCHAR(10),
  arrival_terminal      VARCHAR(20),
  arrival_gate          VARCHAR(10),
  baggage_claim         VARCHAR(10),

  -- Tracking source
  tracking_source       VARCHAR(50),
  last_checked          DATETIME,
  raw_data              JSON,

  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  UNIQUE KEY uk_booking (booking_id),
  INDEX idx_flight (flight_number, flight_date),
  INDEX idx_status (status),
  INDEX idx_arrival (estimated_arrival)
);

-- =====================================================
-- 4. NOTIFICATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,

  -- Recipient
  recipient_type  ENUM('CUSTOMER','DRIVER','SUPPLIER','DISPATCHER','AGENCY') NOT NULL,
  recipient_id    BIGINT,
  recipient_email VARCHAR(255),
  recipient_phone VARCHAR(50),

  -- Content
  type            ENUM(
    'BOOKING_CONFIRMED',
    'DRIVER_ASSIGNED',
    'DRIVER_EN_ROUTE',
    'DRIVER_ARRIVED',
    'TRIP_STARTED',
    'TRIP_COMPLETED',
    'FLIGHT_DELAYED',
    'PICKUP_TIME_CHANGED',
    'BOOKING_CANCELLED',
    'REVIEW_REQUEST',
    'PAYMENT_RECEIVED',
    'PAYOUT_SENT',
    'DOCUMENT_EXPIRING',
    'GENERAL'
  ) NOT NULL,

  title           VARCHAR(255) NOT NULL,
  message         TEXT NOT NULL,

  -- References
  booking_id      BIGINT,
  ride_id         BIGINT,

  -- Delivery
  channel         ENUM('EMAIL','SMS','PUSH','WHATSAPP','IN_APP') NOT NULL,
  status          ENUM('PENDING','SENT','DELIVERED','FAILED','READ') NOT NULL DEFAULT 'PENDING',

  sent_at         DATETIME,
  delivered_at    DATETIME,
  read_at         DATETIME,
  error_message   TEXT,

  -- Metadata
  metadata        JSON,

  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_recipient (recipient_type, recipient_id),
  INDEX idx_booking (booking_id),
  INDEX idx_type (type),
  INDEX idx_status (status),
  INDEX idx_created (created_at)
);

-- =====================================================
-- 5. MESSAGES (In-app messaging)
-- =====================================================

CREATE TABLE IF NOT EXISTS messages (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,

  -- Conversation reference
  booking_id      BIGINT NOT NULL,
  ride_id         BIGINT,

  -- Sender
  sender_type     ENUM('CUSTOMER','DRIVER','DISPATCHER','SYSTEM') NOT NULL,
  sender_id       BIGINT,
  sender_name     VARCHAR(255),

  -- Content
  message         TEXT NOT NULL,
  message_type    ENUM('TEXT','IMAGE','LOCATION','SYSTEM') NOT NULL DEFAULT 'TEXT',

  -- Attachments
  attachment_url  VARCHAR(500),
  location_lat    DECIMAL(10,7),
  location_lng    DECIMAL(10,7),

  -- Status
  is_read         BOOLEAN DEFAULT FALSE,
  read_at         DATETIME,

  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  INDEX idx_booking (booking_id),
  INDEX idx_ride (ride_id),
  INDEX idx_sender (sender_type, sender_id),
  INDEX idx_created (created_at)
);

-- =====================================================
-- 6. DISPATCH ISSUES / ALERTS
-- =====================================================

CREATE TABLE IF NOT EXISTS dispatch_issues (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,

  -- Reference
  booking_id      BIGINT,
  ride_id         BIGINT,
  driver_id       BIGINT,
  supplier_id     BIGINT,

  -- Issue details
  issue_type      ENUM(
    'NO_SHOW_CUSTOMER',
    'NO_SHOW_DRIVER',
    'DRIVER_LATE',
    'VEHICLE_BREAKDOWN',
    'ACCIDENT',
    'CUSTOMER_COMPLAINT',
    'DRIVER_COMPLAINT',
    'PAYMENT_ISSUE',
    'FLIGHT_ISSUE',
    'ADDRESS_ISSUE',
    'OTHER'
  ) NOT NULL,

  severity        ENUM('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL DEFAULT 'MEDIUM',

  title           VARCHAR(255) NOT NULL,
  description     TEXT,

  -- Status
  status          ENUM('OPEN','IN_PROGRESS','RESOLVED','ESCALATED','CLOSED') NOT NULL DEFAULT 'OPEN',

  -- Resolution
  resolution      TEXT,
  resolved_by     BIGINT,
  resolved_at     DATETIME,

  -- Reported
  reported_by     ENUM('CUSTOMER','DRIVER','DISPATCHER','SYSTEM') NOT NULL,
  reporter_id     BIGINT,

  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_booking (booking_id),
  INDEX idx_ride (ride_id),
  INDEX idx_type (issue_type),
  INDEX idx_severity (severity),
  INDEX idx_status (status),
  INDEX idx_created (created_at)
);

-- =====================================================
-- 7. DISPATCHER USERS
-- =====================================================

-- Update users table to include DISPATCHER role
-- Already done in initial schema, but adding dispatcher_settings

CREATE TABLE IF NOT EXISTS dispatcher_settings (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id         BIGINT NOT NULL UNIQUE,

  -- Notification preferences
  notify_new_issues         BOOLEAN DEFAULT TRUE,
  notify_escalations        BOOLEAN DEFAULT TRUE,
  notify_flight_delays      BOOLEAN DEFAULT TRUE,
  notify_driver_offline     BOOLEAN DEFAULT TRUE,

  -- Assignment preferences
  auto_assign_region        VARCHAR(100),
  max_concurrent_issues     INT DEFAULT 10,

  -- Shift info
  is_on_shift               BOOLEAN DEFAULT FALSE,
  shift_start               TIME,
  shift_end                 TIME,

  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- 8. DISPATCH ACTIONS LOG
-- =====================================================

CREATE TABLE IF NOT EXISTS dispatch_actions (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,

  dispatcher_id   BIGINT NOT NULL,

  -- Action details
  action_type     ENUM(
    'ASSIGN_DRIVER',
    'REASSIGN_DRIVER',
    'CANCEL_RIDE',
    'ADJUST_PICKUP_TIME',
    'CONTACT_CUSTOMER',
    'CONTACT_DRIVER',
    'RESOLVE_ISSUE',
    'ESCALATE_ISSUE',
    'ADD_NOTE',
    'OVERRIDE_SYSTEM',
    'MANUAL_NOTIFICATION'
  ) NOT NULL,

  -- References
  booking_id      BIGINT,
  ride_id         BIGINT,
  issue_id        BIGINT,

  -- Details
  description     TEXT,
  old_value       JSON,
  new_value       JSON,

  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (dispatcher_id) REFERENCES users(id),
  INDEX idx_dispatcher (dispatcher_id),
  INDEX idx_booking (booking_id),
  INDEX idx_action (action_type),
  INDEX idx_created (created_at)
);

-- =====================================================
-- 9. UPDATE BOOKINGS TABLE
-- =====================================================

-- Add pickup time adjustment tracking
ALTER TABLE bookings ADD COLUMN original_pickup_datetime DATETIME AFTER pickup_datetime;
ALTER TABLE bookings ADD COLUMN pickup_adjusted_reason VARCHAR(255) AFTER original_pickup_datetime;
ALTER TABLE bookings ADD COLUMN pickup_adjusted_at DATETIME AFTER pickup_adjusted_reason;

-- =====================================================
-- 10. UPDATE RIDES TABLE
-- =====================================================

-- Add more granular status tracking
ALTER TABLE rides ADD COLUMN driver_eta_minutes INT AFTER driver_id;
ALTER TABLE rides ADD COLUMN driver_distance_km DECIMAL(8,2) AFTER driver_eta_minutes;
ALTER TABLE rides ADD COLUMN driver_arrived_at DATETIME AFTER status;
ALTER TABLE rides ADD COLUMN passenger_picked_at DATETIME AFTER driver_arrived_at;
ALTER TABLE rides ADD COLUMN completed_at DATETIME AFTER passenger_picked_at;

-- =====================================================
-- 11. VIEWS FOR DISPATCH
-- =====================================================

-- Active rides requiring attention
CREATE OR REPLACE VIEW v_active_rides AS
SELECT
  r.id as ride_id,
  r.booking_id,
  b.public_code,
  b.pickup_datetime,
  b.pickup_address,
  b.dropoff_address,
  b.flight_number,
  a.name as airport_name,
  z.name as zone_name,
  r.status as ride_status,
  r.driver_id,
  d.full_name as driver_name,
  d.phone as driver_phone,
  s.name as supplier_name,
  s.contact_phone as supplier_phone,
  dl.latitude as driver_lat,
  dl.longitude as driver_lng,
  dl.status as driver_status,
  r.driver_eta_minutes,
  bp.full_name as customer_name,
  bp.phone as customer_phone,
  ft.status as flight_status,
  ft.delay_minutes as flight_delay,
  ft.estimated_arrival as flight_eta
FROM rides r
JOIN bookings b ON b.id = r.booking_id
LEFT JOIN airports a ON a.id = b.airport_id
LEFT JOIN zones z ON z.id = b.zone_id
LEFT JOIN drivers d ON d.id = r.driver_id
LEFT JOIN suppliers s ON s.id = r.supplier_id
LEFT JOIN driver_locations dl ON dl.driver_id = r.driver_id
LEFT JOIN booking_passengers bp ON bp.booking_id = b.id AND bp.is_lead = TRUE
LEFT JOIN flight_tracking ft ON ft.booking_id = b.id
WHERE r.status NOT IN ('COMPLETED', 'CANCELLED')
  AND b.pickup_datetime >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
ORDER BY b.pickup_datetime ASC;

-- Upcoming rides in next 4 hours
CREATE OR REPLACE VIEW v_upcoming_rides AS
SELECT * FROM v_active_rides
WHERE pickup_datetime BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 4 HOUR)
ORDER BY pickup_datetime ASC;

-- Open issues requiring attention
CREATE OR REPLACE VIEW v_open_issues AS
SELECT
  di.*,
  b.public_code,
  b.pickup_datetime,
  s.name as supplier_name,
  d.full_name as driver_name
FROM dispatch_issues di
LEFT JOIN bookings b ON b.id = di.booking_id
LEFT JOIN rides r ON r.id = di.ride_id
LEFT JOIN suppliers s ON s.id = di.supplier_id
LEFT JOIN drivers d ON d.id = di.driver_id
WHERE di.status IN ('OPEN', 'IN_PROGRESS')
ORDER BY
  CASE di.severity
    WHEN 'CRITICAL' THEN 1
    WHEN 'HIGH' THEN 2
    WHEN 'MEDIUM' THEN 3
    ELSE 4
  END,
  di.created_at ASC;

