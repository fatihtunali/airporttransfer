import { NextRequest, NextResponse } from 'next/server';
import { authenticateAgency } from '@/lib/agency-auth';
import { query, queryOne } from '@/lib/db';

interface TransactionRow {
  id: number;
  type: string;
  amount: number;
  balance_after: number;
  currency: string;
  reference: string | null;
  booking_code: string | null;
  notes: string | null;
  created_at: string;
}

interface CreditRow {
  credit_limit: number;
  credit_used: number;
  default_currency: string;
}

export async function GET(request: NextRequest) {
  const auth = await authenticateAgency(request);
  if (!auth.success) return auth.response;

  const { agencyId } = auth.payload;

  // Get credit info
  const credit = await queryOne<CreditRow>(
    `SELECT credit_limit, credit_used, COALESCE(default_currency, 'EUR') as default_currency
     FROM agencies WHERE id = ?`,
    [agencyId]
  );

  // Get transactions
  const transactions = await query<TransactionRow>(
    `SELECT ct.id, ct.type, ct.amount, ct.balance_after, ct.currency,
            ct.reference, b.public_code as booking_code, ct.notes, ct.created_at
     FROM agency_credit_transactions ct
     LEFT JOIN bookings b ON b.id = ct.booking_id
     WHERE ct.agency_id = ?
     ORDER BY ct.created_at DESC
     LIMIT 50`,
    [agencyId]
  );

  const balance = (credit?.credit_limit || 0) - (credit?.credit_used || 0);

  return NextResponse.json({
    stats: {
      balance,
      creditLimit: credit?.credit_limit || 0,
      availableCredit: balance,
      currency: credit?.default_currency || 'EUR',
    },
    transactions: transactions.map((tx) => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      balanceAfter: tx.balance_after,
      currency: tx.currency,
      reference: tx.reference,
      bookingCode: tx.booking_code,
      notes: tx.notes,
      createdAt: tx.created_at,
    })),
  });
}
