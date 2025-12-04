import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { authenticateAdmin } from '@/lib/admin-auth';

interface BookingRow {
  id: number;
  public_code: string;
  supplier_id: number;
  supplier_name: string;
  agency_id: number | null;
  agency_name: string | null;
  airport_id: number;
  airport_code: string;
  airport_name: string;
  zone_id: number;
  zone_name: string;
  direction: string;
  vehicle_type: string;
  pickup_datetime: Date;
  pickup_address: string;
  dropoff_address: string;
  flight_number: string | null;
  pax_adults: number;
  pax_children: number;
  pax_infants: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  special_requests: string | null;
  base_price: number;
  extras_total: number;
  total_price: number;
  currency: string;
  status: string;
  payment_status: string;
  created_at: Date;
}

// GET /api/admin/bookings/[bookingId] - Get single booking with full details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const authResult = await authenticateAdmin(request);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const { bookingId } = await params;
    const id = parseInt(bookingId, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 });
    }

    const booking = await queryOne<BookingRow>(
      `SELECT b.*,
              s.name as supplier_name,
              ag.name as agency_name,
              a.code as airport_code, a.name as airport_name,
              z.name as zone_name
       FROM bookings b
       LEFT JOIN suppliers s ON s.id = b.supplier_id
       LEFT JOIN agencies ag ON ag.id = b.agency_id
       LEFT JOIN airports a ON a.id = b.airport_id
       LEFT JOIN zones z ON z.id = b.zone_id
       WHERE b.id = ?`,
      [id]
    );

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Get passengers
    const passengers = await query<{ name: string; age: number | null; is_lead: boolean }>(
      `SELECT name, age, is_lead FROM booking_passengers WHERE booking_id = ? ORDER BY is_lead DESC, id`,
      [id]
    );

    // Get ride info
    const ride = await queryOne<{
      id: number;
      status: string;
      driver_id: number | null;
      driver_name: string | null;
      vehicle_id: number | null;
      vehicle_plate: string | null;
    }>(
      `SELECT r.id, r.status, r.driver_id, d.name as driver_name, r.vehicle_id, v.plate_number as vehicle_plate
       FROM rides r
       LEFT JOIN drivers d ON d.id = r.driver_id
       LEFT JOIN vehicles v ON v.id = r.vehicle_id
       WHERE r.booking_id = ?`,
      [id]
    );

    // Get payments
    const payments = await query<{
      id: number;
      amount: number;
      currency: string;
      payment_method: string;
      status: string;
      created_at: Date;
    }>(
      `SELECT id, amount, currency, payment_method, status, created_at
       FROM payments WHERE booking_id = ? ORDER BY created_at DESC`,
      [id]
    );

    return NextResponse.json({
      id: booking.id,
      publicCode: booking.public_code,
      supplier: {
        id: booking.supplier_id,
        name: booking.supplier_name,
      },
      agency: booking.agency_id ? {
        id: booking.agency_id,
        name: booking.agency_name,
      } : null,
      airport: {
        id: booking.airport_id,
        code: booking.airport_code,
        name: booking.airport_name,
      },
      zone: {
        id: booking.zone_id,
        name: booking.zone_name,
      },
      direction: booking.direction,
      vehicleType: booking.vehicle_type,
      pickupDatetime: booking.pickup_datetime,
      pickupAddress: booking.pickup_address,
      dropoffAddress: booking.dropoff_address,
      flightNumber: booking.flight_number,
      passengers: {
        adults: booking.pax_adults,
        children: booking.pax_children,
        infants: booking.pax_infants,
        list: passengers,
      },
      customer: {
        name: booking.customer_name,
        email: booking.customer_email,
        phone: booking.customer_phone,
      },
      specialRequests: booking.special_requests,
      pricing: {
        basePrice: booking.base_price,
        extrasTotal: booking.extras_total,
        totalPrice: booking.total_price,
        currency: booking.currency,
      },
      status: booking.status,
      paymentStatus: booking.payment_status,
      ride: ride ? {
        id: ride.id,
        status: ride.status,
        driver: ride.driver_id ? {
          id: ride.driver_id,
          name: ride.driver_name,
        } : null,
        vehicle: ride.vehicle_id ? {
          id: ride.vehicle_id,
          plateNumber: ride.vehicle_plate,
        } : null,
      } : null,
      payments: payments.map(p => ({
        id: p.id,
        amount: p.amount,
        currency: p.currency,
        paymentMethod: p.payment_method,
        status: p.status,
        createdAt: p.created_at,
      })),
      createdAt: booking.created_at,
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}

// PUT /api/admin/bookings/[bookingId] - Update booking status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const authResult = await authenticateAdmin(request);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const { bookingId } = await params;
    const id = parseInt(bookingId, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 });
    }

    const existingBooking = await queryOne<{ id: number }>(
      `SELECT id FROM bookings WHERE id = ?`,
      [id]
    );

    if (!existingBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const body = await request.json();

    const updates: string[] = [];
    const values: (string | number | boolean | null)[] = [];

    if (body.status !== undefined) {
      const validStatuses = ['PENDING', 'AWAITING_PAYMENT', 'CONFIRMED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      updates.push('status = ?');
      values.push(body.status);
    }

    if (body.paymentStatus !== undefined) {
      const validPaymentStatuses = ['UNPAID', 'PARTIALLY_PAID', 'PAID', 'REFUNDED'];
      if (!validPaymentStatuses.includes(body.paymentStatus)) {
        return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 });
      }
      updates.push('payment_status = ?');
      values.push(body.paymentStatus);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(id);

    await query(`UPDATE bookings SET ${updates.join(', ')} WHERE id = ?`, values);

    return NextResponse.json({ success: true, message: 'Booking updated successfully' });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
