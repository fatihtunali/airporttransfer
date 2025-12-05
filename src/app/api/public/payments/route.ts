import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';
import {
  createPaymentRedirectUrl,
  generateBankTransferDetails,
  PaymentRequest,
} from '@/lib/payment-gateway';

interface BookingRow {
  id: number;
  public_code: string;
  total_price: number;
  currency: string;
  payment_status: string;
  customer_email: string;
  customer_name: string;
}

// POST /api/public/payments - Create a payment for a booking
export async function POST(request: NextRequest) {
  try {
    const { bookingCode, paymentMethod, currency } = await request.json();

    if (!bookingCode || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields: bookingCode, paymentMethod' },
        { status: 400 }
      );
    }

    if (!['card', 'bank_transfer'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Invalid payment method. Use "card" or "bank_transfer"' },
        { status: 400 }
      );
    }

    // Get booking details
    const booking = await queryOne<BookingRow>(
      `SELECT
        b.id, b.public_code, b.total_price, b.currency, b.payment_status,
        bp.email as customer_email, bp.full_name as customer_name
       FROM bookings b
       LEFT JOIN booking_passengers bp ON bp.booking_id = b.id AND bp.is_lead = TRUE
       WHERE b.public_code = ?`,
      [bookingCode]
    );

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (booking.payment_status === 'PAID') {
      return NextResponse.json(
        { error: 'This booking has already been paid' },
        { status: 400 }
      );
    }

    const paymentCurrency = currency || booking.currency;
    const amount = Number(booking.total_price);

    if (paymentMethod === 'card') {
      // Create payment redirect URL for external gateway
      const paymentRequest: PaymentRequest = {
        bookingCode: booking.public_code,
        bookingId: booking.id,
        amount,
        currency: paymentCurrency,
        customerEmail: booking.customer_email || '',
        customerName: booking.customer_name || '',
        description: `Airport Transfer - Booking ${booking.public_code}`,
      };

      const result = createPaymentRedirectUrl(paymentRequest);

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Failed to create payment' },
          { status: 500 }
        );
      }

      // Update booking status
      await query(
        `UPDATE bookings
         SET payment_status = 'PENDING', payment_method = 'CARD'
         WHERE id = ?`,
        [booking.id]
      );

      return NextResponse.json({
        paymentMethod: 'card',
        redirectUrl: result.redirectUrl,
        transactionId: result.transactionId,
        amount,
        currency: paymentCurrency,
      });
    } else {
      // Generate bank transfer details
      const bankDetails = generateBankTransferDetails(
        booking.public_code,
        amount,
        paymentCurrency
      );

      // Update booking status
      await query(
        `UPDATE bookings
         SET payment_status = 'PENDING', payment_method = 'BANK_TRANSFER'
         WHERE id = ?`,
        [booking.id]
      );

      return NextResponse.json({
        paymentMethod: 'bank_transfer',
        bankDetails,
        amount,
        currency: paymentCurrency
      });
    }
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to process payment request' },
      { status: 500 }
    );
  }
}

// GET /api/public/payments?bookingCode=XXX - Get payment status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const bookingCode = searchParams.get('bookingCode');

  if (!bookingCode) {
    return NextResponse.json(
      { error: 'Booking code required' },
      { status: 400 }
    );
  }

  try {
    const booking = await queryOne<{
      payment_status: string;
      payment_method: string | null;
      payment_intent_id: string | null;
      total_price: number;
      currency: string;
    }>(
      `SELECT payment_status, payment_method, payment_intent_id, total_price, currency
       FROM bookings WHERE public_code = ?`,
      [bookingCode]
    );

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: booking.payment_status,
      method: booking.payment_method,
      amount: Number(booking.total_price),
      currency: booking.currency,
      isPaid: booking.payment_status === 'PAID'
    });
  } catch (error) {
    console.error('Payment status error:', error);
    return NextResponse.json(
      { error: 'Failed to get payment status' },
      { status: 500 }
    );
  }
}
