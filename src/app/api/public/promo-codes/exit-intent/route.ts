import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';

interface PromoCodeRow {
  id: number;
  code: string;
  description: string | null;
  discount_type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discount_value: number;
  currency: string;
  min_booking_amount: number;
  valid_until: Date | null;
}

// GET /api/public/promo-codes/exit-intent - Get active exit-intent promo code
export async function GET() {
  try {
    // Get the active exit-intent promo code
    const promoCode = await queryOne<PromoCodeRow>(
      `SELECT id, code, description, discount_type, discount_value, currency, min_booking_amount, valid_until
       FROM promo_codes
       WHERE is_active = TRUE
       AND is_exit_intent = TRUE
       AND (valid_from IS NULL OR valid_from <= NOW())
       AND (valid_until IS NULL OR valid_until >= NOW())
       AND (usage_limit IS NULL OR usage_count < usage_limit)
       ORDER BY discount_value DESC
       LIMIT 1`
    );

    if (!promoCode) {
      return NextResponse.json({
        available: false,
      });
    }

    return NextResponse.json({
      available: true,
      promo: {
        code: promoCode.code,
        description: promoCode.description,
        discountType: promoCode.discount_type,
        discountValue: Number(promoCode.discount_value),
        currency: promoCode.currency,
        minBookingAmount: Number(promoCode.min_booking_amount),
        validUntil: promoCode.valid_until,
        displayText: promoCode.discount_type === 'PERCENTAGE'
          ? `${promoCode.discount_value}% OFF`
          : `${promoCode.currency} ${promoCode.discount_value} OFF`,
        headline: promoCode.discount_type === 'PERCENTAGE'
          ? `Wait! Get ${promoCode.discount_value}% Off Your Transfer`
          : `Wait! Save ${promoCode.currency} ${promoCode.discount_value} On Your Transfer`,
      },
    });
  } catch (error) {
    console.error('Error fetching exit-intent promo:', error);
    return NextResponse.json({ available: false });
  }
}
