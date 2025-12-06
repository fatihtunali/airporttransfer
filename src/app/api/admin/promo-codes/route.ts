import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute, insert } from '@/lib/db';
import { authenticateAdmin } from '@/lib/admin-auth';

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
  is_exit_intent: boolean;
  applicable_routes: string | null;
  applicable_vehicle_types: string | null;
  created_at: Date;
}

// GET /api/admin/promo-codes - List all promo codes
export async function GET(request: NextRequest) {
  const authResult = await authenticateAdmin(request);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');

    let sql = `SELECT * FROM promo_codes`;
    const params: string[] = [];

    if (active === 'true') {
      sql += ` WHERE is_active = TRUE AND (valid_until IS NULL OR valid_until > NOW())`;
    } else if (active === 'false') {
      sql += ` WHERE is_active = FALSE OR valid_until < NOW()`;
    }

    sql += ` ORDER BY created_at DESC`;

    const promoCodes = await query<PromoCodeRow>(sql, params);

    return NextResponse.json({
      promoCodes: promoCodes.map(pc => ({
        id: pc.id,
        code: pc.code,
        description: pc.description,
        discountType: pc.discount_type,
        discountValue: Number(pc.discount_value),
        currency: pc.currency,
        minBookingAmount: Number(pc.min_booking_amount),
        maxDiscountAmount: pc.max_discount_amount ? Number(pc.max_discount_amount) : null,
        usageLimit: pc.usage_limit,
        usageCount: pc.usage_count,
        perUserLimit: pc.per_user_limit,
        validFrom: pc.valid_from,
        validUntil: pc.valid_until,
        isActive: pc.is_active,
        isExitIntent: pc.is_exit_intent,
        applicableRoutes: pc.applicable_routes ? JSON.parse(pc.applicable_routes) : null,
        applicableVehicleTypes: pc.applicable_vehicle_types ? JSON.parse(pc.applicable_vehicle_types) : null,
        createdAt: pc.created_at,
      })),
    });
  } catch (error) {
    console.error('Error fetching promo codes:', error);
    return NextResponse.json({ error: 'Failed to fetch promo codes' }, { status: 500 });
  }
}

// POST /api/admin/promo-codes - Create new promo code
export async function POST(request: NextRequest) {
  const authResult = await authenticateAdmin(request);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const body = await request.json();
    const {
      code,
      description,
      discountType = 'PERCENTAGE',
      discountValue,
      currency = 'EUR',
      minBookingAmount = 0,
      maxDiscountAmount,
      usageLimit,
      perUserLimit = 1,
      validFrom,
      validUntil,
      isActive = true,
      isExitIntent = false,
      applicableRoutes,
      applicableVehicleTypes,
    } = body;

    // Validate required fields
    if (!code || !discountValue) {
      return NextResponse.json(
        { error: 'Code and discount value are required' },
        { status: 400 }
      );
    }

    // Check for duplicate code
    const existing = await queryOne<{ id: number }>(
      'SELECT id FROM promo_codes WHERE code = ?',
      [code.toUpperCase()]
    );

    if (existing) {
      return NextResponse.json(
        { error: 'Promo code already exists' },
        { status: 400 }
      );
    }

    // Validate discount
    if (discountType === 'PERCENTAGE' && (discountValue < 0 || discountValue > 100)) {
      return NextResponse.json(
        { error: 'Percentage discount must be between 0 and 100' },
        { status: 400 }
      );
    }

    const result = await insert(
      `INSERT INTO promo_codes (
        code, description, discount_type, discount_value, currency,
        min_booking_amount, max_discount_amount, usage_limit, per_user_limit,
        valid_from, valid_until, is_active, is_exit_intent,
        applicable_routes, applicable_vehicle_types, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code.toUpperCase(),
        description || null,
        discountType,
        discountValue,
        currency,
        minBookingAmount,
        maxDiscountAmount || null,
        usageLimit || null,
        perUserLimit,
        validFrom ? new Date(validFrom) : new Date(),
        validUntil ? new Date(validUntil) : null,
        isActive,
        isExitIntent,
        applicableRoutes ? JSON.stringify(applicableRoutes) : null,
        applicableVehicleTypes ? JSON.stringify(applicableVehicleTypes) : null,
        authResult.payload?.userId || null,
      ]
    );

    return NextResponse.json({
      success: true,
      promoCodeId: result,
      code: code.toUpperCase(),
    });
  } catch (error) {
    console.error('Error creating promo code:', error);
    return NextResponse.json({ error: 'Failed to create promo code' }, { status: 500 });
  }
}
