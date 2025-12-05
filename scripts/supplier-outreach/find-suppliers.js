#!/usr/bin/env node
/**
 * Supplier Finder - Research tool to find transfer companies
 *
 * This script helps you find transfer company contacts from Google search results.
 * It outputs a list of companies to manually verify and add to the outreach list.
 *
 * Usage:
 *   node find-suppliers.js "Istanbul airport transfer"
 *   node find-suppliers.js --city Istanbul --country Turkey
 */

const https = require('https');

const SEARCH_TEMPLATES = [
  '{city} airport transfer company',
  '{city} airport taxi service',
  '{city} private transfer',
  '{city} vip transfer',
  '{airport} transfer service',
  'best {city} airport transfer',
  '{city} limousine service airport'
];

// City data with airport codes
const CITIES = {
  // Turkey
  'Istanbul': { country: 'Turkey', airports: ['IST', 'SAW'], language: 'tr' },
  'Antalya': { country: 'Turkey', airports: ['AYT'], language: 'tr' },
  'Bodrum': { country: 'Turkey', airports: ['BJV'], language: 'tr' },
  'Izmir': { country: 'Turkey', airports: ['ADB'], language: 'tr' },
  'Dalaman': { country: 'Turkey', airports: ['DLM'], language: 'tr' },
  'Cappadocia': { country: 'Turkey', airports: ['ASR', 'NAV'], language: 'tr' },

  // Greece
  'Athens': { country: 'Greece', airports: ['ATH'], language: 'en' },
  'Santorini': { country: 'Greece', airports: ['JTR'], language: 'en' },
  'Mykonos': { country: 'Greece', airports: ['JMK'], language: 'en' },
  'Heraklion': { country: 'Greece', airports: ['HER'], language: 'en' },
  'Rhodes': { country: 'Greece', airports: ['RHO'], language: 'en' },
  'Corfu': { country: 'Greece', airports: ['CFU'], language: 'en' },

  // Cyprus
  'Larnaca': { country: 'Cyprus', airports: ['LCA'], language: 'en' },
  'Paphos': { country: 'Cyprus', airports: ['PFO'], language: 'en' },

  // UAE
  'Dubai': { country: 'UAE', airports: ['DXB'], language: 'en' },
  'Abu Dhabi': { country: 'UAE', airports: ['AUH'], language: 'en' },

  // Egypt
  'Cairo': { country: 'Egypt', airports: ['CAI'], language: 'ar' },
  'Hurghada': { country: 'Egypt', airports: ['HRG'], language: 'ar' },
  'Sharm El Sheikh': { country: 'Egypt', airports: ['SSH'], language: 'ar' },

  // Morocco
  'Marrakech': { country: 'Morocco', airports: ['RAK'], language: 'en' },
  'Casablanca': { country: 'Morocco', airports: ['CMN'], language: 'en' },
  'Agadir': { country: 'Morocco', airports: ['AGA'], language: 'en' },

  // Thailand
  'Bangkok': { country: 'Thailand', airports: ['BKK', 'DMK'], language: 'en' },
  'Phuket': { country: 'Thailand', airports: ['HKT'], language: 'en' },
  'Krabi': { country: 'Thailand', airports: ['KBV'], language: 'en' },
  'Koh Samui': { country: 'Thailand', airports: ['USM'], language: 'en' },
  'Chiang Mai': { country: 'Thailand', airports: ['CNX'], language: 'en' },

  // Indonesia
  'Bali': { country: 'Indonesia', airports: ['DPS'], language: 'en' },
  'Jakarta': { country: 'Indonesia', airports: ['CGK'], language: 'en' },

  // Malaysia
  'Kuala Lumpur': { country: 'Malaysia', airports: ['KUL'], language: 'en' },
  'Langkawi': { country: 'Malaysia', airports: ['LGK'], language: 'en' },

  // Singapore
  'Singapore': { country: 'Singapore', airports: ['SIN'], language: 'en' },

  // Vietnam
  'Ho Chi Minh': { country: 'Vietnam', airports: ['SGN'], language: 'en' },
  'Hanoi': { country: 'Vietnam', airports: ['HAN'], language: 'en' },
  'Da Nang': { country: 'Vietnam', airports: ['DAD'], language: 'en' },

  // Cambodia
  'Siem Reap': { country: 'Cambodia', airports: ['REP'], language: 'en' },

  // Sri Lanka
  'Colombo': { country: 'Sri Lanka', airports: ['CMB'], language: 'en' },

  // Maldives
  'Male': { country: 'Maldives', airports: ['MLE'], language: 'en' },

  // India
  'Goa': { country: 'India', airports: ['GOI'], language: 'en' },
  'Delhi': { country: 'India', airports: ['DEL'], language: 'en' },

  // Georgia
  'Tbilisi': { country: 'Georgia', airports: ['TBS'], language: 'en' },
  'Batumi': { country: 'Georgia', airports: ['BUS'], language: 'en' },

  // Albania
  'Tirana': { country: 'Albania', airports: ['TIA'], language: 'en' },

  // Montenegro
  'Tivat': { country: 'Montenegro', airports: ['TIV'], language: 'en' },
  'Podgorica': { country: 'Montenegro', airports: ['TGD'], language: 'en' },

  // Bulgaria
  'Sofia': { country: 'Bulgaria', airports: ['SOF'], language: 'en' },
  'Varna': { country: 'Bulgaria', airports: ['VAR'], language: 'en' },

  // Romania
  'Bucharest': { country: 'Romania', airports: ['OTP'], language: 'en' },

  // Serbia
  'Belgrade': { country: 'Serbia', airports: ['BEG'], language: 'en' },

  // Jordan
  'Amman': { country: 'Jordan', airports: ['AMM'], language: 'ar' },

  // Qatar
  'Doha': { country: 'Qatar', airports: ['DOH'], language: 'ar' },

  // Oman
  'Muscat': { country: 'Oman', airports: ['MCT'], language: 'ar' }
};

function generateSearchQueries(city) {
  const cityData = CITIES[city];
  if (!cityData) {
    console.log(`City not found in database: ${city}`);
    return [];
  }

  const queries = [];

  for (const template of SEARCH_TEMPLATES) {
    queries.push(template.replace('{city}', city));

    for (const airport of cityData.airports) {
      queries.push(template.replace('{airport}', airport).replace('{city}', city));
    }
  }

  return [...new Set(queries)]; // Remove duplicates
}

function printResearchGuide(city) {
  const cityData = CITIES[city];

  if (!cityData) {
    console.log(`\n❌ City "${city}" not found in database.\n`);
    console.log('Available cities:');
    Object.keys(CITIES).forEach(c => console.log(`  - ${c}`));
    return;
  }

  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║  SUPPLIER RESEARCH GUIDE: ${city.toUpperCase().padEnd(36)} ║
╠══════════════════════════════════════════════════════════════════╣
║  Country: ${cityData.country.padEnd(51)} ║
║  Airports: ${cityData.airports.join(', ').padEnd(50)} ║
║  Language: ${cityData.language.padEnd(51)} ║
╚══════════════════════════════════════════════════════════════════╝

📍 GOOGLE SEARCH QUERIES:
─────────────────────────────────────────────────────────────────────
`);

  const queries = generateSearchQueries(city);
  queries.forEach((q, i) => {
    console.log(`  ${i + 1}. ${q}`);
    console.log(`     https://www.google.com/search?q=${encodeURIComponent(q)}`);
    console.log('');
  });

  console.log(`
📋 WHAT TO LOOK FOR:
─────────────────────────────────────────────────────────────────────
  • Company name
  • Website URL
  • Email address (usually on Contact page)
  • Phone number
  • Whether they do airport transfers (not just city tours)
  • Reviews/ratings to assess quality

📝 PLACES TO CHECK:
─────────────────────────────────────────────────────────────────────
  1. Google Search Results (organic listings)
  2. Google Maps - search "airport transfer" near the airport
  3. TripAdvisor - ${city} Transportation section
  4. Viator/GetYourGuide - see suppliers listed there
  5. Facebook - search "${city} transfer" or "${city} taxi"
  6. Local business directories

⚠️  AVOID:
─────────────────────────────────────────────────────────────────────
  • Aggregator platforms (GetTransfer, Hoppa, etc.)
  • Companies with no real contact info
  • Companies with very bad reviews
  • Companies that only do tours, not transfers

📧 ADD CONTACTS USING:
─────────────────────────────────────────────────────────────────────
  node send-outreach.js add \\
    --company "Company Name" \\
    --email "info@company.com" \\
    --city "${city}" \\
    --country "${cityData.country}" \\
    --website "https://company.com" \\
    --phone "+123456789"

`);
}

function printAllCities() {
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║              100 TARGET CITIES FOR SUPPLIER OUTREACH             ║
╚══════════════════════════════════════════════════════════════════╝
`);

  const byCountry = {};
  for (const [city, data] of Object.entries(CITIES)) {
    if (!byCountry[data.country]) byCountry[data.country] = [];
    byCountry[data.country].push({ city, ...data });
  }

  for (const [country, cities] of Object.entries(byCountry)) {
    console.log(`\n${country}:`);
    console.log('─'.repeat(60));
    cities.forEach(c => {
      console.log(`  ${c.city.padEnd(20)} ${c.airports.join(', ').padEnd(15)} [${c.language}]`);
    });
  }

  console.log(`\nTotal: ${Object.keys(CITIES).length} cities\n`);
}

// CLI
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help') {
  console.log(`
📍 SUPPLIER FINDER

Usage:
  node find-suppliers.js <city>        Show research guide for a city
  node find-suppliers.js --all         List all target cities
  node find-suppliers.js --help        Show this help

Examples:
  node find-suppliers.js Istanbul
  node find-suppliers.js "Sharm El Sheikh"
  node find-suppliers.js --all
  `);
} else if (args[0] === '--all') {
  printAllCities();
} else {
  const city = args.join(' ');
  printResearchGuide(city);
}
