import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { authenticateSupplier, canManageFleet } from '@/lib/supplier-auth';

// GET /api/supplier/dashboard - Get supplier dashboard summary
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
    // Get upcoming rides count (rides with pickup in the future, not completed/cancelled)
    const upcomingRides = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count
       FROM rides r
       JOIN bookings b ON b.id = r.booking_id
       WHERE r.supplier_id = ?
       AND b.pickup_datetime > NOW()
       AND r.status NOT IN ('FINISHED', 'NO_SHOW', 'CANCELLED')`,
      [payload.supplierId]
    );

    // Get completed rides today
    const completedToday = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count
       FROM rides
       WHERE supplier_id = ?
       AND DATE(completed_at) = CURDATE()
       AND status = 'FINISHED'`,
      [payload.supplierId]
    );

    // Get total earnings this month (from supplier_payouts)
    const earningsThisMonth = await queryOne<{ total: number }>(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM supplier_payouts
       WHERE supplier_id = ?
       AND YEAR(created_at) = YEAR(CURDATE())
       AND MONTH(created_at) = MONTH(CURDATE())
       AND status != 'CANCELLED'`,
      [payload.supplierId]
    );

    // Get pending payouts (sum of PENDING status)
    const pendingPayouts = await queryOne<{ total: number }>(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM supplier_payouts
       WHERE supplier_id = ?
       AND status = 'PENDING'`,
      [payload.supplierId]
    );

    // Additional useful stats
    // Get today's rides count
    const todaysRides = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count
       FROM rides r
       JOIN bookings b ON b.id = r.booking_id
       WHERE r.supplier_id = ?
       AND DATE(b.pickup_datetime) = CURDATE()`,
      [payload.supplierId]
    );

    // Get rides pending assignment
    const pendingAssignment = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count
       FROM rides
       WHERE supplier_id = ?
       AND status = 'PENDING_ASSIGN'`,
      [payload.supplierId]
    );

    // Get active drivers count
    const activeDrivers = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count
       FROM drivers
       WHERE supplier_id = ?
       AND is_active = TRUE`,
      [payload.supplierId]
    );

    // Get active vehicles count
    const activeVehicles = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count
       FROM vehicles
       WHERE supplier_id = ?
       AND is_active = TRUE`,
      [payload.supplierId]
    );

    return NextResponse.json({
      upcomingRides: upcomingRides?.count || 0,
      completedRidesToday: completedToday?.count || 0,
      totalEarningsThisMonth: earningsThisMonth?.total || 0,
      pendingPayouts: pendingPayouts?.total || 0,
      // Additional stats
      todaysRides: todaysRides?.count || 0,
      pendingAssignment: pendingAssignment?.count || 0,
      activeDrivers: activeDrivers?.count || 0,
      activeVehicles: activeVehicles?.count || 0,
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
