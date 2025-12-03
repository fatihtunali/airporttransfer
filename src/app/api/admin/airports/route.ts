import { NextRequest, NextResponse } from 'next/server';
import { query, insert } from '@/lib/db';
import { authenticateAdmin } from '@/lib/admin-auth';

interface AirportRow {
  id: number;
  code: string;
  name: string;
  name_local: string | null;
  city: string | null;
  country: string | null;
  country_code: string | null;
  timezone: string | null;
  latitude: number | null;
  longitude: number | null;
  terminals: string | null;
  is_active: boolean;
  created_at: Date;
}

interface AirportCreateRequest {
  code: string;
  name: string;
  nameLocal?: string;
  city?: string;
  country?: string;
  countryCode?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
  terminals?: string[];
}

// GET /api/admin/airports - List all airports (including inactive)
export async function GET(request: NextRequest) {
  // Authenticate admin
  const authResult = await authenticateAdmin(request);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const airports = await query<AirportRow>(
      `SELECT id, code, name, name_local, city, country, country_code,
              timezone, latitude, longitude, terminals, is_active, created_at
       FROM airports
       ORDER BY country, city, name`
    );

    return NextResponse.json(
      airports.map((a) => ({
        id: a.id,
        code: a.code,
        name: a.name,
        nameLocal: a.name_local,
        city: a.city,
        country: a.country,
        countryCode: a.country_code,
        timezone: a.timezone,
        latitude: a.latitude,
        longitude: a.longitude,
        terminals: a.terminals ? JSON.parse(a.terminals) : [],
        isActive: a.is_active,
      }))
    );
  } catch (error) {
    console.error('Error fetching airports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch airports' },
      { status: 500 }
    );
  }
}

// POST /api/admin/airports - Create airport
export async function POST(request: NextRequest) {
  // Authenticate admin
  const authResult = await authenticateAdmin(request);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const body: AirportCreateRequest = await request.json();

    // Validate required fields
    if (!body.code || !body.name) {
      return NextResponse.json(
        { error: 'code and name are required' },
        { status: 400 }
      );
    }

    // Insert airport
    const airportId = await insert(
      `INSERT INTO airports (code, name, name_local, city, country, country_code,
                             timezone, latitude, longitude, terminals, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        body.code.toUpperCase(),
        body.name,
        body.nameLocal || null,
        body.city || null,
        body.country || null,
        body.countryCode || null,
        body.timezone || null,
        body.latitude || null,
        body.longitude || null,
        body.terminals ? JSON.stringify(body.terminals) : null,
      ]
    );

    return NextResponse.json(
      {
        id: airportId,
        code: body.code.toUpperCase(),
        name: body.name,
        nameLocal: body.nameLocal || null,
        city: body.city || null,
        country: body.country || null,
        countryCode: body.countryCode || null,
        timezone: body.timezone || null,
        latitude: body.latitude || null,
        longitude: body.longitude || null,
        terminals: body.terminals || [],
        isActive: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating airport:', error);
    return NextResponse.json(
      { error: 'Failed to create airport' },
      { status: 500 }
    );
  }
}
