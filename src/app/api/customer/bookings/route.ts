import { NextRequest, NextResponse } from 'next/server';
import { authenticateCustomer, getCustomerBookings } from '@/lib/customer-auth';
import { query } from '@/lib/db';
import { applyRateLimit, getRateLimitHeaders, RateLimits } from '@/lib/rate-limit';

// GET /api/customer/bookings - Get customer's booking history
export async function GET(request: NextRequest) {
  const { response: rateLimitResponse, result: rateLimitResult } = applyRateLimit(request, RateLimits.GENERAL);
  if (rateLimitResponse) return rateLimitResponse;

  const auth = await authenticateCustomer(request);
  if (!auth.success) {
    return auth.response;
  }

  const customer = auth.customer!;

  try {
    // Get bookings linked to customer account
    const bookings = await getCustomerBookings(customer.id);

    // Also get bookings by email (for bookings made before account creation)
    const emailBookings = await query<{
      id: number;
      public_code: string;
      pickup_datetime: Date;
      pickup_address: string;
      dropoff_address: string;
      vehicle_type: string;
      total_price: number;
      currency: string;
      status: string;
      created_at: Date;
    }>(
      `SELECT b.id, b.public_code, b.pickup_datetime, b.pickup_address, b.dropoff_address,
              b.vehicle_type, b.total_price, b.currency, b.status, b.created_at
       FROM bookings b
       INNER JOIN booking_passengers bp ON bp.booking_id = b.id AND bp.is_lead = TRUE
       WHERE bp.email = ? AND b.customer_account_id IS NULL
       ORDER BY b.pickup_datetime DESC
       LIMIT 50`,
      [customer.email]
    );

    // Merge and deduplicate
    const allBookings = [...bookings];
    const existingIds = new Set(bookings.map(b => b.id));
    for (const booking of emailBookings) {
      if (!existingIds.has(booking.id)) {
        allBookings.push(booking);
      }
    }

    // Sort by pickup date
    allBookings.sort((a, b) =>
      new Date(b.pickup_datetime).getTime() - new Date(a.pickup_datetime).getTime()
    );

    // Separate into upcoming and past
    const now = new Date();
    const upcoming = allBookings.filter(b =>
      new Date(b.pickup_datetime) > now && !['CANCELLED', 'COMPLETED'].includes(b.status)
    );
    const past = allBookings.filter(b =>
      new Date(b.pickup_datetime) <= now || ['CANCELLED', 'COMPLETED'].includes(b.status)
    );

    return NextResponse.json({
      upcoming: upcoming.map(b => ({
        id: b.id,
        publicCode: b.public_code,
        pickupDatetime: b.pickup_datetime,
        pickupAddress: b.pickup_address,
        dropoffAddress: b.dropoff_address,
        vehicleType: b.vehicle_type,
        totalPrice: Number(b.total_price),
        currency: b.currency,
        status: b.status,
      })),
      past: past.map(b => ({
        id: b.id,
        publicCode: b.public_code,
        pickupDatetime: b.pickup_datetime,
        pickupAddress: b.pickup_address,
        dropoffAddress: b.dropoff_address,
        vehicleType: b.vehicle_type,
        totalPrice: Number(b.total_price),
        currency: b.currency,
        status: b.status,
      })),
      stats: {
        totalBookings: allBookings.length,
        upcomingCount: upcoming.length,
        pastCount: past.length,
      },
    }, {
      headers: getRateLimitHeaders(rateLimitResult),
    });
  } catch (error) {
    console.error('Error fetching customer bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500, headers: getRateLimitHeaders(rateLimitResult) }
    );
  }
}
