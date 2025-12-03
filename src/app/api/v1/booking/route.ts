import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiKey } from '@/lib/agency-auth';
import { query, queryOne } from '@/lib/db';
import crypto from 'crypto';

interface TariffRow {
  id: number;
  supplier_id: number;
  route_id: number;
  airport_id: number;
  zone_id: number;
  base_price: number;
  currency: string;
  vehicle_type: string;
}

interface AgencyRow {
  commission_rate: number;
  credit_limit: number;
  credit_used: number;
}

export async function POST(request: NextRequest) {
  const auth = await authenticateApiKey(request);
  if (!auth.success) return auth.response;

  const { agencyId, agencyName } = auth;

  const body = await request.json();
  const {
    airportCode,
    zoneId,
    vehicleType,
    pickupDate,
    pickupTime,
    direction,
    passengers,
    flightNumber,
    pickupAddress,
    dropoffAddress,
    customer,
    agencyRef,
  } = body;

  // Validate required fields
  if (!airportCode || !zoneId || !vehicleType || !pickupDate || !pickupTime || !customer) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  // Find tariff
  const tariff = await queryOne<TariffRow>(
    `SELECT t.id, t.supplier_id, t.route_id, r.airport_id, r.zone_id,
            t.base_price, t.currency, t.vehicle_type
     FROM tariffs t
     JOIN routes r ON r.id = t.route_id
     JOIN airports a ON a.id = r.airport_id
     WHERE a.code = ? AND r.zone_id = ? AND t.vehicle_type = ? AND t.is_active = TRUE
     ORDER BY t.base_price ASC
     LIMIT 1`,
    [airportCode, zoneId, vehicleType]
  );

  if (!tariff) {
    return NextResponse.json(
      { error: 'No available service for this route' },
      { status: 404 }
    );
  }

  // Get agency info
  const agency = await queryOne<AgencyRow>(
    'SELECT commission_rate, credit_limit, credit_used FROM agencies WHERE id = ?',
    [agencyId]
  );

  if (!agency) {
    return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
  }

  // Check credit
  const availableCredit = agency.credit_limit - agency.credit_used;
  if (tariff.base_price > availableCredit) {
    return NextResponse.json(
      { error: 'Insufficient credit balance' },
      { status: 400 }
    );
  }

  // Calculate commission
  const commission = tariff.base_price * (agency.commission_rate / 100);
  const supplierPayout = tariff.base_price - commission;

  // Generate booking code
  const publicCode = `B${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

  // Create pickup datetime
  const pickupDatetime = `${pickupDate} ${pickupTime}:00`;

  // Create booking
  const bookingResult = await query(
    `INSERT INTO bookings (
       public_code, supplier_id, channel, agency_id, agency_ref,
       airport_id, zone_id, direction, pickup_address, dropoff_address,
       flight_number, flight_date, pickup_datetime,
       pax_adults, pax_children, luggage_count, vehicle_type,
       currency, base_price, total_price, commission, supplier_payout,
       status, payment_status
     ) VALUES (?, ?, 'AGENCY_API', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', 'PAID')`,
    [
      publicCode,
      tariff.supplier_id,
      agencyId,
      agencyRef || null,
      tariff.airport_id,
      tariff.zone_id,
      direction || 'FROM_AIRPORT',
      pickupAddress || null,
      dropoffAddress || null,
      flightNumber || null,
      pickupDate,
      pickupDatetime,
      passengers?.adults || 1,
      passengers?.children || 0,
      passengers?.luggage || 0,
      vehicleType,
      tariff.currency,
      tariff.base_price,
      tariff.base_price,
      commission,
      supplierPayout,
    ]
  );

  const bookingId = (bookingResult as { insertId: number }).insertId;

  // Add lead passenger
  await query(
    `INSERT INTO booking_passengers (booking_id, full_name, phone, email, is_lead)
     VALUES (?, ?, ?, ?, TRUE)`,
    [bookingId, customer.name, customer.phone || null, customer.email || null]
  );

  // Deduct from agency credit
  await query(
    'UPDATE agencies SET credit_used = credit_used + ? WHERE id = ?',
    [tariff.base_price, agencyId]
  );

  // Log credit transaction
  const newBalance = agency.credit_limit - agency.credit_used - tariff.base_price;
  await query(
    `INSERT INTO agency_credit_transactions (agency_id, type, amount, balance_after, currency, booking_id)
     VALUES (?, 'CREDIT_USE', ?, ?, ?, ?)`,
    [agencyId, tariff.base_price, newBalance, tariff.currency, bookingId]
  );

  // Create ride for supplier
  await query(
    `INSERT INTO rides (booking_id, supplier_id, status)
     VALUES (?, ?, 'PENDING_ASSIGN')`,
    [bookingId, tariff.supplier_id]
  );

  return NextResponse.json({
    success: true,
    booking: {
      id: bookingId,
      publicCode,
      status: 'CONFIRMED',
      agencyRef,
      pickup: {
        date: pickupDate,
        time: pickupTime,
        address: pickupAddress,
      },
      pricing: {
        total: tariff.base_price,
        commission,
        net: supplierPayout,
        currency: tariff.currency,
      },
    },
  });
}
