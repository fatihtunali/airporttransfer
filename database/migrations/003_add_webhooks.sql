-- Migration: Add Webhooks System
-- Version: 003
-- Date: 2025-12-06
-- Description: Adds webhook subscriptions and delivery tracking tables

-- =====================================================
-- WEBHOOK SUBSCRIPTIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS webhook_subscriptions (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  agency_id       BIGINT NULL,
  supplier_id     BIGINT NULL,
  endpoint_url    VARCHAR(500) NOT NULL,
  secret          VARCHAR(128) NOT NULL,
  events          JSON NOT NULL COMMENT 'Array of subscribed event types',
  is_active       BOOLEAN DEFAULT TRUE,
  failure_count   INT DEFAULT 0,
  last_success_at DATETIME NULL,
  last_failure_at DATETIME NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,

  INDEX idx_agency (agency_id),
  INDEX idx_supplier (supplier_id),
  INDEX idx_active (is_active)
);

-- =====================================================
-- WEBHOOK DELIVERIES (Audit Log)
-- =====================================================

CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  subscription_id BIGINT NOT NULL,
  event_type      VARCHAR(50) NOT NULL,
  payload         TEXT NOT NULL,
  response_status INT NULL,
  response_body   TEXT NULL,
  delivered_at    DATETIME NULL,
  attempts        INT DEFAULT 1,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (subscription_id) REFERENCES webhook_subscriptions(id) ON DELETE CASCADE,

  INDEX idx_subscription (subscription_id),
  INDEX idx_event_type (event_type),
  INDEX idx_created (created_at)
);

-- =====================================================
-- SAMPLE WEBHOOK EVENTS REFERENCE
-- =====================================================

-- Available event types:
-- 'booking.created'    - New booking created
-- 'booking.confirmed'  - Booking confirmed
-- 'booking.cancelled'  - Booking cancelled
-- 'booking.modified'   - Booking details modified
-- 'booking.assigned'   - Driver/vehicle assigned
-- 'ride.started'       - Ride has started (driver en route)
-- 'ride.completed'     - Ride completed successfully
-- 'ride.no_show'       - Customer no-show
-- 'payment.received'   - Payment received
-- 'payment.refunded'   - Refund processed

SELECT 'Webhook tables created successfully!' AS Result;
