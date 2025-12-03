# AirportTransfer Portal - Strategic Development Roadmap

## Vision
A B2B-first global transfer marketplace with white-label capabilities. Start with Turkey corridor dominance, then expand globally.

---

## Progress Overview

| Phase | Status | Progress |
|-------|--------|----------|
| Phase 1: Foundation | Complete | 100% |
| Phase 2: Marketplace Engine | Complete | 100% |
| Phase 3: Trust Infrastructure | Complete | 100% |
| Phase 4: Supplier Portal | Complete | 100% |
| Phase 5: B2B & White-Label | Complete | 100% |
| Phase 6: Operations & Dispatch | Not Started | 0% |
| Phase 7: Admin Panel | In Progress | 60% |
| Phase 8: Advanced Features | Not Started | 0% |

---

## Actors in the System

| Actor | Role |
|-------|------|
| **Suppliers** | Local transfer companies, chauffeurs, fleet owners |
| **Agencies/Tour Operators** | B2B clients, white-label users |
| **Concierge/Hotels** | Partner referrals, embedded booking |
| **End Clients (B2C)** | Direct travelers |
| **Dispatchers** | Internal oversight & support |

---

## Phase 1: Foundation (System Skeleton)

### 1.1 Multi-Tenant Database Architecture - COMPLETED

```
COMPANIES (Suppliers)
├── company_id, name, legal_name, tax_id
├── country, city, address
├── contact_email, contact_phone, whatsapp
├── logo, documents (license, insurance)
├── verified, active, rating
├── commission_rate, payout_method
├── created_at, updated_at
│
├── VEHICLES
│   ├── vehicle_id, company_id
│   ├── type (sedan/minivan/van/minibus/bus/vip)
│   ├── brand, model, year, plate_number
│   ├── max_passengers, max_luggage
│   ├── features (wifi, water, child_seat, etc.)
│   ├── images[], documents[]
│   ├── active
│   │
│   └── DRIVERS
│       ├── driver_id, vehicle_id (optional)
│       ├── name, phone, email
│       ├── license_number, license_expiry
│       ├── photo, documents[]
│       ├── languages[]
│       ├── rating, verified, active
│
├── SERVICE_ZONES
│   ├── zone_id, company_id
│   ├── airport_code (IST, AYT, DLM, etc.)
│   ├── coverage_areas[] (districts, cities)
│   ├── max_distance_km
│   ├── active
│
├── AVAILABILITY
│   ├── company_id, vehicle_id
│   ├── date, time_slots[]
│   ├── blocked_dates[]
│   ├── advance_booking_hours
│
└── PRICING_RULES (Dynamic, not static!)
    ├── rule_id, company_id
    ├── origin_zone, destination_zone
    ├── vehicle_type
    ├── base_price, currency
    ├── per_km_rate (for distance-based)
    │
    ├── TIME MODIFIERS
    │   ├── night_surcharge (22:00-06:00)
    │   ├── peak_hours_surcharge
    │   ├── early_morning_surcharge
    │
    ├── SEASONAL MODIFIERS
    │   ├── high_season_dates[], multiplier
    │   ├── low_season_dates[], multiplier
    │
    ├── EXTRAS
    │   ├── child_seat_price
    │   ├── extra_luggage_price
    │   ├── meet_greet_price
    │   ├── extra_stop_price
    │   ├── waiting_time_per_hour
    │
    └── SPECIAL RULES
        ├── last_minute_surcharge (< 24h)
        ├── vip_upgrade_price
        ├── round_trip_discount_%
```

**Status:**
- [x] Database schema created (28 tables) - `database/schema.sql`
- [x] MySQL connection utility - `src/lib/db.ts`

### 1.2 Locations Database - COMPLETED

```
AIRPORTS
├── iata_code (IST, AYT, LHR, JFK)
├── name, city, country
├── timezone
├── terminals[]
├── coordinates (lat, lng)
├── active

ZONES / DESTINATIONS
├── zone_id, name
├── country, region, city
├── type (city_center, district, resort, hotel)
├── coordinates
├── parent_zone_id (for hierarchy)
├── popular (for quick search)
```

**Status:**
- [x] Turkey airports seeded (11 airports) - `database/seed-turkey.sql`
  - IST, SAW, AYT, GZP, DLM, BJV, ADB, NAV, ASR, TZX, ESB
- [x] Turkey zones seeded (83 zones)
  - Istanbul districts, Antalya resorts, Bodrum, Cappadocia, Izmir, Ankara
- [x] Routes seeded (79 routes with distance/duration)

### 1.3 Landing Page & Search UI - COMPLETED

- [x] Hero section with search form
- [x] One-way / Round-trip toggle
- [x] Hero background image with gradient overlay
- [x] Search form positioned on left
- [x] "Become a Partner" link in footer
- [x] Airport autocomplete connected to API
- [x] Destination autocomplete connected to API (zones filtered by airport)
- [x] Passenger & luggage selection
- [x] Flight number input
- [x] Search navigates to /search results page

### 1.4 API Documentation - COMPLETED

- [x] OpenAPI 3.0 specification (`openapi.yaml`) - v1.1.0
- [x] Swagger UI available at `/api-docs`
- [x] API route serving spec at `/api/openapi`

**API Spec includes:**
- Auth endpoints (register, login)
- Public endpoints (airports, zones, search-transfers, bookings)
- Supplier endpoints (profile, vehicles, drivers, tariffs, rides, payouts, dashboard)
- Admin endpoints (airports, zones, routes, suppliers, tariffs, payouts, bookings, dashboard)
- Role-based access control (x-roles)
- Pagination support
- Idempotency-Key for payments
- Payment webhook endpoint

---

## Phase 2: Marketplace Engine

### 2.1 Real-Time Matching Algorithm

**Request Flow:**
```
1. User enters: Flight TK1234 + 4 pax + 2 bags + AYT → Belek
                          ↓
2. System: Parse flight → Get arrival time → Add buffer
                          ↓
3. Query: Find suppliers WHERE
          - service_zone includes AYT
          - coverage includes Belek
          - vehicle capacity >= 4 pax
          - available on date/time
          - active & verified
                          ↓
4. Calculate: Dynamic price for each supplier
          - Base price
          + Time modifiers (night, peak)
          + Seasonal modifier
          + Extras (child seat, etc.)
          + Platform commission
                          ↓
5. Return: 2-5 options sorted by price/rating
                          ↓
6. Customer books → Payment captured
                          ↓
7. Supplier notified → Accepts/Auto-accept
                          ↓
8. Driver assigned → Customer gets details
                          ↓
9. Live tracking → Pickup → Complete → Review
```

### 2.2 Pricing Engine

```typescript
calculatePrice(request) {
  basePrice = supplier.getPriceForRoute(origin, destination, vehicleType)

  // Time modifiers
  if (isNightTime(pickupTime)) price += nightSurcharge
  if (isPeakHour(pickupTime)) price += peakSurcharge

  // Seasonal
  if (isHighSeason(date)) price *= highSeasonMultiplier

  // Extras
  if (childSeats > 0) price += childSeats * childSeatPrice
  if (extraLuggage) price += extraLuggagePrice
  if (meetAndGreet) price += meetGreetPrice

  // Special
  if (isLastMinute(date)) price += lastMinuteSurcharge
  if (isRoundTrip) price *= (2 - roundTripDiscount)

  // Commission
  commission = price * commissionRate
  supplierPayout = price - commission

  return { customerPrice, commission, supplierPayout }
}
```

### 2.3 Search Results Page - COMPLETED
- [x] Display multiple supplier options
- [x] Show vehicle icons, capacity
- [x] Price display with currency
- [x] Supplier rating & reviews count
- [x] "Select" button to proceed to booking
- [x] Cancellation policy display
- [x] Meet & Greet, Flight Tracking features shown
- [x] Filter: vehicle type, price range
- [x] Sort: price, rating, duration

---

## Phase 3: Trust Infrastructure - COMPLETED

### 3.1 Supplier Verification
- [x] Company registration documents - API: POST /api/supplier/documents
- [x] Business license upload - API: POST /api/supplier/documents
- [x] Insurance certificate (mandatory) - API: POST /api/supplier/documents
- [x] Bank account verification - via supplier profile
- [x] Address verification - via supplier profile
- [x] Manual review & approval process - API: POST /api/admin/documents/[id]/verify

### 3.2 Driver Verification
- [x] ID/passport upload - API: POST /api/supplier/drivers/[id]/documents
- [x] Driver license (front/back) - API: POST /api/supplier/drivers/[id]/documents
- [x] License expiry tracking & alerts - API: GET /api/supplier/expiring-documents
- [x] Photo verification - API: POST /api/supplier/drivers/[id]/documents (PHOTO type)
- [x] Background check (optional) - document type OTHER

### 3.3 Vehicle Verification
- [x] Registration document - API: POST /api/supplier/vehicles/[id]/documents
- [x] Insurance document - API: POST /api/supplier/vehicles/[id]/documents
- [x] Vehicle photos (exterior, interior) - via vehicle images JSON
- [x] Inspection certificate - API: POST /api/supplier/vehicles/[id]/documents

### 3.4 SLA & Rules
- [x] Max response time to booking (30 min) - sla_rules table
- [x] Auto-accept option for suppliers - sla_rules table
- [x] Cancellation policy tiers - cancellation_policies table
- [x] Refund rules - cancellation_policies table
- [x] No-show penalties - sla_rules table
- [x] Flight delay handling (free waiting) - sla_rules table
- [x] SLA breach penalties - sla_rules table

### 3.5 Reviews & Ratings
- [x] Post-trip review request - API: POST /api/public/reviews
- [x] 5-star rating system - rating_overall (1-5)
- [x] Review categories (punctuality, vehicle, driver) - rating_punctuality, rating_vehicle, rating_driver
- [x] Supplier response to reviews - API: POST /api/supplier/reviews/[id]/respond
- [x] Aggregate ratings display - API: GET /api/public/reviews?supplierId=X

**New APIs Created:**
- `/api/supplier/documents` - Supplier document upload
- `/api/supplier/drivers/[driverId]/documents` - Driver document upload
- `/api/supplier/vehicles/[vehicleId]/documents` - Vehicle document upload
- `/api/supplier/reviews` - List supplier reviews
- `/api/supplier/reviews/[reviewId]/respond` - Respond to review
- `/api/supplier/expiring-documents` - Expiring documents alert
- `/api/admin/documents` - Admin document listing
- `/api/admin/documents/[documentId]/verify` - Verify documents
- `/api/admin/sla-rules` - SLA rules management
- `/api/admin/cancellation-policies` - Cancellation policy management
- `/api/admin/expiring-documents` - All expiring documents
- `/api/public/reviews` - Public reviews & submit review

**New Database Tables (migration-v1.2-trust.sql):**
- `sla_rules` - SLA configuration
- `cancellation_policies` - Cancellation policy tiers
- `supplier_sla_metrics` - Supplier performance tracking
- `v_expiring_documents` - View for document expiry alerts

---

## Phase 4: Supplier Portal - COMPLETED

### 4.1 Onboarding Flow
- [x] Registration form (company details) - `/supplier/register` - 3-step wizard
- [x] Document upload wizard - `/supplier/documents`
- [x] Service zones selection - via registration step 1
- [x] Vehicle fleet setup - `/supplier/vehicles`
- [x] Driver profiles - `/supplier/drivers`
- [x] Pricing rules configuration - `/supplier/pricing`
- [x] Bank/payout details - via registration step 2
- [x] Terms acceptance - via registration step 3
- [x] Submit for verification - registration completion

### 4.2 Dashboard
- [x] Today's bookings - `/supplier` dashboard
- [x] Upcoming bookings calendar - stats cards
- [x] Earnings overview - monthly earnings card
- [x] Pending payouts - pending payout card
- [x] Rating summary - average rating card
- [x] Quick actions - quick action buttons

### 4.3 Booking Management
- [x] New booking notifications - `/supplier/bookings` with real-time refresh
- [x] Accept/Decline with reason - booking action buttons
- [x] Assign driver - driver assignment modal
- [x] Update status (confirmed, driver_assigned, pickup, completed) - status updates
- [x] Contact customer (in-app messaging) - booking details
- [x] Report issue - booking management

### 4.4 Route & Pricing Management
- [x] Add/edit service zones - `/supplier/pricing` grouped by route
- [x] Define zone-to-zone pricing - tariff management
- [x] Set pricing rules (time, season, extras) - pricing modifiers
- [x] Bulk price update - via pricing page
- [x] Competitive pricing suggestions - base price display

### 4.5 Fleet Management
- [x] Add/edit vehicles - `/supplier/vehicles` with modal forms
- [x] Document expiry alerts - sidebar expiry widget
- [x] Add/edit drivers - `/supplier/drivers` with modal forms
- [x] Driver documents management - driver documents link

### 4.6 Financial
- [x] Transaction history - `/supplier/payouts`
- [x] Commission breakdown - payout stats cards
- [x] Payout schedule - scheduled payouts display
- [x] Payout status filtering - status filters

### 4.7 Reviews & Documents
- [x] View customer reviews - `/supplier/reviews`
- [x] Respond to reviews - response form
- [x] Review statistics - total reviews, avg rating, pending response
- [x] Document management - `/supplier/documents`
- [x] Document verification status - verified/pending badges
- [x] Document expiry tracking - expiry alerts

**Supplier Portal Pages Created:**
- `src/app/supplier/layout.tsx` - Main layout with sidebar navigation
- `src/app/supplier/page.tsx` - Dashboard with stats and quick actions
- `src/app/supplier/login/page.tsx` - Login form with authentication
- `src/app/supplier/register/page.tsx` - 3-step registration wizard
- `src/app/supplier/bookings/page.tsx` - Booking management with filters
- `src/app/supplier/vehicles/page.tsx` - Vehicle fleet management
- `src/app/supplier/drivers/page.tsx` - Driver management
- `src/app/supplier/pricing/page.tsx` - Tariff/pricing management
- `src/app/supplier/payouts/page.tsx` - Financial payouts tracking
- `src/app/supplier/documents/page.tsx` - Document upload/verification
- `src/app/supplier/reviews/page.tsx` - Customer reviews with responses

---

## Phase 5: B2B & White-Label (Your Secret Weapon) - COMPLETED

### 5.1 Agency Portal
- [x] Agency registration - `/agency/register` with 3-step wizard
- [x] Agency login - `/agency/login`
- [x] Agency dashboard - `/agency` with stats and quick actions
- [x] Booking management - `/agency/bookings` with filters
- [x] Team/sub-accounts management - `/agency/team` with roles (Owner/Manager/Booker)
- [x] Credit line / invoicing - `/agency/credits` and `/agency/invoices`
- [x] Custom commission rates - per-agency commission_rate

### 5.2 White-Label Solution
- [x] Custom domain support - `/agency/whitelabel` domain tab
- [x] Subdomain support - agency.airporttransferportal.com
- [x] Logo & branding customization - logo, colors, company name
- [x] Color scheme configuration - primary, secondary, accent colors
- [x] SEO settings - meta title, description, favicon
- [x] Tracking integration - Google Analytics, Facebook Pixel
- [x] Footer customization - custom text, contact info
- [x] Display options - show/hide powered by, reviews, suppliers

### 5.3 API for B2B Integration
- [x] `GET  /api/v1/search` - Search available transfers
- [x] `POST /api/v1/quote` - Get price quote
- [x] `POST /api/v1/booking` - Create booking
- [x] `GET  /api/v1/booking/{id}` - Get booking details
- [x] `POST /api/v1/booking/{id}/cancel` - Cancel booking with refund
- [x] API key authentication via X-API-Key header

### 5.4 Embeddable Widget
- [x] Widget management - `/agency/api` page
- [x] Widget types - Search Form, Full Booking, Quote Only
- [x] Theme options - Light, Dark, Auto
- [x] Domain restrictions - allowed domains configuration
- [x] Embed code generation - copy-to-clipboard functionality
- [x] Widget analytics - impressions and conversions tracking

**Agency Portal Pages Created:**
- `src/app/agency/layout.tsx` - Main layout with sidebar navigation
- `src/app/agency/page.tsx` - Dashboard with stats
- `src/app/agency/login/page.tsx` - Login form
- `src/app/agency/register/page.tsx` - 3-step registration wizard
- `src/app/agency/bookings/page.tsx` - Booking management
- `src/app/agency/team/page.tsx` - Team/sub-accounts management
- `src/app/agency/invoices/page.tsx` - Invoice history
- `src/app/agency/credits/page.tsx` - Credit balance and transactions
- `src/app/agency/whitelabel/page.tsx` - White-label configuration
- `src/app/agency/api/page.tsx` - API keys and widget management

**Agency API Endpoints Created:**
- `src/app/api/agency/me/route.ts` - Agency profile
- `src/app/api/agency/register/route.ts` - Registration
- `src/app/api/agency/dashboard/route.ts` - Dashboard stats
- `src/app/api/agency/bookings/route.ts` - Booking list
- `src/app/api/agency/team/route.ts` - Team management
- `src/app/api/agency/invoices/route.ts` - Invoice list
- `src/app/api/agency/credits/route.ts` - Credit transactions
- `src/app/api/agency/whitelabel/route.ts` - White-label config
- `src/app/api/agency/api-keys/route.ts` - API key management
- `src/app/api/agency/widgets/route.ts` - Widget management

**B2B API Endpoints Created:**
- `src/app/api/v1/search/route.ts` - Search transfers
- `src/app/api/v1/quote/route.ts` - Get quote
- `src/app/api/v1/booking/route.ts` - Create booking
- `src/app/api/v1/booking/[bookingId]/route.ts` - Get booking
- `src/app/api/v1/booking/[bookingId]/cancel/route.ts` - Cancel booking

**New Database Tables (migration-v1.3-b2b.sql):**
- `agency_whitelabel` - White-label configuration
- `agency_invoices` - Invoice records
- `agency_invoice_items` - Invoice line items
- `agency_widgets` - Embeddable widgets
- `agency_api_logs` - API request logging
- `agency_credit_transactions` - Credit transaction history

---

## Phase 6: Operations & Dispatch

### 6.1 Live Tracking
- [ ] Flight tracking API integration
- [ ] Auto-adjust pickup for delays
- [ ] Real-time driver location
- [ ] ETA updates to customer
- [ ] Push notifications

### 6.2 Dispatch Dashboard (Internal)
- [ ] All active bookings map view
- [ ] Driver locations
- [ ] Issue alerts
- [ ] Manual intervention tools
- [ ] Customer support interface

### 6.3 Communication
- [ ] In-app messaging (customer ↔ driver)
- [ ] Automated SMS updates
- [ ] WhatsApp integration (optional)
- [ ] Email notifications

---

## Phase 7: Admin Panel

- [ ] Dashboard with KPIs
- [ ] Supplier management (verify, suspend)
- [ ] Booking oversight
- [ ] Financial reports
- [ ] Commission management
- [ ] Location database management
- [ ] System configuration
- [ ] User management
- [ ] Logs & audit trail

---

## Phase 8: Advanced Features

### 8.1 Multi-Language
- [ ] English (default)
- [ ] German, French, Spanish
- [ ] Russian, Turkish, Arabic

### 8.2 Multi-Currency
- [ ] EUR, USD, GBP, TRY, RUB
- [ ] Real-time conversion
- [ ] Supplier payout in local currency

### 8.3 Smart Features
- [ ] Price prediction
- [ ] Demand forecasting
- [ ] Dynamic surge pricing
- [ ] Route optimization

### 8.4 Marketing & Trust (Competitor Parity - airporttransfer.com)
- [ ] Popular Destinations section with airport cards & images
- [ ] Trust indicators (review stars, customer testimonials)
- [ ] Payment security badges (Stripe, PayPal, 3D Secure logos)
- [ ] Prominent "Free Cancellation" messaging on homepage
- [ ] FAQ section for common traveler questions
- [ ] Blog/SEO content (destination guides, airport info)
- [ ] Award badges and certifications display
- [ ] Mobile app (iOS + Android) - future consideration

### 8.5 Growth & Credibility (Competitor Parity - hoppa.com)
- [ ] Trustpilot integration with real review scores
- [ ] "As featured in" media logos section (press mentions)
- [ ] Scale statistics display (countries, airports, partners served)
- [ ] Newsletter signup with "Sign up & save!" incentive
- [ ] "My Bookings" quick lookup in header navigation
- [ ] Clear tagline: "Search, Compare & Book"
- [ ] Partner count & traveler volume social proof
- [ ] Booking amendment/cancel self-service UI

---

## Monetization Model

**Primary: Commission per Booking (15-20%)**
- Scales with volume
- No upfront cost for suppliers
- Clear value proposition

**Secondary: White-Label SaaS**
- Monthly fee for branded solution
- Higher margins
- Stickiness (once integrated, they stay)

**Tertiary: Premium Listings**
- Featured placement in results
- Priority support
- Analytics dashboard

---

## Launch Strategy

### Phase A: Turkey Corridor (MVP)
**3 Airports:**
- Istanbul (IST/SAW)
- Antalya (AYT)
- Cappadocia (NAV/ASR)

**Target:**
- 20 verified suppliers
- Guaranteed response < 30 min
- 100% flight tracking

### Phase B: B2B Push
- Onboard 10 tour operators
- White-label for 3 agencies
- Hotel partnerships in Antalya

### Phase C: Expand
- Dalaman (DLM), Bodrum (BJV), Izmir (ADB)
- Greece, Spain, Italy corridors

### Phase D: Global
- Major European airports
- API partnerships with OTAs

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 16, React, Tailwind CSS |
| Backend | Next.js API Routes |
| Database | MySQL with mysql2 (raw queries) |
| Auth | JWT + HTTP-only cookies |
| Email | Brevo |
| SMS | Twilio / NetGSM |
| Payment | Your payment system |
| Flight API | FlightAware / AeroDataBox |
| Maps | Google Maps API |
| Hosting | DigitalOcean |
| Process | PM2 |

---

## Completed Work Summary

### Infrastructure
- [x] Server setup on DigitalOcean (134.209.137.11)
- [x] Linux user created: `airporttransfer`
- [x] MySQL database created: `airporttransfer`
- [x] GitHub repo: https://github.com/fatihtunali/airporttransfer
- [x] SSH key configured

### Database
- [x] Schema with 28 tables (`database/schema.sql`)
- [x] Turkey seed data (`database/seed-turkey.sql`)
  - 11 airports
  - 83 zones
  - 79 routes

### Frontend
- [x] Next.js 16 project initialized
- [x] Landing page with hero section
- [x] Search form UI (one-way/round-trip)
- [x] Hero background image with gradient

### API
- [x] DB connection utility (`src/lib/db.ts`)
- [x] OpenAPI spec v1.1.0 (`openapi.yaml`)
- [x] Swagger UI page (`/api-docs`)
- [x] OpenAPI route (`/api/openapi`)
- [x] Public API: GET /api/public/airports
- [x] Public API: GET /api/public/zones
- [x] Public API: POST /api/public/search-transfers
- [x] Public API: POST /api/public/bookings
- [x] Public API: GET /api/public/bookings/[publicCode]
- [x] Auth API: POST /api/auth/register
- [x] Auth API: POST /api/auth/login
- [x] Supplier API: All endpoints (profile, vehicles, drivers, tariffs, rides, payouts, dashboard)
- [x] Admin API: All endpoints (airports, zones, routes, suppliers, tariffs, payouts, bookings, dashboard)

### Documentation
- [x] CLAUDE.md with credentials
- [x] ROADMAP.md (this file)

---

## Immediate Next Steps

1. **Complete Landing Page**
   - Connect airport autocomplete to API
   - Connect zone autocomplete to API
   - Wire up search form to API

2. **Build Public API Routes** - COMPLETED
   - [x] `GET /api/public/airports`
   - [x] `GET /api/public/zones`
   - [x] `POST /api/public/search-transfers`
   - [x] `POST /api/public/bookings`
   - [x] `GET /api/public/bookings/[publicCode]`

3. **Build Auth API Routes** - COMPLETED
   - [x] `POST /api/auth/register`
   - [x] `POST /api/auth/login`
   - [x] JWT authentication with jose
   - [x] Password hashing with bcryptjs
   - [x] HTTP-only cookies

4. **Supplier API Routes** - COMPLETED
   - [x] `GET /api/supplier/me` - Profile endpoint
   - [x] `GET/POST /api/supplier/vehicles` - Vehicle management
   - [x] `GET/POST /api/supplier/drivers` - Driver management
   - [x] `GET/POST /api/supplier/tariffs` - Tariff management
   - [x] `GET /api/supplier/tariffs/[tariffId]` - Tariff detail with rules
   - [x] `GET/POST /api/supplier/tariffs/[tariffId]/rules` - Tariff rules
   - [x] `GET /api/supplier/rides` - List rides
   - [x] `GET /api/supplier/rides/[rideId]` - Ride detail
   - [x] `POST /api/supplier/rides/[rideId]/assign-driver` - Assign driver
   - [x] `POST /api/supplier/rides/[rideId]/status` - Update status
   - [x] `GET /api/supplier/payouts` - List payouts
   - [x] `GET /api/supplier/dashboard` - Dashboard KPIs

5. **Admin API Routes** - COMPLETED
   - [x] `GET/POST /api/admin/airports` - Airport management
   - [x] `GET/POST /api/admin/zones` - Zone management
   - [x] `GET/POST /api/admin/routes` - Route management
   - [x] `GET/POST /api/admin/suppliers` - Supplier management
   - [x] `GET /api/admin/suppliers/[supplierId]` - Supplier detail
   - [x] `POST /api/admin/suppliers/[supplierId]/verify` - Verify supplier
   - [x] `GET/POST /api/admin/tariffs` - Tariff management
   - [x] `GET /api/admin/payouts` - List all payouts
   - [x] `POST /api/admin/payouts/[payoutId]/mark-paid` - Mark payout paid
   - [x] `GET /api/admin/bookings` - List all bookings
   - [x] `GET /api/admin/dashboard` - Admin KPIs

7. **Supplier Portal MVP**
   - Registration flow UI
   - Basic dashboard UI
   - Add routes & pricing UI

8. **Soft Launch**
   - Onboard 5 trusted suppliers (your network)
   - Test end-to-end flow
   - Iterate based on feedback

---

*"B2C burns cash. B2B pays invoices."*

*Last Updated: 03 December 2025*
