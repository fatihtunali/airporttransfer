import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { authenticateAdmin } from '@/lib/admin-auth';

// POST /api/admin/bookings/[bookingId]/cancel - Cancel a booking
export async function POST(
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

    const booking = await queryOne<{ id: number; status: string; payment_status: string }>(
      `SELECT id, status, payment_status FROM bookings WHERE id = ?`,
      [id]
    );

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if already cancelled
    if (booking.status === 'CANCELLED') {
      return NextResponse.json({ error: 'Booking is already cancelled' }, { status: 400 });
    }

    // Check if booking is completed
    if (booking.status === 'COMPLETED') {
      return NextResponse.json({ error: 'Cannot cancel a completed booking' }, { status: 400 });
    }

    // Get optional cancellation reason from body
    let cancellationReason = null;
    try {
      const body = await request.json();
      cancellationReason = body.reason || null;
    } catch {
      // No body provided, that's fine
    }

    // Update booking status to cancelled
    await query(
      `UPDATE bookings SET status = 'CANCELLED', updated_at = NOW() WHERE id = ?`,
      [id]
    );

    // If there's a ride associated, cancel it too
    await query(
      `UPDATE rides SET status = 'CANCELLED', updated_at = NOW() WHERE booking_id = ?`,
      [id]
    );

    // Log the cancellation (if we have a cancellation_logs table)
    // For now, just log to console
    console.log(`Booking ${id} cancelled. Reason: ${cancellationReason || 'Not provided'}`);

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully',
      bookingId: id,
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 });
  }
}
