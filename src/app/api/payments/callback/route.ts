import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import {
  verifyCallbackSignature,
  parseCallbackData,
  mapPaymentStatus,
} from '@/lib/payment-gateway';

interface BookingRow {
  id: number;
  public_code: string;
  payment_status: string;
  total_price: number;
  currency: string;
}

/**
 * POST /api/payments/callback
 * Handle payment gateway callback/webhook
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let params: Record<string, string> = {};

    // Parse callback data based on content type
    if (contentType.includes('application/json')) {
      const body = await request.json();
      params = Object.fromEntries(
        Object.entries(body).map(([k, v]) => [k, String(v)])
      );
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      formData.forEach((value, key) => {
        params[key] = String(value);
      });
    } else {
      // Try query params
      const url = new URL(request.url);
      url.searchParams.forEach((value, key) => {
        params[key] = value;
      });
    }

    console.log('[PaymentCallback] Received callback:', JSON.stringify(params));

    // Verify signature if present
    const signature = params.signature;
    if (signature) {
      const isValid = verifyCallbackSignature(params, signature);
      if (!isValid) {
        console.error('[PaymentCallback] Invalid signature');
        return NextResponse.json(
          { success: false, error: 'Invalid signature' },
          { status: 403 }
        );
      }
    }

    // Parse callback data
    const callbackData = parseCallbackData(params);
    if (!callbackData || !callbackData.orderId) {
      console.error('[PaymentCallback] Invalid callback data');
      return NextResponse.json(
        { success: false, error: 'Invalid callback data' },
        { status: 400 }
      );
    }

    // Find booking by order ID (public_code)
    const booking = await queryOne<BookingRow>(
      'SELECT id, public_code, payment_status, total_price, currency FROM bookings WHERE public_code = ?',
      [callbackData.orderId.toUpperCase()]
    );

    if (!booking) {
      console.error('[PaymentCallback] Booking not found:', callbackData.orderId);
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Map status and update booking
    const newPaymentStatus = mapPaymentStatus(callbackData.status);

    // Only update if status changed
    if (booking.payment_status !== newPaymentStatus) {
      await query(
        `UPDATE bookings
         SET payment_status = ?,
             payment_transaction_id = ?,
             payment_method = ?,
             payment_updated_at = NOW()
         WHERE id = ?`,
        [
          newPaymentStatus,
          callbackData.transactionId || null,
          callbackData.paymentMethod || 'CARD',
          booking.id,
        ]
      );

      console.log(
        `[PaymentCallback] Updated booking ${booking.public_code} payment status to ${newPaymentStatus}`
      );

      // Log payment transaction
      await query(
        `INSERT INTO payment_logs (booking_id, transaction_id, status, amount, currency, payment_method, raw_response)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          booking.id,
          callbackData.transactionId || null,
          callbackData.status,
          callbackData.amount,
          callbackData.currency,
          callbackData.paymentMethod || 'CARD',
          JSON.stringify(params),
        ]
      );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      orderId: callbackData.orderId,
      status: newPaymentStatus,
    });
  } catch (error) {
    console.error('[PaymentCallback] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payments/callback
 * Handle redirect-based payment callback
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const params: Record<string, string> = {};

  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  console.log('[PaymentCallback] GET callback:', JSON.stringify(params));

  // Parse callback data
  const callbackData = parseCallbackData(params);

  if (!callbackData || !callbackData.orderId) {
    // Redirect to home with error
    return NextResponse.redirect(new URL('/?payment=error', request.url));
  }

  // Find and update booking
  const booking = await queryOne<BookingRow>(
    'SELECT id, public_code, payment_status FROM bookings WHERE public_code = ?',
    [callbackData.orderId.toUpperCase()]
  );

  if (booking) {
    const newPaymentStatus = mapPaymentStatus(callbackData.status);

    if (booking.payment_status !== newPaymentStatus) {
      await query(
        `UPDATE bookings
         SET payment_status = ?,
             payment_transaction_id = ?,
             payment_updated_at = NOW()
         WHERE id = ?`,
        [newPaymentStatus, callbackData.transactionId || null, booking.id]
      );
    }

    // Redirect based on status
    if (callbackData.status === 'success') {
      return NextResponse.redirect(
        new URL(`/manage-booking?ref=${booking.public_code}&payment=success`, request.url)
      );
    } else if (callbackData.status === 'cancelled') {
      return NextResponse.redirect(
        new URL(`/pay/${booking.public_code}?status=cancelled`, request.url)
      );
    } else {
      return NextResponse.redirect(
        new URL(`/pay/${booking.public_code}?status=failed&error=${callbackData.errorMessage || 'Payment failed'}`, request.url)
      );
    }
  }

  // Fallback redirect
  return NextResponse.redirect(new URL('/?payment=error', request.url));
}
