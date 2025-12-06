import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { authenticateAdmin } from '@/lib/admin-auth';

interface StatsRow {
  active_rides: number;
  upcoming_rides: number;
  completed_today: number;
}

interface DriverCountRow {
  count: number;
}

interface IssueCountRow {
  count: number;
}

interface RideRow {
  id: number;
  public_code: string;
  customer_name: string;
  customer_phone: string;
  pickup_datetime: string;
  pickup_address: string;
  dropoff_address: string;
  flight_number: string | null;
  ride_status: string;
  driver_name: string | null;
  driver_phone: string | null;
  driver_eta_minutes: number | null;
}

interface IssueRow {
  id: number;
  issue_type: string;
  severity: string;
  title: string;
  booking_code: string | null;
  created_at: string;
}

interface AvgResponseRow {
  avg_response_minutes: number | null;
}

export async function GET(request: NextRequest) {
  // Authenticate admin
  const authResult = await authenticateAdmin(request);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    // Get ride stats
    // Ride statuses: PENDING_ASSIGN, ASSIGNED, ON_WAY, AT_PICKUP, IN_RIDE, FINISHED, NO_SHOW, CANCELLED
    const stats = await queryOne<StatsRow>(`
      SELECT
        COUNT(CASE WHEN r.status NOT IN ('FINISHED', 'NO_SHOW', 'CANCELLED') THEN 1 END) as active_rides,
        COUNT(CASE WHEN r.status NOT IN ('FINISHED', 'NO_SHOW', 'CANCELLED')
              AND b.pickup_datetime BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 4 HOUR) THEN 1 END) as upcoming_rides,
        COUNT(CASE WHEN r.status = 'FINISHED' AND DATE(r.completed_at) = CURDATE() THEN 1 END) as completed_today
      FROM rides r
      JOIN bookings b ON b.id = r.booking_id
      WHERE b.pickup_datetime >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `);

    // Get online drivers count (drivers with recent location update)
    const driversOnline = await queryOne<DriverCountRow>(`
      SELECT COUNT(DISTINCT driver_id) as count
      FROM driver_locations
      WHERE status = 'ONLINE' AND updated_at >= DATE_SUB(NOW(), INTERVAL 10 MINUTE)
    `);

    // Get open issues count
    const openIssues = await queryOne<IssueCountRow>(`
      SELECT COUNT(*) as count
      FROM dispatch_issues
      WHERE status IN ('OPEN', 'IN_PROGRESS')
    `);

    // Calculate average response time (time from ride creation to driver assignment)
    const avgResponse = await queryOne<AvgResponseRow>(`
      SELECT AVG(TIMESTAMPDIFF(MINUTE, r.created_at, r.assigned_at)) as avg_response_minutes
      FROM rides r
      WHERE r.assigned_at IS NOT NULL
        AND r.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    // Get active rides with details
    const activeRides = await query<RideRow>(`
      SELECT
        r.id,
        b.public_code,
        b.passenger_name as customer_name,
        b.passenger_phone as customer_phone,
        b.pickup_datetime,
        b.pickup_address,
        b.dropoff_address,
        b.flight_number,
        r.status as ride_status,
        d.full_name as driver_name,
        d.phone as driver_phone,
        r.driver_eta_minutes
      FROM rides r
      JOIN bookings b ON b.id = r.booking_id
      LEFT JOIN drivers d ON d.id = r.driver_id
      WHERE r.status NOT IN ('FINISHED', 'NO_SHOW', 'CANCELLED')
        AND b.pickup_datetime >= DATE_SUB(NOW(), INTERVAL 2 HOUR)
      ORDER BY b.pickup_datetime ASC
      LIMIT 10
    `);

    // Get open issues
    const issues = await query<IssueRow>(`
      SELECT
        di.id,
        di.issue_type,
        di.severity,
        di.title,
        b.public_code as booking_code,
        di.created_at
      FROM dispatch_issues di
      LEFT JOIN bookings b ON b.id = di.booking_id
      WHERE di.status IN ('OPEN', 'IN_PROGRESS')
      ORDER BY
        CASE di.severity
          WHEN 'CRITICAL' THEN 1
          WHEN 'HIGH' THEN 2
          WHEN 'MEDIUM' THEN 3
          ELSE 4
        END,
        di.created_at ASC
      LIMIT 10
    `);

    return NextResponse.json({
      stats: {
        activeRides: stats?.active_rides || 0,
        upcomingRides: stats?.upcoming_rides || 0,
        driversOnline: driversOnline?.count || 0,
        openIssues: openIssues?.count || 0,
        completedToday: stats?.completed_today || 0,
        avgResponseTime: Math.round(avgResponse?.avg_response_minutes || 0)
      },
      activeRides: activeRides.map((ride) => ({
        id: ride.id,
        publicCode: ride.public_code,
        customerName: ride.customer_name || 'Guest',
        customerPhone: ride.customer_phone,
        pickupTime: ride.pickup_datetime,
        pickupAddress: ride.pickup_address || 'Airport',
        dropoffAddress: ride.dropoff_address || 'Destination',
        flightNumber: ride.flight_number,
        status: ride.ride_status,
        driverName: ride.driver_name,
        driverPhone: ride.driver_phone,
        driverEta: ride.driver_eta_minutes,
        flightStatus: null,
        flightDelay: null,
      })),
      issues: issues.map((issue) => ({
        id: issue.id,
        type: issue.issue_type,
        severity: issue.severity,
        title: issue.title,
        bookingCode: issue.booking_code,
        createdAt: issue.created_at,
      })),
    });
  } catch (error) {
    console.error('Dispatch dashboard error:', error);
    return NextResponse.json({
      stats: {
        activeRides: 0,
        upcomingRides: 0,
        driversOnline: 0,
        openIssues: 0,
        completedToday: 0,
        avgResponseTime: 0,
      },
      activeRides: [],
      issues: [],
    });
  }
}
