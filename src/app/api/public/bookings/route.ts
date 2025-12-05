import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, transaction } from '@/lib/db';
import { sendBookingConfirmationEmail } from '@/lib/email';

type BookingChannel = 'B2C' | 'B2B' | 'AGENCY_API';
type VehicleType = 'SEDAN' | 'VAN' | 'MINIBUS' | 'BUS' | 'VIP';

interface LeadPassengerInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface CreateBookingRequest {
  // Option from search
  optionCode?: string;

  // Route details
  airportId: number;
  zoneId: number;
  direction?: string;
  pickupTime: string;
  paxAdults: number;
  vehicleType: VehicleType;
  currency: string;

  // Passenger details
  leadPassenger: LeadPassengerInput;

  // Additional details
  flightNumber?: string;
  pickupAddress?: string;
  dropoffAddress?: string;
  specialRequests?: string;

  // Legacy support
  channel?: BookingChannel;
  mainPassenger?: {
    fullName: string;
    phone: string;
    email?: string;
  };
}

// Generate unique public booking code
function generatePublicCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'ATP';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// POST /api/public/bookings - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const body: CreateBookingRequest = await request.json();

    // Support both new and legacy formats
    const leadPassenger = body.leadPassenger || (body.mainPassenger ? {
      firstName: body.mainPassenger.fullName.split(' ')[0],
      lastName: body.mainPassenger.fullName.split(' ').slice(1).join(' ') || '',
      email: body.mainPassenger.email || '',
      phone: body.mainPassenger.phone,
    } : null);

    // Validate required fields
    if (!leadPassenger?.firstName || !leadPassenger?.lastName || !leadPassenger?.phone) {
      return NextResponse.json(
        { error: 'Missing required passenger details: firstName, lastName, phone' },
        { status: 400 }
      );
    }

    if (!body.airportId || !body.zoneId || !body.pickupTime || !body.vehicleType) {
      return NextResponse.json(
        { error: 'Missing required booking details: airportId, zoneId, pickupTime, vehicleType' },
        { status: 400 }
      );
    }

    // Find a matching tariff for this route and vehicle type
    const tariff = await queryOne<{
      id: number;
      supplier_id: number;
      route_id: number;
      vehicle_type: VehicleType;
      base_price: number;
      price_per_pax: number | null;
      currency: string;
      commission_rate: number;
    }>(
      `SELECT t.id, t.supplier_id, t.route_id, t.vehicle_type,
              t.base_price, t.price_per_pax, t.currency,
              s.commission_rate
       FROM tariffs t
       INNER JOIN routes r ON r.id = t.route_id
       INNER JOIN suppliers s ON s.id = t.supplier_id
       WHERE r.airport_id = ?
         AND r.zone_id = ?
         AND t.vehicle_type = ?
         AND t.is_active = TRUE
         AND r.is_active = TRUE
         AND s.is_active = TRUE
       LIMIT 1`,
      [body.airportId, body.zoneId, body.vehicleType]
    );

    if (!tariff) {
      return NextResponse.json(
        { error: 'No available tariff for this route and vehicle type' },
        { status: 400 }
      );
    }

    // Calculate total price
    const paxAdults = body.paxAdults || 1;
    let totalPrice = Number(tariff.base_price);
    if (tariff.price_per_pax && paxAdults > 1) {
      totalPrice += Number(tariff.price_per_pax) * (paxAdults - 1);
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

    const direction = body.direction || 'FROM_AIRPORT';
    const currency = body.currency || tariff.currency || 'EUR';
    const channel = body.channel || 'B2C';

    // Create booking with transaction
    const bookingId = await transaction(async (conn) => {
      // Insert booking
      const [bookingResult] = await conn.execute(
        `INSERT INTO bookings (
          public_code, supplier_id, channel,
          airport_id, zone_id, direction,
          pickup_address, dropoff_address,
          flight_number,
          pickup_datetime, pax_adults, pax_children,
          vehicle_type, currency, base_price,
          total_price, commission, supplier_payout,
          status, payment_status, customer_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', 'UNPAID', ?)`,
        [
          publicCode,
          tariff.supplier_id,
          channel,
          body.airportId,
          body.zoneId,
          direction,
          body.pickupAddress || null,
          body.dropoffAddress || null,
          body.flightNumber || null,
          body.pickupTime,
          paxAdults,
          0, // pax_children
          body.vehicleType,
          currency,
          tariff.base_price,
          totalPrice,
          commission,
          supplierPayout,
          body.specialRequests || null,
        ]
      );

      const newBookingId = (bookingResult as unknown as { insertId: number }).insertId;

      // Insert main passenger
      const fullName = `${leadPassenger.firstName} ${leadPassenger.lastName}`.trim();
      await conn.execute(
        `INSERT INTO booking_passengers (booking_id, full_name, phone, email, is_lead)
         VALUES (?, ?, ?, ?, TRUE)`,
        [newBookingId, fullName, leadPassenger.phone, leadPassenger.email || null]
      );

      // Create ride record (pending assignment)
      await conn.execute(
        `INSERT INTO rides (booking_id, supplier_id, status)
         VALUES (?, ?, 'PENDING_ASSIGN')`,
        [newBookingId, tariff.supplier_id]
      );

      // Create supplier payout record (pending)
      await conn.execute(
        `INSERT INTO supplier_payouts (supplier_id, booking_id, amount, currency, status)
         VALUES (?, ?, ?, ?, 'PENDING')`,
        [tariff.supplier_id, newBookingId, supplierPayout, currency]
      );

      return newBookingId;
    });

    // Fetch created booking with location details for email
    const booking = await queryOne<{
      id: number;
      public_code: string;
      status: string;
      payment_status: string;
      total_price: number;
      currency: string;
      pickup_datetime: string;
      pickup_address: string;
      dropoff_address: string;
      vehicle_type: string;
      pax_adults: number;
      flight_number: string | null;
      customer_notes: string | null;
      airport_name: string;
      zone_name: string;
      direction: string;
    }>(
      `SELECT b.id, b.public_code, b.status, b.payment_status, b.total_price, b.currency,
              b.pickup_datetime, b.pickup_address, b.dropoff_address, b.vehicle_type,
              b.pax_adults, b.flight_number, b.customer_notes, b.direction,
              a.name as airport_name, z.name as zone_name
       FROM bookings b
       LEFT JOIN airports a ON a.id = b.airport_id
       LEFT JOIN zones z ON z.id = b.zone_id
       WHERE b.id = ?`,
      [bookingId]
    );

    // Send booking confirmation email (async, don't block response)
    if (leadPassenger.email) {
      const fullName = `${leadPassenger.firstName} ${leadPassenger.lastName}`.trim();
      const pickupLocation = booking!.direction === 'FROM_AIRPORT'
        ? booking!.airport_name
        : (booking!.pickup_address || booking!.zone_name);
      const dropoffLocation = booking!.direction === 'FROM_AIRPORT'
        ? (booking!.dropoff_address || booking!.zone_name)
        : booking!.airport_name;

      sendBookingConfirmationEmail({
        publicCode: booking!.public_code,
        customerName: fullName,
        customerEmail: leadPassenger.email,
        pickupDatetime: booking!.pickup_datetime,
        pickupAddress: pickupLocation,
        dropoffAddress: dropoffLocation,
        vehicleType: booking!.vehicle_type,
        passengers: booking!.pax_adults,
        flightNumber: booking!.flight_number || undefined,
        totalPrice: Number(booking!.total_price),
        currency: booking!.currency,
        paymentStatus: booking!.payment_status,
        specialRequests: booking!.customer_notes || undefined,
      }).catch((err) => {
        console.error('Failed to send booking confirmation email:', err);
      });
    }

    return NextResponse.json(
      {
        bookingId: booking!.id,
        publicCode: booking!.public_code,
        status: booking!.status,
        paymentStatus: booking!.payment_status,
        totalPrice: Number(booking!.total_price),
        currency: booking!.currency,
        message: 'Booking created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking. Please try again.' },
      { status: 500 }
    );
  }
}
