import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
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

interface VehicleUpdateRequest {
  plateNumber?: string;
  brand?: string | null;
  model?: string | null;
  year?: number | null;
  color?: string | null;
  seatCount?: number;
  luggageCount?: number;
  vehicleType?: VehicleType;
  features?: string[];
  images?: string[];
  isActive?: boolean;
}

// GET /api/supplier/vehicles/[vehicleId] - Get single vehicle
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ vehicleId: string }> }
) {
  const authResult = await authenticateSupplier(request);
  if (!authResult.success) {
    return authResult.response;
  }

  const { payload } = authResult;

  if (!canManageFleet(payload.role)) {
    return NextResponse.json(
      { error: 'Access denied. Fleet management role required.' },
      { status: 403 }
    );
  }

  try {
    const { vehicleId } = await params;
    const id = parseInt(vehicleId, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid vehicle ID' }, { status: 400 });
    }

    const vehicle = await queryOne<VehicleRow>(
      `SELECT * FROM vehicles WHERE id = ? AND supplier_id = ?`,
      [id, payload.supplierId]
    );

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Safe JSON parse helper
    const safeParseJson = (str: string | null): string[] => {
      if (!str || !str.trim()) return [];
      try {
        return JSON.parse(str);
      } catch {
        return [];
      }
    };

    return NextResponse.json({
      id: vehicle.id,
      supplierId: vehicle.supplier_id,
      plateNumber: vehicle.plate_number,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      seatCount: vehicle.seat_count,
      luggageCount: vehicle.luggage_count,
      vehicleType: vehicle.vehicle_type,
      features: safeParseJson(vehicle.features),
      images: safeParseJson(vehicle.images),
      isActive: vehicle.is_active,
      createdAt: vehicle.created_at,
    });
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return NextResponse.json({ error: 'Failed to fetch vehicle' }, { status: 500 });
  }
}

// PUT /api/supplier/vehicles/[vehicleId] - Update vehicle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ vehicleId: string }> }
) {
  const authResult = await authenticateSupplier(request);
  if (!authResult.success) {
    return authResult.response;
  }

  const { payload } = authResult;

  if (!canManageFleet(payload.role)) {
    return NextResponse.json(
      { error: 'Access denied. Fleet management role required.' },
      { status: 403 }
    );
  }

  try {
    const { vehicleId } = await params;
    const id = parseInt(vehicleId, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid vehicle ID' }, { status: 400 });
    }

    const existingVehicle = await queryOne<{ id: number }>(
      `SELECT id FROM vehicles WHERE id = ? AND supplier_id = ?`,
      [id, payload.supplierId]
    );

    if (!existingVehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    const body: VehicleUpdateRequest = await request.json();

    const updates: string[] = [];
    const values: (string | number | boolean | null)[] = [];

    if (body.plateNumber !== undefined) {
      updates.push('plate_number = ?');
      values.push(body.plateNumber.toUpperCase());
    }
    if (body.brand !== undefined) {
      updates.push('brand = ?');
      values.push(body.brand);
    }
    if (body.model !== undefined) {
      updates.push('model = ?');
      values.push(body.model);
    }
    if (body.year !== undefined) {
      updates.push('year = ?');
      values.push(body.year);
    }
    if (body.color !== undefined) {
      updates.push('color = ?');
      values.push(body.color);
    }
    if (body.seatCount !== undefined) {
      updates.push('seat_count = ?');
      values.push(body.seatCount);
    }
    if (body.luggageCount !== undefined) {
      updates.push('luggage_count = ?');
      values.push(body.luggageCount);
    }
    if (body.vehicleType !== undefined) {
      const validTypes: VehicleType[] = ['SEDAN', 'VAN', 'MINIBUS', 'BUS', 'VIP'];
      if (!validTypes.includes(body.vehicleType)) {
        return NextResponse.json(
          { error: `Invalid vehicleType. Must be one of: ${validTypes.join(', ')}` },
          { status: 400 }
        );
      }
      updates.push('vehicle_type = ?');
      values.push(body.vehicleType);
    }
    if (body.features !== undefined) {
      updates.push('features = ?');
      values.push(JSON.stringify(body.features));
    }
    if (body.images !== undefined) {
      updates.push('images = ?');
      values.push(JSON.stringify(body.images));
    }
    if (body.isActive !== undefined) {
      updates.push('is_active = ?');
      values.push(body.isActive);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(id);

    await query(`UPDATE vehicles SET ${updates.join(', ')} WHERE id = ?`, values);

    const updatedVehicle = await queryOne<VehicleRow>(
      `SELECT * FROM vehicles WHERE id = ?`,
      [id]
    );

    // Safe JSON parse helper for response
    const safeParseJsonRes = (str: string | null): string[] => {
      if (!str || !str.trim()) return [];
      try {
        return JSON.parse(str);
      } catch {
        return [];
      }
    };

    return NextResponse.json({
      id: updatedVehicle!.id,
      supplierId: updatedVehicle!.supplier_id,
      plateNumber: updatedVehicle!.plate_number,
      brand: updatedVehicle!.brand,
      model: updatedVehicle!.model,
      year: updatedVehicle!.year,
      color: updatedVehicle!.color,
      seatCount: updatedVehicle!.seat_count,
      luggageCount: updatedVehicle!.luggage_count,
      vehicleType: updatedVehicle!.vehicle_type,
      features: safeParseJsonRes(updatedVehicle!.features),
      images: safeParseJsonRes(updatedVehicle!.images),
      isActive: updatedVehicle!.is_active,
    });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    return NextResponse.json({ error: 'Failed to update vehicle' }, { status: 500 });
  }
}

// DELETE /api/supplier/vehicles/[vehicleId] - Delete vehicle
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ vehicleId: string }> }
) {
  const authResult = await authenticateSupplier(request);
  if (!authResult.success) {
    return authResult.response;
  }

  const { payload } = authResult;

  if (!canManageFleet(payload.role)) {
    return NextResponse.json(
      { error: 'Access denied. Fleet management role required.' },
      { status: 403 }
    );
  }

  try {
    const { vehicleId } = await params;
    const id = parseInt(vehicleId, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid vehicle ID' }, { status: 400 });
    }

    const existingVehicle = await queryOne<{ id: number }>(
      `SELECT id FROM vehicles WHERE id = ? AND supplier_id = ?`,
      [id, payload.supplierId]
    );

    if (!existingVehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Check for active rides with this vehicle
    const activeRides = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM rides WHERE vehicle_id = ? AND status IN ('ASSIGNED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS')`,
      [id]
    );

    if (activeRides && activeRides.count > 0) {
      return NextResponse.json(
        { error: `Cannot delete vehicle. It has ${activeRides.count} active ride(s). Deactivate instead.` },
        { status: 400 }
      );
    }

    await query(`DELETE FROM vehicles WHERE id = ?`, [id]);

    return NextResponse.json({ success: true, message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return NextResponse.json({ error: 'Failed to delete vehicle' }, { status: 500 });
  }
}
