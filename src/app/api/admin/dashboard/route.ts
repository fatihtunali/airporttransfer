import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { authenticateAdmin } from '@/lib/admin-auth';

// GET /api/admin/dashboard - Get admin dashboard KPIs
export async function GET(request: NextRequest) {
  // Authenticate admin
  const authResult = await authenticateAdmin(request);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    // Total bookings today
    const bookingsToday = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM bookings WHERE DATE(created_at) = CURDATE()`
    );

    // Total revenue today (sum of total_price for PAID bookings today)
    const revenueToday = await queryOne<{ total: number }>(
      `SELECT COALESCE(SUM(total_price), 0) as total
       FROM bookings
       WHERE DATE(created_at) = CURDATE()
       AND payment_status = 'PAID'`
    );

    // Active suppliers (verified and active)
    const activeSuppliers = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM suppliers WHERE is_verified = TRUE AND is_active = TRUE`
    );

    // Pending payouts total
    const pendingPayouts = await queryOne<{ total: number }>(
      `SELECT COALESCE(SUM(amount), 0) as total FROM supplier_payouts WHERE status = 'PENDING'`
    );

    // Additional useful stats
    // Total suppliers (all)
    const totalSuppliers = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM suppliers`
    );

    // Suppliers pending verification
    const pendingVerification = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM suppliers WHERE is_verified = FALSE AND is_active = TRUE`
    );

    // Total bookings this month
    const bookingsThisMonth = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM bookings
       WHERE YEAR(created_at) = YEAR(CURDATE())
       AND MONTH(created_at) = MONTH(CURDATE())`
    );

    // Total revenue this month
    const revenueThisMonth = await queryOne<{ total: number }>(
      `SELECT COALESCE(SUM(total_price), 0) as total
       FROM bookings
       WHERE YEAR(created_at) = YEAR(CURDATE())
       AND MONTH(created_at) = MONTH(CURDATE())
       AND payment_status = 'PAID'`
    );

    // Total commission earned this month
    const commissionThisMonth = await queryOne<{ total: number }>(
      `SELECT COALESCE(SUM(commission), 0) as total
       FROM bookings
       WHERE YEAR(created_at) = YEAR(CURDATE())
       AND MONTH(created_at) = MONTH(CURDATE())
       AND payment_status = 'PAID'`
    );

    // Active rides (not completed/cancelled)
    const activeRides = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM rides WHERE status NOT IN ('FINISHED', 'NO_SHOW', 'CANCELLED')`
    );

    // Total registered users
    const totalUsers = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM users WHERE is_active = TRUE`
    );

    return NextResponse.json({
      // KPIs from OpenAPI spec
      totalBookingsToday: bookingsToday?.count || 0,
      totalRevenueToday: revenueToday?.total || 0,
      activeSuppliers: activeSuppliers?.count || 0,
      pendingPayouts: pendingPayouts?.total || 0,
      // Additional stats
      totalSuppliers: totalSuppliers?.count || 0,
      pendingVerification: pendingVerification?.count || 0,
      bookingsThisMonth: bookingsThisMonth?.count || 0,
      revenueThisMonth: revenueThisMonth?.total || 0,
      commissionThisMonth: commissionThisMonth?.total || 0,
      activeRides: activeRides?.count || 0,
      totalUsers: totalUsers?.count || 0,
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
