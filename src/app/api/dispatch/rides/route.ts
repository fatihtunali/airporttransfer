import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authenticateAdmin } from '@/lib/admin-auth';

interface RideRow {
  id: number;
  booking_id: number;
  public_code: string;
  customer_name: string;
  customer_phone: string;
  pickup_datetime: string;
  pickup_address: string;
  dropoff_address: string;
  airport_name: string;
  zone_name: string;
  flight_number: string | null;
  ride_status: string;
  supplier_name: string;
  driver_name: string | null;
  driver_phone: string | null;
  driver_eta_minutes: number | null;
  vehicle_type: string;
  pax_count: number;
}

export async function GET(request: NextRequest) {
  // Authenticate admin
  const authResult = await authenticateAdmin(request);
  if (!authResult.success) {
    return authResult.response;
  }

  const { searchParams } = new URL(request.url);
  const filter = searchParams.get('filter') || 'active';

  // Ride statuses: PENDING_ASSIGN, ASSIGNED, ON_WAY, AT_PICKUP, IN_RIDE, FINISHED, NO_SHOW, CANCELLED
  let whereClause = '';
  switch (filter) {
    case 'active':
      whereClause = "r.status NOT IN ('FINISHED', 'NO_SHOW', 'CANCELLED')";
      break;
    case 'upcoming':
      whereClause = `r.status NOT IN ('FINISHED', 'NO_SHOW', 'CANCELLED')
                     AND b.pickup_datetime BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 4 HOUR)`;
      break;
    case 'pending':
      whereClause = "r.status = 'PENDING_ASSIGN'";
      break;
    case 'in_progress':
      whereClause = "r.status IN ('ON_WAY', 'AT_PICKUP', 'IN_RIDE')";
      break;
    case 'delayed':
      whereClause = `r.status NOT IN ('FINISHED', 'NO_SHOW', 'CANCELLED')
                     AND ft.delay_minutes > 15`;
      break;
    case 'all':
    default:
      whereClause = "DATE(b.pickup_datetime) = CURDATE()";
  }

  try {
    const rides = await query<RideRow>(`
      SELECT
        r.id,
        r.booking_id,
        b.public_code,
        b.passenger_name as customer_name,
        b.passenger_phone as customer_phone,
        b.pickup_datetime,
        b.pickup_address,
        b.dropoff_address,
        a.name as airport_name,
        z.name as zone_name,
        b.flight_number,
        r.status as ride_status,
        s.name as supplier_name,
        d.full_name as driver_name,
        d.phone as driver_phone,
        r.driver_eta_minutes,
        b.vehicle_type,
        (b.pax_adults + b.pax_children) as pax_count
      FROM rides r
      JOIN bookings b ON b.id = r.booking_id
      LEFT JOIN airports a ON a.id = b.airport_id
      LEFT JOIN zones z ON z.id = b.zone_id
      LEFT JOIN suppliers s ON s.id = r.supplier_id
      LEFT JOIN drivers d ON d.id = r.driver_id
      WHERE ${whereClause}
      ORDER BY b.pickup_datetime ASC
      LIMIT 100
    `);

    return NextResponse.json({
      rides: rides.map((ride) => ({
        id: ride.id,
        bookingId: ride.booking_id,
        publicCode: ride.public_code,
        customerName: ride.customer_name || 'Guest',
        customerPhone: ride.customer_phone,
        pickupTime: ride.pickup_datetime,
        pickupAddress: ride.pickup_address || 'Airport',
        dropoffAddress: ride.dropoff_address || 'Destination',
        airportName: ride.airport_name || 'Unknown Airport',
        zoneName: ride.zone_name || 'Unknown Zone',
        flightNumber: ride.flight_number,
        flightStatus: null, // Would be populated from flight_tracking
        flightDelay: null,
        status: ride.ride_status,
        supplierName: ride.supplier_name || 'Unknown Supplier',
        driverName: ride.driver_name,
        driverPhone: ride.driver_phone,
        driverEta: ride.driver_eta_minutes,
        vehicleType: ride.vehicle_type,
        paxCount: ride.pax_count,
      })),
    });
  } catch (error) {
    console.error('Dispatch rides error:', error);
    return NextResponse.json({ rides: [] });
  }
}
