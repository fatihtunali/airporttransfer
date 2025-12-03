import { NextRequest, NextResponse } from 'next/server';
import { authenticateAgency } from '@/lib/agency-auth';
import { query, queryOne } from '@/lib/db';

interface StatsRow {
  total_bookings: number;
  pending_bookings: number;
  completed_bookings: number;
  total_revenue: number;
  commission: number;
}

interface CreditRow {
  credit_limit: number;
  credit_used: number;
  default_currency: string;
}

interface TeamCountRow {
  count: number;
}

interface BookingRow {
  id: number;
  public_code: string;
  customer_name: string;
  airport_name: string;
  zone_name: string;
  pickup_datetime: string;
  status: string;
  total_price: number;
  currency: string;
}

export async function GET(request: NextRequest) {
  const auth = await authenticateAgency(request);
  if (!auth.success) return auth.response;

  const { agencyId } = auth.payload;

  // Get booking stats
  const stats = await queryOne<StatsRow>(
    `SELECT
       COUNT(*) as total_bookings,
       SUM(CASE WHEN status IN ('PENDING', 'AWAITING_PAYMENT') THEN 1 ELSE 0 END) as pending_bookings,
       SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_bookings,
       COALESCE(SUM(total_price), 0) as total_revenue,
       COALESCE(SUM(commission), 0) as commission
     FROM bookings
     WHERE agency_id = ?`,
    [agencyId]
  );

  // Get credit info
  const credit = await queryOne<CreditRow>(
    `SELECT credit_limit, credit_used, COALESCE(default_currency, 'EUR') as default_currency
     FROM agencies WHERE id = ?`,
    [agencyId]
  );

  // Get team count
  const teamCount = await queryOne<TeamCountRow>(
    `SELECT COUNT(*) as count FROM agency_users WHERE agency_id = ? AND is_active = TRUE`,
    [agencyId]
  );

  // Get recent bookings
  const recentBookings = await query<BookingRow[]>(
    `SELECT
       b.id, b.public_code, bp.full_name as customer_name,
       a.name as airport_name, z.name as zone_name,
       b.pickup_datetime, b.status, b.total_price, b.currency
     FROM bookings b
     LEFT JOIN booking_passengers bp ON bp.booking_id = b.id AND bp.is_lead = TRUE
     LEFT JOIN airports a ON a.id = b.airport_id
     LEFT JOIN zones z ON z.id = b.zone_id
     WHERE b.agency_id = ?
     ORDER BY b.created_at DESC
     LIMIT 10`,
    [agencyId]
  );

  return NextResponse.json({
    stats: {
      totalBookings: stats?.total_bookings || 0,
      pendingBookings: stats?.pending_bookings || 0,
      completedBookings: stats?.completed_bookings || 0,
      totalRevenue: stats?.total_revenue || 0,
      commission: stats?.commission || 0,
      creditBalance: (credit?.credit_limit || 0) - (credit?.credit_used || 0),
      currency: credit?.default_currency || 'EUR',
      teamMembers: teamCount?.count || 1,
    },
    recentBookings: recentBookings.map((b) => ({
      id: b.id,
      publicCode: b.public_code,
      customerName: b.customer_name || 'Guest',
      route: `${b.airport_name} → ${b.zone_name}`,
      pickupDate: b.pickup_datetime,
      status: b.status,
      totalPrice: b.total_price,
      currency: b.currency,
    })),
  });
}
