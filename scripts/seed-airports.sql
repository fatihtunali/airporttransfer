-- World Airports Seed Data
-- Major airports from all continents

-- Clear existing data (optional - comment out if you want to keep Turkish airports)
-- DELETE FROM airports WHERE id > 11;

-- EUROPE
INSERT IGNORE INTO airports (code, name, city, country, country_code, timezone, latitude, longitude, is_active) VALUES
-- United Kingdom
('LHR', 'London Heathrow Airport', 'London', 'United Kingdom', 'GB', 'Europe/London', 51.4700, -0.4543, 1),
('LGW', 'London Gatwick Airport', 'London', 'United Kingdom', 'GB', 'Europe/London', 51.1537, -0.1821, 1),
('STN', 'London Stansted Airport', 'London', 'United Kingdom', 'GB', 'Europe/London', 51.8850, 0.2350, 1),
('LTN', 'London Luton Airport', 'London', 'United Kingdom', 'GB', 'Europe/London', 51.8747, -0.3683, 1),
('MAN', 'Manchester Airport', 'Manchester', 'United Kingdom', 'GB', 'Europe/London', 53.3537, -2.2750, 1),
('EDI', 'Edinburgh Airport', 'Edinburgh', 'United Kingdom', 'GB', 'Europe/London', 55.9500, -3.3725, 1),
('BHX', 'Birmingham Airport', 'Birmingham', 'United Kingdom', 'GB', 'Europe/London', 52.4539, -1.7480, 1),

-- Germany
('FRA', 'Frankfurt Airport', 'Frankfurt', 'Germany', 'DE', 'Europe/Berlin', 50.0333, 8.5706, 1),
('MUC', 'Munich Airport', 'Munich', 'Germany', 'DE', 'Europe/Berlin', 48.3538, 11.7861, 1),
('DUS', 'Dusseldorf Airport', 'Dusseldorf', 'Germany', 'DE', 'Europe/Berlin', 51.2895, 6.7668, 1),
('TXL', 'Berlin Brandenburg Airport', 'Berlin', 'Germany', 'DE', 'Europe/Berlin', 52.3667, 13.5033, 1),
('HAM', 'Hamburg Airport', 'Hamburg', 'Germany', 'DE', 'Europe/Berlin', 53.6304, 9.9882, 1),
('CGN', 'Cologne Bonn Airport', 'Cologne', 'Germany', 'DE', 'Europe/Berlin', 50.8659, 7.1427, 1),

-- France
('CDG', 'Paris Charles de Gaulle Airport', 'Paris', 'France', 'FR', 'Europe/Paris', 49.0097, 2.5479, 1),
('ORY', 'Paris Orly Airport', 'Paris', 'France', 'FR', 'Europe/Paris', 48.7233, 2.3794, 1),
('NCE', 'Nice Cote d''Azur Airport', 'Nice', 'France', 'FR', 'Europe/Paris', 43.6584, 7.2159, 1),
('LYS', 'Lyon Saint-Exupery Airport', 'Lyon', 'France', 'FR', 'Europe/Paris', 45.7256, 5.0811, 1),
('MRS', 'Marseille Provence Airport', 'Marseille', 'France', 'FR', 'Europe/Paris', 43.4393, 5.2214, 1),

-- Spain
('MAD', 'Madrid Barajas Airport', 'Madrid', 'Spain', 'ES', 'Europe/Madrid', 40.4936, -3.5668, 1),
('BCN', 'Barcelona El Prat Airport', 'Barcelona', 'Spain', 'ES', 'Europe/Madrid', 41.2971, 2.0785, 1),
('PMI', 'Palma de Mallorca Airport', 'Palma de Mallorca', 'Spain', 'ES', 'Europe/Madrid', 39.5517, 2.7388, 1),
('AGP', 'Malaga Airport', 'Malaga', 'Spain', 'ES', 'Europe/Madrid', 36.6749, -4.4991, 1),
('ALC', 'Alicante Airport', 'Alicante', 'Spain', 'ES', 'Europe/Madrid', 38.2822, -0.5582, 1),
('TFS', 'Tenerife South Airport', 'Tenerife', 'Spain', 'ES', 'Atlantic/Canary', 28.0445, -16.5725, 1),
('LPA', 'Gran Canaria Airport', 'Las Palmas', 'Spain', 'ES', 'Atlantic/Canary', 27.9319, -15.3866, 1),
('IBZ', 'Ibiza Airport', 'Ibiza', 'Spain', 'ES', 'Europe/Madrid', 38.8729, 1.3731, 1),

-- Italy
('FCO', 'Rome Fiumicino Airport', 'Rome', 'Italy', 'IT', 'Europe/Rome', 41.8003, 12.2389, 1),
('MXP', 'Milan Malpensa Airport', 'Milan', 'Italy', 'IT', 'Europe/Rome', 45.6306, 8.7281, 1),
('LIN', 'Milan Linate Airport', 'Milan', 'Italy', 'IT', 'Europe/Rome', 45.4456, 9.2778, 1),
('VCE', 'Venice Marco Polo Airport', 'Venice', 'Italy', 'IT', 'Europe/Rome', 45.5053, 12.3519, 1),
('NAP', 'Naples Airport', 'Naples', 'Italy', 'IT', 'Europe/Rome', 40.8860, 14.2908, 1),
('FLR', 'Florence Airport', 'Florence', 'Italy', 'IT', 'Europe/Rome', 43.8100, 11.2051, 1),
('BGY', 'Milan Bergamo Airport', 'Bergamo', 'Italy', 'IT', 'Europe/Rome', 45.6739, 9.7042, 1),

-- Netherlands
('AMS', 'Amsterdam Schiphol Airport', 'Amsterdam', 'Netherlands', 'NL', 'Europe/Amsterdam', 52.3086, 4.7639, 1),
('RTM', 'Rotterdam The Hague Airport', 'Rotterdam', 'Netherlands', 'NL', 'Europe/Amsterdam', 51.9569, 4.4372, 1),
('EIN', 'Eindhoven Airport', 'Eindhoven', 'Netherlands', 'NL', 'Europe/Amsterdam', 51.4500, 5.3747, 1),

-- Belgium
('BRU', 'Brussels Airport', 'Brussels', 'Belgium', 'BE', 'Europe/Brussels', 50.9014, 4.4844, 1),
('CRL', 'Brussels South Charleroi Airport', 'Charleroi', 'Belgium', 'BE', 'Europe/Brussels', 50.4592, 4.4538, 1),

-- Switzerland
('ZRH', 'Zurich Airport', 'Zurich', 'Switzerland', 'CH', 'Europe/Zurich', 47.4647, 8.5492, 1),
('GVA', 'Geneva Airport', 'Geneva', 'Switzerland', 'CH', 'Europe/Zurich', 46.2381, 6.1089, 1),
('BSL', 'Basel-Mulhouse Airport', 'Basel', 'Switzerland', 'CH', 'Europe/Zurich', 47.5896, 7.5299, 1),

-- Austria
('VIE', 'Vienna International Airport', 'Vienna', 'Austria', 'AT', 'Europe/Vienna', 48.1103, 16.5697, 1),
('SZG', 'Salzburg Airport', 'Salzburg', 'Austria', 'AT', 'Europe/Vienna', 47.7933, 13.0043, 1),
('INN', 'Innsbruck Airport', 'Innsbruck', 'Austria', 'AT', 'Europe/Vienna', 47.2602, 11.3439, 1),

-- Portugal
('LIS', 'Lisbon Portela Airport', 'Lisbon', 'Portugal', 'PT', 'Europe/Lisbon', 38.7813, -9.1359, 1),
('OPO', 'Porto Airport', 'Porto', 'Portugal', 'PT', 'Europe/Lisbon', 41.2481, -8.6814, 1),
('FAO', 'Faro Airport', 'Faro', 'Portugal', 'PT', 'Europe/Lisbon', 37.0144, -7.9659, 1),
('FNC', 'Funchal Madeira Airport', 'Funchal', 'Portugal', 'PT', 'Atlantic/Madeira', 32.6979, -16.7745, 1),

-- Greece
('ATH', 'Athens International Airport', 'Athens', 'Greece', 'GR', 'Europe/Athens', 37.9364, 23.9445, 1),
('SKG', 'Thessaloniki Airport', 'Thessaloniki', 'Greece', 'GR', 'Europe/Athens', 40.5197, 22.9709, 1),
('HER', 'Heraklion Airport', 'Heraklion', 'Greece', 'GR', 'Europe/Athens', 35.3397, 25.1803, 1),
('RHO', 'Rhodes Airport', 'Rhodes', 'Greece', 'GR', 'Europe/Athens', 36.4054, 28.0862, 1),
('CFU', 'Corfu Airport', 'Corfu', 'Greece', 'GR', 'Europe/Athens', 39.6019, 19.9117, 1),
('JMK', 'Mykonos Airport', 'Mykonos', 'Greece', 'GR', 'Europe/Athens', 37.4351, 25.3481, 1),
('JTR', 'Santorini Airport', 'Santorini', 'Greece', 'GR', 'Europe/Athens', 36.3992, 25.4793, 1),
('KGS', 'Kos Airport', 'Kos', 'Greece', 'GR', 'Europe/Athens', 36.7933, 26.9406, 1),
('ZTH', 'Zakynthos Airport', 'Zakynthos', 'Greece', 'GR', 'Europe/Athens', 37.7509, 20.8843, 1),

-- Poland
('WAW', 'Warsaw Chopin Airport', 'Warsaw', 'Poland', 'PL', 'Europe/Warsaw', 52.1657, 20.9671, 1),
('KRK', 'Krakow Airport', 'Krakow', 'Poland', 'PL', 'Europe/Warsaw', 50.0777, 19.7848, 1),
('GDN', 'Gdansk Airport', 'Gdansk', 'Poland', 'PL', 'Europe/Warsaw', 54.3776, 18.4662, 1),
('WRO', 'Wroclaw Airport', 'Wroclaw', 'Poland', 'PL', 'Europe/Warsaw', 51.1027, 16.8858, 1),

-- Czech Republic
('PRG', 'Prague Vaclav Havel Airport', 'Prague', 'Czech Republic', 'CZ', 'Europe/Prague', 50.1008, 14.2600, 1),

-- Hungary
('BUD', 'Budapest Ferenc Liszt Airport', 'Budapest', 'Hungary', 'HU', 'Europe/Budapest', 47.4298, 19.2611, 1),

-- Ireland
('DUB', 'Dublin Airport', 'Dublin', 'Ireland', 'IE', 'Europe/Dublin', 53.4213, -6.2701, 1),
('SNN', 'Shannon Airport', 'Shannon', 'Ireland', 'IE', 'Europe/Dublin', 52.7020, -8.9248, 1),
('ORK', 'Cork Airport', 'Cork', 'Ireland', 'IE', 'Europe/Dublin', 51.8413, -8.4911, 1),

-- Scandinavia
('CPH', 'Copenhagen Airport', 'Copenhagen', 'Denmark', 'DK', 'Europe/Copenhagen', 55.6180, 12.6508, 1),
('OSL', 'Oslo Gardermoen Airport', 'Oslo', 'Norway', 'NO', 'Europe/Oslo', 60.1939, 11.1004, 1),
('ARN', 'Stockholm Arlanda Airport', 'Stockholm', 'Sweden', 'SE', 'Europe/Stockholm', 59.6519, 17.9186, 1),
('GOT', 'Gothenburg Landvetter Airport', 'Gothenburg', 'Sweden', 'SE', 'Europe/Stockholm', 57.6628, 12.2798, 1),
('HEL', 'Helsinki Vantaa Airport', 'Helsinki', 'Finland', 'FI', 'Europe/Helsinki', 60.3172, 24.9633, 1),
('BGO', 'Bergen Airport', 'Bergen', 'Norway', 'NO', 'Europe/Oslo', 60.2934, 5.2181, 1),

-- Eastern Europe
('SVO', 'Moscow Sheremetyevo Airport', 'Moscow', 'Russia', 'RU', 'Europe/Moscow', 55.9726, 37.4146, 1),
('DME', 'Moscow Domodedovo Airport', 'Moscow', 'Russia', 'RU', 'Europe/Moscow', 55.4088, 37.9063, 1),
('LED', 'St Petersburg Pulkovo Airport', 'St Petersburg', 'Russia', 'RU', 'Europe/Moscow', 59.8003, 30.2625, 1),
('KBP', 'Kyiv Boryspil Airport', 'Kyiv', 'Ukraine', 'UA', 'Europe/Kyiv', 50.3450, 30.8947, 1),
('OTP', 'Bucharest Henri Coanda Airport', 'Bucharest', 'Romania', 'RO', 'Europe/Bucharest', 44.5711, 26.0850, 1),
('SOF', 'Sofia Airport', 'Sofia', 'Bulgaria', 'BG', 'Europe/Sofia', 42.6967, 23.4114, 1),
('VAR', 'Varna Airport', 'Varna', 'Bulgaria', 'BG', 'Europe/Sofia', 43.2324, 27.8251, 1),
('BOJ', 'Burgas Airport', 'Burgas', 'Bulgaria', 'BG', 'Europe/Sofia', 42.5696, 27.5152, 1),

-- Croatia
('ZAG', 'Zagreb Airport', 'Zagreb', 'Croatia', 'HR', 'Europe/Zagreb', 45.7429, 16.0688, 1),
('SPU', 'Split Airport', 'Split', 'Croatia', 'HR', 'Europe/Zagreb', 43.5389, 16.2980, 1),
('DBV', 'Dubrovnik Airport', 'Dubrovnik', 'Croatia', 'HR', 'Europe/Zagreb', 42.5614, 18.2682, 1),

-- Cyprus
('LCA', 'Larnaca Airport', 'Larnaca', 'Cyprus', 'CY', 'Asia/Nicosia', 34.8754, 33.6249, 1),
('PFO', 'Paphos Airport', 'Paphos', 'Cyprus', 'CY', 'Asia/Nicosia', 34.7180, 32.4857, 1),

-- Malta
('MLA', 'Malta International Airport', 'Valletta', 'Malta', 'MT', 'Europe/Malta', 35.8575, 14.4775, 1),

-- MIDDLE EAST
-- UAE
('DXB', 'Dubai International Airport', 'Dubai', 'United Arab Emirates', 'AE', 'Asia/Dubai', 25.2528, 55.3644, 1),
('AUH', 'Abu Dhabi International Airport', 'Abu Dhabi', 'United Arab Emirates', 'AE', 'Asia/Dubai', 24.4330, 54.6511, 1),
('SHJ', 'Sharjah Airport', 'Sharjah', 'United Arab Emirates', 'AE', 'Asia/Dubai', 25.3286, 55.5172, 1),

-- Qatar
('DOH', 'Hamad International Airport', 'Doha', 'Qatar', 'QA', 'Asia/Qatar', 25.2731, 51.6081, 1),

-- Saudi Arabia
('JED', 'King Abdulaziz International Airport', 'Jeddah', 'Saudi Arabia', 'SA', 'Asia/Riyadh', 21.6796, 39.1565, 1),
('RUH', 'King Khalid International Airport', 'Riyadh', 'Saudi Arabia', 'SA', 'Asia/Riyadh', 24.9576, 46.6988, 1),
('DMM', 'King Fahd International Airport', 'Dammam', 'Saudi Arabia', 'SA', 'Asia/Riyadh', 26.4712, 49.7979, 1),

-- Bahrain
('BAH', 'Bahrain International Airport', 'Manama', 'Bahrain', 'BH', 'Asia/Bahrain', 26.2708, 50.6336, 1),

-- Kuwait
('KWI', 'Kuwait International Airport', 'Kuwait City', 'Kuwait', 'KW', 'Asia/Kuwait', 29.2266, 47.9689, 1),

-- Oman
('MCT', 'Muscat International Airport', 'Muscat', 'Oman', 'OM', 'Asia/Muscat', 23.5933, 58.2844, 1),

-- Jordan
('AMM', 'Queen Alia International Airport', 'Amman', 'Jordan', 'JO', 'Asia/Amman', 31.7226, 35.9931, 1),

-- Israel
('TLV', 'Ben Gurion Airport', 'Tel Aviv', 'Israel', 'IL', 'Asia/Jerusalem', 32.0114, 34.8867, 1),

-- Lebanon
('BEY', 'Beirut Rafic Hariri Airport', 'Beirut', 'Lebanon', 'LB', 'Asia/Beirut', 33.8209, 35.4884, 1),

-- Egypt
('CAI', 'Cairo International Airport', 'Cairo', 'Egypt', 'EG', 'Africa/Cairo', 30.1219, 31.4056, 1),
('HRG', 'Hurghada International Airport', 'Hurghada', 'Egypt', 'EG', 'Africa/Cairo', 27.1783, 33.7994, 1),
('SSH', 'Sharm El Sheikh Airport', 'Sharm El Sheikh', 'Egypt', 'EG', 'Africa/Cairo', 27.9773, 34.3950, 1),
('LXR', 'Luxor International Airport', 'Luxor', 'Egypt', 'EG', 'Africa/Cairo', 25.6710, 32.7066, 1),

-- Morocco
('CMN', 'Casablanca Mohammed V Airport', 'Casablanca', 'Morocco', 'MA', 'Africa/Casablanca', 33.3675, -7.5898, 1),
('RAK', 'Marrakech Menara Airport', 'Marrakech', 'Morocco', 'MA', 'Africa/Casablanca', 31.6069, -8.0363, 1),
('AGA', 'Agadir Al Massira Airport', 'Agadir', 'Morocco', 'MA', 'Africa/Casablanca', 30.3250, -9.4131, 1),
('TNG', 'Tangier Ibn Battouta Airport', 'Tangier', 'Morocco', 'MA', 'Africa/Casablanca', 35.7269, -5.9169, 1),

-- Tunisia
('TUN', 'Tunis Carthage Airport', 'Tunis', 'Tunisia', 'TN', 'Africa/Tunis', 36.8510, 10.2272, 1),
('DJE', 'Djerba Zarzis Airport', 'Djerba', 'Tunisia', 'TN', 'Africa/Tunis', 33.8750, 10.7755, 1),

-- AFRICA
('JNB', 'Johannesburg O.R. Tambo Airport', 'Johannesburg', 'South Africa', 'ZA', 'Africa/Johannesburg', -26.1392, 28.2460, 1),
('CPT', 'Cape Town International Airport', 'Cape Town', 'South Africa', 'ZA', 'Africa/Johannesburg', -33.9649, 18.6017, 1),
('NBO', 'Nairobi Jomo Kenyatta Airport', 'Nairobi', 'Kenya', 'KE', 'Africa/Nairobi', -1.3192, 36.9278, 1),
('ADD', 'Addis Ababa Bole Airport', 'Addis Ababa', 'Ethiopia', 'ET', 'Africa/Addis_Ababa', 8.9779, 38.7993, 1),
('LOS', 'Lagos Murtala Muhammed Airport', 'Lagos', 'Nigeria', 'NG', 'Africa/Lagos', 6.5774, 3.3212, 1),
('ACC', 'Accra Kotoka Airport', 'Accra', 'Ghana', 'GH', 'Africa/Accra', 5.6052, -0.1668, 1),
('DAR', 'Dar es Salaam Julius Nyerere Airport', 'Dar es Salaam', 'Tanzania', 'TZ', 'Africa/Dar_es_Salaam', -6.8781, 39.2026, 1),
('MRU', 'Mauritius Sir Seewoosagur Ramgoolam Airport', 'Mauritius', 'Mauritius', 'MU', 'Indian/Mauritius', -20.4302, 57.6836, 1),
('SEZ', 'Seychelles International Airport', 'Victoria', 'Seychelles', 'SC', 'Indian/Mahe', -4.6743, 55.5218, 1),
('ZNZ', 'Zanzibar Abeid Amani Karume Airport', 'Zanzibar', 'Tanzania', 'TZ', 'Africa/Dar_es_Salaam', -6.2220, 39.2249, 1),

-- ASIA
-- India
('DEL', 'Delhi Indira Gandhi Airport', 'New Delhi', 'India', 'IN', 'Asia/Kolkata', 28.5562, 77.1000, 1),
('BOM', 'Mumbai Chhatrapati Shivaji Airport', 'Mumbai', 'India', 'IN', 'Asia/Kolkata', 19.0896, 72.8656, 1),
('BLR', 'Bangalore Kempegowda Airport', 'Bangalore', 'India', 'IN', 'Asia/Kolkata', 13.1986, 77.7066, 1),
('MAA', 'Chennai International Airport', 'Chennai', 'India', 'IN', 'Asia/Kolkata', 12.9941, 80.1709, 1),
('CCU', 'Kolkata Netaji Subhash Chandra Bose Airport', 'Kolkata', 'India', 'IN', 'Asia/Kolkata', 22.6547, 88.4467, 1),
('HYD', 'Hyderabad Rajiv Gandhi Airport', 'Hyderabad', 'India', 'IN', 'Asia/Kolkata', 17.2403, 78.4294, 1),
('GOI', 'Goa Dabolim Airport', 'Goa', 'India', 'IN', 'Asia/Kolkata', 15.3808, 73.8314, 1),
('COK', 'Cochin International Airport', 'Kochi', 'India', 'IN', 'Asia/Kolkata', 10.1520, 76.4019, 1),

-- Thailand
('BKK', 'Bangkok Suvarnabhumi Airport', 'Bangkok', 'Thailand', 'TH', 'Asia/Bangkok', 13.6900, 100.7501, 1),
('DMK', 'Bangkok Don Mueang Airport', 'Bangkok', 'Thailand', 'TH', 'Asia/Bangkok', 13.9126, 100.6068, 1),
('HKT', 'Phuket International Airport', 'Phuket', 'Thailand', 'TH', 'Asia/Bangkok', 8.1132, 98.3169, 1),
('CNX', 'Chiang Mai International Airport', 'Chiang Mai', 'Thailand', 'TH', 'Asia/Bangkok', 18.7668, 98.9626, 1),
('USM', 'Koh Samui Airport', 'Koh Samui', 'Thailand', 'TH', 'Asia/Bangkok', 9.5478, 100.0622, 1),

-- Singapore
('SIN', 'Singapore Changi Airport', 'Singapore', 'Singapore', 'SG', 'Asia/Singapore', 1.3644, 103.9915, 1),

-- Malaysia
('KUL', 'Kuala Lumpur International Airport', 'Kuala Lumpur', 'Malaysia', 'MY', 'Asia/Kuala_Lumpur', 2.7456, 101.7099, 1),
('PEN', 'Penang International Airport', 'Penang', 'Malaysia', 'MY', 'Asia/Kuala_Lumpur', 5.2972, 100.2767, 1),
('LGK', 'Langkawi International Airport', 'Langkawi', 'Malaysia', 'MY', 'Asia/Kuala_Lumpur', 6.3297, 99.7286, 1),
('BKI', 'Kota Kinabalu International Airport', 'Kota Kinabalu', 'Malaysia', 'MY', 'Asia/Kuala_Lumpur', 5.9372, 116.0511, 1),

-- Indonesia
('CGK', 'Jakarta Soekarno-Hatta Airport', 'Jakarta', 'Indonesia', 'ID', 'Asia/Jakarta', -6.1256, 106.6558, 1),
('DPS', 'Bali Ngurah Rai Airport', 'Denpasar', 'Indonesia', 'ID', 'Asia/Makassar', -8.7482, 115.1672, 1),
('SUB', 'Surabaya Juanda Airport', 'Surabaya', 'Indonesia', 'ID', 'Asia/Jakarta', -7.3798, 112.7868, 1),

-- Vietnam
('SGN', 'Ho Chi Minh City Tan Son Nhat Airport', 'Ho Chi Minh City', 'Vietnam', 'VN', 'Asia/Ho_Chi_Minh', 10.8188, 106.6520, 1),
('HAN', 'Hanoi Noi Bai Airport', 'Hanoi', 'Vietnam', 'VN', 'Asia/Ho_Chi_Minh', 21.2212, 105.8071, 1),
('DAD', 'Da Nang International Airport', 'Da Nang', 'Vietnam', 'VN', 'Asia/Ho_Chi_Minh', 16.0439, 108.1992, 1),
('CXR', 'Cam Ranh International Airport', 'Nha Trang', 'Vietnam', 'VN', 'Asia/Ho_Chi_Minh', 11.9982, 109.2194, 1),
('PQC', 'Phu Quoc International Airport', 'Phu Quoc', 'Vietnam', 'VN', 'Asia/Ho_Chi_Minh', 10.1699, 103.9931, 1),

-- Philippines
('MNL', 'Manila Ninoy Aquino Airport', 'Manila', 'Philippines', 'PH', 'Asia/Manila', 14.5086, 121.0197, 1),
('CEB', 'Cebu Mactan International Airport', 'Cebu', 'Philippines', 'PH', 'Asia/Manila', 10.3075, 123.9794, 1),

-- China
('PEK', 'Beijing Capital Airport', 'Beijing', 'China', 'CN', 'Asia/Shanghai', 40.0801, 116.5846, 1),
('PKX', 'Beijing Daxing Airport', 'Beijing', 'China', 'CN', 'Asia/Shanghai', 39.5098, 116.4105, 1),
('PVG', 'Shanghai Pudong Airport', 'Shanghai', 'China', 'CN', 'Asia/Shanghai', 31.1434, 121.8052, 1),
('SHA', 'Shanghai Hongqiao Airport', 'Shanghai', 'China', 'CN', 'Asia/Shanghai', 31.1979, 121.3363, 1),
('CAN', 'Guangzhou Baiyun Airport', 'Guangzhou', 'China', 'CN', 'Asia/Shanghai', 23.3924, 113.2988, 1),
('SZX', 'Shenzhen Baoan Airport', 'Shenzhen', 'China', 'CN', 'Asia/Shanghai', 22.6393, 113.8107, 1),
('CTU', 'Chengdu Shuangliu Airport', 'Chengdu', 'China', 'CN', 'Asia/Shanghai', 30.5785, 103.9471, 1),
('XIY', 'Xi''an Xianyang Airport', 'Xi''an', 'China', 'CN', 'Asia/Shanghai', 34.4471, 108.7516, 1),
('HGH', 'Hangzhou Xiaoshan Airport', 'Hangzhou', 'China', 'CN', 'Asia/Shanghai', 30.2295, 120.4344, 1),

-- Hong Kong & Macau
('HKG', 'Hong Kong International Airport', 'Hong Kong', 'Hong Kong', 'HK', 'Asia/Hong_Kong', 22.3080, 113.9185, 1),
('MFM', 'Macau International Airport', 'Macau', 'Macau', 'MO', 'Asia/Macau', 22.1496, 113.5915, 1),

-- Taiwan
('TPE', 'Taipei Taoyuan Airport', 'Taipei', 'Taiwan', 'TW', 'Asia/Taipei', 25.0777, 121.2330, 1),
('KHH', 'Kaohsiung International Airport', 'Kaohsiung', 'Taiwan', 'TW', 'Asia/Taipei', 22.5771, 120.3500, 1),

-- Japan
('NRT', 'Tokyo Narita Airport', 'Tokyo', 'Japan', 'JP', 'Asia/Tokyo', 35.7653, 140.3864, 1),
('HND', 'Tokyo Haneda Airport', 'Tokyo', 'Japan', 'JP', 'Asia/Tokyo', 35.5494, 139.7798, 1),
('KIX', 'Osaka Kansai Airport', 'Osaka', 'Japan', 'JP', 'Asia/Tokyo', 34.4349, 135.2441, 1),
('ITM', 'Osaka Itami Airport', 'Osaka', 'Japan', 'JP', 'Asia/Tokyo', 34.7855, 135.4380, 1),
('NGO', 'Nagoya Chubu Centrair Airport', 'Nagoya', 'Japan', 'JP', 'Asia/Tokyo', 34.8585, 136.8055, 1),
('FUK', 'Fukuoka Airport', 'Fukuoka', 'Japan', 'JP', 'Asia/Tokyo', 33.5859, 130.4510, 1),
('CTS', 'Sapporo New Chitose Airport', 'Sapporo', 'Japan', 'JP', 'Asia/Tokyo', 42.7752, 141.6924, 1),
('OKA', 'Naha Airport', 'Okinawa', 'Japan', 'JP', 'Asia/Tokyo', 26.1958, 127.6459, 1),

-- South Korea
('ICN', 'Seoul Incheon Airport', 'Seoul', 'South Korea', 'KR', 'Asia/Seoul', 37.4691, 126.4505, 1),
('GMP', 'Seoul Gimpo Airport', 'Seoul', 'South Korea', 'KR', 'Asia/Seoul', 37.5583, 126.7906, 1),
('PUS', 'Busan Gimhae Airport', 'Busan', 'South Korea', 'KR', 'Asia/Seoul', 35.1795, 128.9382, 1),
('CJU', 'Jeju International Airport', 'Jeju', 'South Korea', 'KR', 'Asia/Seoul', 33.5112, 126.4928, 1),

-- Sri Lanka
('CMB', 'Colombo Bandaranaike Airport', 'Colombo', 'Sri Lanka', 'LK', 'Asia/Colombo', 7.1808, 79.8841, 1),

-- Maldives
('MLE', 'Male Velana Airport', 'Male', 'Maldives', 'MV', 'Indian/Maldives', 4.1918, 73.5292, 1),

-- Nepal
('KTM', 'Kathmandu Tribhuvan Airport', 'Kathmandu', 'Nepal', 'NP', 'Asia/Kathmandu', 27.6966, 85.3591, 1),

-- Pakistan
('KHI', 'Karachi Jinnah Airport', 'Karachi', 'Pakistan', 'PK', 'Asia/Karachi', 24.9065, 67.1608, 1),
('LHE', 'Lahore Allama Iqbal Airport', 'Lahore', 'Pakistan', 'PK', 'Asia/Karachi', 31.5216, 74.4036, 1),
('ISB', 'Islamabad International Airport', 'Islamabad', 'Pakistan', 'PK', 'Asia/Karachi', 33.5607, 72.8495, 1),

-- Bangladesh
('DAC', 'Dhaka Hazrat Shahjalal Airport', 'Dhaka', 'Bangladesh', 'BD', 'Asia/Dhaka', 23.8433, 90.3978, 1),

-- Cambodia
('PNH', 'Phnom Penh International Airport', 'Phnom Penh', 'Cambodia', 'KH', 'Asia/Phnom_Penh', 11.5466, 104.8440, 1),
('REP', 'Siem Reap International Airport', 'Siem Reap', 'Cambodia', 'KH', 'Asia/Phnom_Penh', 13.4107, 103.8128, 1),

-- Myanmar
('RGN', 'Yangon International Airport', 'Yangon', 'Myanmar', 'MM', 'Asia/Yangon', 16.9073, 96.1332, 1),

-- AMERICAS
-- USA
('JFK', 'New York John F Kennedy Airport', 'New York', 'United States', 'US', 'America/New_York', 40.6413, -73.7781, 1),
('EWR', 'Newark Liberty Airport', 'Newark', 'United States', 'US', 'America/New_York', 40.6895, -74.1745, 1),
('LGA', 'New York LaGuardia Airport', 'New York', 'United States', 'US', 'America/New_York', 40.7769, -73.8740, 1),
('LAX', 'Los Angeles International Airport', 'Los Angeles', 'United States', 'US', 'America/Los_Angeles', 33.9416, -118.4085, 1),
('SFO', 'San Francisco International Airport', 'San Francisco', 'United States', 'US', 'America/Los_Angeles', 37.6213, -122.3790, 1),
('ORD', 'Chicago O''Hare Airport', 'Chicago', 'United States', 'US', 'America/Chicago', 41.9742, -87.9073, 1),
('MIA', 'Miami International Airport', 'Miami', 'United States', 'US', 'America/New_York', 25.7959, -80.2870, 1),
('ATL', 'Atlanta Hartsfield-Jackson Airport', 'Atlanta', 'United States', 'US', 'America/New_York', 33.6407, -84.4277, 1),
('DFW', 'Dallas Fort Worth Airport', 'Dallas', 'United States', 'US', 'America/Chicago', 32.8998, -97.0403, 1),
('DEN', 'Denver International Airport', 'Denver', 'United States', 'US', 'America/Denver', 39.8561, -104.6737, 1),
('SEA', 'Seattle-Tacoma Airport', 'Seattle', 'United States', 'US', 'America/Los_Angeles', 47.4502, -122.3088, 1),
('BOS', 'Boston Logan Airport', 'Boston', 'United States', 'US', 'America/New_York', 42.3656, -71.0096, 1),
('LAS', 'Las Vegas Harry Reid Airport', 'Las Vegas', 'United States', 'US', 'America/Los_Angeles', 36.0840, -115.1537, 1),
('MCO', 'Orlando International Airport', 'Orlando', 'United States', 'US', 'America/New_York', 28.4312, -81.3081, 1),
('PHX', 'Phoenix Sky Harbor Airport', 'Phoenix', 'United States', 'US', 'America/Phoenix', 33.4373, -112.0078, 1),
('IAH', 'Houston George Bush Airport', 'Houston', 'United States', 'US', 'America/Chicago', 29.9902, -95.3368, 1),
('IAD', 'Washington Dulles Airport', 'Washington DC', 'United States', 'US', 'America/New_York', 38.9531, -77.4565, 1),
('DCA', 'Washington Reagan Airport', 'Washington DC', 'United States', 'US', 'America/New_York', 38.8512, -77.0402, 1),
('SAN', 'San Diego International Airport', 'San Diego', 'United States', 'US', 'America/Los_Angeles', 32.7336, -117.1897, 1),
('HNL', 'Honolulu Daniel K. Inouye Airport', 'Honolulu', 'United States', 'US', 'Pacific/Honolulu', 21.3187, -157.9225, 1),

-- Canada
('YYZ', 'Toronto Pearson Airport', 'Toronto', 'Canada', 'CA', 'America/Toronto', 43.6777, -79.6248, 1),
('YVR', 'Vancouver International Airport', 'Vancouver', 'Canada', 'CA', 'America/Vancouver', 49.1967, -123.1815, 1),
('YUL', 'Montreal Pierre Elliott Trudeau Airport', 'Montreal', 'Canada', 'CA', 'America/Toronto', 45.4706, -73.7408, 1),
('YYC', 'Calgary International Airport', 'Calgary', 'Canada', 'CA', 'America/Edmonton', 51.1215, -114.0076, 1),
('YOW', 'Ottawa Macdonald-Cartier Airport', 'Ottawa', 'Canada', 'CA', 'America/Toronto', 45.3225, -75.6692, 1),

-- Mexico
('MEX', 'Mexico City Benito Juarez Airport', 'Mexico City', 'Mexico', 'MX', 'America/Mexico_City', 19.4363, -99.0721, 1),
('CUN', 'Cancun International Airport', 'Cancun', 'Mexico', 'MX', 'America/Cancun', 21.0365, -86.8771, 1),
('GDL', 'Guadalajara Miguel Hidalgo Airport', 'Guadalajara', 'Mexico', 'MX', 'America/Mexico_City', 20.5218, -103.3111, 1),
('SJD', 'Los Cabos International Airport', 'San Jose del Cabo', 'Mexico', 'MX', 'America/Mazatlan', 23.1518, -109.7215, 1),
('PVR', 'Puerto Vallarta Gustavo Diaz Ordaz Airport', 'Puerto Vallarta', 'Mexico', 'MX', 'America/Mexico_City', 20.6801, -105.2544, 1),

-- Caribbean
('SJU', 'San Juan Luis Munoz Marin Airport', 'San Juan', 'Puerto Rico', 'PR', 'America/Puerto_Rico', 18.4394, -66.0018, 1),
('NAS', 'Nassau Lynden Pindling Airport', 'Nassau', 'Bahamas', 'BS', 'America/Nassau', 25.0390, -77.4662, 1),
('MBJ', 'Montego Bay Sangster Airport', 'Montego Bay', 'Jamaica', 'JM', 'America/Jamaica', 18.5037, -77.9134, 1),
('PUJ', 'Punta Cana International Airport', 'Punta Cana', 'Dominican Republic', 'DO', 'America/Santo_Domingo', 18.5674, -68.3634, 1),
('AUA', 'Aruba Queen Beatrix Airport', 'Oranjestad', 'Aruba', 'AW', 'America/Aruba', 12.5014, -70.0152, 1),
('CUR', 'Curacao Hato Airport', 'Willemstad', 'Curacao', 'CW', 'America/Curacao', 12.1889, -68.9598, 1),
('BGI', 'Barbados Grantley Adams Airport', 'Bridgetown', 'Barbados', 'BB', 'America/Barbados', 13.0746, -59.4925, 1),
('POS', 'Trinidad Piarco Airport', 'Port of Spain', 'Trinidad and Tobago', 'TT', 'America/Port_of_Spain', 10.5953, -61.3372, 1),
('HAV', 'Havana Jose Marti Airport', 'Havana', 'Cuba', 'CU', 'America/Havana', 22.9892, -82.4091, 1),

-- South America
('GRU', 'Sao Paulo Guarulhos Airport', 'Sao Paulo', 'Brazil', 'BR', 'America/Sao_Paulo', -23.4356, -46.4731, 1),
('GIG', 'Rio de Janeiro Galeao Airport', 'Rio de Janeiro', 'Brazil', 'BR', 'America/Sao_Paulo', -22.8100, -43.2506, 1),
('BSB', 'Brasilia International Airport', 'Brasilia', 'Brazil', 'BR', 'America/Sao_Paulo', -15.8711, -47.9186, 1),
('EZE', 'Buenos Aires Ezeiza Airport', 'Buenos Aires', 'Argentina', 'AR', 'America/Argentina/Buenos_Aires', -34.8222, -58.5358, 1),
('AEP', 'Buenos Aires Aeroparque Jorge Newbery', 'Buenos Aires', 'Argentina', 'AR', 'America/Argentina/Buenos_Aires', -34.5592, -58.4156, 1),
('SCL', 'Santiago Arturo Merino Benitez Airport', 'Santiago', 'Chile', 'CL', 'America/Santiago', -33.3930, -70.7858, 1),
('LIM', 'Lima Jorge Chavez Airport', 'Lima', 'Peru', 'PE', 'America/Lima', -12.0219, -77.1143, 1),
('BOG', 'Bogota El Dorado Airport', 'Bogota', 'Colombia', 'CO', 'America/Bogota', 4.7016, -74.1469, 1),
('CTG', 'Cartagena Rafael Nunez Airport', 'Cartagena', 'Colombia', 'CO', 'America/Bogota', 10.4424, -75.5130, 1),
('UIO', 'Quito Mariscal Sucre Airport', 'Quito', 'Ecuador', 'EC', 'America/Guayaquil', -0.1292, -78.3575, 1),
('CCS', 'Caracas Simon Bolivar Airport', 'Caracas', 'Venezuela', 'VE', 'America/Caracas', 10.6012, -66.9913, 1),
('MVD', 'Montevideo Carrasco Airport', 'Montevideo', 'Uruguay', 'UY', 'America/Montevideo', -34.8384, -56.0308, 1),
('ASU', 'Asuncion Silvio Pettirossi Airport', 'Asuncion', 'Paraguay', 'PY', 'America/Asuncion', -25.2400, -57.5200, 1),
('VVI', 'Santa Cruz Viru Viru Airport', 'Santa Cruz', 'Bolivia', 'BO', 'America/La_Paz', -17.6448, -63.1354, 1),

-- OCEANIA
('SYD', 'Sydney Kingsford Smith Airport', 'Sydney', 'Australia', 'AU', 'Australia/Sydney', -33.9399, 151.1753, 1),
('MEL', 'Melbourne Tullamarine Airport', 'Melbourne', 'Australia', 'AU', 'Australia/Melbourne', -37.6690, 144.8410, 1),
('BNE', 'Brisbane Airport', 'Brisbane', 'Australia', 'AU', 'Australia/Brisbane', -27.3942, 153.1218, 1),
('PER', 'Perth Airport', 'Perth', 'Australia', 'AU', 'Australia/Perth', -31.9385, 115.9672, 1),
('ADL', 'Adelaide Airport', 'Adelaide', 'Australia', 'AU', 'Australia/Adelaide', -34.9450, 138.5306, 1),
('CNS', 'Cairns Airport', 'Cairns', 'Australia', 'AU', 'Australia/Brisbane', -16.8858, 145.7555, 1),
('OOL', 'Gold Coast Airport', 'Gold Coast', 'Australia', 'AU', 'Australia/Brisbane', -28.1644, 153.5047, 1),
('AKL', 'Auckland Airport', 'Auckland', 'New Zealand', 'NZ', 'Pacific/Auckland', -37.0082, 174.7850, 1),
('CHC', 'Christchurch Airport', 'Christchurch', 'New Zealand', 'NZ', 'Pacific/Auckland', -43.4894, 172.5323, 1),
('WLG', 'Wellington Airport', 'Wellington', 'New Zealand', 'NZ', 'Pacific/Auckland', -41.3272, 174.8050, 1),
('ZQN', 'Queenstown Airport', 'Queenstown', 'New Zealand', 'NZ', 'Pacific/Auckland', -45.0211, 168.7392, 1),
('NAN', 'Nadi International Airport', 'Nadi', 'Fiji', 'FJ', 'Pacific/Fiji', -17.7554, 177.4431, 1),
('PPT', 'Tahiti Faa''a Airport', 'Papeete', 'French Polynesia', 'PF', 'Pacific/Tahiti', -17.5537, -149.6067, 1);
