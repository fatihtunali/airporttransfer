import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, transaction } from '@/lib/db';

interface CancellationPolicy {
  id: number;
  policy_code: string;
  policy_name: string;
  description: string;
  hours_before: number;
  refund_percent: number;
  is_default: boolean;
}

// POST /api/public/bookings/[publicCode]/cancel - Cancel a booking
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ publicCode: string }> }
) {
  try {
    const { publicCode } = await params;
    const body = await request.json();
    const { email, reason } = body;

    if (!publicCode) {
      return NextResponse.json(
        { error: 'Booking code is required' },
        { status: 400 }
      );
    }

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
      pickup_datetime: string;
      total_price: number;
      currency: string;
      status: string;
      payment_status: string;
    }>(
      `SELECT id, public_code, supplier_id, pickup_datetime,
              total_price, currency, status, payment_status
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
    const leadPassenger = await queryOne<{ email: string | null; full_name: string }>(
      `SELECT email, full_name FROM booking_passengers WHERE booking_id = ? AND is_lead = TRUE`,
      [booking.id]
    );

    if (!leadPassenger?.email || leadPassenger.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Email does not match booking records' },
        { status: 403 }
      );
    }

    // Check if booking can be cancelled
    if (booking.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'This booking has already been cancelled' },
        { status: 400 }
      );
    }

    if (booking.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Completed bookings cannot be cancelled' },
        { status: 400 }
      );
    }

    if (booking.status === 'IN_PROGRESS') {
      return NextResponse.json(
        { error: 'Bookings in progress cannot be cancelled. Please contact support.' },
        { status: 400 }
      );
    }

    // Calculate hours until pickup
    const pickupTime = new Date(booking.pickup_datetime);
    const now = new Date();
    const hoursUntilPickup = (pickupTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    // If pickup has already passed
    if (hoursUntilPickup < 0) {
      return NextResponse.json(
        { error: 'Cannot cancel a booking after the pickup time has passed' },
        { status: 400 }
      );
    }

    // Get applicable cancellation policy (find the policy where hours_before <= hoursUntilPickup)
    const policies = await query<CancellationPolicy>(
      `SELECT * FROM cancellation_policies
       WHERE is_active = TRUE
       ORDER BY hours_before DESC`,
      []
    );

    // Find the applicable policy
    let applicablePolicy: CancellationPolicy | null = null;
    for (const policy of policies) {
      if (hoursUntilPickup >= policy.hours_before) {
        applicablePolicy = policy;
        break;
      }
    }

    // If no policy found, use the most restrictive (no refund)
    if (!applicablePolicy) {
      applicablePolicy = policies[policies.length - 1] || {
        id: 0,
        policy_code: 'NO_REFUND',
        policy_name: 'No Refund',
        description: 'No refund available',
        hours_before: 0,
        refund_percent: 0,
        is_default: false,
      };
    }

    // Calculate refund amount
    const refundPercent = applicablePolicy.refund_percent;
    const totalPrice = Number(booking.total_price);
    const refundAmount = (totalPrice * refundPercent) / 100;

    // Perform cancellation in transaction
    await transaction(async (conn) => {
      // Update booking status
      await conn.execute(
        `UPDATE bookings
         SET status = 'CANCELLED',
             cancelled_at = NOW(),
             cancel_reason = ?
         WHERE id = ?`,
        [reason || null, booking.id]
      );

      // Update ride status
      await conn.execute(
        `UPDATE rides SET status = 'CANCELLED' WHERE booking_id = ?`,
        [booking.id]
      );

      // Update supplier payout to cancelled
      await conn.execute(
        `UPDATE supplier_payouts SET status = 'CANCELLED' WHERE booking_id = ?`,
        [booking.id]
      );

      // If paid and refund > 0, create refund record
      if (booking.payment_status === 'PAID' && refundAmount > 0) {
        await conn.execute(
          `UPDATE payments
           SET status = 'REFUNDED',
               refund_amount = ?,
               refund_reason = ?
           WHERE booking_id = ? AND status = 'SUCCESS'`,
          [refundAmount, `Cancellation: ${applicablePolicy!.policy_name}`, booking.id]
        );

        // Update booking payment status
        await conn.execute(
          `UPDATE bookings SET payment_status = 'REFUNDED' WHERE id = ?`,
          [booking.id]
        );
      }

      // Log the cancellation action
      await conn.execute(
        `INSERT INTO activity_logs (action, entity_type, entity_id, new_values, created_at)
         VALUES ('BOOKING_CANCELLED', 'booking', ?, ?, NOW())`,
        [
          booking.id,
          JSON.stringify({
            cancelledBy: 'customer',
            reason,
            policy: applicablePolicy!.policy_code,
            refundPercent,
            refundAmount,
          }),
        ]
      );
    });

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully',
      bookingCode: booking.public_code,
      cancellation: {
        policy: applicablePolicy.policy_name,
        hoursBeforePickup: Math.floor(hoursUntilPickup),
        refundPercent,
        refundAmount,
        currency: booking.currency,
        wasPaid: booking.payment_status === 'PAID',
      },
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { error: 'Failed to cancel booking. Please try again.' },
      { status: 500 }
    );
  }
}

// GET /api/public/bookings/[publicCode]/cancel - Get cancellation info (preview)
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
        { error: 'Booking code is required' },
        { status: 400 }
      );
    }

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
      pickup_datetime: string;
      total_price: number;
      currency: string;
      status: string;
      payment_status: string;
    }>(
      `SELECT id, public_code, pickup_datetime,
              total_price, currency, status, payment_status
       FROM bookings WHERE public_code = ?`,
      [publicCode.toUpperCase()]
    );

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Verify email
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

    // Check if booking can be cancelled
    const canCancel = !['CANCELLED', 'COMPLETED', 'IN_PROGRESS'].includes(booking.status);

    // Calculate hours until pickup
    const pickupTime = new Date(booking.pickup_datetime);
    const now = new Date();
    const hoursUntilPickup = (pickupTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilPickup < 0) {
      return NextResponse.json({
        canCancel: false,
        reason: 'Pickup time has passed',
        booking: {
          code: booking.public_code,
          status: booking.status,
          pickupTime: booking.pickup_datetime,
        },
      });
    }

    // Get all cancellation policies for display
    const policies = await query<CancellationPolicy>(
      `SELECT * FROM cancellation_policies
       WHERE is_active = TRUE
       ORDER BY hours_before DESC`,
      []
    );

    // Find applicable policy
    let applicablePolicy: CancellationPolicy | null = null;
    for (const policy of policies) {
      if (hoursUntilPickup >= policy.hours_before) {
        applicablePolicy = policy;
        break;
      }
    }

    if (!applicablePolicy) {
      applicablePolicy = policies[policies.length - 1];
    }

    const refundPercent = applicablePolicy?.refund_percent || 0;
    const totalPrice = Number(booking.total_price);
    const refundAmount = (totalPrice * refundPercent) / 100;

    return NextResponse.json({
      canCancel,
      reason: canCancel ? null : `Booking status is ${booking.status}`,
      booking: {
        code: booking.public_code,
        status: booking.status,
        paymentStatus: booking.payment_status,
        pickupTime: booking.pickup_datetime,
        totalPrice,
        currency: booking.currency,
      },
      cancellation: applicablePolicy ? {
        policy: applicablePolicy.policy_name,
        policyCode: applicablePolicy.policy_code,
        description: applicablePolicy.description,
        hoursBeforePickup: Math.floor(hoursUntilPickup),
        refundPercent,
        refundAmount,
        isPaid: booking.payment_status === 'PAID',
      } : null,
      allPolicies: policies.map(p => ({
        name: p.policy_name,
        description: p.description,
        hoursRequired: p.hours_before,
        refundPercent: p.refund_percent,
      })),
    });
  } catch (error) {
    console.error('Error getting cancellation info:', error);
    return NextResponse.json(
      { error: 'Failed to get cancellation info' },
      { status: 500 }
    );
  }
}
