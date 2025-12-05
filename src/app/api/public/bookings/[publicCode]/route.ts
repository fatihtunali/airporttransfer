import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

// GET /api/public/bookings/[publicCode] - Get booking by public code
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicCode: string }> }
) {
  try {
    const { publicCode } = await params;
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!publicCode) {
      return NextResponse.json(
        { error: 'Public code is required' },
        { status: 400 }
      );
    }

    // Email verification is required for security
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required for verification' },
        { status: 400 }
      );
    }

    // Get booking details
    const booking = await queryOne<{
      id: number;
      public_code: string;
      supplier_id: number;
      channel: string;
      agency_ref: string | null;
      airport_id: number;
      zone_id: number;
      direction: string;
      pickup_address: string | null;
      dropoff_address: string | null;
      flight_number: string | null;
      flight_date: string | null;
      flight_time: string | null;
      pickup_datetime: string;
      pax_adults: number;
      pax_children: number;
      vehicle_type: string;
      currency: string;
      total_price: number;
      status: string;
      payment_status: string;
      customer_notes: string | null;
      created_at: string;
    }>(
      `SELECT id, public_code, supplier_id, channel, agency_ref,
              airport_id, zone_id, direction,
              pickup_address, dropoff_address,
              flight_number, flight_date, flight_time,
              pickup_datetime, pax_adults, pax_children,
              vehicle_type, currency, total_price,
              status, payment_status, customer_notes, created_at
       FROM bookings WHERE public_code = ?`,
      [publicCode.toUpperCase()]
    );

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Verify email matches lead passenger
    const leadPassenger = await queryOne<{ email: string | null }>(
      `SELECT email FROM booking_passengers WHERE booking_id = ? AND is_lead = TRUE`,
      [booking.id]
    );

    if (!leadPassenger?.email || leadPassenger.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Email does not match booking records' },
        { status: 403 }
      );
    }

    // Get airport details
    const airport = await queryOne<{
      id: number;
      code: string;
      name: string;
      city: string;
      country: string;
      timezone: string;
    }>(
      'SELECT id, code, name, city, country, timezone FROM airports WHERE id = ?',
      [booking.airport_id]
    );

    // Get zone details
    const zone = await queryOne<{
      id: number;
      name: string;
      city: string;
      country: string;
    }>(
      'SELECT id, name, city, country FROM zones WHERE id = ?',
      [booking.zone_id]
    );

    // Get supplier name (limited info for public view)
    const supplier = await queryOne<{
      id: number;
      name: string;
      rating_avg: number;
    }>(
      'SELECT id, name, rating_avg FROM suppliers WHERE id = ?',
      [booking.supplier_id]
    );

    // Get passengers
    const passengers = await query<{
      id: number;
      full_name: string;
      phone: string | null;
      email: string | null;
      is_lead: boolean;
    }>(
      `SELECT id, full_name, phone, email, is_lead
       FROM booking_passengers WHERE booking_id = ?`,
      [booking.id]
    );

    // Get ride status if assigned
    const ride = await queryOne<{
      id: number;
      status: string;
      vehicle_id: number | null;
      driver_id: number | null;
    }>(
      'SELECT id, status, vehicle_id, driver_id FROM rides WHERE booking_id = ?',
      [booking.id]
    );

    // Get driver info if assigned (limited for customer)
    let driver = null;
    if (ride?.driver_id) {
      driver = await queryOne<{
        full_name: string;
        phone: string;
        photo_url: string | null;
      }>(
        'SELECT full_name, phone, photo_url FROM drivers WHERE id = ?',
        [ride.driver_id]
      );
    }

    // Get vehicle info if assigned
    let vehicle = null;
    if (ride?.vehicle_id) {
      vehicle = await queryOne<{
        brand: string;
        model: string;
        color: string;
        plate_number: string;
      }>(
        'SELECT brand, model, color, plate_number FROM vehicles WHERE id = ?',
        [ride.vehicle_id]
      );
    }

    return NextResponse.json({
      id: booking.id,
      publicCode: booking.public_code,
      channel: booking.channel,
      agencyName: booking.agency_ref,
      airport: airport ? {
        id: airport.id,
        code: airport.code,
        name: airport.name,
        city: airport.city,
        country: airport.country,
        timezone: airport.timezone,
        isActive: true,
      } : null,
      zone: zone ? {
        id: zone.id,
        name: zone.name,
        city: zone.city,
        country: zone.country,
        isActive: true,
      } : null,
      direction: booking.direction,
      pickupAddress: booking.pickup_address,
      dropoffAddress: booking.dropoff_address,
      flightNumber: booking.flight_number,
      flightDate: booking.flight_date,
      flightTime: booking.flight_time,
      pickupTime: booking.pickup_datetime,
      paxAdults: booking.pax_adults,
      paxChildren: booking.pax_children,
      vehicleType: booking.vehicle_type,
      currency: booking.currency,
      totalPrice: Number(booking.total_price),
      status: booking.status,
      paymentStatus: booking.payment_status,
      supplier: supplier ? {
        name: supplier.name,
        rating: Number(supplier.rating_avg),
      } : null,
      passengers: passengers.map((p) => ({
        id: p.id,
        fullName: p.full_name,
        phone: p.phone,
        email: p.email,
        isMain: p.is_lead,
      })),
      ride: ride ? {
        status: ride.status,
        driver: driver ? {
          name: driver.full_name,
          phone: driver.phone,
          photo: driver.photo_url,
        } : null,
        vehicle: vehicle ? {
          brand: vehicle.brand,
          model: vehicle.model,
          color: vehicle.color,
          plate: vehicle.plate_number,
        } : null,
      } : null,
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}
