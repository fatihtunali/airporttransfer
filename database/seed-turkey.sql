-- AirportTransfer - Turkey Airports & Zones Seed Data
-- Focus: Major tourist airports and destinations

-- =====================================================
-- TURKEY AIRPORTS
-- =====================================================

INSERT INTO airports (code, name, name_local, city, country, country_code, timezone, latitude, longitude, terminals, is_active) VALUES
-- Istanbul
('IST', 'Istanbul Airport', 'İstanbul Havalimanı', 'Istanbul', 'Turkey', 'TR', 'Europe/Istanbul', 41.2608, 28.7414, '["International", "Domestic"]', TRUE),
('SAW', 'Sabiha Gokcen Airport', 'Sabiha Gökçen Havalimanı', 'Istanbul', 'Turkey', 'TR', 'Europe/Istanbul', 40.8986, 29.3092, '["Main Terminal"]', TRUE),

-- Antalya Region
('AYT', 'Antalya Airport', 'Antalya Havalimanı', 'Antalya', 'Turkey', 'TR', 'Europe/Istanbul', 36.8987, 30.8005, '["Terminal 1", "Terminal 2", "Domestic"]', TRUE),
('GZP', 'Gazipasa Airport', 'Gazipaşa-Alanya Havalimanı', 'Alanya', 'Turkey', 'TR', 'Europe/Istanbul', 36.2992, 32.3006, '["Main Terminal"]', TRUE),

-- Aegean Coast
('DLM', 'Dalaman Airport', 'Dalaman Havalimanı', 'Dalaman', 'Turkey', 'TR', 'Europe/Istanbul', 36.7131, 28.7925, '["International", "Domestic"]', TRUE),
('BJV', 'Milas-Bodrum Airport', 'Milas-Bodrum Havalimanı', 'Bodrum', 'Turkey', 'TR', 'Europe/Istanbul', 37.2506, 27.6643, '["Main Terminal"]', TRUE),
('ADB', 'Izmir Adnan Menderes Airport', 'İzmir Adnan Menderes Havalimanı', 'Izmir', 'Turkey', 'TR', 'Europe/Istanbul', 38.2924, 27.1570, '["International", "Domestic"]', TRUE),

-- Cappadocia
('NAV', 'Nevsehir Kapadokya Airport', 'Nevşehir Kapadokya Havalimanı', 'Nevsehir', 'Turkey', 'TR', 'Europe/Istanbul', 38.7719, 34.5345, '["Main Terminal"]', TRUE),
('ASR', 'Kayseri Erkilet Airport', 'Kayseri Erkilet Havalimanı', 'Kayseri', 'Turkey', 'TR', 'Europe/Istanbul', 38.7704, 35.4954, '["Main Terminal"]', TRUE),

-- Black Sea
('TZX', 'Trabzon Airport', 'Trabzon Havalimanı', 'Trabzon', 'Turkey', 'TR', 'Europe/Istanbul', 40.9951, 39.7897, '["Main Terminal"]', TRUE),

-- Capital
('ESB', 'Ankara Esenboga Airport', 'Ankara Esenboğa Havalimanı', 'Ankara', 'Turkey', 'TR', 'Europe/Istanbul', 40.1281, 32.9951, '["Main Terminal"]', TRUE);

-- =====================================================
-- ISTANBUL ZONES
-- =====================================================

INSERT INTO zones (name, name_local, city, country, country_code, zone_type, is_popular, is_active) VALUES
-- Istanbul European Side
('Sultanahmet', 'Sultanahmet', 'Istanbul', 'Turkey', 'TR', 'DISTRICT', TRUE, TRUE),
('Taksim', 'Taksim', 'Istanbul', 'Turkey', 'TR', 'DISTRICT', TRUE, TRUE),
('Beyoglu', 'Beyoğlu', 'Istanbul', 'Turkey', 'TR', 'DISTRICT', TRUE, TRUE),
('Besiktas', 'Beşiktaş', 'Istanbul', 'Turkey', 'TR', 'DISTRICT', TRUE, TRUE),
('Sisli', 'Şişli', 'Istanbul', 'Turkey', 'TR', 'DISTRICT', FALSE, TRUE),
('Fatih', 'Fatih', 'Istanbul', 'Turkey', 'TR', 'DISTRICT', FALSE, TRUE),
('Eminonu', 'Eminönü', 'Istanbul', 'Turkey', 'TR', 'DISTRICT', TRUE, TRUE),
('Galata', 'Galata', 'Istanbul', 'Turkey', 'TR', 'DISTRICT', TRUE, TRUE),
('Nisantasi', 'Nişantaşı', 'Istanbul', 'Turkey', 'TR', 'DISTRICT', FALSE, TRUE),
('Levent', 'Levent', 'Istanbul', 'Turkey', 'TR', 'DISTRICT', FALSE, TRUE),
('Maslak', 'Maslak', 'Istanbul', 'Turkey', 'TR', 'DISTRICT', FALSE, TRUE),

-- Istanbul Asian Side
('Kadikoy', 'Kadıköy', 'Istanbul', 'Turkey', 'TR', 'DISTRICT', TRUE, TRUE),
('Uskudar', 'Üsküdar', 'Istanbul', 'Turkey', 'TR', 'DISTRICT', FALSE, TRUE),
('Moda', 'Moda', 'Istanbul', 'Turkey', 'TR', 'DISTRICT', FALSE, TRUE),
('Bagdat Caddesi', 'Bağdat Caddesi', 'Istanbul', 'Turkey', 'TR', 'DISTRICT', FALSE, TRUE),
('Pendik', 'Pendik', 'Istanbul', 'Turkey', 'TR', 'DISTRICT', FALSE, TRUE),

-- Istanbul City Center (Generic)
('Istanbul City Center', 'İstanbul Şehir Merkezi', 'Istanbul', 'Turkey', 'TR', 'CITY_CENTER', TRUE, TRUE);

-- =====================================================
-- ANTALYA ZONES
-- =====================================================

INSERT INTO zones (name, name_local, city, country, country_code, zone_type, is_popular, is_active) VALUES
-- Antalya City
('Antalya City Center', 'Antalya Şehir Merkezi', 'Antalya', 'Turkey', 'TR', 'CITY_CENTER', TRUE, TRUE),
('Kaleici (Old Town)', 'Kaleiçi', 'Antalya', 'Turkey', 'TR', 'DISTRICT', TRUE, TRUE),
('Lara', 'Lara', 'Antalya', 'Turkey', 'TR', 'RESORT', TRUE, TRUE),
('Kundu', 'Kundu', 'Antalya', 'Turkey', 'TR', 'RESORT', TRUE, TRUE),
('Konyaalti', 'Konyaaltı', 'Antalya', 'Turkey', 'TR', 'DISTRICT', TRUE, TRUE),

-- Belek
('Belek', 'Belek', 'Antalya', 'Turkey', 'TR', 'RESORT', TRUE, TRUE),
('Kadriye', 'Kadriye', 'Antalya', 'Turkey', 'TR', 'RESORT', FALSE, TRUE),

-- Side
('Side', 'Side', 'Antalya', 'Turkey', 'TR', 'RESORT', TRUE, TRUE),
('Manavgat', 'Manavgat', 'Antalya', 'Turkey', 'TR', 'DISTRICT', FALSE, TRUE),
('Colakli', 'Çolaklı', 'Antalya', 'Turkey', 'TR', 'RESORT', FALSE, TRUE),
('Kumkoy', 'Kumköy', 'Antalya', 'Turkey', 'TR', 'RESORT', FALSE, TRUE),
('Titreyengol', 'Titreyengöl', 'Antalya', 'Turkey', 'TR', 'RESORT', FALSE, TRUE),
('Sorgun', 'Sorgun', 'Antalya', 'Turkey', 'TR', 'RESORT', FALSE, TRUE),

-- Alanya
('Alanya', 'Alanya', 'Antalya', 'Turkey', 'TR', 'RESORT', TRUE, TRUE),
('Mahmutlar', 'Mahmutlar', 'Antalya', 'Turkey', 'TR', 'RESORT', FALSE, TRUE),
('Okurcalar', 'Okurcalar', 'Antalya', 'Turkey', 'TR', 'RESORT', FALSE, TRUE),
('Konakli', 'Konaklı', 'Antalya', 'Turkey', 'TR', 'RESORT', FALSE, TRUE),
('Avsallar', 'Avsallar', 'Antalya', 'Turkey', 'TR', 'RESORT', FALSE, TRUE),
('Incekum', 'İncekum', 'Antalya', 'Turkey', 'TR', 'RESORT', FALSE, TRUE),

-- Kemer
('Kemer', 'Kemer', 'Antalya', 'Turkey', 'TR', 'RESORT', TRUE, TRUE),
('Beldibi', 'Beldibi', 'Antalya', 'Turkey', 'TR', 'RESORT', FALSE, TRUE),
('Goynuk', 'Göynük', 'Antalya', 'Turkey', 'TR', 'RESORT', FALSE, TRUE),
('Camyuva', 'Çamyuva', 'Antalya', 'Turkey', 'TR', 'RESORT', FALSE, TRUE),
('Kiris', 'Kiriş', 'Antalya', 'Turkey', 'TR', 'RESORT', FALSE, TRUE),
('Tekirova', 'Tekirova', 'Antalya', 'Turkey', 'TR', 'RESORT', FALSE, TRUE),

-- Other Antalya
('Kas', 'Kaş', 'Antalya', 'Turkey', 'TR', 'RESORT', TRUE, TRUE),
('Kalkan', 'Kalkan', 'Antalya', 'Turkey', 'TR', 'RESORT', TRUE, TRUE),
('Olympos', 'Olimpos', 'Antalya', 'Turkey', 'TR', 'RESORT', FALSE, TRUE),
('Cirali', 'Çıralı', 'Antalya', 'Turkey', 'TR', 'RESORT', FALSE, TRUE);

-- =====================================================
-- BODRUM/DALAMAN ZONES
-- =====================================================

INSERT INTO zones (name, name_local, city, country, country_code, zone_type, is_popular, is_active) VALUES
-- Bodrum
('Bodrum City Center', 'Bodrum Şehir Merkezi', 'Bodrum', 'Turkey', 'TR', 'CITY_CENTER', TRUE, TRUE),
('Yalikavak', 'Yalıkavak', 'Bodrum', 'Turkey', 'TR', 'RESORT', TRUE, TRUE),
('Turgutreis', 'Turgutreis', 'Bodrum', 'Turkey', 'TR', 'RESORT', FALSE, TRUE),
('Gumusluk', 'Gümüşlük', 'Bodrum', 'Turkey', 'TR', 'RESORT', FALSE, TRUE),
('Bitez', 'Bitez', 'Bodrum', 'Turkey', 'TR', 'RESORT', FALSE, TRUE),
('Gundogan', 'Gündoğan', 'Bodrum', 'Turkey', 'TR', 'RESORT', FALSE, TRUE),
('Turkbuku', 'Türkbükü', 'Bodrum', 'Turkey', 'TR', 'RESORT', TRUE, TRUE),
('Torba', 'Torba', 'Bodrum', 'Turkey', 'TR', 'RESORT', FALSE, TRUE),

-- Marmaris
('Marmaris', 'Marmaris', 'Mugla', 'Turkey', 'TR', 'RESORT', TRUE, TRUE),
('Icmeler', 'İçmeler', 'Mugla', 'Turkey', 'TR', 'RESORT', FALSE, TRUE),
('Turunc', 'Turunç', 'Mugla', 'Turkey', 'TR', 'RESORT', FALSE, TRUE),

-- Fethiye
('Fethiye', 'Fethiye', 'Mugla', 'Turkey', 'TR', 'RESORT', TRUE, TRUE),
('Oludeniz', 'Ölüdeniz', 'Mugla', 'Turkey', 'TR', 'RESORT', TRUE, TRUE),
('Hisaronu', 'Hisarönü', 'Mugla', 'Turkey', 'TR', 'RESORT', FALSE, TRUE),
('Ovacik', 'Ovacık', 'Mugla', 'Turkey', 'TR', 'RESORT', FALSE, TRUE),
('Calis Beach', 'Çalış Plajı', 'Mugla', 'Turkey', 'TR', 'RESORT', FALSE, TRUE),

-- Dalaman/Gocek
('Dalaman', 'Dalaman', 'Mugla', 'Turkey', 'TR', 'DISTRICT', FALSE, TRUE),
('Gocek', 'Göcek', 'Mugla', 'Turkey', 'TR', 'RESORT', TRUE, TRUE);

-- =====================================================
-- CAPPADOCIA ZONES
-- =====================================================

INSERT INTO zones (name, name_local, city, country, country_code, zone_type, is_popular, is_active) VALUES
('Goreme', 'Göreme', 'Nevsehir', 'Turkey', 'TR', 'DISTRICT', TRUE, TRUE),
('Urgup', 'Ürgüp', 'Nevsehir', 'Turkey', 'TR', 'DISTRICT', TRUE, TRUE),
('Uchisar', 'Uçhisar', 'Nevsehir', 'Turkey', 'TR', 'DISTRICT', TRUE, TRUE),
('Avanos', 'Avanos', 'Nevsehir', 'Turkey', 'TR', 'DISTRICT', FALSE, TRUE),
('Nevsehir City Center', 'Nevşehir Şehir Merkezi', 'Nevsehir', 'Turkey', 'TR', 'CITY_CENTER', FALSE, TRUE),
('Kayseri City Center', 'Kayseri Şehir Merkezi', 'Kayseri', 'Turkey', 'TR', 'CITY_CENTER', FALSE, TRUE),
('Ortahisar', 'Ortahisar', 'Nevsehir', 'Turkey', 'TR', 'DISTRICT', FALSE, TRUE),
('Cavusin', 'Çavuşin', 'Nevsehir', 'Turkey', 'TR', 'DISTRICT', FALSE, TRUE);

-- =====================================================
-- IZMIR ZONES
-- =====================================================

INSERT INTO zones (name, name_local, city, country, country_code, zone_type, is_popular, is_active) VALUES
('Izmir City Center', 'İzmir Şehir Merkezi', 'Izmir', 'Turkey', 'TR', 'CITY_CENTER', TRUE, TRUE),
('Alsancak', 'Alsancak', 'Izmir', 'Turkey', 'TR', 'DISTRICT', TRUE, TRUE),
('Konak', 'Konak', 'Izmir', 'Turkey', 'TR', 'DISTRICT', FALSE, TRUE),
('Cesme', 'Çeşme', 'Izmir', 'Turkey', 'TR', 'RESORT', TRUE, TRUE),
('Alacati', 'Alaçatı', 'Izmir', 'Turkey', 'TR', 'RESORT', TRUE, TRUE),
('Kusadasi', 'Kuşadası', 'Aydin', 'Turkey', 'TR', 'RESORT', TRUE, TRUE),
('Selcuk', 'Selçuk', 'Izmir', 'Turkey', 'TR', 'DISTRICT', TRUE, TRUE);

-- =====================================================
-- ANKARA ZONES
-- =====================================================

INSERT INTO zones (name, name_local, city, country, country_code, zone_type, is_popular, is_active) VALUES
('Ankara City Center', 'Ankara Şehir Merkezi', 'Ankara', 'Turkey', 'TR', 'CITY_CENTER', TRUE, TRUE),
('Kizilay', 'Kızılay', 'Ankara', 'Turkey', 'TR', 'DISTRICT', TRUE, TRUE),
('Cankaya', 'Çankaya', 'Ankara', 'Turkey', 'TR', 'DISTRICT', FALSE, TRUE),
('Ulus', 'Ulus', 'Ankara', 'Turkey', 'TR', 'DISTRICT', FALSE, TRUE);

-- =====================================================
-- SAMPLE ROUTES (Airport to Popular Zones)
-- =====================================================

-- Istanbul IST Routes
INSERT INTO routes (airport_id, zone_id, direction, approx_distance_km, approx_duration_min)
SELECT a.id, z.id, 'BOTH',
  CASE z.name
    WHEN 'Sultanahmet' THEN 45
    WHEN 'Taksim' THEN 40
    WHEN 'Beyoglu' THEN 42
    WHEN 'Besiktas' THEN 38
    WHEN 'Kadikoy' THEN 55
    WHEN 'Istanbul City Center' THEN 42
    ELSE 45
  END,
  CASE z.name
    WHEN 'Sultanahmet' THEN 55
    WHEN 'Taksim' THEN 50
    WHEN 'Beyoglu' THEN 52
    WHEN 'Besiktas' THEN 45
    WHEN 'Kadikoy' THEN 70
    WHEN 'Istanbul City Center' THEN 50
    ELSE 55
  END
FROM airports a, zones z
WHERE a.code = 'IST' AND z.city = 'Istanbul' AND z.is_popular = TRUE;

-- Istanbul SAW Routes
INSERT INTO routes (airport_id, zone_id, direction, approx_distance_km, approx_duration_min)
SELECT a.id, z.id, 'BOTH',
  CASE z.name
    WHEN 'Sultanahmet' THEN 50
    WHEN 'Taksim' THEN 45
    WHEN 'Kadikoy' THEN 25
    WHEN 'Istanbul City Center' THEN 45
    ELSE 40
  END,
  CASE z.name
    WHEN 'Sultanahmet' THEN 65
    WHEN 'Taksim' THEN 55
    WHEN 'Kadikoy' THEN 35
    WHEN 'Istanbul City Center' THEN 55
    ELSE 50
  END
FROM airports a, zones z
WHERE a.code = 'SAW' AND z.city = 'Istanbul' AND z.is_popular = TRUE;

-- Antalya AYT Routes
INSERT INTO routes (airport_id, zone_id, direction, approx_distance_km, approx_duration_min)
SELECT a.id, z.id, 'BOTH',
  CASE z.name
    WHEN 'Antalya City Center' THEN 12
    WHEN 'Kaleici (Old Town)' THEN 14
    WHEN 'Lara' THEN 8
    WHEN 'Kundu' THEN 10
    WHEN 'Konyaalti' THEN 18
    WHEN 'Belek' THEN 35
    WHEN 'Side' THEN 65
    WHEN 'Alanya' THEN 125
    WHEN 'Kemer' THEN 45
    WHEN 'Kas' THEN 185
    WHEN 'Kalkan' THEN 165
    ELSE 30
  END,
  CASE z.name
    WHEN 'Antalya City Center' THEN 20
    WHEN 'Kaleici (Old Town)' THEN 25
    WHEN 'Lara' THEN 15
    WHEN 'Kundu' THEN 18
    WHEN 'Konyaalti' THEN 30
    WHEN 'Belek' THEN 40
    WHEN 'Side' THEN 75
    WHEN 'Alanya' THEN 135
    WHEN 'Kemer' THEN 55
    WHEN 'Kas' THEN 180
    WHEN 'Kalkan' THEN 160
    ELSE 40
  END
FROM airports a, zones z
WHERE a.code = 'AYT' AND z.country = 'Turkey' AND z.is_popular = TRUE AND z.city = 'Antalya';

-- Dalaman DLM Routes
INSERT INTO routes (airport_id, zone_id, direction, approx_distance_km, approx_duration_min)
SELECT a.id, z.id, 'BOTH',
  CASE z.name
    WHEN 'Marmaris' THEN 95
    WHEN 'Fethiye' THEN 45
    WHEN 'Oludeniz' THEN 55
    WHEN 'Gocek' THEN 22
    WHEN 'Dalaman' THEN 8
    ELSE 50
  END,
  CASE z.name
    WHEN 'Marmaris' THEN 100
    WHEN 'Fethiye' THEN 55
    WHEN 'Oludeniz' THEN 65
    WHEN 'Gocek' THEN 25
    WHEN 'Dalaman' THEN 12
    ELSE 60
  END
FROM airports a, zones z
WHERE a.code = 'DLM' AND z.country = 'Turkey' AND z.is_popular = TRUE;

-- Bodrum BJV Routes
INSERT INTO routes (airport_id, zone_id, direction, approx_distance_km, approx_duration_min)
SELECT a.id, z.id, 'BOTH',
  CASE z.name
    WHEN 'Bodrum City Center' THEN 35
    WHEN 'Yalikavak' THEN 55
    WHEN 'Turkbuku' THEN 50
    ELSE 40
  END,
  CASE z.name
    WHEN 'Bodrum City Center' THEN 40
    WHEN 'Yalikavak' THEN 60
    WHEN 'Turkbuku' THEN 55
    ELSE 45
  END
FROM airports a, zones z
WHERE a.code = 'BJV' AND z.city = 'Bodrum' AND z.is_popular = TRUE;

-- Cappadocia NAV Routes
INSERT INTO routes (airport_id, zone_id, direction, approx_distance_km, approx_duration_min)
SELECT a.id, z.id, 'BOTH',
  CASE z.name
    WHEN 'Goreme' THEN 40
    WHEN 'Urgup' THEN 35
    WHEN 'Uchisar' THEN 38
    ELSE 35
  END,
  CASE z.name
    WHEN 'Goreme' THEN 45
    WHEN 'Urgup' THEN 40
    WHEN 'Uchisar' THEN 42
    ELSE 40
  END
FROM airports a, zones z
WHERE a.code = 'NAV' AND z.city = 'Nevsehir' AND z.is_popular = TRUE;

-- Cappadocia ASR Routes
INSERT INTO routes (airport_id, zone_id, direction, approx_distance_km, approx_duration_min)
SELECT a.id, z.id, 'BOTH',
  CASE z.name
    WHEN 'Goreme' THEN 75
    WHEN 'Urgup' THEN 70
    WHEN 'Uchisar' THEN 72
    ELSE 70
  END,
  CASE z.name
    WHEN 'Goreme' THEN 80
    WHEN 'Urgup' THEN 75
    WHEN 'Uchisar' THEN 78
    ELSE 75
  END
FROM airports a, zones z
WHERE a.code = 'ASR' AND z.city = 'Nevsehir' AND z.is_popular = TRUE;

-- Izmir ADB Routes
INSERT INTO routes (airport_id, zone_id, direction, approx_distance_km, approx_duration_min)
SELECT a.id, z.id, 'BOTH',
  CASE z.name
    WHEN 'Izmir City Center' THEN 18
    WHEN 'Alsancak' THEN 20
    WHEN 'Cesme' THEN 85
    WHEN 'Alacati' THEN 80
    WHEN 'Kusadasi' THEN 75
    WHEN 'Selcuk' THEN 60
    ELSE 40
  END,
  CASE z.name
    WHEN 'Izmir City Center' THEN 25
    WHEN 'Alsancak' THEN 28
    WHEN 'Cesme' THEN 90
    WHEN 'Alacati' THEN 85
    WHEN 'Kusadasi' THEN 80
    WHEN 'Selcuk' THEN 65
    ELSE 45
  END
FROM airports a, zones z
WHERE a.code = 'ADB' AND z.is_popular = TRUE AND (z.city = 'Izmir' OR z.name IN ('Kusadasi', 'Selcuk'));
