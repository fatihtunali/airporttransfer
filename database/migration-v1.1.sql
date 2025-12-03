-- AirportTransfer Database Migration v1.1
-- Aligns enums with OpenAPI spec v1.1.0
-- Date: 03 December 2025

-- =====================================================
-- 1. UPDATE VehicleType ENUM
-- OpenAPI: SEDAN, VAN, MINIBUS, BUS, VIP
-- DB had: SEDAN, MINIVAN, VAN, MINIBUS, BUS, VIP, LUXURY
-- Action: Remove MINIVAN and LUXURY, keep rest
-- =====================================================

-- Update vehicles table
ALTER TABLE vehicles
MODIFY COLUMN vehicle_type ENUM('SEDAN','VAN','MINIBUS','BUS','VIP') NOT NULL;

-- Update tariffs table
ALTER TABLE tariffs
MODIFY COLUMN vehicle_type ENUM('SEDAN','VAN','MINIBUS','BUS','VIP') NOT NULL;

-- Update bookings table
ALTER TABLE bookings
MODIFY COLUMN vehicle_type ENUM('SEDAN','VAN','MINIBUS','BUS','VIP') NOT NULL;

-- =====================================================
-- 2. UPDATE RideStatus ENUM
-- OpenAPI: PENDING_ASSIGN, ASSIGNED, ON_WAY, AT_PICKUP, IN_RIDE, FINISHED, NO_SHOW, CANCELLED
-- DB had: PENDING_ASSIGN, ASSIGNED, DRIVER_ON_WAY, AT_PICKUP, IN_PROGRESS, COMPLETED, NO_SHOW, CANCELLED
-- Changes: DRIVER_ON_WAY -> ON_WAY, IN_PROGRESS -> IN_RIDE, COMPLETED -> FINISHED
-- =====================================================

ALTER TABLE rides
MODIFY COLUMN status ENUM('PENDING_ASSIGN','ASSIGNED','ON_WAY','AT_PICKUP','IN_RIDE','FINISHED','NO_SHOW','CANCELLED') NOT NULL DEFAULT 'PENDING_ASSIGN';

-- =====================================================
-- 3. UPDATE BookingStatus ENUM
-- OpenAPI: PENDING, AWAITING_PAYMENT, CONFIRMED, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED
-- DB had: PENDING, AWAITING_PAYMENT, CONFIRMED, ASSIGNED, DRIVER_ON_WAY, AT_PICKUP, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW
-- Action: Simplify to match OpenAPI
-- =====================================================

ALTER TABLE bookings
MODIFY COLUMN status ENUM('PENDING','AWAITING_PAYMENT','CONFIRMED','ASSIGNED','IN_PROGRESS','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PENDING';

-- =====================================================
-- 4. UPDATE PaymentStatus ENUM (in bookings)
-- OpenAPI: UNPAID, PARTIALLY_PAID, PAID, REFUNDED
-- DB had: Same - OK
-- =====================================================
-- No change needed

-- =====================================================
-- 5. UPDATE PaymentProviderStatus ENUM (in payments table)
-- OpenAPI: PENDING, SUCCESS, FAILED, REFUNDED
-- DB had: PENDING, PROCESSING, SUCCESS, FAILED, REFUNDED, PARTIALLY_REFUNDED
-- Action: Simplify to match OpenAPI
-- =====================================================

ALTER TABLE payments
MODIFY COLUMN status ENUM('PENDING','SUCCESS','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING';

-- =====================================================
-- 6. UPDATE SupplierPayoutStatus ENUM
-- OpenAPI: PENDING, SCHEDULED, PAID, CANCELLED
-- DB had: PENDING, SCHEDULED, PROCESSING, PAID, CANCELLED
-- Action: Remove PROCESSING
-- =====================================================

ALTER TABLE supplier_payouts
MODIFY COLUMN status ENUM('PENDING','SCHEDULED','PAID','CANCELLED') NOT NULL DEFAULT 'PENDING';

-- =====================================================
-- 7. UPDATE TariffRuleType ENUM
-- OpenAPI: TIME_OF_DAY, DAY_OF_WEEK, SEASON, LAST_MINUTE
-- DB had: TIME_OF_DAY, DAY_OF_WEEK, SEASON, LAST_MINUTE, EXTRA
-- Action: Remove EXTRA
-- =====================================================

ALTER TABLE tariff_rules
MODIFY COLUMN rule_type ENUM('TIME_OF_DAY','DAY_OF_WEEK','SEASON','LAST_MINUTE') NOT NULL;

-- =====================================================
-- 8. Verify all changes
-- =====================================================

-- Show updated column types
SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'airporttransfer'
AND COLUMN_NAME IN ('vehicle_type', 'status', 'rule_type')
ORDER BY TABLE_NAME;
