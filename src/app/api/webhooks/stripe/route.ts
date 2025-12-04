import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyWebhookSignature, mapStripeStatus } from '@/lib/payments';
import { sendBookingNotification } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature
    const verification = verifyWebhookSignature(payload, signature);
    if (!verification.valid) {
      console.error('[Stripe Webhook] Invalid signature:', verification.error);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(payload);

    console.log('[Stripe Webhook] Event:', event.type);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const bookingCode = paymentIntent.metadata?.booking_code;

        if (bookingCode) {
          // Update booking payment status
          await query(
            `UPDATE bookings
             SET payment_status = 'PAID',
                 paid_at = NOW(),
                 payment_method = 'CARD'
             WHERE public_code = ?`,
            [bookingCode]
          );

          // Get booking details for notification
          interface BookingDetails {
            customer_phone: string;
            total_price: number;
            currency: string;
          }
          const booking = await query<BookingDetails>(
            `SELECT bp.phone as customer_phone, b.total_price, b.currency
             FROM bookings b
             LEFT JOIN booking_passengers bp ON bp.booking_id = b.id AND bp.is_lead = TRUE
             WHERE b.public_code = ?`,
            [bookingCode]
          );

          if (booking[0]?.customer_phone) {
            // Send payment confirmation notification
            await sendBookingNotification(
              'paymentReceived',
              {
                bookingCode,
                amount: booking[0].total_price.toString(),
                currency: booking[0].currency
              },
              { phone: booking[0].customer_phone }
            );
          }

          console.log('[Stripe Webhook] Payment succeeded for booking:', bookingCode);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const bookingCode = paymentIntent.metadata?.booking_code;

        if (bookingCode) {
          await query(
            `UPDATE bookings
             SET payment_status = 'FAILED'
             WHERE public_code = ?`,
            [bookingCode]
          );

          console.log('[Stripe Webhook] Payment failed for booking:', bookingCode);
        }
        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object;
        const bookingCode = paymentIntent.metadata?.booking_code;

        if (bookingCode) {
          await query(
            `UPDATE bookings
             SET payment_status = 'CANCELLED'
             WHERE public_code = ?`,
            [bookingCode]
          );

          console.log('[Stripe Webhook] Payment cancelled for booking:', bookingCode);
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        const paymentIntentId = charge.payment_intent;

        if (paymentIntentId) {
          const isFullRefund = charge.amount_refunded === charge.amount;
          const status = isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED';

          await query(
            `UPDATE bookings
             SET payment_status = ?
             WHERE payment_intent_id = ?`,
            [status, paymentIntentId]
          );

          console.log('[Stripe Webhook] Refund processed:', status);
        }
        break;
      }

      default:
        console.log('[Stripe Webhook] Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Stripe Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
