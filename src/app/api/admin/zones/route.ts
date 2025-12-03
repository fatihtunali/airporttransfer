import { NextRequest, NextResponse } from 'next/server';
import { query, insert } from '@/lib/db';
import { authenticateAdmin } from '@/lib/admin-auth';

interface ZoneRow {
  id: number;
  name: string;
  name_local: string | null;
  city: string | null;
  country: string | null;
  country_code: string | null;
  zone_type: string;
  parent_zone_id: number | null;
  latitude: number | null;
  longitude: number | null;
  is_popular: boolean;
  is_active: boolean;
  created_at: Date;
}

interface ZoneCreateRequest {
  name: string;
  nameLocal?: string;
  city?: string;
  country?: string;
  countryCode?: string;
  zoneType?: string;
  parentZoneId?: number;
  latitude?: number;
  longitude?: number;
  isPopular?: boolean;
}

// GET /api/admin/zones - List all zones (including inactive)
export async function GET(request: NextRequest) {
  // Authenticate admin
  const authResult = await authenticateAdmin(request);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const zones = await query<ZoneRow>(
      `SELECT id, name, name_local, city, country, country_code, zone_type,
              parent_zone_id, latitude, longitude, is_popular, is_active, created_at
       FROM zones
       ORDER BY country, city, name`
    );

    return NextResponse.json(
      zones.map((z) => ({
        id: z.id,
        name: z.name,
        nameLocal: z.name_local,
        city: z.city,
        country: z.country,
        countryCode: z.country_code,
        zoneType: z.zone_type,
        parentZoneId: z.parent_zone_id,
        latitude: z.latitude,
        longitude: z.longitude,
        isPopular: z.is_popular,
        isActive: z.is_active,
      }))
    );
  } catch (error) {
    console.error('Error fetching zones:', error);
    return NextResponse.json(
      { error: 'Failed to fetch zones' },
      { status: 500 }
    );
  }
}

// POST /api/admin/zones - Create zone
export async function POST(request: NextRequest) {
  // Authenticate admin
  const authResult = await authenticateAdmin(request);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const body: ZoneCreateRequest = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400 }
      );
    }

    // Insert zone
    const zoneId = await insert(
      `INSERT INTO zones (name, name_local, city, country, country_code, zone_type,
                          parent_zone_id, latitude, longitude, is_popular, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        body.name,
        body.nameLocal || null,
        body.city || null,
        body.country || null,
        body.countryCode || null,
        body.zoneType || 'DISTRICT',
        body.parentZoneId || null,
        body.latitude || null,
        body.longitude || null,
        body.isPopular || false,
      ]
    );

    return NextResponse.json(
      {
        id: zoneId,
        name: body.name,
        nameLocal: body.nameLocal || null,
        city: body.city || null,
        country: body.country || null,
        countryCode: body.countryCode || null,
        zoneType: body.zoneType || 'DISTRICT',
        parentZoneId: body.parentZoneId || null,
        latitude: body.latitude || null,
        longitude: body.longitude || null,
        isPopular: body.isPopular || false,
        isActive: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating zone:', error);
    return NextResponse.json(
      { error: 'Failed to create zone' },
      { status: 500 }
    );
  }
}
