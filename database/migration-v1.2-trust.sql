-- AirportTransfer Database Migration v1.2
-- Trust Infrastructure - SLA Rules & Cancellation Policies
-- Date: 03 December 2025

-- =====================================================
-- SLA RULES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS sla_rules (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  rule_key      VARCHAR(100) UNIQUE NOT NULL,
  rule_name     VARCHAR(255) NOT NULL,
  rule_value    VARCHAR(500) NOT NULL,
  description   TEXT,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_rule_key (rule_key),
  INDEX idx_active (is_active)
);

-- =====================================================
-- DEFAULT SLA RULES
-- =====================================================

INSERT INTO sla_rules (rule_key, rule_name, rule_value, description) VALUES
-- Response Times
('max_response_time_minutes', 'Maximum Response Time', '30', 'Maximum time for supplier to respond to booking request (minutes)'),
('auto_accept_enabled', 'Auto-Accept Enabled', 'true', 'Allow suppliers to enable auto-accept for bookings'),

-- Cancellation Policies
('free_cancel_hours_before', 'Free Cancellation Window', '48', 'Hours before pickup for free cancellation'),
('partial_refund_hours_before', 'Partial Refund Window', '24', 'Hours before pickup for 50% refund'),
('no_refund_hours_before', 'No Refund Window', '12', 'Hours before pickup with no refund'),

-- No-Show & Penalties
('no_show_charge_percent', 'No-Show Charge', '100', 'Percentage charged to customer for no-show'),
('supplier_no_show_penalty', 'Supplier No-Show Penalty', '50', 'EUR penalty for supplier failing to show'),
('late_arrival_threshold_minutes', 'Late Arrival Threshold', '15', 'Minutes late before penalty applies'),

-- Flight Delay Handling
('free_waiting_minutes_airport', 'Free Waiting (Airport)', '60', 'Free waiting time at airport pickups (minutes)'),
('free_waiting_minutes_other', 'Free Waiting (Other)', '15', 'Free waiting time for non-airport pickups (minutes)'),
('flight_tracking_enabled', 'Flight Tracking', 'true', 'Enable automatic flight tracking for delays'),

-- SLA Breach
('sla_breach_warning_count', 'SLA Warning Threshold', '3', 'Number of SLA breaches before warning'),
('sla_breach_suspension_count', 'SLA Suspension Threshold', '5', 'Number of SLA breaches before account suspension'),

-- Review Settings
('review_request_delay_hours', 'Review Request Delay', '2', 'Hours after completion to send review request'),
('min_rating_for_featured', 'Minimum Rating for Featured', '4.5', 'Minimum average rating to be featured');

-- =====================================================
-- CANCELLATION POLICIES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS cancellation_policies (
  id                BIGINT PRIMARY KEY AUTO_INCREMENT,
  policy_code       VARCHAR(50) UNIQUE NOT NULL,
  policy_name       VARCHAR(255) NOT NULL,
  description       TEXT,
  hours_before      INT NOT NULL,
  refund_percent    INT NOT NULL,
  is_default        BOOLEAN DEFAULT FALSE,
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_policy_code (policy_code)
);

INSERT INTO cancellation_policies (policy_code, policy_name, description, hours_before, refund_percent, is_default) VALUES
('FREE_CANCEL_48H', 'Free Cancellation (48h)', 'Full refund if cancelled 48+ hours before pickup', 48, 100, TRUE),
('PARTIAL_REFUND_24H', 'Partial Refund (24h)', '50% refund if cancelled 24-48 hours before pickup', 24, 50, FALSE),
('NO_REFUND_12H', 'No Refund (12h)', 'No refund if cancelled less than 12 hours before pickup', 12, 0, FALSE),
('FLEXIBLE', 'Flexible', 'Full refund anytime up to 24 hours before', 24, 100, FALSE),
('NON_REFUNDABLE', 'Non-Refundable', 'No refund at any time, lowest price', 0, 0, FALSE);

-- =====================================================
-- SUPPLIER SLA METRICS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS supplier_sla_metrics (
  id                    BIGINT PRIMARY KEY AUTO_INCREMENT,
  supplier_id           BIGINT NOT NULL,
  metric_date           DATE NOT NULL,
  total_bookings        INT DEFAULT 0,
  completed_bookings    INT DEFAULT 0,
  cancelled_bookings    INT DEFAULT 0,
  no_shows              INT DEFAULT 0,
  late_arrivals         INT DEFAULT 0,
  avg_response_time_min INT DEFAULT 0,
  sla_breaches          INT DEFAULT 0,
  customer_complaints   INT DEFAULT 0,
  created_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_supplier_date (supplier_id, metric_date),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
  INDEX idx_supplier (supplier_id),
  INDEX idx_date (metric_date)
);

-- =====================================================
-- DOCUMENT EXPIRY ALERTS VIEW
-- =====================================================

CREATE OR REPLACE VIEW v_expiring_documents AS
SELECT
  'supplier' as entity_type,
  sd.supplier_id as entity_id,
  s.name as entity_name,
  sd.doc_type,
  sd.doc_name,
  sd.expiry_date,
  DATEDIFF(sd.expiry_date, CURDATE()) as days_until_expiry,
  CASE
    WHEN sd.expiry_date < CURDATE() THEN 'EXPIRED'
    WHEN DATEDIFF(sd.expiry_date, CURDATE()) <= 7 THEN 'CRITICAL'
    WHEN DATEDIFF(sd.expiry_date, CURDATE()) <= 30 THEN 'WARNING'
    ELSE 'OK'
  END as expiry_status
FROM supplier_documents sd
JOIN suppliers s ON s.id = sd.supplier_id
WHERE sd.expiry_date IS NOT NULL AND sd.is_verified = TRUE

UNION ALL

SELECT
  'driver' as entity_type,
  d.id as entity_id,
  d.full_name as entity_name,
  dd.doc_type,
  dd.doc_name,
  dd.expiry_date,
  DATEDIFF(dd.expiry_date, CURDATE()) as days_until_expiry,
  CASE
    WHEN dd.expiry_date < CURDATE() THEN 'EXPIRED'
    WHEN DATEDIFF(dd.expiry_date, CURDATE()) <= 7 THEN 'CRITICAL'
    WHEN DATEDIFF(dd.expiry_date, CURDATE()) <= 30 THEN 'WARNING'
    ELSE 'OK'
  END as expiry_status
FROM driver_documents dd
JOIN drivers d ON d.id = dd.driver_id
WHERE dd.expiry_date IS NOT NULL AND dd.is_verified = TRUE

UNION ALL

SELECT
  'vehicle' as entity_type,
  v.id as entity_id,
  CONCAT(v.brand, ' ', v.model, ' (', v.plate_number, ')') as entity_name,
  vd.doc_type,
  vd.doc_name,
  vd.expiry_date,
  DATEDIFF(vd.expiry_date, CURDATE()) as days_until_expiry,
  CASE
    WHEN vd.expiry_date < CURDATE() THEN 'EXPIRED'
    WHEN DATEDIFF(vd.expiry_date, CURDATE()) <= 7 THEN 'CRITICAL'
    WHEN DATEDIFF(vd.expiry_date, CURDATE()) <= 30 THEN 'WARNING'
    ELSE 'OK'
  END as expiry_status
FROM vehicle_documents vd
JOIN vehicles v ON v.id = vd.vehicle_id
WHERE vd.expiry_date IS NOT NULL AND vd.is_verified = TRUE;
