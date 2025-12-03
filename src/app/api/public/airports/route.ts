import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface Airport {
  id: number;
  code: string;
  name: string;
  city: string;
  country: string;
  timezone: string;
  isActive: boolean;
}

// GET /api/public/airports - List active airports
export async function GET() {
  try {
    const airports = await query<{
      id: number;
      code: string;
      name: string;
      city: string;
      country: string;
      timezone: string;
      is_active: boolean;
    }>(
      `SELECT id, code, name, city, country, timezone, is_active
       FROM airports
       WHERE is_active = TRUE
       ORDER BY country, city, name`
    );

    // Transform to camelCase for API response
    const response: Airport[] = airports.map((a) => ({
      id: a.id,
      code: a.code,
      name: a.name,
      city: a.city,
      country: a.country,
      timezone: a.timezone,
      isActive: a.is_active,
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching airports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch airports' },
      { status: 500 }
    );
  }
}
