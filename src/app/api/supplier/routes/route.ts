import { NextRequest, NextResponse } from 'next/server';
import { query, insert } from '@/lib/db';
import { authenticateSupplier } from '@/lib/supplier-auth';

interface SupplierRoute {
  id: number;
  supplier_id: number;
  airport_id: number;
  zone_id: number | null;
  destination_name: string | null;
  destination_address: string | null;
  distance_km: number | null;
  duration_min: number | null;
  direction: string;
  is_active: number;
  airport_code: string;
  airport_name: string;
  airport_city: string;
  zone_name: string | null;
  zone_city: string | null;
}

// GET /api/supplier/routes - Get supplier's own routes
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateSupplier(request);
    if (!authResult.success) {
      return authResult.response;
    }
    const supplierId = authResult.payload.supplierId;

    // Get supplier's own routes
    const routes = await query<SupplierRoute>(
      `SELECT
        sr.id,
        sr.supplier_id,
        sr.airport_id,
        sr.zone_id,
        sr.destination_name,
        sr.destination_address,
        sr.distance_km,
        sr.duration_min,
        sr.direction,
        sr.is_active,
        a.code as airport_code,
        a.name as airport_name,
        a.city as airport_city,
        z.name as zone_name,
        z.city as zone_city
      FROM supplier_routes sr
      INNER JOIN airports a ON sr.airport_id = a.id
      LEFT JOIN zones z ON sr.zone_id = z.id
      WHERE sr.supplier_id = ?
        AND sr.is_active = 1
      ORDER BY a.code, COALESCE(z.name, sr.destination_name)`,
      [supplierId]
    );

    return NextResponse.json(
      routes.map(r => ({
        id: r.id,
        airportId: r.airport_id,
        zoneId: r.zone_id,
        destinationName: r.destination_name,
        destinationAddress: r.destination_address,
        direction: r.direction,
        distanceKm: r.distance_km,
        durationMin: r.duration_min,
        airportCode: r.airport_code,
        airportName: r.airport_name,
        airportCity: r.airport_city,
        zoneName: r.zone_name || r.destination_name,
        zoneCity: r.zone_city,
        isActive: r.is_active === 1,
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

// POST /api/supplier/routes - Create a new route
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateSupplier(request);
    if (!authResult.success) {
      return authResult.response;
    }
    const supplierId = authResult.payload.supplierId;

    const body = await request.json();
    const { airportId, zoneId, destinationName, destinationAddress, distanceKm, durationMin, direction } = body;

    if (!airportId) {
      return NextResponse.json({ error: 'Airport is required' }, { status: 400 });
    }

    if (!zoneId && !destinationName) {
      return NextResponse.json({ error: 'Zone or destination name is required' }, { status: 400 });
    }

    // Check if supplier has this airport in their service zones
    const serviceZone = await query<{ id: number }>(
      'SELECT id FROM supplier_service_zones WHERE supplier_id = ? AND airport_id = ? AND is_active = 1',
      [supplierId, airportId]
    );

    if (serviceZone.length === 0) {
      return NextResponse.json(
        { error: 'You must add this airport to your service zones first' },
        { status: 400 }
      );
    }

    // Check for duplicate route
    const existing = await query<{ id: number }>(
      `SELECT id FROM supplier_routes
       WHERE supplier_id = ? AND airport_id = ?
       AND (zone_id = ? OR (zone_id IS NULL AND destination_name = ?))`,
      [supplierId, airportId, zoneId || null, destinationName || null]
    );

    if (existing.length > 0) {
      return NextResponse.json({ error: 'This route already exists' }, { status: 400 });
    }

    const routeId = await insert(
      `INSERT INTO supplier_routes
       (supplier_id, airport_id, zone_id, destination_name, destination_address, distance_km, duration_min, direction)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        supplierId,
        airportId,
        zoneId || null,
        destinationName || null,
        destinationAddress || null,
        distanceKm || null,
        durationMin || null,
        direction || 'BOTH'
      ]
    );

    return NextResponse.json({ id: routeId, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating supplier route:', error);
    return NextResponse.json(
      { error: 'Failed to create route' },
      { status: 500 }
    );
  }
}
