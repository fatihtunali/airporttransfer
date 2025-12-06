import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
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
  bank_name: string | null;
  bank_account_name: string | null;
  bank_iban: string | null;
  bank_swift: string | null;
  bank_country: string | null;
  payment_email: string | null;
  preferred_payment_method: string | null;
  // Booking info via JOIN
  public_code: string | null;
}

interface StatsRow {
  status: PayoutStatus;
  total: number;
  count: number;
}

interface EarningsRow {
  total_revenue: number;
  total_supplier_payouts: number;
  total_commission: number;
  completed_bookings: number;
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
             s.bank_name, s.bank_account_name, s.bank_iban, s.bank_swift,
             s.bank_country, s.payment_email, s.preferred_payment_method,
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

    // Get stats
    const statsRows = await query<StatsRow>(`
      SELECT status, SUM(amount) as total, COUNT(*) as count
      FROM supplier_payouts
      GROUP BY status
    `, []);

    const stats = {
      totalPending: 0,
      totalScheduled: 0,
      totalPaid: 0,
      countPending: 0,
      countScheduled: 0,
      countPaid: 0,
    };

    for (const row of statsRows) {
      if (row.status === 'PENDING') {
        stats.totalPending = Number(row.total) || 0;
        stats.countPending = Number(row.count) || 0;
      } else if (row.status === 'SCHEDULED') {
        stats.totalScheduled = Number(row.total) || 0;
        stats.countScheduled = Number(row.count) || 0;
      } else if (row.status === 'PAID') {
        stats.totalPaid = Number(row.total) || 0;
        stats.countPaid = Number(row.count) || 0;
      }
    }

    // Get company earnings (commission)
    const earningsRow = await queryOne<EarningsRow>(`
      SELECT
        COALESCE(SUM(b.total_price), 0) as total_revenue,
        COALESCE(SUM(sp.amount), 0) as total_supplier_payouts,
        COALESCE(SUM(b.total_price - sp.amount), 0) as total_commission,
        COUNT(DISTINCT b.id) as completed_bookings
      FROM supplier_payouts sp
      JOIN bookings b ON b.id = sp.booking_id
      WHERE sp.status != 'CANCELLED'
    `, []);

    const companyEarnings = {
      totalRevenue: Number(earningsRow?.total_revenue) || 0,
      totalSupplierPayouts: Number(earningsRow?.total_supplier_payouts) || 0,
      totalCommission: Number(earningsRow?.total_commission) || 0,
      completedBookings: Number(earningsRow?.completed_bookings) || 0,
    };

    return NextResponse.json({
      payouts: payouts.map((p) => ({
        id: p.id,
        supplierId: p.supplier_id,
        supplierName: p.supplier_name,
        bookingId: p.booking_id,
        bookingCode: p.public_code,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        payoutMethod: p.payout_method,
        reference: p.reference,
        dueDate: p.due_date,
        paidAt: p.paid_at,
        notes: p.notes,
        createdAt: p.created_at,
        // Bank details for payment
        bankName: p.bank_name,
        bankAccountName: p.bank_account_name,
        bankIban: p.bank_iban,
        bankSwift: p.bank_swift,
        bankCountry: p.bank_country,
        paymentEmail: p.payment_email,
        preferredPaymentMethod: p.preferred_payment_method,
      })),
      stats,
      companyEarnings,
    });
  } catch (error) {
    console.error('Error fetching payouts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payouts' },
      { status: 500 }
    );
  }
}
