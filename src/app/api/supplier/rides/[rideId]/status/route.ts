import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute, insert } from '@/lib/db';
import { authenticateSupplier } from '@/lib/supplier-auth';

type RideStatus = 'PENDING_ASSIGN' | 'ASSIGNED' | 'ON_WAY' | 'AT_PICKUP' | 'IN_RIDE' | 'FINISHED' | 'NO_SHOW' | 'CANCELLED';

interface UpdateStatusRequest {
  status: RideStatus;
}

interface RideRow {
  id: number;
  supplier_id: number;
  booking_id: number;
  status: RideStatus;
  driver_id: number | null;
}

interface BookingRow {
  id: number;
  total_price: number;
  currency: string;
}

interface SupplierRow {
  commission_rate: number;
}

// Valid status transitions
const validTransitions: Record<RideStatus, RideStatus[]> = {
  PENDING_ASSIGN: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['ON_WAY', 'CANCELLED'],
  ON_WAY: ['AT_PICKUP', 'CANCELLED'],
  AT_PICKUP: ['IN_RIDE', 'NO_SHOW', 'CANCELLED'],
  IN_RIDE: ['FINISHED', 'CANCELLED'],
  FINISHED: [],
  NO_SHOW: [],
  CANCELLED: [],
};

// POST /api/supplier/rides/[rideId]/status - Update ride status
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
  const { rideId } = await params;

  try {
    const body: UpdateStatusRequest = await request.json();

    // Validate required fields
    if (!body.status) {
      return NextResponse.json(
        { error: 'status is required' },
        { status: 400 }
      );
    }

    // Validate status value
    const validStatuses: RideStatus[] = [
      'PENDING_ASSIGN',
      'ASSIGNED',
      'ON_WAY',
      'AT_PICKUP',
      'IN_RIDE',
      'FINISHED',
      'NO_SHOW',
      'CANCELLED',
    ];

    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Support lookup by either ride ID (numeric) or booking public code (alphanumeric)
    const isNumeric = /^\d+$/.test(rideId);
    const ride = await queryOne<RideRow>(
      isNumeric
        ? `SELECT r.id, r.supplier_id, r.booking_id, r.status, r.driver_id FROM rides r WHERE r.id = ? AND r.supplier_id = ?`
        : `SELECT r.id, r.supplier_id, r.booking_id, r.status, r.driver_id FROM rides r
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

    // Check if transition is valid
    const allowedTransitions = validTransitions[ride.status];
    if (!allowedTransitions.includes(body.status)) {
      return NextResponse.json(
        {
          error: `Invalid status transition from ${ride.status} to ${body.status}. Allowed: ${allowedTransitions.join(', ') || 'none'}`,
        },
        { status: 400 }
      );
    }

    // For certain transitions, driver must be assigned
    if (['ON_WAY', 'AT_PICKUP', 'IN_RIDE', 'FINISHED'].includes(body.status) && !ride.driver_id) {
      return NextResponse.json(
        { error: 'Cannot update to this status without an assigned driver' },
        { status: 400 }
      );
    }

    // Build update query based on status
    let updateSql = `UPDATE rides SET status = ?, updated_at = NOW()`;
    const updateParams: (string | number)[] = [body.status];

    // Set timestamp columns based on status
    switch (body.status) {
      case 'ON_WAY':
        updateSql += `, started_at = NOW()`;
        break;
      case 'AT_PICKUP':
        updateSql += `, arrived_at = NOW()`;
        break;
      case 'IN_RIDE':
        updateSql += `, picked_up_at = NOW()`;
        break;
      case 'FINISHED':
        updateSql += `, completed_at = NOW()`;
        break;
    }

    updateSql += ` WHERE id = ?`;
    updateParams.push(numericRideId);

    await execute(updateSql, updateParams);

    // Update booking status based on ride status
    let bookingStatus = null;
    switch (body.status) {
      case 'ON_WAY':
      case 'AT_PICKUP':
      case 'IN_RIDE':
        bookingStatus = 'IN_PROGRESS';
        break;
      case 'FINISHED':
        bookingStatus = 'COMPLETED';
        break;
      case 'CANCELLED':
        bookingStatus = 'CANCELLED';
        break;
    }

    if (bookingStatus) {
      const bookingUpdateSql =
        bookingStatus === 'COMPLETED'
          ? `UPDATE bookings SET status = ?, completed_at = NOW(), updated_at = NOW() WHERE id = (SELECT booking_id FROM rides WHERE id = ?)`
          : bookingStatus === 'CANCELLED'
            ? `UPDATE bookings SET status = ?, cancelled_at = NOW(), updated_at = NOW() WHERE id = (SELECT booking_id FROM rides WHERE id = ?)`
            : `UPDATE bookings SET status = ?, updated_at = NOW() WHERE id = (SELECT booking_id FROM rides WHERE id = ?)`;

      await execute(bookingUpdateSql, [bookingStatus, numericRideId]);
    }

    // Create payout when ride is completed
    if (body.status === 'FINISHED' && ride.booking_id) {
      try {
        // Get booking details
        const booking = await queryOne<BookingRow>(
          `SELECT id, total_price, currency FROM bookings WHERE id = ?`,
          [ride.booking_id]
        );

        // Get supplier commission rate
        const supplier = await queryOne<SupplierRow>(
          `SELECT commission_rate FROM suppliers WHERE id = ?`,
          [payload.supplierId]
        );

        if (booking && supplier) {
          const commissionRate = supplier.commission_rate || 15; // Default 15%
          const supplierAmount = booking.total_price * (1 - commissionRate / 100);

          // Calculate due date (7 days from completion)
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 7);
          const dueDateStr = dueDate.toISOString().split('T')[0];

          // Create payout record
          await insert(
            `INSERT INTO supplier_payouts (supplier_id, booking_id, amount, currency, status, due_date)
             VALUES (?, ?, ?, ?, 'PENDING', ?)`,
            [payload.supplierId, ride.booking_id, supplierAmount.toFixed(2), booking.currency, dueDateStr]
          );
        }
      } catch (payoutError) {
        console.error('Error creating payout:', payoutError);
        // Don't fail the request if payout creation fails
      }
    }

    return NextResponse.json({
      id: numericRideId,
      status: body.status,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating ride status:', error);
    return NextResponse.json(
      { error: 'Failed to update ride status' },
      { status: 500 }
    );
  }
}
