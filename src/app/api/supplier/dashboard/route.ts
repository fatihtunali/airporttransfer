import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';
import { authenticateSupplier, canManageFleet } from '@/lib/supplier-auth';

interface SupplierRow {
  id: number;
  name: string;
  is_verified: boolean;
  rating_avg: number;
  rating_count: number;
}

interface BookingRow {
  id: number;
  public_code: string;
  customer_name: string;
  pickup_datetime: Date;
  status: string;
  vehicle_type: string;
  total_price: number;
  currency: string;
}

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
    // Get supplier info
    const supplier = await queryOne<SupplierRow>(
      `SELECT id, name, is_verified, rating_avg, rating_count
       FROM suppliers WHERE id = ?`,
      [payload.supplierId]
    );

    // Get today's bookings count
    const todayBookings = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count
       FROM rides r
       JOIN bookings b ON b.id = r.booking_id
       WHERE r.supplier_id = ?
       AND DATE(b.pickup_datetime) = CURDATE()`,
      [payload.supplierId]
    );

    // Get upcoming bookings count (future rides not completed/cancelled)
    const upcomingBookings = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count
       FROM rides r
       JOIN bookings b ON b.id = r.booking_id
       WHERE r.supplier_id = ?
       AND b.pickup_datetime > NOW()
       AND r.status NOT IN ('FINISHED', 'NO_SHOW', 'CANCELLED')`,
      [payload.supplierId]
    );

    // Get completed this month
    const completedThisMonth = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count
       FROM rides r
       JOIN bookings b ON b.id = r.booking_id
       WHERE r.supplier_id = ?
       AND YEAR(r.completed_at) = YEAR(CURDATE())
       AND MONTH(r.completed_at) = MONTH(CURDATE())
       AND r.status = 'FINISHED'`,
      [payload.supplierId]
    );

    // Get pending payout
    const pendingPayout = await queryOne<{ total: number }>(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM supplier_payouts
       WHERE supplier_id = ?
       AND status = 'PENDING'`,
      [payload.supplierId]
    );

    // Get recent bookings (using ride status for supplier-relevant info)
    const recentBookings = await query<BookingRow>(
      `SELECT
         b.id,
         b.public_code,
         COALESCE(bp.full_name, 'Guest') as customer_name,
         b.pickup_datetime,
         r.status,
         b.vehicle_type,
         b.total_price,
         b.currency
       FROM rides r
       JOIN bookings b ON b.id = r.booking_id
       LEFT JOIN booking_passengers bp ON bp.booking_id = b.id AND bp.is_lead = TRUE
       WHERE r.supplier_id = ?
       ORDER BY b.pickup_datetime DESC
       LIMIT 5`,
      [payload.supplierId]
    );

    return NextResponse.json({
      supplier: {
        id: supplier?.id || payload.supplierId,
        name: supplier?.name || 'Supplier',
        isVerified: supplier?.is_verified || false,
        rating: Number(supplier?.rating_avg) || 0,
        ratingCount: Number(supplier?.rating_count) || 0,
      },
      stats: {
        todayBookings: Number(todayBookings?.count) || 0,
        upcomingBookings: Number(upcomingBookings?.count) || 0,
        completedThisMonth: Number(completedThisMonth?.count) || 0,
        pendingPayout: Number(pendingPayout?.total) || 0,
        currency: 'EUR',
      },
      recentBookings: recentBookings.map((b) => ({
        id: b.id,
        publicCode: b.public_code,
        customerName: b.customer_name,
        pickupDatetime: b.pickup_datetime,
        status: b.status,
        vehicleType: b.vehicle_type,
        totalPrice: Number(b.total_price) || 0,
        currency: b.currency,
      })),
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
