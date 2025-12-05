import { NextRequest, NextResponse } from 'next/server';
import { query, insert } from '@/lib/db';
import { authenticateSupplier } from '@/lib/supplier-auth';

interface ServiceZone {
  id: number;
  supplier_id: number;
  airport_id: number;
  max_distance_km: number;
  is_active: number;
  airport_code: string;
  airport_name: string;
  airport_city: string;
  airport_country: string;
}

// GET - List supplier's service zones
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateSupplier(request);
    if (!authResult.success) {
      return authResult.response;
    }
    const supplierId = authResult.payload.supplierId;

    const zones = await query<ServiceZone>(`
      SELECT
        sz.id,
        sz.supplier_id,
        sz.airport_id,
        sz.max_distance_km,
        sz.is_active,
        a.code as airport_code,
        a.name as airport_name,
        a.city as airport_city,
        a.country as airport_country
      FROM supplier_service_zones sz
      JOIN airports a ON sz.airport_id = a.id
      WHERE sz.supplier_id = ?
      ORDER BY a.country, a.city, a.code
    `, [supplierId]);

    return NextResponse.json(
      zones.map((z) => ({
        id: z.id,
        airportId: z.airport_id,
        airportCode: z.airport_code,
        airportName: z.airport_name,
        airportCity: z.airport_city,
        airportCountry: z.airport_country,
        maxDistanceKm: z.max_distance_km,
        isActive: z.is_active === 1,
      }))
    );
  } catch (error) {
    console.error('Error fetching supplier zones:', error);
    return NextResponse.json(
      { error: 'Failed to fetch zones' },
      { status: 500 }
    );
  }
}

// POST - Add new service zones
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateSupplier(request);
    if (!authResult.success) {
      return authResult.response;
    }
    const supplierId = authResult.payload.supplierId;

    const body = await request.json();
    const { airportIds, maxDistanceKm } = body;

    if (!airportIds || !Array.isArray(airportIds) || airportIds.length === 0) {
      return NextResponse.json(
        { error: 'Airport IDs are required' },
        { status: 400 }
      );
    }

    const distance = maxDistanceKm || 100;
    const addedZones: number[] = [];

    for (const airportId of airportIds) {
      // Check if already exists
      const existing = await query<{ id: number }>(
        'SELECT id FROM supplier_service_zones WHERE supplier_id = ? AND airport_id = ?',
        [supplierId, airportId]
      );

      if (existing.length === 0) {
        const id = await insert(
          `INSERT INTO supplier_service_zones (supplier_id, airport_id, max_distance_km, is_active)
           VALUES (?, ?, ?, 1)`,
          [supplierId, airportId, distance]
        );
        addedZones.push(id);
      }
    }

    return NextResponse.json({
      success: true,
      added: addedZones.length,
    });
  } catch (error) {
    console.error('Error adding supplier zones:', error);
    return NextResponse.json(
      { error: 'Failed to add zones' },
      { status: 500 }
    );
  }
}
