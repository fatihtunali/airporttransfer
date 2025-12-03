import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface Zone {
  id: number;
  name: string;
  city: string;
  country: string;
  isActive: boolean;
}

// GET /api/public/zones - List zones, optionally filtered by airport
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const airportId = searchParams.get('airportId');

    let zones;

    if (airportId) {
      // Get zones that have routes from this airport
      zones = await query<{
        id: number;
        name: string;
        city: string;
        country: string;
        is_active: boolean;
        is_popular: boolean;
      }>(
        `SELECT DISTINCT z.id, z.name, z.city, z.country, z.is_active, z.is_popular
         FROM zones z
         INNER JOIN routes r ON r.zone_id = z.id
         WHERE r.airport_id = ?
           AND z.is_active = TRUE
           AND r.is_active = TRUE
         ORDER BY z.is_popular DESC, z.name`,
        [airportId]
      );
    } else {
      // Get all active zones
      zones = await query<{
        id: number;
        name: string;
        city: string;
        country: string;
        is_active: boolean;
      }>(
        `SELECT id, name, city, country, is_active
         FROM zones
         WHERE is_active = TRUE
         ORDER BY is_popular DESC, country, city, name`
      );
    }

    // Transform to camelCase for API response
    const response: Zone[] = zones.map((z) => ({
      id: z.id,
      name: z.name,
      city: z.city,
      country: z.country,
      isActive: z.is_active,
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching zones:', error);
    return NextResponse.json(
      { error: 'Failed to fetch zones' },
      { status: 500 }
    );
  }
}
