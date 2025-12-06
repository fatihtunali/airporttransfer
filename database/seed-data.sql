-- AirportTransfer Portal - Seed Data Script
-- Version: 1.0
-- Date: 04 December 2024
-- Run this after schema.sql to populate test data

-- =====================================================
-- CLEAR EXISTING DATA (Optional - Uncomment if needed)
-- =====================================================
-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE activity_logs;
-- TRUNCATE TABLE notifications;
-- TRUNCATE TABLE reviews;
-- TRUNCATE TABLE supplier_payouts;
-- TRUNCATE TABLE payments;
-- TRUNCATE TABLE booking_extras;
-- TRUNCATE TABLE booking_passengers;
-- TRUNCATE TABLE rides;
-- TRUNCATE TABLE bookings;
-- TRUNCATE TABLE extras;
-- TRUNCATE TABLE tariff_rules;
-- TRUNCATE TABLE tariffs;
-- TRUNCATE TABLE supplier_zone_coverage;
-- TRUNCATE TABLE supplier_service_zones;
-- TRUNCATE TABLE driver_documents;
-- TRUNCATE TABLE drivers;
-- TRUNCATE TABLE vehicle_documents;
-- TRUNCATE TABLE vehicles;
-- TRUNCATE TABLE routes;
-- TRUNCATE TABLE zones;
-- TRUNCATE TABLE airports;
-- TRUNCATE TABLE supplier_documents;
-- TRUNCATE TABLE supplier_users;
-- TRUNCATE TABLE agency_users;
-- TRUNCATE TABLE agencies;
-- TRUNCATE TABLE suppliers;
-- TRUNCATE TABLE users;
-- SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 1. USERS
-- =====================================================
-- Password for all users: Password123! (hashed with bcrypt)
-- $2b$10$rqQv5rRPt.5v5rRPt.5rOeABCD... (use proper hash in production)

INSERT INTO users (id, email, password_hash, full_name, phone, role, is_active, email_verified) VALUES
-- Admin Users
(1, 'admin@airporttransferportal.com', '$2b$10$K1qTvRQEqH0PEBK6qTvRQeJlKvH0PEBK6qTvRQeJlKvH0PEBK6qTv', 'System Admin', '+1-555-0001', 'ADMIN', TRUE, TRUE),
(2, 'manager@airporttransferportal.com', '$2b$10$K1qTvRQEqH0PEBK6qTvRQeJlKvH0PEBK6qTvRQeJlKvH0PEBK6qTv', 'Operations Manager', '+1-555-0002', 'ADMIN', TRUE, TRUE),

-- Supplier Users (London)
(10, 'london@premiumtransfers.com', '$2b$10$K1qTvRQEqH0PEBK6qTvRQeJlKvH0PEBK6qTvRQeJlKvH0PEBK6qTv', 'James Wilson', '+44-20-7946-0958', 'SUPPLIER_OWNER', TRUE, TRUE),
(11, 'dispatch@premiumtransfers.com', '$2b$10$K1qTvRQEqH0PEBK6qTvRQeJlKvH0PEBK6qTvRQeJlKvH0PEBK6qTv', 'Sarah Johnson', '+44-20-7946-0959', 'DISPATCHER', TRUE, TRUE),
(12, 'driver1@premiumtransfers.com', '$2b$10$K1qTvRQEqH0PEBK6qTvRQeJlKvH0PEBK6qTvRQeJlKvH0PEBK6qTv', 'Michael Brown', '+44-7700-900100', 'DRIVER', TRUE, TRUE),
(13, 'driver2@premiumtransfers.com', '$2b$10$K1qTvRQEqH0PEBK6qTvRQeJlKvH0PEBK6qTvRQeJlKvH0PEBK6qTv', 'David Smith', '+44-7700-900101', 'DRIVER', TRUE, TRUE),

-- Supplier Users (Paris)
(20, 'paris@elitetransfers.fr', '$2b$10$K1qTvRQEqH0PEBK6qTvRQeJlKvH0PEBK6qTvRQeJlKvH0PEBK6qTv', 'Pierre Dubois', '+33-1-42-96-0001', 'SUPPLIER_OWNER', TRUE, TRUE),
(21, 'dispatch@elitetransfers.fr', '$2b$10$K1qTvRQEqH0PEBK6qTvRQeJlKvH0PEBK6qTvRQeJlKvH0PEBK6qTv', 'Marie Laurent', '+33-1-42-96-0002', 'DISPATCHER', TRUE, TRUE),

-- Supplier Users (Istanbul)
(30, 'istanbul@viptransfer.tr', '$2b$10$K1qTvRQEqH0PEBK6qTvRQeJlKvH0PEBK6qTvRQeJlKvH0PEBK6qTv', 'Ahmet Yilmaz', '+90-212-555-0001', 'SUPPLIER_OWNER', TRUE, TRUE),
(31, 'dispatch@viptransfer.tr', '$2b$10$K1qTvRQEqH0PEBK6qTvRQeJlKvH0PEBK6qTvRQeJlKvH0PEBK6qTv', 'Ayse Kaya', '+90-212-555-0002', 'DISPATCHER', TRUE, TRUE),

-- Agency Users
(50, 'agency@travelcorp.com', '$2b$10$K1qTvRQEqH0PEBK6qTvRQeJlKvH0PEBK6qTvRQeJlKvH0PEBK6qTv', 'Travel Corp Manager', '+1-555-1000', 'END_CUSTOMER', TRUE, TRUE),
(51, 'booker@travelcorp.com', '$2b$10$K1qTvRQEqH0PEBK6qTvRQeJlKvH0PEBK6qTvRQeJlKvH0PEBK6qTv', 'Travel Corp Booker', '+1-555-1001', 'END_CUSTOMER', TRUE, TRUE),

-- End Customers
(100, 'john.doe@email.com', '$2b$10$K1qTvRQEqH0PEBK6qTvRQeJlKvH0PEBK6qTvRQeJlKvH0PEBK6qTv', 'John Doe', '+1-555-2000', 'END_CUSTOMER', TRUE, TRUE),
(101, 'jane.smith@email.com', '$2b$10$K1qTvRQEqH0PEBK6qTvRQeJlKvH0PEBK6qTvRQeJlKvH0PEBK6qTv', 'Jane Smith', '+1-555-2001', 'END_CUSTOMER', TRUE, TRUE);

-- =====================================================
-- 2. SUPPLIERS
-- =====================================================

INSERT INTO suppliers (id, name, legal_name, tax_number, contact_name, contact_email, contact_phone, whatsapp, country, city, address, description, is_verified, is_active, commission_rate, rating_avg, rating_count) VALUES
-- London Supplier
(1, 'Premium London Transfers', 'Premium London Transfers Ltd', 'GB123456789', 'James Wilson', 'london@premiumtransfers.com', '+44-20-7946-0958', '+447700900000', 'United Kingdom', 'London', 'Mehmet Akif Ersoy Mah Hanimeli Sok NO 5/B, Uskudar, Istanbul', 'Premium airport transfer service in London with luxury vehicles and professional drivers.', TRUE, TRUE, 15.00, 4.85, 1250),

-- Paris Supplier
(2, 'Elite Paris Transfers', 'Elite Transfers SARL', 'FR12345678901', 'Pierre Dubois', 'paris@elitetransfers.fr', '+33-1-42-96-0001', '+33612345678', 'France', 'Paris', '45 Rue de Transfer, 75001 Paris', 'Service de transfert aéroport de luxe à Paris avec des chauffeurs professionnels.', TRUE, TRUE, 15.00, 4.78, 890),

-- Istanbul Supplier
(3, 'VIP Istanbul Transfer', 'VIP Transfer Ltd. Sti.', 'TR1234567890', 'Ahmet Yilmaz', 'istanbul@viptransfer.tr', '+90-212-555-0001', '+905551234567', 'Turkey', 'Istanbul', 'Transfer Cad. No:1, Besiktas, Istanbul', 'Istanbul havalimanı VIP transfer hizmetleri. Konforlu araçlar ve profesyonel sürücüler.', TRUE, TRUE, 12.00, 4.90, 2100),

-- Barcelona Supplier
(4, 'Barcelona Airport Shuttle', 'BCN Shuttle S.L.', 'ES12345678A', 'Carlos Garcia', 'barcelona@bcnshuttle.es', '+34-93-123-4567', '+34612345678', 'Spain', 'Barcelona', 'Carrer de Transfer 10, 08001 Barcelona', 'Servicio de traslado al aeropuerto de Barcelona con vehículos modernos.', TRUE, TRUE, 15.00, 4.72, 650),

-- Dubai Supplier
(5, 'Dubai Luxury Transfers', 'Dubai Luxury Transport LLC', 'AE123456789', 'Mohammed Al-Rashid', 'dubai@luxurytransfers.ae', '+971-4-123-4567', '+971501234567', 'UAE', 'Dubai', 'Transfer Tower, Sheikh Zayed Road, Dubai', 'Premium airport transfer service in Dubai with luxury fleet.', TRUE, TRUE, 18.00, 4.95, 1800);

-- Link users to suppliers
INSERT INTO supplier_users (supplier_id, user_id, role, is_active) VALUES
(1, 10, 'OWNER', TRUE),
(1, 11, 'DISPATCHER', TRUE),
(2, 20, 'OWNER', TRUE),
(2, 21, 'DISPATCHER', TRUE),
(3, 30, 'OWNER', TRUE),
(3, 31, 'DISPATCHER', TRUE);

-- =====================================================
-- 3. AIRPORTS
-- =====================================================

INSERT INTO airports (id, code, name, name_local, city, country, country_code, timezone, latitude, longitude, is_active) VALUES
-- UK
(1, 'LHR', 'London Heathrow Airport', NULL, 'London', 'United Kingdom', 'GB', 'Europe/London', 51.4700223, -0.4542955, TRUE),
(2, 'LGW', 'London Gatwick Airport', NULL, 'London', 'United Kingdom', 'GB', 'Europe/London', 51.1536621, -0.1820629, TRUE),
(3, 'STN', 'London Stansted Airport', NULL, 'London', 'United Kingdom', 'GB', 'Europe/London', 51.8860181, 0.2388661, TRUE),
(4, 'LTN', 'London Luton Airport', NULL, 'London', 'United Kingdom', 'GB', 'Europe/London', 51.8746548, -0.3685173, TRUE),

-- France
(10, 'CDG', 'Paris Charles de Gaulle', 'Aéroport Paris-Charles-de-Gaulle', 'Paris', 'France', 'FR', 'Europe/Paris', 49.0096906, 2.5479245, TRUE),
(11, 'ORY', 'Paris Orly Airport', 'Aéroport Paris-Orly', 'Paris', 'France', 'FR', 'Europe/Paris', 48.7262433, 2.3652469, TRUE),

-- Turkey
(20, 'IST', 'Istanbul Airport', 'İstanbul Havalimanı', 'Istanbul', 'Turkey', 'TR', 'Europe/Istanbul', 41.2619444, 28.7419444, TRUE),
(21, 'SAW', 'Sabiha Gökçen Airport', 'Sabiha Gökçen Havalimanı', 'Istanbul', 'Turkey', 'TR', 'Europe/Istanbul', 40.8986111, 29.3091667, TRUE),
(22, 'AYT', 'Antalya Airport', 'Antalya Havalimanı', 'Antalya', 'Turkey', 'TR', 'Europe/Istanbul', 36.8986720, 30.8006420, TRUE),

-- Spain
(30, 'BCN', 'Barcelona El Prat Airport', 'Aeropuerto de Barcelona-El Prat', 'Barcelona', 'Spain', 'ES', 'Europe/Madrid', 41.2974370, 2.0833330, TRUE),
(31, 'MAD', 'Madrid Barajas Airport', 'Aeropuerto Adolfo Suárez Madrid-Barajas', 'Madrid', 'Spain', 'ES', 'Europe/Madrid', 40.4722222, -3.5608333, TRUE),

-- UAE
(40, 'DXB', 'Dubai International Airport', NULL, 'Dubai', 'UAE', 'AE', 'Asia/Dubai', 25.2531745, 55.3656728, TRUE),
(41, 'DWC', 'Al Maktoum International Airport', NULL, 'Dubai', 'UAE', 'AE', 'Asia/Dubai', 24.8964400, 55.1613700, TRUE),

-- Netherlands
(50, 'AMS', 'Amsterdam Schiphol Airport', NULL, 'Amsterdam', 'Netherlands', 'NL', 'Europe/Amsterdam', 52.3105386, 4.7682744, TRUE),

-- Italy
(60, 'FCO', 'Rome Fiumicino Airport', 'Aeroporto Leonardo da Vinci', 'Rome', 'Italy', 'IT', 'Europe/Rome', 41.8045170, 12.2508330, TRUE),

-- USA
(70, 'JFK', 'John F. Kennedy International Airport', NULL, 'New York', 'USA', 'US', 'America/New_York', 40.6413111, -73.7781391, TRUE);

-- =====================================================
-- 4. ZONES
-- =====================================================

INSERT INTO zones (id, name, name_local, city, country, country_code, zone_type, latitude, longitude, is_popular, is_active) VALUES
-- London Zones
(1, 'Central London', NULL, 'London', 'United Kingdom', 'GB', 'CITY_CENTER', 51.5074, -0.1278, TRUE, TRUE),
(2, 'Westminster', NULL, 'London', 'United Kingdom', 'GB', 'DISTRICT', 51.4975, -0.1357, TRUE, TRUE),
(3, 'Kensington', NULL, 'London', 'United Kingdom', 'GB', 'DISTRICT', 51.4990, -0.1991, TRUE, TRUE),
(4, 'Camden', NULL, 'London', 'United Kingdom', 'GB', 'DISTRICT', 51.5290, -0.1255, FALSE, TRUE),
(5, 'Canary Wharf', NULL, 'London', 'United Kingdom', 'GB', 'DISTRICT', 51.5054, -0.0235, TRUE, TRUE),
(6, 'Mayfair', NULL, 'London', 'United Kingdom', 'GB', 'DISTRICT', 51.5100, -0.1470, TRUE, TRUE),

-- Paris Zones
(10, 'Paris City Center', 'Centre de Paris', 'Paris', 'France', 'FR', 'CITY_CENTER', 48.8566, 2.3522, TRUE, TRUE),
(11, 'Champs-Élysées', NULL, 'Paris', 'France', 'FR', 'DISTRICT', 48.8698, 2.3078, TRUE, TRUE),
(12, 'Montmartre', NULL, 'Paris', 'France', 'FR', 'DISTRICT', 48.8867, 2.3431, TRUE, TRUE),
(13, 'La Défense', NULL, 'Paris', 'France', 'FR', 'DISTRICT', 48.8918, 2.2378, TRUE, TRUE),
(14, 'Disneyland Paris', NULL, 'Paris', 'France', 'FR', 'RESORT', 48.8673, 2.7838, TRUE, TRUE),

-- Istanbul Zones
(20, 'Istanbul City Center', 'Şehir Merkezi', 'Istanbul', 'Turkey', 'TR', 'CITY_CENTER', 41.0082, 28.9784, TRUE, TRUE),
(21, 'Taksim', NULL, 'Istanbul', 'Turkey', 'TR', 'DISTRICT', 41.0370, 28.9850, TRUE, TRUE),
(22, 'Sultanahmet', NULL, 'Istanbul', 'Turkey', 'TR', 'DISTRICT', 41.0054, 28.9768, TRUE, TRUE),
(23, 'Kadıköy', NULL, 'Istanbul', 'Turkey', 'TR', 'DISTRICT', 40.9819, 29.0270, TRUE, TRUE),
(24, 'Beşiktaş', NULL, 'Istanbul', 'Turkey', 'TR', 'DISTRICT', 41.0430, 29.0071, TRUE, TRUE),

-- Barcelona Zones
(30, 'Barcelona City Center', 'Centro de Barcelona', 'Barcelona', 'Spain', 'ES', 'CITY_CENTER', 41.3874, 2.1686, TRUE, TRUE),
(31, 'Las Ramblas', NULL, 'Barcelona', 'Spain', 'ES', 'DISTRICT', 41.3818, 2.1732, TRUE, TRUE),
(32, 'Sagrada Familia', NULL, 'Barcelona', 'Spain', 'ES', 'DISTRICT', 41.4036, 2.1744, TRUE, TRUE),
(33, 'Barceloneta Beach', 'Playa Barceloneta', 'Barcelona', 'Spain', 'ES', 'DISTRICT', 41.3754, 2.1912, TRUE, TRUE),

-- Dubai Zones
(40, 'Dubai City Center', NULL, 'Dubai', 'UAE', 'AE', 'CITY_CENTER', 25.2048, 55.2708, TRUE, TRUE),
(41, 'Dubai Marina', NULL, 'Dubai', 'UAE', 'AE', 'DISTRICT', 25.0805, 55.1403, TRUE, TRUE),
(42, 'Palm Jumeirah', NULL, 'Dubai', 'UAE', 'AE', 'RESORT', 25.1124, 55.1390, TRUE, TRUE),
(43, 'Downtown Dubai', NULL, 'Dubai', 'UAE', 'AE', 'DISTRICT', 25.1972, 55.2744, TRUE, TRUE),
(44, 'JBR', 'Jumeirah Beach Residence', 'Dubai', 'UAE', 'AE', 'DISTRICT', 25.0750, 55.1320, TRUE, TRUE),

-- Amsterdam Zones
(50, 'Amsterdam City Center', NULL, 'Amsterdam', 'Netherlands', 'NL', 'CITY_CENTER', 52.3676, 4.9041, TRUE, TRUE),
(51, 'Dam Square', NULL, 'Amsterdam', 'Netherlands', 'NL', 'DISTRICT', 52.3730, 4.8930, TRUE, TRUE),

-- Rome Zones
(60, 'Rome City Center', 'Centro di Roma', 'Rome', 'Italy', 'IT', 'CITY_CENTER', 41.9028, 12.4964, TRUE, TRUE),
(61, 'Vatican', 'Vaticano', 'Rome', 'Italy', 'IT', 'DISTRICT', 41.9029, 12.4534, TRUE, TRUE),

-- New York Zones
(70, 'Manhattan', NULL, 'New York', 'USA', 'US', 'CITY_CENTER', 40.7831, -73.9712, TRUE, TRUE),
(71, 'Times Square', NULL, 'New York', 'USA', 'US', 'DISTRICT', 40.7580, -73.9855, TRUE, TRUE),
(72, 'Brooklyn', NULL, 'New York', 'USA', 'US', 'DISTRICT', 40.6782, -73.9442, TRUE, TRUE);

-- =====================================================
-- 5. ROUTES
-- =====================================================

INSERT INTO routes (id, airport_id, zone_id, direction, approx_distance_km, approx_duration_min, is_active) VALUES
-- London Heathrow Routes
(1, 1, 1, 'BOTH', 25, 45, TRUE),
(2, 1, 2, 'BOTH', 27, 50, TRUE),
(3, 1, 3, 'BOTH', 22, 40, TRUE),
(4, 1, 4, 'BOTH', 30, 55, TRUE),
(5, 1, 5, 'BOTH', 35, 60, TRUE),
(6, 1, 6, 'BOTH', 24, 45, TRUE),

-- London Gatwick Routes
(10, 2, 1, 'BOTH', 45, 75, TRUE),
(11, 2, 2, 'BOTH', 48, 80, TRUE),

-- Paris CDG Routes
(20, 10, 10, 'BOTH', 30, 45, TRUE),
(21, 10, 11, 'BOTH', 32, 50, TRUE),
(22, 10, 12, 'BOTH', 28, 45, TRUE),
(23, 10, 13, 'BOTH', 35, 55, TRUE),
(24, 10, 14, 'BOTH', 40, 45, TRUE),

-- Istanbul Airport Routes
(30, 20, 20, 'BOTH', 45, 50, TRUE),
(31, 20, 21, 'BOTH', 42, 45, TRUE),
(32, 20, 22, 'BOTH', 50, 55, TRUE),
(33, 20, 23, 'BOTH', 60, 70, TRUE),
(34, 20, 24, 'BOTH', 48, 50, TRUE),

-- Sabiha Gokcen Routes
(40, 21, 20, 'BOTH', 40, 50, TRUE),
(41, 21, 21, 'BOTH', 45, 55, TRUE),
(42, 21, 23, 'BOTH', 20, 25, TRUE),

-- Barcelona Routes
(50, 30, 30, 'BOTH', 15, 25, TRUE),
(51, 30, 31, 'BOTH', 17, 30, TRUE),
(52, 30, 32, 'BOTH', 20, 35, TRUE),
(53, 30, 33, 'BOTH', 14, 25, TRUE),

-- Dubai Routes
(60, 40, 40, 'BOTH', 10, 15, TRUE),
(61, 40, 41, 'BOTH', 40, 35, TRUE),
(62, 40, 42, 'BOTH', 50, 45, TRUE),
(63, 40, 43, 'BOTH', 12, 20, TRUE),
(64, 40, 44, 'BOTH', 42, 40, TRUE),

-- Amsterdam Routes
(70, 50, 50, 'BOTH', 20, 25, TRUE),
(71, 50, 51, 'BOTH', 22, 30, TRUE),

-- Rome Routes
(80, 60, 60, 'BOTH', 35, 45, TRUE),
(81, 60, 61, 'BOTH', 38, 50, TRUE),

-- New York JFK Routes
(90, 70, 70, 'BOTH', 25, 60, TRUE),
(91, 70, 71, 'BOTH', 27, 65, TRUE),
(92, 70, 72, 'BOTH', 20, 45, TRUE);

-- =====================================================
-- 6. VEHICLES
-- =====================================================

INSERT INTO vehicles (id, supplier_id, plate_number, brand, model, year, color, seat_count, luggage_count, vehicle_type, features, is_active) VALUES
-- London Supplier Vehicles
(1, 1, 'LDN001', 'Mercedes-Benz', 'E-Class', 2023, 'Black', 3, 3, 'SEDAN', '["WiFi", "Leather Seats", "Water", "Phone Charger"]', TRUE),
(2, 1, 'LDN002', 'Mercedes-Benz', 'S-Class', 2023, 'Black', 3, 3, 'VIP', '["WiFi", "Leather Seats", "Champagne", "TV", "Privacy Glass"]', TRUE),
(3, 1, 'LDN003', 'Mercedes-Benz', 'V-Class', 2022, 'Silver', 6, 6, 'VAN', '["WiFi", "Leather Seats", "Water", "Spacious Interior"]', TRUE),
(4, 1, 'LDN004', 'Mercedes-Benz', 'Sprinter', 2022, 'White', 16, 16, 'MINIBUS', '["WiFi", "Air Conditioning", "Luggage Space"]', TRUE),

-- Paris Supplier Vehicles
(10, 2, 'PAR001', 'Mercedes-Benz', 'E-Class', 2023, 'Black', 3, 3, 'SEDAN', '["WiFi", "Cuir", "Eau", "Chargeur"]', TRUE),
(11, 2, 'PAR002', 'Mercedes-Benz', 'S-Class', 2023, 'Black', 3, 3, 'VIP', '["WiFi", "Cuir", "Champagne", "TV"]', TRUE),
(12, 2, 'PAR003', 'Mercedes-Benz', 'V-Class', 2022, 'Black', 6, 6, 'VAN', '["WiFi", "Cuir", "Espace"]', TRUE),

-- Istanbul Supplier Vehicles
(20, 3, 'IST001', 'Mercedes-Benz', 'E-Class', 2023, 'Black', 3, 3, 'SEDAN', '["WiFi", "Deri Koltuk", "Su", "Şarj"]', TRUE),
(21, 3, 'IST002', 'Mercedes-Benz', 'S-Class', 2024, 'Black', 3, 3, 'VIP', '["WiFi", "Deri Koltuk", "İçecek", "TV"]', TRUE),
(22, 3, 'IST003', 'Mercedes-Benz', 'Vito', 2023, 'White', 6, 6, 'VAN', '["WiFi", "Klima", "Bagaj"]', TRUE),
(23, 3, 'IST004', 'Mercedes-Benz', 'Sprinter', 2023, 'White', 16, 16, 'MINIBUS', '["WiFi", "Klima", "Bagaj"]', TRUE),

-- Barcelona Supplier Vehicles
(30, 4, 'BCN001', 'Mercedes-Benz', 'E-Class', 2022, 'Black', 3, 3, 'SEDAN', '["WiFi", "Asientos de Cuero", "Agua"]', TRUE),
(31, 4, 'BCN002', 'Volkswagen', 'Caravelle', 2022, 'Silver', 6, 6, 'VAN', '["WiFi", "Aire Acondicionado", "Espacio"]', TRUE),

-- Dubai Supplier Vehicles
(40, 5, 'DXB001', 'Mercedes-Benz', 'S-Class', 2024, 'White', 3, 3, 'VIP', '["WiFi", "Leather", "Champagne", "TV", "Refrigerator"]', TRUE),
(41, 5, 'DXB002', 'Lexus', 'LX570', 2023, 'Black', 5, 5, 'VIP', '["WiFi", "Leather", "Water", "SUV Comfort"]', TRUE),
(42, 5, 'DXB003', 'Mercedes-Benz', 'V-Class', 2023, 'Black', 6, 6, 'VAN', '["WiFi", "Leather", "Water", "Spacious"]', TRUE);

-- =====================================================
-- 7. DRIVERS
-- =====================================================

INSERT INTO drivers (id, supplier_id, user_id, full_name, phone, email, license_number, license_expiry, languages, is_active, rating_avg, rating_count) VALUES
-- London Drivers
(1, 1, 12, 'Michael Brown', '+44-7700-900100', 'michael@premiumtransfers.com', 'BROWN123456', '2026-06-30', '["English"]', TRUE, 4.92, 320),
(2, 1, 13, 'David Smith', '+44-7700-900101', 'david@premiumtransfers.com', 'SMITH789012', '2025-12-31', '["English", "Spanish"]', TRUE, 4.88, 280),
(3, 1, NULL, 'Robert Taylor', '+44-7700-900102', 'robert@premiumtransfers.com', 'TAYLOR345678', '2026-03-31', '["English", "French"]', TRUE, 4.95, 410),

-- Paris Drivers
(10, 2, NULL, 'Jean-Pierre Martin', '+33-6-12345001', 'jean@elitetransfers.fr', 'FR123456', '2025-08-31', '["French", "English"]', TRUE, 4.82, 180),
(11, 2, NULL, 'François Dupont', '+33-6-12345002', 'francois@elitetransfers.fr', 'FR789012', '2026-02-28', '["French", "English", "German"]', TRUE, 4.90, 220),

-- Istanbul Drivers
(20, 3, NULL, 'Mehmet Demir', '+90-532-1234501', 'mehmet@viptransfer.tr', 'TR12345678', '2025-10-31', '["Turkish", "English"]', TRUE, 4.95, 520),
(21, 3, NULL, 'Ali Öztürk', '+90-532-1234502', 'ali@viptransfer.tr', 'TR87654321', '2026-04-30', '["Turkish", "English", "German"]', TRUE, 4.91, 480),
(22, 3, NULL, 'Hasan Yıldız', '+90-532-1234503', 'hasan@viptransfer.tr', 'TR11223344', '2025-12-31', '["Turkish", "English", "Arabic"]', TRUE, 4.88, 390),

-- Barcelona Drivers
(30, 4, NULL, 'Antonio Fernandez', '+34-612-345001', 'antonio@bcnshuttle.es', 'ES12345678', '2026-01-31', '["Spanish", "English", "Catalan"]', TRUE, 4.78, 150),

-- Dubai Drivers
(40, 5, NULL, 'Ahmed Hassan', '+971-50-1234501', 'ahmed@luxurytransfers.ae', 'UAE123456', '2026-06-30', '["Arabic", "English"]', TRUE, 4.97, 620),
(41, 5, NULL, 'Raj Sharma', '+971-50-1234502', 'raj@luxurytransfers.ae', 'UAE789012', '2025-09-30', '["Hindi", "English", "Arabic"]', TRUE, 4.94, 540);

-- =====================================================
-- 8. SUPPLIER SERVICE ZONES
-- =====================================================

INSERT INTO supplier_service_zones (id, supplier_id, airport_id, max_distance_km, is_active) VALUES
(1, 1, 1, 100, TRUE),  -- London supplier at Heathrow
(2, 1, 2, 100, TRUE),  -- London supplier at Gatwick
(3, 2, 10, 80, TRUE),  -- Paris supplier at CDG
(4, 2, 11, 80, TRUE),  -- Paris supplier at Orly
(5, 3, 20, 120, TRUE), -- Istanbul supplier at IST
(6, 3, 21, 100, TRUE), -- Istanbul supplier at SAW
(7, 4, 30, 60, TRUE),  -- Barcelona supplier at BCN
(8, 5, 40, 80, TRUE);  -- Dubai supplier at DXB

-- Link service zones to coverage areas
INSERT INTO supplier_zone_coverage (supplier_service_zone_id, zone_id, is_active) VALUES
-- London coverage
(1, 1, TRUE), (1, 2, TRUE), (1, 3, TRUE), (1, 4, TRUE), (1, 5, TRUE), (1, 6, TRUE),
(2, 1, TRUE), (2, 2, TRUE),
-- Paris coverage
(3, 10, TRUE), (3, 11, TRUE), (3, 12, TRUE), (3, 13, TRUE), (3, 14, TRUE),
-- Istanbul coverage
(5, 20, TRUE), (5, 21, TRUE), (5, 22, TRUE), (5, 23, TRUE), (5, 24, TRUE),
(6, 20, TRUE), (6, 21, TRUE), (6, 23, TRUE),
-- Barcelona coverage
(7, 30, TRUE), (7, 31, TRUE), (7, 32, TRUE), (7, 33, TRUE),
-- Dubai coverage
(8, 40, TRUE), (8, 41, TRUE), (8, 42, TRUE), (8, 43, TRUE), (8, 44, TRUE);

-- =====================================================
-- 9. TARIFFS
-- =====================================================

INSERT INTO tariffs (id, supplier_id, route_id, vehicle_type, currency, base_price, max_pax, is_active) VALUES
-- London Heathrow to Central London
(1, 1, 1, 'SEDAN', 'EUR', 55.00, 3, TRUE),
(2, 1, 1, 'VIP', 'EUR', 95.00, 3, TRUE),
(3, 1, 1, 'VAN', 'EUR', 75.00, 6, TRUE),
(4, 1, 1, 'MINIBUS', 'EUR', 120.00, 16, TRUE),

-- London Heathrow to Westminster
(5, 1, 2, 'SEDAN', 'EUR', 60.00, 3, TRUE),
(6, 1, 2, 'VIP', 'EUR', 100.00, 3, TRUE),
(7, 1, 2, 'VAN', 'EUR', 80.00, 6, TRUE),

-- Paris CDG Routes
(20, 2, 20, 'SEDAN', 'EUR', 65.00, 3, TRUE),
(21, 2, 20, 'VIP', 'EUR', 110.00, 3, TRUE),
(22, 2, 20, 'VAN', 'EUR', 85.00, 6, TRUE),
(23, 2, 24, 'SEDAN', 'EUR', 95.00, 3, TRUE),
(24, 2, 24, 'VAN', 'EUR', 120.00, 6, TRUE),

-- Istanbul Routes
(30, 3, 30, 'SEDAN', 'EUR', 35.00, 3, TRUE),
(31, 3, 30, 'VIP', 'EUR', 55.00, 3, TRUE),
(32, 3, 30, 'VAN', 'EUR', 45.00, 6, TRUE),
(33, 3, 30, 'MINIBUS', 'EUR', 75.00, 16, TRUE),
(34, 3, 31, 'SEDAN', 'EUR', 33.00, 3, TRUE),
(35, 3, 31, 'VIP', 'EUR', 52.00, 3, TRUE),

-- Barcelona Routes
(50, 4, 50, 'SEDAN', 'EUR', 40.00, 3, TRUE),
(51, 4, 50, 'VAN', 'EUR', 55.00, 6, TRUE),

-- Dubai Routes
(60, 5, 60, 'VIP', 'EUR', 45.00, 3, TRUE),
(61, 5, 61, 'VIP', 'EUR', 65.00, 3, TRUE),
(62, 5, 62, 'VIP', 'EUR', 80.00, 3, TRUE),
(63, 5, 61, 'VAN', 'EUR', 75.00, 6, TRUE);

-- =====================================================
-- 10. EXTRAS
-- =====================================================

INSERT INTO extras (id, supplier_id, name, name_key, description, price, currency, is_active) VALUES
-- London Extras
(1, 1, 'Child Seat (0-12 months)', 'CHILD_SEAT_INFANT', 'Rear-facing infant car seat', 10.00, 'EUR', TRUE),
(2, 1, 'Child Seat (1-4 years)', 'CHILD_SEAT_TODDLER', 'Forward-facing toddler seat', 10.00, 'EUR', TRUE),
(3, 1, 'Booster Seat (4-12 years)', 'BOOSTER_SEAT', 'Booster seat for older children', 8.00, 'EUR', TRUE),
(4, 1, 'Meet & Greet Inside Terminal', 'MEET_GREET_INSIDE', 'Driver meets you inside the terminal', 15.00, 'EUR', TRUE),
(5, 1, 'Extra Stop', 'EXTRA_STOP', 'Additional stop during transfer', 20.00, 'EUR', TRUE),

-- Paris Extras
(10, 2, 'Siège enfant', 'CHILD_SEAT', 'Siège auto pour enfant', 12.00, 'EUR', TRUE),
(11, 2, 'Accueil personnalisé', 'MEET_GREET', 'Accueil avec pancarte nominative', 15.00, 'EUR', TRUE),

-- Istanbul Extras
(20, 3, 'Bebek Koltuğu', 'CHILD_SEAT', 'Bebek için oto koltuğu', 8.00, 'EUR', TRUE),
(21, 3, 'Karşılama Servisi', 'MEET_GREET', 'Terminal içinde karşılama', 10.00, 'EUR', TRUE),

-- Dubai Extras
(30, 5, 'Child Seat', 'CHILD_SEAT', 'Safety seat for children', 15.00, 'EUR', TRUE),
(31, 5, 'VIP Meet & Assist', 'MEET_GREET_VIP', 'Personal assistant from aircraft door', 50.00, 'EUR', TRUE),
(32, 5, 'Champagne Welcome', 'CHAMPAGNE', 'Bottle of champagne on board', 75.00, 'EUR', TRUE);

-- =====================================================
-- 11. AGENCIES
-- =====================================================

INSERT INTO agencies (id, name, legal_name, contact_name, contact_email, contact_phone, country, city, website, commission_rate, credit_limit, is_verified, is_active, api_key) VALUES
(1, 'TravelCorp International', 'TravelCorp Ltd', 'Robert Johnson', 'agency@travelcorp.com', '+1-555-1000', 'USA', 'New York', 'https://www.travelcorp.com', 10.00, 50000.00, TRUE, TRUE, 'api_key_travelcorp_123456'),
(2, 'Euro Tours GmbH', 'Euro Tours GmbH', 'Hans Mueller', 'bookings@eurotours.de', '+49-30-12345678', 'Germany', 'Berlin', 'https://www.eurotours.de', 12.00, 30000.00, TRUE, TRUE, 'api_key_eurotours_789012'),
(3, 'Asia Pacific Travel', 'AP Travel Pte Ltd', 'David Wong', 'partners@aptravel.sg', '+65-6789-0123', 'Singapore', 'Singapore', 'https://www.aptravel.sg', 8.00, 75000.00, TRUE, TRUE, 'api_key_aptravel_345678');

INSERT INTO agency_users (agency_id, user_id, role, is_active) VALUES
(1, 50, 'OWNER', TRUE),
(1, 51, 'BOOKER', TRUE);

-- =====================================================
-- 12. SAMPLE BOOKINGS
-- =====================================================

INSERT INTO bookings (id, public_code, customer_id, supplier_id, channel, airport_id, zone_id, direction, pickup_address, dropoff_address, flight_number, pickup_datetime, pax_adults, pax_children, vehicle_type, currency, base_price, extras_price, total_price, commission, supplier_payout, status, payment_status, created_at) VALUES
-- Confirmed booking
(1, 'ATP-240001', 100, 1, 'B2C', 1, 1, 'FROM_AIRPORT', 'London Heathrow Terminal 5', 'The Ritz London, 150 Piccadilly', 'BA123', DATE_ADD(NOW(), INTERVAL 3 DAY), 2, 0, 'SEDAN', 'EUR', 55.00, 10.00, 65.00, 9.75, 55.25, 'CONFIRMED', 'PAID', DATE_SUB(NOW(), INTERVAL 2 DAY)),

-- Assigned booking
(2, 'ATP-240002', 101, 3, 'B2C', 20, 21, 'FROM_AIRPORT', 'Istanbul Airport International Arrivals', 'Pera Palace Hotel, Tepebaşı', 'TK1234', DATE_ADD(NOW(), INTERVAL 1 DAY), 2, 1, 'VAN', 'EUR', 45.00, 8.00, 53.00, 6.36, 46.64, 'ASSIGNED', 'PAID', DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- Pending booking
(3, 'ATP-240003', NULL, 2, 'B2C', 10, 14, 'FROM_AIRPORT', 'Paris CDG Terminal 2E', 'Disneyland Hotel, 1 Rue de la Marnière', 'AF456', DATE_ADD(NOW(), INTERVAL 5 DAY), 2, 2, 'VAN', 'EUR', 120.00, 24.00, 144.00, 21.60, 122.40, 'PENDING', 'UNPAID', NOW()),

-- Completed booking
(4, 'ATP-240004', 100, 1, 'B2C', 1, 2, 'FROM_AIRPORT', 'London Heathrow Terminal 3', 'Park Plaza Westminster Bridge', 'VS001', DATE_SUB(NOW(), INTERVAL 5 DAY), 1, 0, 'VIP', 'EUR', 100.00, 15.00, 115.00, 17.25, 97.75, 'COMPLETED', 'PAID', DATE_SUB(NOW(), INTERVAL 10 DAY)),

-- Agency booking
(5, 'ATP-240005', NULL, 5, 'B2B', 40, 42, 'FROM_AIRPORT', 'Dubai International Airport Terminal 3', 'Atlantis The Palm', 'EK001', DATE_ADD(NOW(), INTERVAL 7 DAY), 4, 0, 'VIP', 'EUR', 80.00, 75.00, 155.00, 27.90, 127.10, 'CONFIRMED', 'PAID', DATE_SUB(NOW(), INTERVAL 3 DAY));

-- Booking passengers
INSERT INTO booking_passengers (booking_id, full_name, phone, email, is_lead) VALUES
(1, 'John Doe', '+1-555-2000', 'john.doe@email.com', TRUE),
(1, 'Mary Doe', '+1-555-2000', NULL, FALSE),
(2, 'Jane Smith', '+1-555-2001', 'jane.smith@email.com', TRUE),
(2, 'Tom Smith', NULL, NULL, FALSE),
(2, 'Little Smith', NULL, NULL, FALSE),
(4, 'John Doe', '+1-555-2000', 'john.doe@email.com', TRUE);

-- Booking extras
INSERT INTO booking_extras (booking_id, extra_id, name, quantity, unit_price, total_price) VALUES
(1, 4, 'Meet & Greet Inside Terminal', 1, 10.00, 10.00),
(2, 20, 'Bebek Koltuğu', 1, 8.00, 8.00),
(3, 10, 'Siège enfant', 2, 12.00, 24.00),
(4, 4, 'Meet & Greet Inside Terminal', 1, 15.00, 15.00),
(5, 32, 'Champagne Welcome', 1, 75.00, 75.00);

-- Rides
INSERT INTO rides (id, booking_id, supplier_id, vehicle_id, driver_id, status, assigned_at, created_at) VALUES
(1, 1, 1, 1, 1, 'ASSIGNED', NOW(), NOW()),
(2, 2, 3, 22, 20, 'ASSIGNED', DATE_SUB(NOW(), INTERVAL 12 HOUR), DATE_SUB(NOW(), INTERVAL 1 DAY)),
(4, 4, 1, 2, 3, 'FINISHED', DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY)),
(5, 5, 5, 40, 40, 'ASSIGNED', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY));

-- Payments
INSERT INTO payments (booking_id, amount, currency, payment_method, provider, status, created_at) VALUES
(1, 65.00, 'EUR', 'CARD', 'stripe', 'SUCCESS', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 53.00, 'EUR', 'CARD', 'stripe', 'SUCCESS', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(4, 115.00, 'EUR', 'CARD', 'stripe', 'SUCCESS', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(5, 155.00, 'EUR', 'BANK_TRANSFER', 'manual', 'SUCCESS', DATE_SUB(NOW(), INTERVAL 3 DAY));

-- Reviews
INSERT INTO reviews (booking_id, customer_id, supplier_id, driver_id, rating_overall, rating_punctuality, rating_vehicle, rating_driver, review_text, is_published, created_at) VALUES
(4, 100, 1, 3, 5, 5, 5, 5, 'Excellent service! The driver was waiting for me with a name sign, the car was immaculate, and the journey was smooth. Highly recommended!', TRUE, DATE_SUB(NOW(), INTERVAL 4 DAY));

-- =====================================================
-- 13. NOTIFICATIONS
-- =====================================================

INSERT INTO notifications (user_id, type, title, message, link, is_read, created_at) VALUES
(10, 'BOOKING', 'New Booking Received', 'You have a new booking ATP-240001 for Dec 7, 2024', '/supplier/bookings/1', FALSE, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(10, 'PAYMENT', 'Payment Received', 'Payment of €65.00 received for booking ATP-240001', '/supplier/payouts', TRUE, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(30, 'BOOKING', 'New Booking Received', 'You have a new booking ATP-240002 for Dec 5, 2024', '/supplier/bookings/2', FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- =====================================================
-- 14. PROMO CODES
-- =====================================================

INSERT INTO promo_codes (id, code, description, discount_type, discount_value, currency, min_booking_amount, max_discount_amount, usage_limit, per_user_limit, valid_from, valid_until, is_active, is_exit_intent) VALUES
-- Exit-intent promo code (10% off)
(1, 'SAVE10', 'Save 10% on your first booking!', 'PERCENTAGE', 10.00, 'EUR', 20.00, 50.00, NULL, 1, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), TRUE, TRUE),

-- Welcome promo code (15% off for new customers)
(2, 'WELCOME15', 'Welcome discount - 15% off your first transfer', 'PERCENTAGE', 15.00, 'EUR', 30.00, 75.00, 1000, 1, NOW(), DATE_ADD(NOW(), INTERVAL 6 MONTH), TRUE, FALSE),

-- Fixed discount code
(3, 'FLAT20', 'Get €20 off any booking over €100', 'FIXED_AMOUNT', 20.00, 'EUR', 100.00, NULL, 500, 2, NOW(), DATE_ADD(NOW(), INTERVAL 3 MONTH), TRUE, FALSE),

-- Seasonal promo
(4, 'WINTER2025', 'Winter Special - 12% off all transfers', 'PERCENTAGE', 12.00, 'EUR', 25.00, 40.00, NULL, 3, NOW(), '2025-03-31 23:59:59', TRUE, FALSE);

SELECT 'Seed data inserted successfully!' AS Result;
