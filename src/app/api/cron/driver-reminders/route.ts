import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendDriverAssignmentReminder } from '@/lib/email';

// Secret key to protect cron endpoint
const CRON_SECRET = process.env.CRON_SECRET || 'driver-reminder-secret-2024';

interface UnassignedRide {
  ride_id: number;
  booking_id: number;
  public_code: string;
  pickup_datetime: string;
  pickup_address: string | null;
  dropoff_address: string | null;
  airport_name: string;
  zone_name: string;
  direction: string;
  vehicle_type: string;
  pax_adults: number;
  pax_children: number;
  supplier_id: number;
  supplier_name: string;
  supplier_email: string;
  customer_name: string;
  customer_phone: string;
  hours_until_pickup: number;
}

// GET /api/cron/driver-reminders - Send reminders for unassigned rides
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  const providedSecret = authHeader?.replace('Bearer ', '') ||
                         request.nextUrl.searchParams.get('secret');

  if (providedSecret !== CRON_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Find bookings where:
    // - Pickup is within 5-6 hours from now (to send reminder once)
    // - No driver assigned (status = PENDING_ASSIGN)
    // - Reminder not already sent
    // - Booking is confirmed (not cancelled)
    const unassignedRides = await query<UnassignedRide>(`
      SELECT
        r.id as ride_id,
        b.id as booking_id,
        b.public_code,
        b.pickup_datetime,
        b.pickup_address,
        b.dropoff_address,
        a.name as airport_name,
        z.name as zone_name,
        b.direction,
        b.vehicle_type,
        b.pax_adults,
        b.pax_children,
        s.id as supplier_id,
        s.name as supplier_name,
        s.contact_email as supplier_email,
        bp.full_name as customer_name,
        bp.phone as customer_phone,
        TIMESTAMPDIFF(HOUR, NOW(), b.pickup_datetime) as hours_until_pickup
      FROM rides r
      INNER JOIN bookings b ON b.id = r.booking_id
      INNER JOIN suppliers s ON s.id = r.supplier_id
      INNER JOIN airports a ON a.id = b.airport_id
      INNER JOIN zones z ON z.id = b.zone_id
      LEFT JOIN booking_passengers bp ON bp.booking_id = b.id AND bp.is_lead = TRUE
      WHERE r.status = 'PENDING_ASSIGN'
        AND r.driver_id IS NULL
        AND r.driver_reminder_sent_at IS NULL
        AND b.status IN ('CONFIRMED', 'PENDING')
        AND b.pickup_datetime > NOW()
        AND b.pickup_datetime <= DATE_ADD(NOW(), INTERVAL 6 HOUR)
        AND s.contact_email IS NOT NULL
        AND s.contact_email != ''
    `);

    const results = {
      checked: unassignedRides.length,
      sent: 0,
      failed: 0,
      details: [] as { publicCode: string; status: string; error?: string }[],
    };

    for (const ride of unassignedRides) {
      try {
        // Determine pickup and dropoff addresses
        const pickupAddress = ride.direction === 'FROM_AIRPORT'
          ? ride.airport_name
          : (ride.pickup_address || ride.zone_name);
        const dropoffAddress = ride.direction === 'FROM_AIRPORT'
          ? (ride.dropoff_address || ride.zone_name)
          : ride.airport_name;

        // Send reminder email
        await sendDriverAssignmentReminder({
          publicCode: ride.public_code,
          supplierName: ride.supplier_name,
          supplierEmail: ride.supplier_email,
          customerName: ride.customer_name || 'Customer',
          customerPhone: ride.customer_phone || 'N/A',
          pickupDatetime: ride.pickup_datetime,
          pickupAddress,
          dropoffAddress,
          vehicleType: ride.vehicle_type,
          passengers: ride.pax_adults + ride.pax_children,
          hoursUntilPickup: ride.hours_until_pickup,
        });

        // Mark reminder as sent
        await query(
          `UPDATE rides SET driver_reminder_sent_at = NOW() WHERE id = ?`,
          [ride.ride_id]
        );

        results.sent++;
        results.details.push({
          publicCode: ride.public_code,
          status: 'sent',
        });

        console.log(`Driver reminder sent for booking ${ride.public_code} to ${ride.supplier_email}`);
      } catch (error) {
        results.failed++;
        results.details.push({
          publicCode: ride.public_code,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        console.error(`Failed to send reminder for ${ride.public_code}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.checked} unassigned rides. Sent ${results.sent} reminders, ${results.failed} failed.`,
      results,
    });
  } catch (error) {
    console.error('Driver reminder cron error:', error);
    return NextResponse.json(
      { error: 'Failed to process driver reminders' },
      { status: 500 }
    );
  }
}
