import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiKey } from '@/lib/agency-auth';
import { query, queryOne } from '@/lib/db';

interface BookingRow {
  id: number;
  status: string;
  total_price: number;
  currency: string;
  pickup_datetime: string;
}

interface AgencyRow {
  credit_limit: number;
  credit_used: number;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const auth = await authenticateApiKey(request);
  if (!auth.success) return auth.response;

  const { agencyId } = auth;
  const { bookingId } = await params;

  const body = await request.json();
  const { reason } = body;

  // Support both numeric ID and public code
  const isNumeric = /^\d+$/.test(bookingId);

  const booking = await queryOne<BookingRow>(
    `SELECT id, status, total_price, currency, pickup_datetime
     FROM bookings
     WHERE agency_id = ? AND ${isNumeric ? 'id = ?' : 'public_code = ?'}`,
    [agencyId, bookingId]
  );

  if (!booking) {
    return NextResponse.json(
      { error: 'Booking not found' },
      { status: 404 }
    );
  }

  // Check if booking can be cancelled
  const nonCancellable = ['COMPLETED', 'CANCELLED', 'IN_PROGRESS'];
  if (nonCancellable.includes(booking.status)) {
    return NextResponse.json(
      { error: `Cannot cancel booking with status: ${booking.status}` },
      { status: 400 }
    );
  }

  // Calculate refund based on cancellation policy
  const pickupTime = new Date(booking.pickup_datetime);
  const now = new Date();
  const hoursUntilPickup = (pickupTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  let refundPercentage = 100;
  if (hoursUntilPickup < 2) {
    refundPercentage = 0;
  } else if (hoursUntilPickup < 24) {
    refundPercentage = 50;
  } else if (hoursUntilPickup < 48) {
    refundPercentage = 75;
  }

  const refundAmount = booking.total_price * (refundPercentage / 100);

  // Update booking status
  await query(
    `UPDATE bookings SET status = 'CANCELLED', cancelled_at = NOW(), cancel_reason = ?
     WHERE id = ?`,
    [reason || 'Cancelled via API', booking.id]
  );

  // Refund credit if applicable
  if (refundAmount > 0) {
    await query(
      'UPDATE agencies SET credit_used = credit_used - ? WHERE id = ?',
      [refundAmount, agencyId]
    );

    // Get updated balance
    const agency = await queryOne<AgencyRow>(
      'SELECT credit_limit, credit_used FROM agencies WHERE id = ?',
      [agencyId]
    );

    const newBalance = (agency?.credit_limit || 0) - (agency?.credit_used || 0);

    // Log refund transaction
    await query(
      `INSERT INTO agency_credit_transactions (agency_id, type, amount, balance_after, currency, booking_id, notes)
       VALUES (?, 'REFUND', ?, ?, ?, ?, ?)`,
      [
        agencyId,
        refundAmount,
        newBalance,
        booking.currency,
        booking.id,
        `Booking cancellation refund (${refundPercentage}%)`,
      ]
    );
  }

  // Cancel ride
  await query(
    "UPDATE rides SET status = 'CANCELLED' WHERE booking_id = ?",
    [booking.id]
  );

  return NextResponse.json({
    success: true,
    booking: {
      id: booking.id,
      status: 'CANCELLED',
    },
    refund: {
      amount: refundAmount,
      percentage: refundPercentage,
      currency: booking.currency,
    },
  });
}
