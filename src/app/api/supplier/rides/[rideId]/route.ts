import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
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
  pickup_address: string | null;
  dropoff_address: string | null;
  customer_notes: string | null;
  // Passenger info
  passenger_name: string | null;
  passenger_phone: string | null;
  passenger_email: string | null;
  // Driver/Vehicle info
  driver_name: string | null;
  driver_phone: string | null;
  vehicle_plate: string | null;
  vehicle_type: string | null;
  vehicle_brand: string | null;
  vehicle_model: string | null;
}

// GET /api/supplier/rides/[rideId] - Get ride details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ rideId: string }> }
) {
  // Authenticate supplier
  const authResult = await authenticateSupplier(request);
  if (!authResult.success) {
    return authResult.response;
  }

  const { payload } = authResult;
  const { rideId } = await params;

  try {
    // Get ride with full details
    const ride = await queryOne<RideRow>(
      `SELECT r.id, r.booking_id, r.supplier_id, r.vehicle_id, r.driver_id,
              r.status, r.pickup_lat, r.pickup_lng, r.dropoff_lat, r.dropoff_lng,
              r.current_lat, r.current_lng, r.assigned_at, r.started_at,
              r.arrived_at, r.picked_up_at, r.completed_at, r.driver_note, r.created_at,
              b.public_code, b.pickup_datetime, b.pax_adults, b.pax_children,
              b.direction, b.flight_number, b.pickup_address, b.dropoff_address,
              b.customer_notes,
              a.code as airport_code,
              z.name as zone_name,
              bp.full_name as passenger_name, bp.phone as passenger_phone, bp.email as passenger_email,
              d.full_name as driver_name, d.phone as driver_phone,
              v.plate_number as vehicle_plate, v.vehicle_type, v.brand as vehicle_brand, v.model as vehicle_model
       FROM rides r
       JOIN bookings b ON b.id = r.booking_id
       JOIN airports a ON a.id = b.airport_id
       JOIN zones z ON z.id = b.zone_id
       LEFT JOIN booking_passengers bp ON bp.booking_id = b.id AND bp.is_lead = TRUE
       LEFT JOIN drivers d ON d.id = r.driver_id
       LEFT JOIN vehicles v ON v.id = r.vehicle_id
       WHERE r.id = ? AND r.supplier_id = ?`,
      [rideId, payload.supplierId]
    );

    if (!ride) {
      return NextResponse.json(
        { error: 'Ride not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: ride.id,
      bookingId: ride.booking_id,
      supplierId: ride.supplier_id,
      vehicleId: ride.vehicle_id,
      driverId: ride.driver_id,
      status: ride.status,
      pickupLat: ride.pickup_lat,
      pickupLng: ride.pickup_lng,
      dropoffLat: ride.dropoff_lat,
      dropoffLng: ride.dropoff_lng,
      currentLat: ride.current_lat,
      currentLng: ride.current_lng,
      assignedAt: ride.assigned_at,
      startedAt: ride.started_at,
      arrivedAt: ride.arrived_at,
      pickedUpAt: ride.picked_up_at,
      completedAt: ride.completed_at,
      driverNote: ride.driver_note,
      booking: {
        publicCode: ride.public_code,
        pickupDatetime: ride.pickup_datetime,
        paxAdults: ride.pax_adults,
        paxChildren: ride.pax_children,
        airportCode: ride.airport_code,
        zoneName: ride.zone_name,
        direction: ride.direction,
        flightNumber: ride.flight_number,
        pickupAddress: ride.pickup_address,
        dropoffAddress: ride.dropoff_address,
        customerNotes: ride.customer_notes,
      },
      passenger: {
        name: ride.passenger_name,
        phone: ride.passenger_phone,
        email: ride.passenger_email,
      },
      driver: ride.driver_id
        ? {
            id: ride.driver_id,
            name: ride.driver_name,
            phone: ride.driver_phone,
          }
        : null,
      vehicle: ride.vehicle_id
        ? {
            id: ride.vehicle_id,
            plateNumber: ride.vehicle_plate,
            vehicleType: ride.vehicle_type,
            brand: ride.vehicle_brand,
            model: ride.vehicle_model,
          }
        : null,
    });
  } catch (error) {
    console.error('Error fetching ride:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ride' },
      { status: 500 }
    );
  }
}
