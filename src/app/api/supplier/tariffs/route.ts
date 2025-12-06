import { NextRequest, NextResponse } from 'next/server';
import { query, insert, queryOne } from '@/lib/db';
import { authenticateSupplier, canManageFleet } from '@/lib/supplier-auth';

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
  // Route info via JOIN
  airport_code?: string;
  airport_name?: string;
  zone_name?: string;
  direction?: string;
}

interface TariffCreateRequest {
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

// GET /api/supplier/tariffs - List tariffs for current supplier
export async function GET(request: NextRequest) {
  // Authenticate supplier
  const authResult = await authenticateSupplier(request);
  if (!authResult.success) {
    return authResult.response;
  }

  const { payload } = authResult;

  // Check role for fleet management
  if (!canManageFleet(payload.role)) {
    return NextResponse.json(
      { error: 'Access denied. Fleet management role required.' },
      { status: 403 }
    );
  }

  try {
    // Get pagination params - ensure integers for MySQL prepared statements
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10) || 20));
    const routeId = searchParams.get('routeId');
    const offset = (page - 1) * pageSize;

    // Build query
    let sql = `
      SELECT t.id, t.supplier_id, t.route_id, t.vehicle_type, t.currency,
             t.base_price, t.price_per_pax, t.min_pax, t.max_pax,
             t.valid_from, t.valid_to, t.is_active, t.created_at,
             a.code as airport_code, a.name as airport_name,
             z.name as zone_name, r.direction
      FROM tariffs t
      JOIN routes r ON r.id = t.route_id
      JOIN airports a ON a.id = r.airport_id
      JOIN zones z ON z.id = r.zone_id
      WHERE t.supplier_id = ?
    `;
    const params: (number | string)[] = [payload.supplierId];

    if (routeId) {
      sql += ` AND t.route_id = ?`;
      params.push(parseInt(routeId));
    }

    // LIMIT/OFFSET embedded directly as MySQL2 doesn't support them as bind params
    sql += ` ORDER BY t.created_at DESC LIMIT ${pageSize} OFFSET ${offset}`;

    const tariffs = await query<TariffRow>(sql, params);

    // Get total count
    let countSql = `SELECT COUNT(*) as total FROM tariffs WHERE supplier_id = ?`;
    const countParams: (number | string)[] = [payload.supplierId];
    if (routeId) {
      countSql += ` AND route_id = ?`;
      countParams.push(parseInt(routeId));
    }

    const countResult = await query<{ total: number }>(countSql, countParams);
    const total = countResult[0]?.total || 0;

    return NextResponse.json({
      items: tariffs.map((t) => ({
        id: t.id,
        supplierId: t.supplier_id,
        routeId: t.route_id,
        vehicleType: t.vehicle_type,
        currency: t.currency,
        basePrice: Number(t.base_price),
        pricePerPax: t.price_per_pax ? Number(t.price_per_pax) : null,
        minPax: t.min_pax,
        maxPax: t.max_pax,
        validFrom: t.valid_from,
        validTo: t.valid_to,
        isActive: t.is_active,
        // Flat fields for frontend
        airportCode: t.airport_code,
        airportName: t.airport_name,
        zoneName: t.zone_name,
        direction: t.direction,
      })),
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Error fetching tariffs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tariffs' },
      { status: 500 }
    );
  }
}

// POST /api/supplier/tariffs - Create new tariff for current supplier
export async function POST(request: NextRequest) {
  // Authenticate supplier
  const authResult = await authenticateSupplier(request);
  if (!authResult.success) {
    return authResult.response;
  }

  const { payload } = authResult;

  // Check role for fleet management
  if (!canManageFleet(payload.role)) {
    return NextResponse.json(
      { error: 'Access denied. Fleet management role required.' },
      { status: 403 }
    );
  }

  try {
    const body: TariffCreateRequest = await request.json();

    // Validate required fields
    if (!body.routeId || !body.vehicleType || !body.currency || body.basePrice === undefined) {
      return NextResponse.json(
        { error: 'routeId, vehicleType, currency, and basePrice are required' },
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

    // Verify system route exists and is active
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

    // Check if tariff already exists for this supplier/route/vehicle combination
    const existing = await queryOne<{ id: number }>(
      `SELECT id FROM tariffs WHERE supplier_id = ? AND route_id = ? AND vehicle_type = ?`,
      [payload.supplierId, body.routeId, body.vehicleType]
    );

    if (existing) {
      return NextResponse.json(
        { error: 'Tariff already exists for this route and vehicle type' },
        { status: 400 }
      );
    }

    // Insert tariff
    const tariffId = await insert(
      `INSERT INTO tariffs (supplier_id, route_id, vehicle_type, currency, base_price,
                            price_per_pax, min_pax, max_pax, valid_from, valid_to, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        payload.supplierId,
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
        supplierId: payload.supplierId,
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
