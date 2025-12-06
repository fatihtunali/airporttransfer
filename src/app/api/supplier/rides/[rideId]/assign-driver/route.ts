import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { authenticateSupplier, canManageFleet } from '@/lib/supplier-auth';

type RideStatus = 'PENDING_ASSIGN' | 'ASSIGNED' | 'ON_WAY' | 'AT_PICKUP' | 'IN_RIDE' | 'FINISHED' | 'NO_SHOW' | 'CANCELLED';

interface AssignDriverRequest {
  driverId: number;
  vehicleId?: number;
}

interface RideRow {
  id: number;
  supplier_id: number;
  status: RideStatus;
}

// POST /api/supplier/rides/[rideId]/assign-driver - Assign driver and optionally vehicle to ride
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ rideId: string }> }
) {
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

  const { rideId } = await params;

  try {
    const body: AssignDriverRequest = await request.json();

    // Validate required fields
    if (!body.driverId) {
      return NextResponse.json(
        { error: 'driverId is required' },
        { status: 400 }
      );
    }

    // Support lookup by either ride ID (numeric) or booking public code (alphanumeric)
    const isNumeric = /^\d+$/.test(rideId);
    const ride = await queryOne<RideRow>(
      isNumeric
        ? `SELECT r.id, r.supplier_id, r.status FROM rides r WHERE r.id = ? AND r.supplier_id = ?`
        : `SELECT r.id, r.supplier_id, r.status FROM rides r
           JOIN bookings b ON b.id = r.booking_id
           WHERE b.public_code = ? AND r.supplier_id = ?`,
      [rideId, payload.supplierId]
    );

    if (!ride) {
      return NextResponse.json(
        { error: 'Ride not found' },
        { status: 404 }
      );
    }

    // Use numeric ride ID for all subsequent operations
    const numericRideId = ride.id;

    // Check ride status allows assignment
    if (!['PENDING_ASSIGN', 'ASSIGNED'].includes(ride.status)) {
      return NextResponse.json(
        { error: `Cannot assign driver to ride with status: ${ride.status}` },
        { status: 400 }
      );
    }

    // Verify driver belongs to supplier
    const driver = await queryOne<{ id: number; full_name: string; phone: string }>(
      `SELECT id, full_name, phone FROM drivers WHERE id = ? AND supplier_id = ? AND is_active = TRUE`,
      [body.driverId, payload.supplierId]
    );

    if (!driver) {
      return NextResponse.json(
        { error: 'Driver not found or inactive' },
        { status: 400 }
      );
    }

    // If vehicle provided, verify it belongs to supplier
    let vehicle = null;
    if (body.vehicleId) {
      vehicle = await queryOne<{ id: number; plate_number: string; vehicle_type: string }>(
        `SELECT id, plate_number, vehicle_type FROM vehicles WHERE id = ? AND supplier_id = ? AND is_active = TRUE`,
        [body.vehicleId, payload.supplierId]
      );

      if (!vehicle) {
        return NextResponse.json(
          { error: 'Vehicle not found or inactive' },
          { status: 400 }
        );
      }
    }

    // Update ride
    await execute(
      `UPDATE rides
       SET driver_id = ?, vehicle_id = ?, status = 'ASSIGNED', assigned_at = NOW(), updated_at = NOW()
       WHERE id = ?`,
      [body.driverId, body.vehicleId || null, numericRideId]
    );

    // Also update booking status to ASSIGNED if it was CONFIRMED
    await execute(
      `UPDATE bookings SET status = 'ASSIGNED', updated_at = NOW()
       WHERE id = (SELECT booking_id FROM rides WHERE id = ?)
       AND status = 'CONFIRMED'`,
      [numericRideId]
    );

    return NextResponse.json({
      id: numericRideId,
      status: 'ASSIGNED',
      driverId: body.driverId,
      vehicleId: body.vehicleId || null,
      assignedAt: new Date().toISOString(),
      driver: {
        id: driver.id,
        name: driver.full_name,
        phone: driver.phone,
      },
      vehicle: vehicle
        ? {
            id: vehicle.id,
            plateNumber: vehicle.plate_number,
            vehicleType: vehicle.vehicle_type,
          }
        : null,
    });
  } catch (error) {
    console.error('Error assigning driver:', error);
    return NextResponse.json(
      { error: 'Failed to assign driver' },
      { status: 500 }
    );
  }
}
