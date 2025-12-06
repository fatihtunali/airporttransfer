import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

// POST /api/public/payments/crypto - Submit crypto payment details
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingCode, currency, amount, txHash, walletAddress } = body;

    if (!bookingCode || !currency || !txHash) {
      return NextResponse.json(
        { error: 'Missing required fields: bookingCode, currency, txHash' },
        { status: 400 }
      );
    }

    // Verify booking exists
    const booking = await queryOne<{ id: number; status: string }>(
      'SELECT id, status FROM bookings WHERE public_code = ?',
      [bookingCode.toUpperCase()]
    );

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Update booking with crypto payment details
    await query(
      `UPDATE bookings
       SET crypto_currency = ?,
           crypto_amount = ?,
           crypto_tx_hash = ?,
           crypto_wallet_address = ?,
           payment_status = 'PENDING_VERIFICATION'
       WHERE id = ?`,
      [currency, amount, txHash, walletAddress, booking.id]
    );

    // Log the crypto payment for admin verification
    console.log(`Crypto payment submitted for booking ${bookingCode}:`, {
      currency,
      amount,
      txHash,
      walletAddress,
    });

    return NextResponse.json({
      success: true,
      message: 'Crypto payment details submitted. We will verify and confirm your booking shortly.',
    });
  } catch (error) {
    console.error('Error processing crypto payment:', error);
    return NextResponse.json(
      { error: 'Failed to process crypto payment' },
      { status: 500 }
    );
  }
}
