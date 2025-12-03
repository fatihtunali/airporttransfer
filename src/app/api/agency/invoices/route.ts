import { NextRequest, NextResponse } from 'next/server';
import { authenticateAgency } from '@/lib/agency-auth';
import { query, queryOne } from '@/lib/db';

interface InvoiceRow {
  id: number;
  invoice_number: string;
  period_start: string;
  period_end: string;
  booking_count: number;
  subtotal: number;
  commission_rate: number;
  commission_amount: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  status: string;
  due_date: string;
  paid_at: string | null;
  pdf_url: string | null;
}

interface StatsRow {
  total_paid: number;
  total_pending: number;
  total_overdue: number;
}

export async function GET(request: NextRequest) {
  const auth = await authenticateAgency(request);
  if (!auth.success) return auth.response;

  const { agencyId } = auth.payload;
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  let sql = `
    SELECT id, invoice_number, period_start, period_end, booking_count,
           subtotal, commission_rate, commission_amount, tax_amount,
           total_amount, currency, status, due_date, paid_at, pdf_url
    FROM agency_invoices
    WHERE agency_id = ?
  `;
  const params: (string | number)[] = [agencyId];

  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }

  sql += ' ORDER BY created_at DESC';

  const invoices = await query<InvoiceRow>(sql, params);

  // Get stats
  const stats = await queryOne<StatsRow>(
    `SELECT
       COALESCE(SUM(CASE WHEN status = 'PAID' THEN commission_amount ELSE 0 END), 0) as total_paid,
       COALESCE(SUM(CASE WHEN status IN ('SENT', 'DRAFT') THEN commission_amount ELSE 0 END), 0) as total_pending,
       COALESCE(SUM(CASE WHEN status = 'OVERDUE' THEN commission_amount ELSE 0 END), 0) as total_overdue
     FROM agency_invoices
     WHERE agency_id = ?`,
    [agencyId]
  );

  const currency = invoices[0]?.currency || 'EUR';

  return NextResponse.json({
    invoices: invoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoice_number,
      periodStart: inv.period_start,
      periodEnd: inv.period_end,
      bookingCount: inv.booking_count,
      subtotal: inv.subtotal,
      commissionRate: inv.commission_rate,
      commissionAmount: inv.commission_amount,
      taxAmount: inv.tax_amount,
      totalAmount: inv.total_amount,
      currency: inv.currency,
      status: inv.status,
      dueDate: inv.due_date,
      paidAt: inv.paid_at,
      pdfUrl: inv.pdf_url,
    })),
    stats: {
      totalPaid: stats?.total_paid || 0,
      totalPending: stats?.total_pending || 0,
      totalOverdue: stats?.total_overdue || 0,
      currency,
    },
  });
}
