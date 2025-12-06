import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authenticateSupplier } from '@/lib/supplier-auth';

interface SystemRoute {
  id: number;
  airport_id: number;
  zone_id: number;
  direction: string;
  is_active: boolean;
  airport_code: string;
  airport_name: string;
  zone_name: string;
}

// GET /api/supplier/routes/for-pricing - Get system routes available for pricing
// Returns routes from the `routes` table that match supplier's service zones
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateSupplier(request);
    if (!authResult.success) {
      return authResult.response;
    }

    // Get all active system routes
    const routes = await query<SystemRoute>(
      `SELECT DISTINCT
        r.id,
        r.airport_id,
        r.zone_id,
        r.direction,
        r.is_active,
        a.code as airport_code,
        a.name as airport_name,
        z.name as zone_name
      FROM routes r
      INNER JOIN airports a ON r.airport_id = a.id
      INNER JOIN zones z ON r.zone_id = z.id
      WHERE r.is_active = TRUE
      ORDER BY a.code, z.name`,
      []
    );

    return NextResponse.json(
      routes.map(r => ({
        id: r.id,
        airportId: r.airport_id,
        zoneId: r.zone_id,
        direction: r.direction,
        airportCode: r.airport_code,
        airportName: r.airport_name,
        zoneName: r.zone_name,
        isActive: r.is_active,
      }))
    );
  } catch (error) {
    console.error('Error fetching routes for pricing:', error);
    return NextResponse.json(
      { error: 'Failed to fetch routes' },
      { status: 500 }
    );
  }
}
