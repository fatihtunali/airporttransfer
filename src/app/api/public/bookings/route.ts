import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, insert, transaction } from '@/lib/db';
import crypto from 'crypto';

type BookingChannel = 'B2C' | 'B2B' | 'AGENCY_API';
type VehicleType = 'SEDAN' | 'VAN' | 'MINIBUS' | 'BUS' | 'VIP';

interface PassengerInput {
  fullName: string;
  phone?: string;
  email?: string;
}

interface CreateBookingRequest {
  optionCode: string;
  channel: BookingChannel;
  agencyName?: string;
  mainPassenger: {
    fullName: string;
    phone: string;
    email?: string;
  };
  additionalPassengers?: PassengerInput[];
  // Additional booking details
  flightNumber?: string;
  flightDate?: string;
  flightTime?: string;
  pickupAddress?: string;
  dropoffAddress?: string;
  customerNotes?: string;
}

interface TariffDetails {
  tariff_id: number;
  supplier_id: number;
  route_id: number;
  airport_id: number;
  zone_id: number;
  direction: string;
  vehicle_type: VehicleType;
  base_price: number;
  price_per_pax: number | null;
  currency: string;
  commission_rate: number;
}

// Generate unique public booking code
function generatePublicCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding confusing chars
  let code = 'LT';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Decode option code to get tariff details
async function decodeOptionCode(optionCode: string): Promise<TariffDetails | null> {
  // Option codes are generated from tariff data
  // For now, we'll need to search for matching tariffs
  // In production, you might want to store option codes temporarily in Redis

  // This is a simplified approach - in reality you'd decode the hash
  // or look up the option code from a cache
  return null;
}

// POST /api/public/bookings - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const body: CreateBookingRequest = await request.json();

    // Validate required fields
    if (!body.optionCode || !body.channel || !body.mainPassenger?.fullName || !body.mainPassenger?.phone) {
      return NextResponse.json(
        { error: 'Missing required fields: optionCode, channel, mainPassenger.fullName, mainPassenger.phone' },
        { status: 400 }
      );
    }

    // For MVP, we'll extract tariff info from a separate search parameter
    // In production, option codes should be cached and validated

    // For now, require additional search parameters
    const searchParams = new URL(request.url).searchParams;
    const tariffId = searchParams.get('tariffId');
    const pickupTime = searchParams.get('pickupTime');
    const paxAdults = parseInt(searchParams.get('paxAdults') || '1');
    const paxChildren = parseInt(searchParams.get('paxChildren') || '0');

    if (!tariffId || !pickupTime) {
      return NextResponse.json(
        { error: 'Missing tariffId or pickupTime. Use search-transfers first to get a valid option.' },
        { status: 400 }
      );
    }

    // Get tariff details
    const tariff = await queryOne<{
      id: number;
      supplier_id: number;
      route_id: number;
      vehicle_type: VehicleType;
      base_price: number;
      price_per_pax: number | null;
      currency: string;
      airport_id: number;
      zone_id: number;
      direction: string;
      commission_rate: number;
    }>(
      `SELECT t.id, t.supplier_id, t.route_id, t.vehicle_type,
              t.base_price, t.price_per_pax, t.currency,
              r.airport_id, r.zone_id, r.direction,
              s.commission_rate
       FROM tariffs t
       INNER JOIN routes r ON r.id = t.route_id
       INNER JOIN suppliers s ON s.id = t.supplier_id
       WHERE t.id = ? AND t.is_active = TRUE`,
      [tariffId]
    );

    if (!tariff) {
      return NextResponse.json(
        { error: 'Invalid tariff or tariff no longer available' },
        { status: 400 }
      );
    }

    // Calculate total price
    const totalPax = paxAdults + paxChildren;
    let totalPrice = Number(tariff.base_price);
    if (tariff.price_per_pax && totalPax > 1) {
      totalPrice += Number(tariff.price_per_pax) * (totalPax - 1);
    }

    // Calculate commission
    const commission = totalPrice * (Number(tariff.commission_rate) / 100);
    const supplierPayout = totalPrice - commission;

    // Generate unique public code
    let publicCode = generatePublicCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await queryOne<{ id: number }>(
        'SELECT id FROM bookings WHERE public_code = ?',
        [publicCode]
      );
      if (!existing) break;
      publicCode = generatePublicCode();
      attempts++;
    }

    // Create booking with transaction
    const result = await transaction(async (conn) => {
      // Insert booking
      const [bookingResult] = await conn.execute(
        `INSERT INTO bookings (
          public_code, supplier_id, channel, agency_ref,
          airport_id, zone_id, direction,
          pickup_address, dropoff_address,
          flight_number, flight_date, flight_time,
          pickup_datetime, pax_adults, pax_children,
          vehicle_type, currency, base_price,
          total_price, commission, supplier_payout,
          status, payment_status, customer_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', 'UNPAID', ?)`,
        [
          publicCode,
          tariff.supplier_id,
          body.channel,
          body.agencyName || null,
          tariff.airport_id,
          tariff.zone_id,
          tariff.direction === 'BOTH' ? 'FROM_AIRPORT' : tariff.direction,
          body.pickupAddress || null,
          body.dropoffAddress || null,
          body.flightNumber || null,
          body.flightDate || null,
          body.flightTime || null,
          pickupTime,
          paxAdults,
          paxChildren,
          tariff.vehicle_type,
          tariff.currency,
          tariff.base_price,
          totalPrice,
          commission,
          supplierPayout,
          body.customerNotes || null,
        ]
      );

      const bookingId = (bookingResult as { insertId: number }).insertId;

      // Insert main passenger
      await conn.execute(
        `INSERT INTO booking_passengers (booking_id, full_name, phone, email, is_lead)
         VALUES (?, ?, ?, ?, TRUE)`,
        [bookingId, body.mainPassenger.fullName, body.mainPassenger.phone, body.mainPassenger.email || null]
      );

      // Insert additional passengers
      if (body.additionalPassengers?.length) {
        for (const passenger of body.additionalPassengers) {
          await conn.execute(
            `INSERT INTO booking_passengers (booking_id, full_name, phone, email, is_lead)
             VALUES (?, ?, ?, ?, FALSE)`,
            [bookingId, passenger.fullName, passenger.phone || null, passenger.email || null]
          );
        }
      }

      // Create ride record (pending assignment)
      await conn.execute(
        `INSERT INTO rides (booking_id, supplier_id, status)
         VALUES (?, ?, 'PENDING_ASSIGN')`,
        [bookingId, tariff.supplier_id]
      );

      // Create supplier payout record (pending)
      await conn.execute(
        `INSERT INTO supplier_payouts (supplier_id, booking_id, amount, currency, status)
         VALUES (?, ?, ?, ?, 'PENDING')`,
        [tariff.supplier_id, bookingId, supplierPayout, tariff.currency]
      );

      return bookingId;
    });

    // Fetch created booking with details
    const booking = await queryOne<{
      id: number;
      public_code: string;
      supplier_id: number;
      channel: BookingChannel;
      airport_id: number;
      zone_id: number;
      direction: string;
      flight_number: string | null;
      flight_date: string | null;
      flight_time: string | null;
      pickup_datetime: string;
      pax_adults: number;
      pax_children: number;
      vehicle_type: VehicleType;
      currency: string;
      total_price: number;
      status: string;
      payment_status: string;
      created_at: string;
    }>(
      `SELECT id, public_code, supplier_id, channel,
              airport_id, zone_id, direction,
              flight_number, flight_date, flight_time,
              pickup_datetime, pax_adults, pax_children,
              vehicle_type, currency, total_price,
              status, payment_status, created_at
       FROM bookings WHERE id = ?`,
      [result]
    );

    // Fetch passengers
    const passengers = await query<{
      id: number;
      booking_id: number;
      full_name: string;
      phone: string | null;
      email: string | null;
      is_lead: boolean;
    }>(
      `SELECT id, booking_id, full_name, phone, email, is_lead
       FROM booking_passengers WHERE booking_id = ?`,
      [result]
    );

    // Get airport and zone details
    const airport = await queryOne<{ id: number; code: string; name: string; city: string; country: string }>(
      'SELECT id, code, name, city, country FROM airports WHERE id = ?',
      [booking!.airport_id]
    );

    const zone = await queryOne<{ id: number; name: string; city: string; country: string }>(
      'SELECT id, name, city, country FROM zones WHERE id = ?',
      [booking!.zone_id]
    );

    return NextResponse.json(
      {
        booking: {
          id: booking!.id,
          publicCode: booking!.public_code,
          supplierId: booking!.supplier_id,
          channel: booking!.channel,
          airport: airport ? {
            id: airport.id,
            code: airport.code,
            name: airport.name,
            city: airport.city,
            country: airport.country,
          } : null,
          zone: zone ? {
            id: zone.id,
            name: zone.name,
            city: zone.city,
            country: zone.country,
          } : null,
          direction: booking!.direction,
          flightNumber: booking!.flight_number,
          flightDate: booking!.flight_date,
          flightTime: booking!.flight_time,
          pickupTime: booking!.pickup_datetime,
          paxAdults: booking!.pax_adults,
          paxChildren: booking!.pax_children,
          vehicleType: booking!.vehicle_type,
          currency: booking!.currency,
          totalPrice: Number(booking!.total_price),
          status: booking!.status,
          paymentStatus: booking!.payment_status,
        },
        passengers: passengers.map((p) => ({
          id: p.id,
          bookingId: p.booking_id,
          fullName: p.full_name,
          phone: p.phone,
          email: p.email,
          isMain: p.is_lead,
        })),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
