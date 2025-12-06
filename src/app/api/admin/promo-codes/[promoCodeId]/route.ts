import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
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

// GET /api/admin/promo-codes/[promoCodeId] - Get single promo code
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ promoCodeId: string }> }
) {
  const authResult = await authenticateAdmin(request);
  if (!authResult.success) {
    return authResult.response;
  }

  const { promoCodeId } = await params;

  try {
    const promoCode = await queryOne<PromoCodeRow>(
      'SELECT * FROM promo_codes WHERE id = ?',
      [promoCodeId]
    );

    if (!promoCode) {
      return NextResponse.json({ error: 'Promo code not found' }, { status: 404 });
    }

    return NextResponse.json({
      promoCode: {
        id: promoCode.id,
        code: promoCode.code,
        description: promoCode.description,
        discountType: promoCode.discount_type,
        discountValue: Number(promoCode.discount_value),
        currency: promoCode.currency,
        minBookingAmount: Number(promoCode.min_booking_amount),
        maxDiscountAmount: promoCode.max_discount_amount ? Number(promoCode.max_discount_amount) : null,
        usageLimit: promoCode.usage_limit,
        usageCount: promoCode.usage_count,
        perUserLimit: promoCode.per_user_limit,
        validFrom: promoCode.valid_from,
        validUntil: promoCode.valid_until,
        isActive: promoCode.is_active,
        isExitIntent: promoCode.is_exit_intent,
        applicableRoutes: promoCode.applicable_routes ? JSON.parse(promoCode.applicable_routes) : null,
        applicableVehicleTypes: promoCode.applicable_vehicle_types ? JSON.parse(promoCode.applicable_vehicle_types) : null,
        createdAt: promoCode.created_at,
      },
    });
  } catch (error) {
    console.error('Error fetching promo code:', error);
    return NextResponse.json({ error: 'Failed to fetch promo code' }, { status: 500 });
  }
}

// PUT /api/admin/promo-codes/[promoCodeId] - Update promo code
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ promoCodeId: string }> }
) {
  const authResult = await authenticateAdmin(request);
  if (!authResult.success) {
    return authResult.response;
  }

  const { promoCodeId } = await params;

  try {
    const body = await request.json();
    const {
      description,
      discountType,
      discountValue,
      currency,
      minBookingAmount,
      maxDiscountAmount,
      usageLimit,
      perUserLimit,
      validFrom,
      validUntil,
      isActive,
      isExitIntent,
      applicableRoutes,
      applicableVehicleTypes,
    } = body;

    // Check if promo code exists
    const existing = await queryOne<{ id: number }>(
      'SELECT id FROM promo_codes WHERE id = ?',
      [promoCodeId]
    );

    if (!existing) {
      return NextResponse.json({ error: 'Promo code not found' }, { status: 404 });
    }

    await execute(
      `UPDATE promo_codes SET
        description = COALESCE(?, description),
        discount_type = COALESCE(?, discount_type),
        discount_value = COALESCE(?, discount_value),
        currency = COALESCE(?, currency),
        min_booking_amount = COALESCE(?, min_booking_amount),
        max_discount_amount = ?,
        usage_limit = ?,
        per_user_limit = COALESCE(?, per_user_limit),
        valid_from = COALESCE(?, valid_from),
        valid_until = ?,
        is_active = COALESCE(?, is_active),
        is_exit_intent = COALESCE(?, is_exit_intent),
        applicable_routes = ?,
        applicable_vehicle_types = ?
      WHERE id = ?`,
      [
        description,
        discountType,
        discountValue,
        currency,
        minBookingAmount,
        maxDiscountAmount ?? null,
        usageLimit ?? null,
        perUserLimit,
        validFrom ? new Date(validFrom) : null,
        validUntil ? new Date(validUntil) : null,
        isActive,
        isExitIntent,
        applicableRoutes ? JSON.stringify(applicableRoutes) : null,
        applicableVehicleTypes ? JSON.stringify(applicableVehicleTypes) : null,
        promoCodeId,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating promo code:', error);
    return NextResponse.json({ error: 'Failed to update promo code' }, { status: 500 });
  }
}

// DELETE /api/admin/promo-codes/[promoCodeId] - Delete promo code
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ promoCodeId: string }> }
) {
  const authResult = await authenticateAdmin(request);
  if (!authResult.success) {
    return authResult.response;
  }

  const { promoCodeId } = await params;

  try {
    // Check if promo code has been used
    const usage = await queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM promo_code_usage WHERE promo_code_id = ?',
      [promoCodeId]
    );

    if (usage && usage.count > 0) {
      // Soft delete - just deactivate
      await execute(
        'UPDATE promo_codes SET is_active = FALSE WHERE id = ?',
        [promoCodeId]
      );
      return NextResponse.json({ success: true, message: 'Promo code deactivated (has usage history)' });
    }

    // Hard delete if never used
    await execute('DELETE FROM promo_codes WHERE id = ?', [promoCodeId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting promo code:', error);
    return NextResponse.json({ error: 'Failed to delete promo code' }, { status: 500 });
  }
}
