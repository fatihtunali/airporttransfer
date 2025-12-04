import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authenticateSupplier } from '@/lib/supplier-auth';

// GET /api/supplier/routes - Get all active routes available for tariff creation
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateSupplier(request);
    if (!authResult.success) {
      return authResult.response;
    }

    // Get all active routes with airport and zone info
    const routes = await query<{
      id: number;
      airport_id: number;
      zone_id: number;
      direction: string;
      distance_km: number | null;
      duration_min: number | null;
      airport_code: string;
      airport_name: string;
      airport_city: string;
      zone_name: string;
      zone_city: string;
    }>(
      `SELECT
        r.id,
        r.airport_id,
        r.zone_id,
        r.direction,
        r.distance_km,
        r.duration_min,
        a.code as airport_code,
        a.name as airport_name,
        a.city as airport_city,
        z.name as zone_name,
        z.city as zone_city
      FROM routes r
      INNER JOIN airports a ON r.airport_id = a.id
      INNER JOIN zones z ON r.zone_id = z.id
      WHERE r.is_active = TRUE
        AND a.is_active = TRUE
        AND z.is_active = TRUE
      ORDER BY a.code, z.name`,
      []
    );

    return NextResponse.json(
      routes.map(r => ({
        id: r.id,
        airportId: r.airport_id,
        zoneId: r.zone_id,
        direction: r.direction,
        distanceKm: r.distance_km,
        durationMin: r.duration_min,
        airportCode: r.airport_code,
        airportName: r.airport_name,
        airportCity: r.airport_city,
        zoneName: r.zone_name,
        zoneCity: r.zone_city,
      }))
    );
  } catch (error) {
    console.error('Error fetching supplier routes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch routes' },
      { status: 500 }
    );
  }
}
