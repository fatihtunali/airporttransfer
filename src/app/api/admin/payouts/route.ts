import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authenticateAdmin } from '@/lib/admin-auth';

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
  // Supplier info via JOIN
  supplier_name: string;
  // Booking info via JOIN
  public_code: string | null;
}

// GET /api/admin/payouts - List all supplier payouts
export async function GET(request: NextRequest) {
  // Authenticate admin
  const authResult = await authenticateAdmin(request);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    // Get query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let sql = `
      SELECT sp.id, sp.supplier_id, sp.booking_id, sp.amount, sp.currency,
             sp.status, sp.payout_method, sp.reference, sp.due_date,
             sp.paid_at, sp.notes, sp.created_at,
             s.name as supplier_name,
             b.public_code
      FROM supplier_payouts sp
      JOIN suppliers s ON s.id = sp.supplier_id
      LEFT JOIN bookings b ON b.id = sp.booking_id
    `;
    const params: (string)[] = [];

    if (status) {
      sql += ` WHERE sp.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY sp.created_at DESC`;

    const payouts = await query<PayoutRow>(sql, params);

    return NextResponse.json(
      payouts.map((p) => ({
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
        supplier: {
          id: p.supplier_id,
          name: p.supplier_name,
        },
        booking: p.booking_id
          ? {
              id: p.booking_id,
              publicCode: p.public_code,
            }
          : null,
      }))
    );
  } catch (error) {
    console.error('Error fetching payouts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payouts' },
      { status: 500 }
    );
  }
}
