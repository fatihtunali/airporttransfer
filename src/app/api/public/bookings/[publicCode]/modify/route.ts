import { NextRequest, NextResponse } from 'next/server';
import { queryOne, transaction } from '@/lib/db';

interface ModifyBookingRequest {
  email: string;
  // Modifiable fields
  pickupTime?: string;
  flightNumber?: string;
  pickupAddress?: string;
  dropoffAddress?: string;
  specialRequests?: string;
  // Passenger details
  passengerName?: string;
  passengerPhone?: string;
  passengerEmail?: string;
}

// POST /api/public/bookings/[publicCode]/modify - Modify a booking
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ publicCode: string }> }
) {
  try {
    const { publicCode } = await params;
    const body: ModifyBookingRequest = await request.json();
    const { email, ...modifications } = body;

    if (!publicCode) {
      return NextResponse.json(
        { error: 'Booking code is required' },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required for verification' },
        { status: 400 }
      );
    }

    // Check if any modification was provided
    const hasModifications = Object.values(modifications).some(v => v !== undefined);
    if (!hasModifications) {
      return NextResponse.json(
        { error: 'No modifications provided' },
        { status: 400 }
      );
    }

    // Get booking details
    const booking = await queryOne<{
      id: number;
      public_code: string;
      pickup_datetime: string;
      status: string;
      flight_number: string | null;
      pickup_address: string | null;
      dropoff_address: string | null;
      customer_notes: string | null;
    }>(
      `SELECT id, public_code, pickup_datetime, status,
              flight_number, pickup_address, dropoff_address, customer_notes
       FROM bookings WHERE public_code = ?`,
      [publicCode.toUpperCase()]
    );

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Verify email matches lead passenger
    const leadPassenger = await queryOne<{
      id: number;
      email: string | null;
      full_name: string;
      phone: string | null;
    }>(
      `SELECT id, email, full_name, phone
       FROM booking_passengers WHERE booking_id = ? AND is_lead = TRUE`,
      [booking.id]
    );

    if (!leadPassenger?.email || leadPassenger.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Email does not match booking records' },
        { status: 403 }
      );
    }

    // Check if booking can be modified
    const unmodifiableStatuses = ['CANCELLED', 'COMPLETED', 'IN_PROGRESS'];
    if (unmodifiableStatuses.includes(booking.status)) {
      return NextResponse.json(
        { error: `Cannot modify a booking with status: ${booking.status}` },
        { status: 400 }
      );
    }

    // Calculate hours until pickup
    const pickupTime = new Date(booking.pickup_datetime);
    const now = new Date();
    const hoursUntilPickup = (pickupTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Require at least 4 hours before pickup to modify
    const MIN_HOURS_FOR_MODIFICATION = 4;
    if (hoursUntilPickup < MIN_HOURS_FOR_MODIFICATION) {
      return NextResponse.json(
        {
          error: `Modifications must be made at least ${MIN_HOURS_FOR_MODIFICATION} hours before pickup. Please contact support for last-minute changes.`,
        },
        { status: 400 }
      );
    }

    // Validate new pickup time if provided
    if (modifications.pickupTime) {
      const newPickupTime = new Date(modifications.pickupTime);
      const minPickupTime = new Date(Date.now() + 4 * 60 * 60 * 1000); // At least 4 hours from now

      if (newPickupTime < minPickupTime) {
        return NextResponse.json(
          { error: 'New pickup time must be at least 4 hours from now' },
          { status: 400 }
        );
      }
    }

    // Track changes for logging
    const changes: Record<string, { old: unknown; new: unknown }> = {};

    // Perform modifications in transaction
    await transaction(async (conn) => {
      // Build booking update query
      const bookingUpdates: string[] = [];
      const bookingValues: unknown[] = [];

      if (modifications.pickupTime !== undefined) {
        bookingUpdates.push('pickup_datetime = ?');
        bookingValues.push(modifications.pickupTime);
        changes.pickupTime = { old: booking.pickup_datetime, new: modifications.pickupTime };
      }

      if (modifications.flightNumber !== undefined) {
        bookingUpdates.push('flight_number = ?');
        bookingValues.push(modifications.flightNumber || null);
        changes.flightNumber = { old: booking.flight_number, new: modifications.flightNumber };
      }

      if (modifications.pickupAddress !== undefined) {
        bookingUpdates.push('pickup_address = ?');
        bookingValues.push(modifications.pickupAddress || null);
        changes.pickupAddress = { old: booking.pickup_address, new: modifications.pickupAddress };
      }

      if (modifications.dropoffAddress !== undefined) {
        bookingUpdates.push('dropoff_address = ?');
        bookingValues.push(modifications.dropoffAddress || null);
        changes.dropoffAddress = { old: booking.dropoff_address, new: modifications.dropoffAddress };
      }

      if (modifications.specialRequests !== undefined) {
        bookingUpdates.push('customer_notes = ?');
        bookingValues.push(modifications.specialRequests || null);
        changes.specialRequests = { old: booking.customer_notes, new: modifications.specialRequests };
      }

      if (bookingUpdates.length > 0) {
        bookingUpdates.push('updated_at = NOW()');
        bookingValues.push(booking.id);
        await conn.execute(
          `UPDATE bookings SET ${bookingUpdates.join(', ')} WHERE id = ?`,
          bookingValues
        );
      }

      // Update passenger details if provided
      const passengerUpdates: string[] = [];
      const passengerValues: unknown[] = [];

      if (modifications.passengerName !== undefined) {
        passengerUpdates.push('full_name = ?');
        passengerValues.push(modifications.passengerName);
        changes.passengerName = { old: leadPassenger.full_name, new: modifications.passengerName };
      }

      if (modifications.passengerPhone !== undefined) {
        passengerUpdates.push('phone = ?');
        passengerValues.push(modifications.passengerPhone);
        changes.passengerPhone = { old: leadPassenger.phone, new: modifications.passengerPhone };
      }

      if (modifications.passengerEmail !== undefined) {
        passengerUpdates.push('email = ?');
        passengerValues.push(modifications.passengerEmail);
        changes.passengerEmail = { old: leadPassenger.email, new: modifications.passengerEmail };
      }

      if (passengerUpdates.length > 0) {
        passengerValues.push(leadPassenger.id);
        await conn.execute(
          `UPDATE booking_passengers SET ${passengerUpdates.join(', ')} WHERE id = ?`,
          passengerValues
        );
      }

      // Log the modification
      await conn.execute(
        `INSERT INTO activity_logs (action, entity_type, entity_id, old_values, new_values, created_at)
         VALUES ('BOOKING_MODIFIED', 'booking', ?, ?, ?, NOW())`,
        [
          booking.id,
          JSON.stringify(Object.fromEntries(
            Object.entries(changes).map(([key, val]) => [key, val.old])
          )),
          JSON.stringify(Object.fromEntries(
            Object.entries(changes).map(([key, val]) => [key, val.new])
          )),
        ]
      );
    });

    return NextResponse.json({
      success: true,
      message: 'Booking modified successfully',
      bookingCode: booking.public_code,
      modifications: Object.keys(changes),
    });
  } catch (error) {
    console.error('Error modifying booking:', error);
    return NextResponse.json(
      { error: 'Failed to modify booking. Please try again.' },
      { status: 500 }
    );
  }
}

// GET /api/public/bookings/[publicCode]/modify - Get modification options
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicCode: string }> }
) {
  try {
    const { publicCode } = await params;
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!publicCode || !email) {
      return NextResponse.json(
        { error: 'Booking code and email are required' },
        { status: 400 }
      );
    }

    // Get booking details
    const booking = await queryOne<{
      id: number;
      public_code: string;
      pickup_datetime: string;
      status: string;
      flight_number: string | null;
      pickup_address: string | null;
      dropoff_address: string | null;
      customer_notes: string | null;
    }>(
      `SELECT id, public_code, pickup_datetime, status,
              flight_number, pickup_address, dropoff_address, customer_notes
       FROM bookings WHERE public_code = ?`,
      [publicCode.toUpperCase()]
    );

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Verify email
    const leadPassenger = await queryOne<{
      id: number;
      email: string | null;
      full_name: string;
      phone: string | null;
    }>(
      `SELECT id, email, full_name, phone
       FROM booking_passengers WHERE booking_id = ? AND is_lead = TRUE`,
      [booking.id]
    );

    if (!leadPassenger?.email || leadPassenger.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Email does not match booking records' },
        { status: 403 }
      );
    }

    // Check if booking can be modified
    const unmodifiableStatuses = ['CANCELLED', 'COMPLETED', 'IN_PROGRESS'];
    const canModify = !unmodifiableStatuses.includes(booking.status);

    // Calculate hours until pickup
    const pickupTime = new Date(booking.pickup_datetime);
    const now = new Date();
    const hoursUntilPickup = (pickupTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    const MIN_HOURS_FOR_MODIFICATION = 4;
    const timeAllowsModification = hoursUntilPickup >= MIN_HOURS_FOR_MODIFICATION;

    return NextResponse.json({
      canModify: canModify && timeAllowsModification,
      reason: !canModify
        ? `Booking status is ${booking.status}`
        : !timeAllowsModification
        ? `Less than ${MIN_HOURS_FOR_MODIFICATION} hours until pickup`
        : null,
      booking: {
        code: booking.public_code,
        status: booking.status,
        pickupTime: booking.pickup_datetime,
        flightNumber: booking.flight_number,
        pickupAddress: booking.pickup_address,
        dropoffAddress: booking.dropoff_address,
        specialRequests: booking.customer_notes,
      },
      passenger: {
        name: leadPassenger.full_name,
        phone: leadPassenger.phone,
        email: leadPassenger.email,
      },
      modifiableFields: [
        'pickupTime',
        'flightNumber',
        'pickupAddress',
        'dropoffAddress',
        'specialRequests',
        'passengerName',
        'passengerPhone',
        'passengerEmail',
      ],
      hoursUntilPickup: Math.floor(hoursUntilPickup),
      minHoursRequired: MIN_HOURS_FOR_MODIFICATION,
    });
  } catch (error) {
    console.error('Error getting modification info:', error);
    return NextResponse.json(
      { error: 'Failed to get modification info' },
      { status: 500 }
    );
  }
}
