import { NextRequest, NextResponse } from 'next/server';
import { query, insert, queryOne } from '@/lib/db';
import { authenticateAdmin } from '@/lib/admin-auth';

type VehicleType = 'SEDAN' | 'VAN' | 'MINIBUS' | 'BUS' | 'VIP';

interface TariffRow {
  id: number;
  supplier_id: number;
  route_id: number;
  vehicle_type: VehicleType;
  currency: string;
  base_price: number;
  price_per_pax: number | null;
  min_pax: number;
  max_pax: number | null;
  valid_from: Date | null;
  valid_to: Date | null;
  is_active: boolean;
  created_at: Date;
  // Supplier info via JOIN
  supplier_name: string;
  // Route info via JOIN
  airport_code: string;
  airport_name: string;
  zone_name: string;
  direction: string;
}

interface TariffCreateRequest {
  supplierId: number;
  routeId: number;
  vehicleType: VehicleType;
  currency: string;
  basePrice: number;
  pricePerPax?: number;
  minPax?: number;
  maxPax?: number;
  validFrom?: string;
  validTo?: string;
}

// GET /api/admin/tariffs - List all tariffs across suppliers
export async function GET(request: NextRequest) {
  // Authenticate admin
  const authResult = await authenticateAdmin(request);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const tariffs = await query<TariffRow>(
      `SELECT t.id, t.supplier_id, t.route_id, t.vehicle_type, t.currency,
              t.base_price, t.price_per_pax, t.min_pax, t.max_pax,
              t.valid_from, t.valid_to, t.is_active, t.created_at,
              s.name as supplier_name,
              a.code as airport_code, a.name as airport_name,
              z.name as zone_name, r.direction
       FROM tariffs t
       JOIN suppliers s ON s.id = t.supplier_id
       JOIN routes r ON r.id = t.route_id
       JOIN airports a ON a.id = r.airport_id
       JOIN zones z ON z.id = r.zone_id
       ORDER BY t.created_at DESC`
    );

    return NextResponse.json(
      tariffs.map((t) => ({
        id: t.id,
        supplierId: t.supplier_id,
        routeId: t.route_id,
        vehicleType: t.vehicle_type,
        currency: t.currency,
        basePrice: t.base_price,
        pricePerPax: t.price_per_pax,
        minPax: t.min_pax,
        maxPax: t.max_pax,
        validFrom: t.valid_from,
        validTo: t.valid_to,
        isActive: t.is_active,
        supplier: {
          id: t.supplier_id,
          name: t.supplier_name,
        },
        route: {
          id: t.route_id,
          airportCode: t.airport_code,
          airportName: t.airport_name,
          zoneName: t.zone_name,
          direction: t.direction,
        },
      }))
    );
  } catch (error) {
    console.error('Error fetching tariffs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tariffs' },
      { status: 500 }
    );
  }
}

// POST /api/admin/tariffs - Create tariff for any supplier
export async function POST(request: NextRequest) {
  // Authenticate admin
  const authResult = await authenticateAdmin(request);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const body: TariffCreateRequest = await request.json();

    // Validate required fields
    if (!body.supplierId || !body.routeId || !body.vehicleType || !body.currency || body.basePrice === undefined) {
      return NextResponse.json(
        { error: 'supplierId, routeId, vehicleType, currency, and basePrice are required' },
        { status: 400 }
      );
    }

    // Validate vehicle type
    const validTypes: VehicleType[] = ['SEDAN', 'VAN', 'MINIBUS', 'BUS', 'VIP'];
    if (!validTypes.includes(body.vehicleType)) {
      return NextResponse.json(
        { error: `Invalid vehicleType. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Verify supplier exists
    const supplier = await queryOne<{ id: number; name: string }>(
      `SELECT id, name FROM suppliers WHERE id = ?`,
      [body.supplierId]
    );
    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 400 }
      );
    }

    // Verify route exists
    const route = await queryOne<{ id: number }>(
      `SELECT id FROM routes WHERE id = ? AND is_active = TRUE`,
      [body.routeId]
    );
    if (!route) {
      return NextResponse.json(
        { error: 'Route not found or inactive' },
        { status: 400 }
      );
    }

    // Insert tariff
    const tariffId = await insert(
      `INSERT INTO tariffs (supplier_id, route_id, vehicle_type, currency, base_price,
                            price_per_pax, min_pax, max_pax, valid_from, valid_to, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        body.supplierId,
        body.routeId,
        body.vehicleType,
        body.currency.toUpperCase(),
        body.basePrice,
        body.pricePerPax || null,
        body.minPax || 1,
        body.maxPax || null,
        body.validFrom || null,
        body.validTo || null,
      ]
    );

    return NextResponse.json(
      {
        id: tariffId,
        supplierId: body.supplierId,
        routeId: body.routeId,
        vehicleType: body.vehicleType,
        currency: body.currency.toUpperCase(),
        basePrice: body.basePrice,
        pricePerPax: body.pricePerPax || null,
        minPax: body.minPax || 1,
        maxPax: body.maxPax || null,
        validFrom: body.validFrom || null,
        validTo: body.validTo || null,
        isActive: true,
        supplier: {
          id: supplier.id,
          name: supplier.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating tariff:', error);
    return NextResponse.json(
      { error: 'Failed to create tariff' },
      { status: 500 }
    );
  }
}
