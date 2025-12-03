import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface FlightRow {
  id: number;
  booking_id: number;
  public_code: string;
  flight_number: string;
  flight_date: string;
  departure_airport: string;
  arrival_airport: string;
  scheduled_departure: string | null;
  scheduled_arrival: string;
  estimated_arrival: string | null;
  actual_arrival: string | null;
  status: string;
  delay_minutes: number;
  delay_reason: string | null;
  arrival_terminal: string | null;
  arrival_gate: string | null;
  baggage_claim: string | null;
  tracking_source: string | null;
  last_checked: string | null;
  customer_name: string;
  pickup_datetime: string;
  pickup_adjusted: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get('filter') || 'all';

  let whereClause = `b.pickup_datetime BETWEEN DATE_SUB(NOW(), INTERVAL 2 HOUR) AND DATE_ADD(NOW(), INTERVAL 24 HOUR)`;

  switch (filter) {
    case 'delayed':
      whereClause += ` AND ft.delay_minutes > 0`;
      break;
    case 'arriving':
      whereClause += ` AND ft.status IN ('EN_ROUTE', 'DEPARTED')
                       AND ft.estimated_arrival BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 2 HOUR)`;
      break;
    case 'landed':
      whereClause += ` AND ft.status IN ('LANDED', 'ARRIVED_GATE')`;
      break;
  }

  try {
    const flights = await query<FlightRow>(`
      SELECT
        ft.id,
        ft.booking_id,
        b.public_code,
        ft.flight_number,
        ft.flight_date,
        ft.departure_airport,
        ft.arrival_airport,
        ft.scheduled_departure,
        ft.scheduled_arrival,
        ft.estimated_arrival,
        ft.actual_arrival,
        ft.status,
        ft.delay_minutes,
        ft.delay_reason,
        ft.arrival_terminal,
        ft.arrival_gate,
        ft.baggage_claim,
        ft.tracking_source,
        ft.last_checked,
        bp.full_name as customer_name,
        b.pickup_datetime,
        CASE WHEN b.original_pickup_datetime IS NOT NULL THEN 1 ELSE 0 END as pickup_adjusted
      FROM flight_tracking ft
      JOIN bookings b ON b.id = ft.booking_id
      LEFT JOIN booking_passengers bp ON bp.booking_id = b.id AND bp.is_lead = TRUE
      WHERE ${whereClause}
      ORDER BY ft.estimated_arrival ASC, ft.scheduled_arrival ASC
      LIMIT 100
    `);

    return NextResponse.json({
      flights: flights.map((flight) => ({
        id: flight.id,
        bookingId: flight.booking_id,
        bookingCode: flight.public_code,
        flightNumber: flight.flight_number,
        flightDate: flight.flight_date,
        departureAirport: flight.departure_airport,
        arrivalAirport: flight.arrival_airport,
        scheduledDeparture: flight.scheduled_departure,
        scheduledArrival: flight.scheduled_arrival,
        estimatedArrival: flight.estimated_arrival,
        actualArrival: flight.actual_arrival,
        status: flight.status,
        delayMinutes: flight.delay_minutes,
        delayReason: flight.delay_reason,
        terminal: flight.arrival_terminal,
        gate: flight.arrival_gate,
        baggageClaim: flight.baggage_claim,
        trackingSource: flight.tracking_source,
        lastChecked: flight.last_checked,
        customerName: flight.customer_name || 'Guest',
        pickupTime: flight.pickup_datetime,
        pickupAdjusted: flight.pickup_adjusted === 1,
      })),
    });
  } catch (error) {
    console.error('Flight tracking error:', error);
    return NextResponse.json({ flights: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, flightNumber, flightDate, departureAirport, arrivalAirport, scheduledDeparture, scheduledArrival } = body;

    if (!bookingId || !flightNumber || !flightDate) {
      return NextResponse.json({ error: 'Missing required fields (bookingId, flightNumber, flightDate)' }, { status: 400 });
    }

    // Insert or update flight tracking
    await query(`
      INSERT INTO flight_tracking (booking_id, flight_number, flight_date, departure_airport, arrival_airport, scheduled_departure, scheduled_arrival, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'SCHEDULED')
      ON DUPLICATE KEY UPDATE
        flight_number = VALUES(flight_number),
        flight_date = VALUES(flight_date),
        departure_airport = VALUES(departure_airport),
        arrival_airport = VALUES(arrival_airport),
        scheduled_departure = VALUES(scheduled_departure),
        scheduled_arrival = VALUES(scheduled_arrival)
    `, [bookingId, flightNumber, flightDate, departureAirport || null, arrivalAirport || null, scheduledDeparture || null, scheduledArrival || null]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Add flight tracking error:', error);
    return NextResponse.json({ error: 'Failed to add flight tracking' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, estimatedArrival, actualArrival, delayMinutes, delayReason, terminal, gate, baggageClaim, trackingSource } = body;

    if (!id) {
      return NextResponse.json({ error: 'Flight tracking ID required' }, { status: 400 });
    }

    await query(`
      UPDATE flight_tracking SET
        status = COALESCE(?, status),
        estimated_arrival = COALESCE(?, estimated_arrival),
        actual_arrival = COALESCE(?, actual_arrival),
        delay_minutes = COALESCE(?, delay_minutes),
        delay_reason = COALESCE(?, delay_reason),
        arrival_terminal = COALESCE(?, arrival_terminal),
        arrival_gate = COALESCE(?, arrival_gate),
        baggage_claim = COALESCE(?, baggage_claim),
        tracking_source = COALESCE(?, tracking_source),
        last_checked = NOW()
      WHERE id = ?
    `, [status, estimatedArrival, actualArrival, delayMinutes, delayReason, terminal, gate, baggageClaim, trackingSource, id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update flight tracking error:', error);
    return NextResponse.json({ error: 'Failed to update flight tracking' }, { status: 500 });
  }
}
