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
  route_count?: number;
}

interface SupplierDestination {
  destination_name: string;
  destination_address: string | null;
  airport_city: string;
  airport_country: string;
  supplier_count: number;
  route_count: number;
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
    // Get official zones with route count
    const zones = await query<ZoneRow>(
      `SELECT z.id, z.name, z.name_local, z.city, z.country, z.country_code, z.zone_type,
              z.parent_zone_id, z.latitude, z.longitude, z.is_popular, z.is_active, z.created_at,
              COUNT(DISTINCT r.id) as route_count
       FROM zones z
       LEFT JOIN routes r ON r.zone_id = z.id AND r.is_active = TRUE
       GROUP BY z.id
       ORDER BY z.country, z.city, z.name`
    );

    // Get supplier custom destinations (not linked to official zones)
    const supplierDestinations = await query<SupplierDestination>(
      `SELECT
         sr.destination_name,
         sr.destination_address,
         a.city as airport_city,
         a.country as airport_country,
         COUNT(DISTINCT sr.supplier_id) as supplier_count,
         COUNT(sr.id) as route_count
       FROM supplier_routes sr
       INNER JOIN airports a ON sr.airport_id = a.id
       WHERE sr.zone_id IS NULL
         AND sr.destination_name IS NOT NULL
         AND sr.is_active = 1
       GROUP BY sr.destination_name, sr.destination_address, a.city, a.country
       ORDER BY a.country, a.city, sr.destination_name`
    );

    return NextResponse.json({
      zones: zones.map((z) => ({
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
        routeCount: Number(z.route_count) || 0,
      })),
      supplierDestinations: supplierDestinations.map((d) => ({
        name: d.destination_name,
        address: d.destination_address,
        city: d.airport_city,
        country: d.airport_country,
        supplierCount: Number(d.supplier_count) || 0,
        routeCount: Number(d.route_count) || 0,
      })),
    });
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
