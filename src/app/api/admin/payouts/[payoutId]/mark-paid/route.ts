import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { authenticateAdmin } from '@/lib/admin-auth';

type PayoutStatus = 'PENDING' | 'SCHEDULED' | 'PAID' | 'CANCELLED';

interface PayoutRow {
  id: number;
  supplier_id: number;
  amount: number;
  currency: string;
  status: PayoutStatus;
}

// POST /api/admin/payouts/[payoutId]/mark-paid - Mark payout as paid
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ payoutId: string }> }
) {
  // Authenticate admin
  const authResult = await authenticateAdmin(request);
  if (!authResult.success) {
    return authResult.response;
  }

  const { payoutId } = await params;

  try {
    // Get payout
    const payout = await queryOne<PayoutRow>(
      `SELECT id, supplier_id, amount, currency, status FROM supplier_payouts WHERE id = ?`,
      [payoutId]
    );

    if (!payout) {
      return NextResponse.json(
        { error: 'Payout not found' },
        { status: 404 }
      );
    }

    if (payout.status === 'PAID') {
      return NextResponse.json(
        { error: 'Payout is already marked as paid' },
        { status: 400 }
      );
    }

    if (payout.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Cannot mark cancelled payout as paid' },
        { status: 400 }
      );
    }

    // Update payout to paid
    await execute(
      `UPDATE supplier_payouts SET status = 'PAID', paid_at = NOW(), updated_at = NOW() WHERE id = ?`,
      [payoutId]
    );

    return NextResponse.json({
      id: payout.id,
      supplierId: payout.supplier_id,
      amount: payout.amount,
      currency: payout.currency,
      status: 'PAID',
      paidAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error marking payout as paid:', error);
    return NextResponse.json(
      { error: 'Failed to mark payout as paid' },
      { status: 500 }
    );
  }
}
