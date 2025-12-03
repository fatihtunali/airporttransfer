-- Sample Data for Airport Transfer Portal
-- This seeds realistic test data for all modules

-- =====================================================
-- 1. SUPPLIERS (3 suppliers in Turkey)
-- =====================================================

INSERT INTO suppliers (id, name, legal_name, tax_number, contact_name, contact_email, contact_phone, whatsapp, country, city, address, logo_url, description, is_verified, is_active, commission_rate, rating_avg, rating_count, response_time_avg) VALUES
(1, 'Istanbul VIP Transfers', 'Istanbul VIP Turizm Ltd.', 'TR1234567890', 'Ahmet Yilmaz', 'info@istanbulvip.com', '+90 532 111 2233', '+90 532 111 2233', 'Turkey', 'Istanbul', 'Ataturk Mah. Havalimani Cad. No:42, Arnavutkoy', 'https://placehold.co/200x200?text=IVT', 'Premium airport transfer service in Istanbul with luxury vehicles and professional drivers. Serving IST and SAW airports since 2010.', 1, 1, 15.00, 4.85, 324, 12),
(2, 'Antalya Airport Shuttle', 'AAS Turizm ve Seyahat A.S.', 'TR0987654321', 'Mehmet Demir', 'reservations@antalyashuttle.com', '+90 533 222 4455', '+90 533 222 4455', 'Turkey', 'Antalya', 'Lara Mah. Turizm Cad. No:15, Muratpasa', 'https://placehold.co/200x200?text=AAS', 'Reliable and affordable airport transfers in Antalya region. Covering all resorts from Kemer to Alanya.', 1, 1, 12.00, 4.72, 856, 8),
(3, 'Cappadocia Express', 'Kapadokya Ekspres Turizm', 'TR5678901234', 'Fatma Ozturk', 'booking@cappadociaexpress.com', '+90 534 333 6677', '+90 534 333 6677', 'Turkey', 'Nevsehir', 'Goreme Kasabasi Uzundere Cad. No:8', 'https://placehold.co/200x200?text=CE', 'Specialized in Cappadocia airport transfers with local expertise. Hot air balloon tour pickups available.', 1, 1, 18.00, 4.91, 198, 15);

-- =====================================================
-- 2. VEHICLES (2-3 per supplier)
-- =====================================================

INSERT INTO vehicles (id, supplier_id, plate_number, brand, model, year, color, seat_count, luggage_count, vehicle_type, features, images, is_active) VALUES
-- Istanbul VIP Transfers
(1, 1, '34 VIP 001', 'Mercedes-Benz', 'E-Class', 2023, 'Black', 4, 3, 'SEDAN', '["wifi", "water", "child_seat", "phone_charger"]', '["https://placehold.co/400x300?text=Mercedes+E"]', 1),
(2, 1, '34 VIP 002', 'Mercedes-Benz', 'V-Class', 2022, 'Black', 7, 6, 'VAN', '["wifi", "water", "child_seat", "phone_charger", "lcd_screen"]', '["https://placehold.co/400x300?text=Mercedes+V"]', 1),
(3, 1, '34 VIP 003', 'Mercedes-Benz', 'S-Class', 2024, 'Black', 4, 2, 'VIP', '["wifi", "water", "champagne", "leather_seats", "privacy_glass"]', '["https://placehold.co/400x300?text=Mercedes+S"]', 1),
-- Antalya Airport Shuttle
(4, 2, '07 AAS 101', 'Volkswagen', 'Transporter', 2021, 'White', 8, 8, 'VAN', '["ac", "luggage_space"]', '["https://placehold.co/400x300?text=VW+Transporter"]', 1),
(5, 2, '07 AAS 102', 'Mercedes-Benz', 'Sprinter', 2022, 'White', 16, 16, 'MINIBUS', '["ac", "luggage_space", "reclining_seats"]', '["https://placehold.co/400x300?text=Sprinter"]', 1),
(6, 2, '07 AAS 103', 'Toyota', 'Corolla', 2023, 'Gray', 4, 2, 'SEDAN', '["ac", "phone_charger"]', '["https://placehold.co/400x300?text=Corolla"]', 1),
-- Cappadocia Express
(7, 3, '50 CAP 01', 'Ford', 'Tourneo Custom', 2022, 'Silver', 8, 8, 'VAN', '["ac", "wifi", "water"]', '["https://placehold.co/400x300?text=Tourneo"]', 1),
(8, 3, '50 CAP 02', 'Mercedes-Benz', 'Vito', 2023, 'Black', 7, 6, 'VAN', '["ac", "wifi", "water", "child_seat"]', '["https://placehold.co/400x300?text=Vito"]', 1);

-- =====================================================
-- 3. DRIVERS (2-3 per supplier)
-- =====================================================

INSERT INTO drivers (id, supplier_id, full_name, phone, email, license_number, license_expiry, photo_url, languages, is_active, rating_avg, rating_count) VALUES
-- Istanbul VIP Transfers
(1, 1, 'Kemal Yildiz', '+90 535 111 0001', 'kemal@istanbulvip.com', 'IST-2020-12345', '2026-05-15', 'https://placehold.co/150x150?text=KY', '["Turkish", "English", "German"]', 1, 4.92, 187),
(2, 1, 'Serkan Kaya', '+90 535 111 0002', 'serkan@istanbulvip.com', 'IST-2019-23456', '2025-08-20', 'https://placehold.co/150x150?text=SK', '["Turkish", "English"]', 1, 4.78, 156),
(3, 1, 'Burak Celik', '+90 535 111 0003', 'burak@istanbulvip.com', 'IST-2021-34567', '2027-01-10', 'https://placehold.co/150x150?text=BC', '["Turkish", "English", "Russian"]', 1, 4.88, 98),
-- Antalya Airport Shuttle
(4, 2, 'Mustafa Arslan', '+90 536 222 0001', 'mustafa@antalyashuttle.com', 'ANT-2018-45678', '2025-12-01', 'https://placehold.co/150x150?text=MA', '["Turkish", "English", "German", "Russian"]', 1, 4.75, 412),
(5, 2, 'Osman Ozkan', '+90 536 222 0002', 'osman@antalyashuttle.com', 'ANT-2020-56789', '2026-03-15', 'https://placehold.co/150x150?text=OO', '["Turkish", "English"]', 1, 4.68, 298),
(6, 2, 'Emre Sahin', '+90 536 222 0003', 'emre@antalyashuttle.com', 'ANT-2022-67890', '2028-06-30', 'https://placehold.co/150x150?text=ES', '["Turkish", "German"]', 1, 4.82, 124),
-- Cappadocia Express
(7, 3, 'Hasan Korkmaz', '+90 537 333 0001', 'hasan@cappadociaexpress.com', 'NEV-2019-78901', '2025-09-25', 'https://placehold.co/150x150?text=HK', '["Turkish", "English", "French"]', 1, 4.95, 89),
(8, 3, 'Ali Polat', '+90 537 333 0002', 'ali@cappadociaexpress.com', 'NEV-2021-89012', '2027-04-10', 'https://placehold.co/150x150?text=AP', '["Turkish", "English"]', 1, 4.87, 67);

-- =====================================================
-- 4. BOOKING PASSENGERS TABLE CHECK
-- =====================================================

-- Check if booking_passengers table exists
CREATE TABLE IF NOT EXISTS booking_passengers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  booking_id BIGINT NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  is_lead BOOLEAN DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  INDEX idx_booking (booking_id),
  INDEX idx_lead (is_lead)
);

-- =====================================================
-- 5. BOOKINGS (Various statuses and scenarios)
-- =====================================================

-- Get airport and zone IDs first (using the seed data from Turkey)
SET @ist_id = (SELECT id FROM airports WHERE code = 'IST' LIMIT 1);
SET @ayt_id = (SELECT id FROM airports WHERE code = 'AYT' LIMIT 1);
SET @nav_id = (SELECT id FROM airports WHERE code = 'NAV' LIMIT 1);

SET @taksim_id = (SELECT id FROM zones WHERE name LIKE '%Taksim%' LIMIT 1);
SET @sultanahmet_id = (SELECT id FROM zones WHERE name LIKE '%Sultanahmet%' LIMIT 1);
SET @belek_id = (SELECT id FROM zones WHERE name LIKE '%Belek%' LIMIT 1);
SET @kemer_id = (SELECT id FROM zones WHERE name LIKE '%Kemer%' LIMIT 1);
SET @goreme_id = (SELECT id FROM zones WHERE name LIKE '%Goreme%' OR name LIKE '%Göreme%' LIMIT 1);

-- If zones not found, use defaults
SET @taksim_id = COALESCE(@taksim_id, 1);
SET @sultanahmet_id = COALESCE(@sultanahmet_id, 2);
SET @belek_id = COALESCE(@belek_id, 10);
SET @kemer_id = COALESCE(@kemer_id, 11);
SET @goreme_id = COALESCE(@goreme_id, 20);

INSERT INTO bookings (id, public_code, supplier_id, airport_id, zone_id, direction, pickup_address, dropoff_address, flight_number, flight_date, flight_time, pickup_datetime, pax_adults, pax_children, pax_infants, luggage_count, vehicle_type, currency, base_price, extras_price, total_price, commission, supplier_payout, status, payment_status, customer_notes) VALUES
-- Active/Upcoming bookings for today
(1, 'ATP-2024-001', 1, @ist_id, @taksim_id, 'FROM_AIRPORT', 'Istanbul Airport (IST) - International Arrivals', 'Taksim Square, Beyoglu', 'TK1234', CURDATE(), '14:30:00', DATE_ADD(NOW(), INTERVAL 2 HOUR), 2, 0, 0, 2, 'SEDAN', 'EUR', 45.00, 5.00, 50.00, 7.50, 42.50, 'CONFIRMED', 'PAID', 'Please wait at arrivals with name sign'),
(2, 'ATP-2024-002', 1, @ist_id, @sultanahmet_id, 'FROM_AIRPORT', 'Istanbul Airport (IST) - Terminal 1', 'Sultanahmet, Fatih', 'LH1234', CURDATE(), '15:45:00', DATE_ADD(NOW(), INTERVAL 3 HOUR), 4, 2, 0, 4, 'VAN', 'EUR', 55.00, 10.00, 65.00, 9.75, 55.25, 'ASSIGNED', 'PAID', 'Family with children, need child seat'),
(3, 'ATP-2024-003', 2, @ayt_id, @belek_id, 'FROM_AIRPORT', 'Antalya Airport (AYT) - Domestic', 'Belek Resort Area', 'PC456', CURDATE(), '16:00:00', DATE_ADD(NOW(), INTERVAL 4 HOUR), 2, 0, 0, 3, 'SEDAN', 'EUR', 35.00, 0.00, 35.00, 4.20, 30.80, 'CONFIRMED', 'PAID', NULL),
(4, 'ATP-2024-004', 2, @ayt_id, @kemer_id, 'FROM_AIRPORT', 'Antalya Airport (AYT) - International', 'Kemer Town Center', 'SU789', CURDATE(), '17:30:00', DATE_ADD(NOW(), INTERVAL 5 HOUR), 3, 1, 0, 4, 'VAN', 'EUR', 55.00, 5.00, 60.00, 7.20, 52.80, 'PENDING', 'UNPAID', 'Russian speaking driver preferred'),

-- In Progress bookings
(5, 'ATP-2024-005', 1, @ist_id, @taksim_id, 'FROM_AIRPORT', 'Istanbul Airport (IST)', 'Taksim Hotel', 'TK5678', CURDATE(), '12:00:00', DATE_ADD(NOW(), INTERVAL -30 MINUTE), 2, 0, 0, 2, 'SEDAN', 'EUR', 45.00, 0.00, 45.00, 6.75, 38.25, 'IN_PROGRESS', 'PAID', NULL),
(6, 'ATP-2024-006', 2, @ayt_id, @belek_id, 'FROM_AIRPORT', 'Antalya Airport (AYT)', 'Titanic Deluxe Belek', 'TK4567', CURDATE(), '11:30:00', DATE_ADD(NOW(), INTERVAL -45 MINUTE), 4, 0, 0, 6, 'VAN', 'EUR', 40.00, 0.00, 40.00, 4.80, 35.20, 'IN_PROGRESS', 'PAID', NULL),

-- Completed today
(7, 'ATP-2024-007', 1, @ist_id, @sultanahmet_id, 'FROM_AIRPORT', 'Istanbul Airport (IST)', 'Four Seasons Sultanahmet', 'BA123', CURDATE(), '08:00:00', DATE_ADD(CURDATE(), INTERVAL 9 HOUR), 2, 0, 0, 2, 'VIP', 'EUR', 95.00, 15.00, 110.00, 16.50, 93.50, 'COMPLETED', 'PAID', 'VIP guest'),
(8, 'ATP-2024-008', 3, @nav_id, @goreme_id, 'FROM_AIRPORT', 'Nevsehir Airport (NAV)', 'Goreme Cave Hotel', 'TK890', CURDATE(), '09:30:00', DATE_ADD(CURDATE(), INTERVAL 10 HOUR), 2, 0, 0, 2, 'VAN', 'EUR', 45.00, 0.00, 45.00, 8.10, 36.90, 'COMPLETED', 'PAID', 'Early morning balloon tour next day'),

-- Upcoming tomorrow
(9, 'ATP-2024-009', 1, @ist_id, @taksim_id, 'TO_AIRPORT', 'Grand Hyatt Istanbul', 'Istanbul Airport (IST)', NULL, DATE_ADD(CURDATE(), INTERVAL 1 DAY), NULL, DATE_ADD(NOW(), INTERVAL 26 HOUR), 2, 0, 0, 3, 'SEDAN', 'EUR', 45.00, 0.00, 45.00, 6.75, 38.25, 'CONFIRMED', 'PAID', 'Flight at 15:00, pickup at 11:00'),
(10, 'ATP-2024-010', 2, @ayt_id, @belek_id, 'TO_AIRPORT', 'Regnum Carya Golf Resort', 'Antalya Airport (AYT)', NULL, DATE_ADD(CURDATE(), INTERVAL 1 DAY), NULL, DATE_ADD(NOW(), INTERVAL 28 HOUR), 6, 2, 0, 8, 'MINIBUS', 'EUR', 75.00, 10.00, 85.00, 10.20, 74.80, 'ASSIGNED', 'PAID', 'Large group, golf equipment');

-- =====================================================
-- 6. BOOKING PASSENGERS
-- =====================================================

INSERT INTO booking_passengers (booking_id, full_name, email, phone, is_lead) VALUES
(1, 'John Smith', 'john.smith@email.com', '+1 555 123 4567', TRUE),
(1, 'Jane Smith', 'jane.smith@email.com', NULL, FALSE),
(2, 'Michael Brown', 'm.brown@email.com', '+44 7700 900123', TRUE),
(2, 'Sarah Brown', NULL, NULL, FALSE),
(2, 'Emma Brown', NULL, NULL, FALSE),
(2, 'James Brown', NULL, NULL, FALSE),
(3, 'Hans Mueller', 'hans.mueller@email.de', '+49 170 1234567', TRUE),
(3, 'Greta Mueller', NULL, NULL, FALSE),
(4, 'Dmitry Petrov', 'dmitry@email.ru', '+7 916 123 4567', TRUE),
(4, 'Anna Petrov', NULL, NULL, FALSE),
(5, 'Robert Johnson', 'r.johnson@email.com', '+1 555 987 6543', TRUE),
(5, 'Lisa Johnson', NULL, NULL, FALSE),
(6, 'Klaus Weber', 'klaus.weber@email.de', '+49 160 9876543', TRUE),
(6, 'Maria Weber', NULL, NULL, FALSE),
(7, 'William Anderson', 'w.anderson@vip.com', '+1 212 555 0000', TRUE),
(7, 'Elizabeth Anderson', NULL, NULL, FALSE),
(8, 'Pierre Dubois', 'pierre@email.fr', '+33 6 12 34 56 78', TRUE),
(8, 'Marie Dubois', NULL, NULL, FALSE),
(9, 'David Wilson', 'd.wilson@company.com', '+1 555 111 2222', TRUE),
(9, 'Jennifer Wilson', NULL, NULL, FALSE),
(10, 'Thomas Schmidt', 't.schmidt@golf.de', '+49 171 5555555', TRUE);

-- =====================================================
-- 7. RIDES (linked to bookings)
-- =====================================================

INSERT INTO rides (id, booking_id, supplier_id, vehicle_id, driver_id, driver_eta_minutes, driver_distance_km, status, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, current_lat, current_lng) VALUES
-- Active ride - driver en route
(1, 1, 1, 1, 1, 15, 8.5, 'ON_WAY', 41.2614, 28.7420, 41.0369, 28.9850, 41.1500, 28.8500),
-- Active ride - driver assigned
(2, 2, 1, 2, 2, 45, 35.0, 'ASSIGNED', 41.2614, 28.7420, 41.0082, 28.9784, NULL, NULL),
-- Confirmed - pending driver assignment
(3, 3, 2, 4, 4, NULL, NULL, 'PENDING_ASSIGN', 36.8990, 30.8005, 36.8600, 31.0500, NULL, NULL),
(4, 4, 2, 4, NULL, NULL, NULL, 'PENDING_ASSIGN', 36.8990, 30.8005, 36.5950, 30.5550, NULL, NULL),
-- In progress rides
(5, 5, 1, 1, 3, 0, 0, 'IN_RIDE', 41.2614, 28.7420, 41.0369, 28.9850, 41.0800, 28.9200),
(6, 6, 2, 5, 5, 0, 0, 'IN_RIDE', 36.8990, 30.8005, 36.8600, 31.0500, 36.8800, 30.9200),
-- Completed rides
(7, 7, 1, 3, 1, 0, 0, 'FINISHED', 41.2614, 28.7420, 41.0082, 28.9784, 41.0082, 28.9784),
(8, 8, 3, 7, 7, 0, 0, 'FINISHED', 38.6242, 34.8263, 38.6431, 34.8297, 38.6431, 34.8297),
-- Tomorrow's rides
(9, 9, 1, 1, 2, NULL, NULL, 'ASSIGNED', 41.0400, 29.0100, 41.2614, 28.7420, NULL, NULL),
(10, 10, 2, 5, 6, NULL, NULL, 'ASSIGNED', 36.8600, 31.0500, 36.8990, 30.8005, NULL, NULL);

-- =====================================================
-- 8. DRIVER LOCATIONS (for live tracking)
-- =====================================================

INSERT INTO driver_locations (driver_id, latitude, longitude, accuracy, heading, speed, status, battery_level, updated_at) VALUES
(1, 41.1500, 28.8500, 5.0, 180.0, 45.0, 'ON_TRIP', 85, NOW()),
(2, 41.2614, 28.7420, 10.0, 0.0, 0.0, 'ONLINE', 92, NOW()),
(3, 41.0800, 28.9200, 5.0, 135.0, 55.0, 'ON_TRIP', 78, NOW()),
(4, 36.8990, 30.8005, 8.0, 0.0, 0.0, 'ONLINE', 95, NOW()),
(5, 36.8800, 30.9200, 5.0, 90.0, 60.0, 'ON_TRIP', 67, NOW()),
(6, 36.5500, 30.5300, 15.0, 0.0, 0.0, 'ONLINE', 100, NOW()),
(7, 38.6431, 34.8297, 5.0, 0.0, 0.0, 'ONLINE', 88, NOW()),
(8, 38.6400, 34.8350, 10.0, 0.0, 0.0, 'BREAK', 45, DATE_SUB(NOW(), INTERVAL 20 MINUTE));

-- =====================================================
-- 9. FLIGHT TRACKING
-- =====================================================

INSERT INTO flight_tracking (booking_id, flight_number, flight_date, scheduled_departure, scheduled_arrival, estimated_arrival, actual_arrival, status, delay_minutes, delay_reason, departure_airport, arrival_airport, arrival_terminal, arrival_gate, baggage_claim, tracking_source, last_checked) VALUES
(1, 'TK1234', CURDATE(), DATE_ADD(NOW(), INTERVAL -3 HOUR), DATE_ADD(NOW(), INTERVAL 2 HOUR), DATE_ADD(NOW(), INTERVAL 2 HOUR), NULL, 'EN_ROUTE', 0, NULL, 'JFK', 'IST', '1', 'B12', NULL, 'FlightAware', NOW()),
(2, 'LH1234', CURDATE(), DATE_ADD(NOW(), INTERVAL -2 HOUR), DATE_ADD(NOW(), INTERVAL 3 HOUR), DATE_ADD(NOW(), INTERVAL 3.5 HOUR), NULL, 'DELAYED', 30, 'Weather delay', 'FRA', 'IST', '1', NULL, NULL, 'FlightAware', NOW()),
(3, 'PC456', CURDATE(), DATE_ADD(NOW(), INTERVAL 1 HOUR), DATE_ADD(NOW(), INTERVAL 4 HOUR), DATE_ADD(NOW(), INTERVAL 4 HOUR), NULL, 'SCHEDULED', 0, NULL, 'IST', 'AYT', 'D', NULL, NULL, 'FlightAware', NOW()),
(4, 'SU789', CURDATE(), DATE_ADD(NOW(), INTERVAL 2 HOUR), DATE_ADD(NOW(), INTERVAL 5 HOUR), DATE_ADD(NOW(), INTERVAL 5.25 HOUR), NULL, 'DEPARTED', 15, 'Late departure', 'SVO', 'AYT', 'I', NULL, NULL, 'FlightAware', NOW()),
(5, 'TK5678', CURDATE(), DATE_ADD(NOW(), INTERVAL -5 HOUR), DATE_ADD(NOW(), INTERVAL -30 MINUTE), DATE_ADD(NOW(), INTERVAL -30 MINUTE), DATE_ADD(NOW(), INTERVAL -25 MINUTE), 'ARRIVED_GATE', 5, NULL, 'AMS', 'IST', '1', 'A15', '3', 'FlightAware', NOW()),
(6, 'TK4567', CURDATE(), DATE_ADD(NOW(), INTERVAL -4 HOUR), DATE_ADD(NOW(), INTERVAL -45 MINUTE), DATE_ADD(NOW(), INTERVAL -45 MINUTE), DATE_ADD(NOW(), INTERVAL -40 MINUTE), 'ARRIVED_GATE', 0, NULL, 'BER', 'AYT', 'D', 'D8', '2', 'FlightAware', NOW());

-- =====================================================
-- 10. DISPATCH ISSUES
-- =====================================================

INSERT INTO dispatch_issues (id, booking_id, ride_id, driver_id, supplier_id, issue_type, severity, title, description, status, resolution, reported_by, created_at) VALUES
(1, 2, 2, NULL, 1, 'FLIGHT_ISSUE', 'MEDIUM', 'Flight LH1234 delayed 30 minutes', 'Customer flight from Frankfurt delayed. Pickup time may need adjustment.', 'OPEN', NULL, 'SYSTEM', NOW()),
(2, 4, 4, NULL, 2, 'DRIVER_LATE', 'HIGH', 'No driver assigned for booking ATP-2024-004', 'Booking in 5 hours with no driver assigned. Need urgent assignment.', 'OPEN', NULL, 'SYSTEM', NOW()),
(3, NULL, NULL, 5, 2, 'VEHICLE_BREAKDOWN', 'CRITICAL', 'Vehicle 07 AAS 102 reported issue', 'Driver reported engine warning light. Vehicle may need replacement.', 'IN_PROGRESS', NULL, 'DRIVER', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(4, 7, 7, 1, 1, 'CUSTOMER_COMPLAINT', 'LOW', 'Minor complaint about AC', 'Customer mentioned AC was too cold during ride. Issue resolved during trip.', 'RESOLVED', 'Driver adjusted AC temperature. Customer satisfied at end of trip.', 'CUSTOMER', DATE_SUB(NOW(), INTERVAL 3 HOUR));

-- =====================================================
-- 11. MESSAGES
-- =====================================================

INSERT INTO messages (booking_id, ride_id, sender_type, sender_id, sender_name, message, message_type, is_read, created_at) VALUES
-- Booking 1 conversation
(1, 1, 'SYSTEM', NULL, 'System', 'Booking confirmed. Driver will be assigned shortly.', 'SYSTEM', TRUE, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(1, 1, 'SYSTEM', NULL, 'System', 'Driver Kemal Yildiz has been assigned to your transfer.', 'SYSTEM', TRUE, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(1, 1, 'CUSTOMER', NULL, 'John Smith', 'Hi, I have 2 large suitcases, is that okay?', 'TEXT', TRUE, DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
(1, 1, 'DRIVER', 1, 'Kemal Yildiz', 'Hello! No problem, we have plenty of space. See you soon!', 'TEXT', TRUE, DATE_SUB(NOW(), INTERVAL 40 MINUTE)),
(1, 1, 'SYSTEM', NULL, 'System', 'Driver is now en route to pickup location.', 'SYSTEM', FALSE, DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
-- Booking 2 conversation
(2, 2, 'SYSTEM', NULL, 'System', 'Flight LH1234 is delayed by 30 minutes. Pickup time adjusted.', 'SYSTEM', FALSE, DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
(2, 2, 'DISPATCHER', NULL, 'Dispatcher', 'We have noted the flight delay. Your driver will arrive at the new estimated time.', 'TEXT', FALSE, DATE_SUB(NOW(), INTERVAL 25 MINUTE)),
-- Booking 5 conversation
(5, 5, 'DRIVER', 3, 'Burak Celik', 'I have arrived at Terminal 1 Arrivals. Holding sign with your name.', 'TEXT', TRUE, DATE_SUB(NOW(), INTERVAL 35 MINUTE)),
(5, 5, 'CUSTOMER', NULL, 'Robert Johnson', 'Just collecting luggage, will be there in 5 mins', 'TEXT', TRUE, DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
(5, 5, 'DRIVER', 3, 'Burak Celik', 'No problem, I am waiting by the exit doors.', 'TEXT', TRUE, DATE_SUB(NOW(), INTERVAL 28 MINUTE)),
(5, 5, 'SYSTEM', NULL, 'System', 'Passenger picked up. Transfer in progress.', 'SYSTEM', TRUE, DATE_SUB(NOW(), INTERVAL 20 MINUTE));

-- =====================================================
-- 12. NOTIFICATIONS
-- =====================================================

INSERT INTO notifications (recipient_type, recipient_id, recipient_email, recipient_phone, type, title, message, booking_id, ride_id, channel, status, sent_at, delivered_at) VALUES
('CUSTOMER', NULL, 'john.smith@email.com', '+1 555 123 4567', 'DRIVER_EN_ROUTE', 'Driver on the way!', 'Your driver Kemal Yildiz is on the way. ETA: 15 minutes.', 1, 1, 'EMAIL', 'DELIVERED', DATE_SUB(NOW(), INTERVAL 10 MINUTE), DATE_SUB(NOW(), INTERVAL 9 MINUTE)),
('CUSTOMER', NULL, 'm.brown@email.com', '+44 7700 900123', 'FLIGHT_DELAYED', 'Flight Delay Detected', 'Your flight LH1234 is delayed by 30 minutes. We have adjusted your pickup time.', 2, 2, 'EMAIL', 'DELIVERED', DATE_SUB(NOW(), INTERVAL 30 MINUTE), DATE_SUB(NOW(), INTERVAL 29 MINUTE)),
('DRIVER', 1, 'kemal@istanbulvip.com', '+90 535 111 0001', 'BOOKING_CONFIRMED', 'New Booking Assigned', 'You have been assigned to booking ATP-2024-001. Pickup at 14:30.', 1, 1, 'PUSH', 'DELIVERED', DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 59 MINUTE)),
('SUPPLIER', 2, 'reservations@antalyashuttle.com', '+90 533 222 4455', 'GENERAL', 'Action Required', 'Booking ATP-2024-004 needs driver assignment urgently.', 4, 4, 'EMAIL', 'SENT', DATE_SUB(NOW(), INTERVAL 15 MINUTE), NULL);

-- =====================================================
-- 13. TARIFFS (Sample pricing)
-- =====================================================

-- Get route IDs
SET @route_ist_taksim = (SELECT id FROM routes WHERE airport_id = @ist_id AND zone_id = @taksim_id LIMIT 1);
SET @route_ist_sultanahmet = (SELECT id FROM routes WHERE airport_id = @ist_id AND zone_id = @sultanahmet_id LIMIT 1);
SET @route_ayt_belek = (SELECT id FROM routes WHERE airport_id = @ayt_id AND zone_id = @belek_id LIMIT 1);
SET @route_ayt_kemer = (SELECT id FROM routes WHERE airport_id = @ayt_id AND zone_id = @kemer_id LIMIT 1);
SET @route_nav_goreme = (SELECT id FROM routes WHERE airport_id = @nav_id AND zone_id = @goreme_id LIMIT 1);

-- Use default route IDs if not found
SET @route_ist_taksim = COALESCE(@route_ist_taksim, 1);
SET @route_ist_sultanahmet = COALESCE(@route_ist_sultanahmet, 2);
SET @route_ayt_belek = COALESCE(@route_ayt_belek, 10);
SET @route_ayt_kemer = COALESCE(@route_ayt_kemer, 11);
SET @route_nav_goreme = COALESCE(@route_nav_goreme, 20);

INSERT INTO tariffs (id, supplier_id, route_id, vehicle_type, base_price, currency, is_active) VALUES
(1, 1, @route_ist_taksim, 'SEDAN', 45.00, 'EUR', 1),
(2, 1, @route_ist_taksim, 'VAN', 55.00, 'EUR', 1),
(3, 1, @route_ist_taksim, 'VIP', 95.00, 'EUR', 1),
(4, 1, @route_ist_sultanahmet, 'SEDAN', 50.00, 'EUR', 1),
(5, 1, @route_ist_sultanahmet, 'VAN', 60.00, 'EUR', 1),
(6, 2, @route_ayt_belek, 'SEDAN', 35.00, 'EUR', 1),
(7, 2, @route_ayt_belek, 'VAN', 40.00, 'EUR', 1),
(8, 2, @route_ayt_belek, 'MINIBUS', 75.00, 'EUR', 1),
(9, 2, @route_ayt_kemer, 'SEDAN', 45.00, 'EUR', 1),
(10, 2, @route_ayt_kemer, 'VAN', 55.00, 'EUR', 1),
(11, 3, @route_nav_goreme, 'VAN', 45.00, 'EUR', 1);

SELECT 'Sample data inserted successfully!' as message;
