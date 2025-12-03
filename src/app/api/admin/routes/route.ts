import { NextRequest, NextResponse } from 'next/server';
import { query, insert, queryOne } from '@/lib/db';
import { authenticateAdmin } from '@/lib/admin-auth';

type RouteDirection = 'FROM_AIRPORT' | 'TO_AIRPORT' | 'BOTH';

interface RouteRow {
  id: number;
  airport_id: number;
  zone_id: number;
  direction: RouteDirection;
  approx_distance_km: number | null;
  approx_duration_min: number | null;
  is_active: boolean;
  created_at: Date;
  // Airport info via JOIN
  airport_code: string;
  airport_name: string;
  // Zone info via JOIN
  zone_name: string;
  zone_city: string;
}

interface RouteCreateRequest {
  airportId: number;
  zoneId: number;
  direction: RouteDirection;
  approxDistanceKm?: number;
  approxDurationMin?: number;
}

// GET /api/admin/routes - List all routes
export async function GET(request: NextRequest) {
  // Authenticate admin
  const authResult = await authenticateAdmin(request);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const routes = await query<RouteRow>(
      `SELECT r.id, r.airport_id, r.zone_id, r.direction,
              r.approx_distance_km, r.approx_duration_min, r.is_active, r.created_at,
              a.code as airport_code, a.name as airport_name,
              z.name as zone_name, z.city as zone_city
       FROM routes r
       JOIN airports a ON a.id = r.airport_id
       JOIN zones z ON z.id = r.zone_id
       ORDER BY a.code, z.name`
    );

    return NextResponse.json(
      routes.map((r) => ({
        id: r.id,
        airportId: r.airport_id,
        zoneId: r.zone_id,
        direction: r.direction,
        approxDistanceKm: r.approx_distance_km,
        approxDurationMin: r.approx_duration_min,
        isActive: r.is_active,
        airport: {
          id: r.airport_id,
          code: r.airport_code,
          name: r.airport_name,
        },
        zone: {
          id: r.zone_id,
          name: r.zone_name,
          city: r.zone_city,
        },
      }))
    );
  } catch (error) {
    console.error('Error fetching routes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch routes' },
      { status: 500 }
    );
  }
}

// POST /api/admin/routes - Create route between airport and zone
export async function POST(request: NextRequest) {
  // Authenticate admin
  const authResult = await authenticateAdmin(request);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const body: RouteCreateRequest = await request.json();

    // Validate required fields
    if (!body.airportId || !body.zoneId || !body.direction) {
      return NextResponse.json(
        { error: 'airportId, zoneId, and direction are required' },
        { status: 400 }
      );
    }

    // Validate direction
    const validDirections: RouteDirection[] = ['FROM_AIRPORT', 'TO_AIRPORT', 'BOTH'];
    if (!validDirections.includes(body.direction)) {
      return NextResponse.json(
        { error: `Invalid direction. Must be one of: ${validDirections.join(', ')}` },
        { status: 400 }
      );
    }

    // Verify airport exists
    const airport = await queryOne<{ id: number; code: string; name: string }>(
      `SELECT id, code, name FROM airports WHERE id = ?`,
      [body.airportId]
    );
    if (!airport) {
      return NextResponse.json(
        { error: 'Airport not found' },
        { status: 400 }
      );
    }

    // Verify zone exists
    const zone = await queryOne<{ id: number; name: string; city: string }>(
      `SELECT id, name, city FROM zones WHERE id = ?`,
      [body.zoneId]
    );
    if (!zone) {
      return NextResponse.json(
        { error: 'Zone not found' },
        { status: 400 }
      );
    }

    // Insert route
    const routeId = await insert(
      `INSERT INTO routes (airport_id, zone_id, direction, approx_distance_km, approx_duration_min, is_active)
       VALUES (?, ?, ?, ?, ?, TRUE)`,
      [
        body.airportId,
        body.zoneId,
        body.direction,
        body.approxDistanceKm || null,
        body.approxDurationMin || null,
      ]
    );

    return NextResponse.json(
      {
        id: routeId,
        airportId: body.airportId,
        zoneId: body.zoneId,
        direction: body.direction,
        approxDistanceKm: body.approxDistanceKm || null,
        approxDurationMin: body.approxDurationMin || null,
        isActive: true,
        airport: {
          id: airport.id,
          code: airport.code,
          name: airport.name,
        },
        zone: {
          id: zone.id,
          name: zone.name,
          city: zone.city,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating route:', error);
    return NextResponse.json(
      { error: 'Failed to create route' },
      { status: 500 }
    );
  }
}
