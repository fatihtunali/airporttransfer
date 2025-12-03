import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiKey } from '@/lib/agency-auth';
import { queryOne } from '@/lib/db';

interface BookingRow {
  id: number;
  public_code: string;
  agency_ref: string | null;
  airport_name: string;
  zone_name: string;
  direction: string;
  pickup_address: string | null;
  dropoff_address: string | null;
  flight_number: string | null;
  pickup_datetime: string;
  pax_adults: number;
  pax_children: number;
  luggage_count: number;
  vehicle_type: string;
  total_price: number;
  commission: number;
  supplier_payout: number;
  currency: string;
  status: string;
  payment_status: string;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  driver_name: string | null;
  driver_phone: string | null;
  created_at: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const auth = await authenticateApiKey(request);
  if (!auth.success) return auth.response;

  const { agencyId } = auth;
  const { bookingId } = await params;

  // Support both numeric ID and public code
  const isNumeric = /^\d+$/.test(bookingId);

  const booking = await queryOne<BookingRow>(
    `SELECT
       b.id, b.public_code, b.agency_ref,
       a.name as airport_name, z.name as zone_name,
       b.direction, b.pickup_address, b.dropoff_address,
       b.flight_number, b.pickup_datetime,
       b.pax_adults, b.pax_children, b.luggage_count, b.vehicle_type,
       b.total_price, b.commission, b.supplier_payout, b.currency,
       b.status, b.payment_status, b.created_at,
       bp.full_name as customer_name, bp.phone as customer_phone, bp.email as customer_email,
       d.full_name as driver_name, d.phone as driver_phone
     FROM bookings b
     LEFT JOIN airports a ON a.id = b.airport_id
     LEFT JOIN zones z ON z.id = b.zone_id
     LEFT JOIN booking_passengers bp ON bp.booking_id = b.id AND bp.is_lead = TRUE
     LEFT JOIN rides r ON r.booking_id = b.id
     LEFT JOIN drivers d ON d.id = r.driver_id
     WHERE b.agency_id = ? AND ${isNumeric ? 'b.id = ?' : 'b.public_code = ?'}`,
    [agencyId, bookingId]
  );

  if (!booking) {
    return NextResponse.json(
      { error: 'Booking not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    id: booking.id,
    publicCode: booking.public_code,
    agencyRef: booking.agency_ref,
    status: booking.status,
    paymentStatus: booking.payment_status,
    route: {
      from: booking.direction === 'FROM_AIRPORT' ? booking.airport_name : booking.zone_name,
      to: booking.direction === 'FROM_AIRPORT' ? booking.zone_name : booking.airport_name,
      pickupAddress: booking.pickup_address,
      dropoffAddress: booking.dropoff_address,
    },
    pickup: {
      datetime: booking.pickup_datetime,
      flightNumber: booking.flight_number,
    },
    passengers: {
      adults: booking.pax_adults,
      children: booking.pax_children,
      luggage: booking.luggage_count,
    },
    vehicle: {
      type: booking.vehicle_type,
    },
    pricing: {
      total: booking.total_price,
      commission: booking.commission,
      net: booking.supplier_payout,
      currency: booking.currency,
    },
    customer: {
      name: booking.customer_name,
      phone: booking.customer_phone,
      email: booking.customer_email,
    },
    driver: booking.driver_name
      ? {
          name: booking.driver_name,
          phone: booking.driver_phone,
        }
      : null,
    createdAt: booking.created_at,
  });
}
