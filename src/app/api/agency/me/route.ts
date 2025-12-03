import { NextRequest, NextResponse } from 'next/server';
import { authenticateAgency } from '@/lib/agency-auth';
import { queryOne } from '@/lib/db';

export async function GET(request: NextRequest) {
  const auth = await authenticateAgency(request);
  if (!auth.success) return auth.response;

  const { agencyId } = auth.payload;

  const agency = await queryOne<{
    id: number;
    name: string;
    credit_limit: number;
    credit_used: number;
    default_currency: string;
  }>(
    `SELECT id, name, credit_limit, credit_used, COALESCE(default_currency, 'EUR') as default_currency
     FROM agencies WHERE id = ?`,
    [agencyId]
  );

  if (!agency) {
    return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: agency.id,
    name: agency.name,
    creditBalance: agency.credit_limit - agency.credit_used,
    currency: agency.default_currency,
  });
}
