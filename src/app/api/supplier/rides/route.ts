import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authenticateSupplier } from '@/lib/supplier-auth';

type RideStatus = 'PENDING_ASSIGN' | 'ASSIGNED' | 'ON_WAY' | 'AT_PICKUP' | 'IN_RIDE' | 'FINISHED' | 'NO_SHOW' | 'CANCELLED';

interface RideRow {
  id: number;
  booking_id: number;
  supplier_id: number;
  vehicle_id: number | null;
  driver_id: number | null;
  status: RideStatus;
  pickup_lat: number | null;
  pickup_lng: number | null;
  dropoff_lat: number | null;
  dropoff_lng: number | null;
  current_lat: number | null;
  current_lng: number | null;
  assigned_at: Date | null;
  started_at: Date | null;
  arrived_at: Date | null;
  picked_up_at: Date | null;
  completed_at: Date | null;
  driver_note: string | null;
  created_at: Date;
  // Booking info via JOIN
  public_code: string;
  pickup_datetime: Date;
  pax_adults: number;
  pax_children: number;
  airport_code: string;
  zone_name: string;
  direction: string;
  flight_number: string | null;
  // Passenger info
  passenger_name: string | null;
  passenger_phone: string | null;
  // Driver/Vehicle info
  driver_name: string | null;
  driver_phone: string | null;
  vehicle_plate: string | null;
  vehicle_type: string | null;
}

// GET /api/supplier/rides - List rides for current supplier
export async function GET(request: NextRequest) {
  // Authenticate supplier
  const authResult = await authenticateSupplier(request);
  if (!authResult.success) {
    return authResult.response;
  }

  const { payload } = authResult;

  try {
    // Get query params - ensure integers for MySQL prepared statements
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10) || 20));
    const status = searchParams.get('status');
    const period = searchParams.get('period');
    let fromDate = searchParams.get('fromDate');
    let toDate = searchParams.get('toDate');
    const offset = (page - 1) * pageSize;

    // Convert period to date range if provided
    if (period && !fromDate && !toDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];

      switch (period) {
        case 'today':
          fromDate = todayStr;
          toDate = todayStr;
          break;
        case 'upcoming':
          fromDate = todayStr;
          break;
        case 'past':
          toDate = new Date(today.getTime() - 86400000).toISOString().split('T')[0]; // yesterday
          break;
        // 'all' - no date filter
      }
    }

    // Build query
    let sql = `
      SELECT r.id, r.booking_id, r.supplier_id, r.vehicle_id, r.driver_id,
             r.status, r.pickup_lat, r.pickup_lng, r.dropoff_lat, r.dropoff_lng,
             r.current_lat, r.current_lng, r.assigned_at, r.started_at,
             r.arrived_at, r.picked_up_at, r.completed_at, r.driver_note, r.created_at,
             b.public_code, b.pickup_datetime, b.pax_adults, b.pax_children,
             b.direction, b.flight_number,
             a.code as airport_code,
             z.name as zone_name,
             bp.full_name as passenger_name, bp.phone as passenger_phone,
             d.full_name as driver_name, d.phone as driver_phone,
             v.plate_number as vehicle_plate, v.vehicle_type
      FROM rides r
      JOIN bookings b ON b.id = r.booking_id
      JOIN airports a ON a.id = b.airport_id
      JOIN zones z ON z.id = b.zone_id
      LEFT JOIN booking_passengers bp ON bp.booking_id = b.id AND bp.is_lead = TRUE
      LEFT JOIN drivers d ON d.id = r.driver_id
      LEFT JOIN vehicles v ON v.id = r.vehicle_id
      WHERE r.supplier_id = ?
    `;
    const params: (number | string)[] = [payload.supplierId];

    if (status) {
      sql += ` AND r.status = ?`;
      params.push(status);
    }

    if (fromDate) {
      sql += ` AND DATE(b.pickup_datetime) >= ?`;
      params.push(fromDate);
    }

    if (toDate) {
      sql += ` AND DATE(b.pickup_datetime) <= ?`;
      params.push(toDate);
    }

    // LIMIT/OFFSET embedded directly as MySQL2 doesn't support them as bind params
    sql += ` ORDER BY b.pickup_datetime DESC LIMIT ${pageSize} OFFSET ${offset}`;

    const rides = await query<RideRow>(sql, params);

    // Get total count
    let countSql = `
      SELECT COUNT(*) as total
      FROM rides r
      JOIN bookings b ON b.id = r.booking_id
      WHERE r.supplier_id = ?
    `;
    const countParams: (number | string)[] = [payload.supplierId];

    if (status) {
      countSql += ` AND r.status = ?`;
      countParams.push(status);
    }
    if (fromDate) {
      countSql += ` AND DATE(b.pickup_datetime) >= ?`;
      countParams.push(fromDate);
    }
    if (toDate) {
      countSql += ` AND DATE(b.pickup_datetime) <= ?`;
      countParams.push(toDate);
    }

    const countResult = await query<{ total: number }>(countSql, countParams);
    const total = countResult[0]?.total || 0;

    return NextResponse.json({
      items: rides.map((r) => ({
        id: r.id,
        bookingId: r.booking_id,
        supplierId: r.supplier_id,
        vehicleId: r.vehicle_id,
        driverId: r.driver_id,
        status: r.status,
        pickupLat: r.pickup_lat,
        pickupLng: r.pickup_lng,
        dropoffLat: r.dropoff_lat,
        dropoffLng: r.dropoff_lng,
        currentLat: r.current_lat,
        currentLng: r.current_lng,
        assignedAt: r.assigned_at,
        startedAt: r.started_at,
        arrivedAt: r.arrived_at,
        pickedUpAt: r.picked_up_at,
        completedAt: r.completed_at,
        driverNote: r.driver_note,
        booking: {
          publicCode: r.public_code,
          pickupDatetime: r.pickup_datetime,
          paxAdults: r.pax_adults,
          paxChildren: r.pax_children,
          airportCode: r.airport_code,
          zoneName: r.zone_name,
          direction: r.direction,
          flightNumber: r.flight_number,
        },
        passenger: {
          name: r.passenger_name,
          phone: r.passenger_phone,
        },
        driver: r.driver_id
          ? {
              name: r.driver_name,
              phone: r.driver_phone,
            }
          : null,
        vehicle: r.vehicle_id
          ? {
              plateNumber: r.vehicle_plate,
              vehicleType: r.vehicle_type,
            }
          : null,
      })),
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Error fetching rides:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rides' },
      { status: 500 }
    );
  }
}
