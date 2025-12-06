import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { applyRateLimit, getRateLimitHeaders, RateLimits } from '@/lib/rate-limit';

interface PromoCodeRow {
  id: number;
  code: string;
  description: string | null;
  discount_type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discount_value: number;
  currency: string;
  min_booking_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  usage_count: number;
  per_user_limit: number;
  valid_from: Date;
  valid_until: Date | null;
  is_active: boolean;
  applicable_routes: string | null;
  applicable_vehicle_types: string | null;
}

interface UsageRow {
  count: number;
}

// POST /api/public/promo-codes/validate - Validate promo code and calculate discount
export async function POST(request: NextRequest) {
  // Apply rate limiting
  const { response: rateLimitResponse, result: rateLimitResult } = applyRateLimit(request, RateLimits.PROMO_VALIDATE);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();
    const { code, bookingAmount, customerEmail, routeId, vehicleType } = body;

    if (!code) {
      return NextResponse.json({ error: 'Promo code is required' }, { status: 400 });
    }

    // Fetch promo code
    const promoCode = await queryOne<PromoCodeRow>(
      `SELECT * FROM promo_codes
       WHERE code = ?
       AND is_active = TRUE
       AND (valid_from IS NULL OR valid_from <= NOW())
       AND (valid_until IS NULL OR valid_until >= NOW())`,
      [code.toUpperCase()]
    );

    if (!promoCode) {
      return NextResponse.json({
        valid: false,
        error: 'Invalid or expired promo code',
      });
    }

    // Check usage limit
    if (promoCode.usage_limit !== null && promoCode.usage_count >= promoCode.usage_limit) {
      return NextResponse.json({
        valid: false,
        error: 'Promo code usage limit reached',
      });
    }

    // Check per-user limit if email provided
    if (customerEmail && promoCode.per_user_limit > 0) {
      const userUsage = await queryOne<UsageRow>(
        `SELECT COUNT(*) as count FROM promo_code_usage
         WHERE promo_code_id = ? AND customer_email = ?`,
        [promoCode.id, customerEmail.toLowerCase()]
      );

      if (userUsage && userUsage.count >= promoCode.per_user_limit) {
        return NextResponse.json({
          valid: false,
          error: 'You have already used this promo code',
        });
      }
    }

    // Check minimum booking amount
    if (bookingAmount && Number(bookingAmount) < Number(promoCode.min_booking_amount)) {
      return NextResponse.json({
        valid: false,
        error: `Minimum booking amount is ${promoCode.currency} ${promoCode.min_booking_amount}`,
      });
    }

    // Check route restrictions
    if (promoCode.applicable_routes && routeId) {
      const applicableRoutes = JSON.parse(promoCode.applicable_routes);
      if (!applicableRoutes.includes(Number(routeId))) {
        return NextResponse.json({
          valid: false,
          error: 'Promo code not valid for this route',
        });
      }
    }

    // Check vehicle type restrictions
    if (promoCode.applicable_vehicle_types && vehicleType) {
      const applicableTypes = JSON.parse(promoCode.applicable_vehicle_types);
      if (!applicableTypes.includes(vehicleType)) {
        return NextResponse.json({
          valid: false,
          error: 'Promo code not valid for this vehicle type',
        });
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (bookingAmount) {
      if (promoCode.discount_type === 'PERCENTAGE') {
        discountAmount = (Number(bookingAmount) * Number(promoCode.discount_value)) / 100;
      } else {
        discountAmount = Number(promoCode.discount_value);
      }

      // Apply max discount cap
      if (promoCode.max_discount_amount && discountAmount > Number(promoCode.max_discount_amount)) {
        discountAmount = Number(promoCode.max_discount_amount);
      }

      // Don't exceed booking amount
      if (discountAmount > Number(bookingAmount)) {
        discountAmount = Number(bookingAmount);
      }
    }

    return NextResponse.json({
      valid: true,
      promoCode: {
        id: promoCode.id,
        code: promoCode.code,
        description: promoCode.description,
        discountType: promoCode.discount_type,
        discountValue: Number(promoCode.discount_value),
        currency: promoCode.currency,
      },
      discount: {
        amount: Math.round(discountAmount * 100) / 100,
        currency: promoCode.currency,
        displayText: promoCode.discount_type === 'PERCENTAGE'
          ? `${promoCode.discount_value}% off`
          : `${promoCode.currency} ${promoCode.discount_value} off`,
      },
      finalAmount: bookingAmount
        ? Math.round((Number(bookingAmount) - discountAmount) * 100) / 100
        : null,
    }, {
      headers: getRateLimitHeaders(rateLimitResult),
    });
  } catch (error) {
    console.error('Error validating promo code:', error);
    return NextResponse.json({ error: 'Failed to validate promo code' }, { status: 500 });
  }
}
