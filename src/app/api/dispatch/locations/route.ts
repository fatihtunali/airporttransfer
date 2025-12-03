import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface DriverLocationRow {
  id: number;
  driver_id: number;
  driver_name: string;
  driver_phone: string;
  supplier_name: string;
  latitude: number;
  longitude: number;
  heading: number | null;
  speed: number | null;
  accuracy: number | null;
  battery_level: number | null;
  status: string;
  current_ride_id: number | null;
  booking_code: string | null;
  updated_at: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  let whereClause = 'dl.updated_at > DATE_SUB(NOW(), INTERVAL 30 MINUTE)';
  const params: string[] = [];
  if (status && status !== 'all') {
    whereClause += ' AND dl.status = ?';
    params.push(status);
  }

  try {
    const locations = await query<DriverLocationRow>(`
      SELECT
        dl.id,
        dl.driver_id,
        d.full_name as driver_name,
        d.phone as driver_phone,
        s.name as supplier_name,
        dl.latitude,
        dl.longitude,
        dl.heading,
        dl.speed,
        dl.accuracy,
        dl.battery_level,
        dl.status,
        r.id as current_ride_id,
        b.public_code as booking_code,
        dl.updated_at
      FROM driver_locations dl
      JOIN drivers d ON d.id = dl.driver_id
      LEFT JOIN suppliers s ON s.id = d.supplier_id
      LEFT JOIN rides r ON r.driver_id = dl.driver_id AND r.status IN ('ON_WAY', 'AT_PICKUP', 'IN_RIDE')
      LEFT JOIN bookings b ON b.id = r.booking_id
      WHERE ${whereClause}
      ORDER BY dl.updated_at DESC
    `, params);

    return NextResponse.json({
      drivers: locations.map((loc) => ({
        id: loc.id,
        driverId: loc.driver_id,
        name: loc.driver_name,
        phone: loc.driver_phone,
        supplier: loc.supplier_name,
        location: {
          lat: loc.latitude,
          lng: loc.longitude,
          heading: loc.heading,
          speed: loc.speed,
          accuracy: loc.accuracy,
          batteryLevel: loc.battery_level,
        },
        status: loc.status,
        currentRideId: loc.current_ride_id,
        bookingCode: loc.booking_code,
        lastUpdated: loc.updated_at,
      })),
    });
  } catch (error) {
    console.error('Driver locations error:', error);
    return NextResponse.json({ drivers: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { driverId, latitude, longitude, heading, speed, accuracy, batteryLevel, status } = body;

    if (!driverId || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Upsert driver location
    await query(`
      INSERT INTO driver_locations (driver_id, latitude, longitude, heading, speed, accuracy, battery_level, status, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        latitude = VALUES(latitude),
        longitude = VALUES(longitude),
        heading = VALUES(heading),
        speed = VALUES(speed),
        accuracy = VALUES(accuracy),
        battery_level = VALUES(battery_level),
        status = COALESCE(VALUES(status), status),
        updated_at = NOW()
    `, [driverId, latitude, longitude, heading || null, speed || null, accuracy || null, batteryLevel || null, status || 'ONLINE']);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update location error:', error);
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
  }
}
