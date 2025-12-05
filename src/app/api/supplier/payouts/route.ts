import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authenticateSupplier, canManageFleet } from '@/lib/supplier-auth';

type PayoutStatus = 'PENDING' | 'SCHEDULED' | 'PAID' | 'CANCELLED';

interface PayoutRow {
  id: number;
  supplier_id: number;
  booking_id: number | null;
  amount: number;
  currency: string;
  status: PayoutStatus;
  payout_method: string | null;
  reference: string | null;
  due_date: Date | null;
  paid_at: Date | null;
  notes: string | null;
  created_at: Date;
  // Booking info via JOIN
  public_code: string | null;
  pickup_datetime: Date | null;
}

// GET /api/supplier/payouts - List payouts for current supplier
export async function GET(request: NextRequest) {
  // Authenticate supplier
  const authResult = await authenticateSupplier(request);
  if (!authResult.success) {
    return authResult.response;
  }

  const { payload } = authResult;

  // Check role for fleet management
  if (!canManageFleet(payload.role)) {
    return NextResponse.json(
      { error: 'Access denied. Fleet management role required.' },
      { status: 403 }
    );
  }

  try {
    // Get query params - ensure integers for MySQL prepared statements
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10) || 20));
    const status = searchParams.get('status');
    const offset = (page - 1) * pageSize;

    // Build query
    let sql = `
      SELECT sp.id, sp.supplier_id, sp.booking_id, sp.amount, sp.currency,
             sp.status, sp.payout_method, sp.reference, sp.due_date,
             sp.paid_at, sp.notes, sp.created_at,
             b.public_code, b.pickup_datetime
      FROM supplier_payouts sp
      LEFT JOIN bookings b ON b.id = sp.booking_id
      WHERE sp.supplier_id = ?
    `;
    const params: (number | string)[] = [payload.supplierId];

    if (status) {
      sql += ` AND sp.status = ?`;
      params.push(status);
    }

    // LIMIT/OFFSET embedded directly as MySQL2 doesn't support them as bind params
    sql += ` ORDER BY sp.created_at DESC LIMIT ${pageSize} OFFSET ${offset}`;

    const payouts = await query<PayoutRow>(sql, params);

    // Get total count
    let countSql = `SELECT COUNT(*) as total FROM supplier_payouts WHERE supplier_id = ?`;
    const countParams: (number | string)[] = [payload.supplierId];
    if (status) {
      countSql += ` AND status = ?`;
      countParams.push(status);
    }

    const countResult = await query<{ total: number }>(countSql, countParams);
    const total = countResult[0]?.total || 0;

    return NextResponse.json({
      items: payouts.map((p) => ({
        id: p.id,
        supplierId: p.supplier_id,
        bookingId: p.booking_id,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        payoutMethod: p.payout_method,
        reference: p.reference,
        dueDate: p.due_date,
        paidAt: p.paid_at,
        notes: p.notes,
        booking: p.booking_id
          ? {
              publicCode: p.public_code,
              pickupDatetime: p.pickup_datetime,
            }
          : null,
      })),
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Error fetching payouts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payouts' },
      { status: 500 }
    );
  }
}
