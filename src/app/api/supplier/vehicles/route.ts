import { NextRequest, NextResponse } from 'next/server';
import { query, insert } from '@/lib/db';
import { authenticateSupplier, canManageFleet } from '@/lib/supplier-auth';

type VehicleType = 'SEDAN' | 'VAN' | 'MINIBUS' | 'BUS' | 'VIP';

interface VehicleRow {
  id: number;
  supplier_id: number;
  plate_number: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  color: string | null;
  seat_count: number;
  luggage_count: number;
  vehicle_type: VehicleType;
  features: string | null;
  images: string | null;
  is_active: boolean;
  created_at: Date;
}

interface VehicleCreateRequest {
  plateNumber: string;
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  seatCount: number;
  luggageCount?: number;
  vehicleType: VehicleType;
  features?: string[];
  images?: string[];
}

// GET /api/supplier/vehicles - List vehicles for current supplier
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
    // Get pagination params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const offset = (page - 1) * pageSize;

    // Get vehicles for supplier
    const vehicles = await query<VehicleRow>(
      `SELECT id, supplier_id, plate_number, brand, model, year, color,
              seat_count, luggage_count, vehicle_type, features, images,
              is_active, created_at
       FROM vehicles
       WHERE supplier_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [payload.supplierId, pageSize, offset]
    );

    // Get total count
    const countResult = await query<{ total: number }>(
      `SELECT COUNT(*) as total FROM vehicles WHERE supplier_id = ?`,
      [payload.supplierId]
    );

    const total = countResult[0]?.total || 0;

    return NextResponse.json({
      items: vehicles.map((v) => ({
        id: v.id,
        supplierId: v.supplier_id,
        plateNumber: v.plate_number,
        brand: v.brand,
        model: v.model,
        year: v.year,
        color: v.color,
        seatCount: v.seat_count,
        luggageCount: v.luggage_count,
        vehicleType: v.vehicle_type,
        features: v.features ? JSON.parse(v.features) : [],
        images: v.images ? JSON.parse(v.images) : [],
        isActive: v.is_active,
      })),
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vehicles' },
      { status: 500 }
    );
  }
}

// POST /api/supplier/vehicles - Create new vehicle for current supplier
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
    const body: VehicleCreateRequest = await request.json();

    // Validate required fields
    if (!body.plateNumber || !body.vehicleType || !body.seatCount) {
      return NextResponse.json(
        { error: 'plateNumber, vehicleType, and seatCount are required' },
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

    // Insert vehicle
    const vehicleId = await insert(
      `INSERT INTO vehicles (supplier_id, plate_number, brand, model, year, color,
                             seat_count, luggage_count, vehicle_type, features, images, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        payload.supplierId,
        body.plateNumber.toUpperCase(),
        body.brand || null,
        body.model || null,
        body.year || null,
        body.color || null,
        body.seatCount,
        body.luggageCount || 0,
        body.vehicleType,
        body.features ? JSON.stringify(body.features) : null,
        body.images ? JSON.stringify(body.images) : null,
      ]
    );

    return NextResponse.json(
      {
        id: vehicleId,
        supplierId: payload.supplierId,
        plateNumber: body.plateNumber.toUpperCase(),
        brand: body.brand || null,
        model: body.model || null,
        year: body.year || null,
        color: body.color || null,
        seatCount: body.seatCount,
        luggageCount: body.luggageCount || 0,
        vehicleType: body.vehicleType,
        features: body.features || [],
        images: body.images || [],
        isActive: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating vehicle:', error);
    return NextResponse.json(
      { error: 'Failed to create vehicle' },
      { status: 500 }
    );
  }
}
