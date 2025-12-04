import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { authenticateSupplier, canManageFleet } from '@/lib/supplier-auth';

interface DriverRow {
  id: number;
  supplier_id: number;
  user_id: number | null;
  full_name: string;
  phone: string | null;
  email: string | null;
  license_number: string | null;
  license_expiry: Date | null;
  photo_url: string | null;
  languages: string | null;
  is_active: boolean;
  rating_avg: number;
  rating_count: number;
  created_at: Date;
}

interface DriverUpdateRequest {
  fullName?: string;
  phone?: string | null;
  email?: string | null;
  licenseNumber?: string | null;
  licenseExpiry?: string | null;
  photoUrl?: string | null;
  languages?: string[];
  isActive?: boolean;
}

// GET /api/supplier/drivers/[driverId] - Get single driver
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ driverId: string }> }
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
    const { driverId } = await params;
    const id = parseInt(driverId, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid driver ID' }, { status: 400 });
    }

    const driver = await queryOne<DriverRow>(
      `SELECT * FROM drivers WHERE id = ? AND supplier_id = ?`,
      [id, payload.supplierId]
    );

    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: driver.id,
      supplierId: driver.supplier_id,
      userId: driver.user_id,
      fullName: driver.full_name,
      phone: driver.phone,
      email: driver.email,
      licenseNumber: driver.license_number,
      licenseExpiry: driver.license_expiry,
      photoUrl: driver.photo_url,
      languages: driver.languages ? JSON.parse(driver.languages) : [],
      isActive: driver.is_active,
      ratingAvg: driver.rating_avg,
      ratingCount: driver.rating_count,
      createdAt: driver.created_at,
    });
  } catch (error) {
    console.error('Error fetching driver:', error);
    return NextResponse.json({ error: 'Failed to fetch driver' }, { status: 500 });
  }
}

// PUT /api/supplier/drivers/[driverId] - Update driver
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ driverId: string }> }
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
    const { driverId } = await params;
    const id = parseInt(driverId, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid driver ID' }, { status: 400 });
    }

    const existingDriver = await queryOne<{ id: number }>(
      `SELECT id FROM drivers WHERE id = ? AND supplier_id = ?`,
      [id, payload.supplierId]
    );

    if (!existingDriver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    const body: DriverUpdateRequest = await request.json();

    const updates: string[] = [];
    const values: (string | number | boolean | null)[] = [];

    if (body.fullName !== undefined) {
      updates.push('full_name = ?');
      values.push(body.fullName);
    }
    if (body.phone !== undefined) {
      updates.push('phone = ?');
      values.push(body.phone);
    }
    if (body.email !== undefined) {
      updates.push('email = ?');
      values.push(body.email);
    }
    if (body.licenseNumber !== undefined) {
      updates.push('license_number = ?');
      values.push(body.licenseNumber);
    }
    if (body.licenseExpiry !== undefined) {
      updates.push('license_expiry = ?');
      values.push(body.licenseExpiry);
    }
    if (body.photoUrl !== undefined) {
      updates.push('photo_url = ?');
      values.push(body.photoUrl);
    }
    if (body.languages !== undefined) {
      updates.push('languages = ?');
      values.push(JSON.stringify(body.languages));
    }
    if (body.isActive !== undefined) {
      updates.push('is_active = ?');
      values.push(body.isActive);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(id);

    await query(`UPDATE drivers SET ${updates.join(', ')} WHERE id = ?`, values);

    const updatedDriver = await queryOne<DriverRow>(
      `SELECT * FROM drivers WHERE id = ?`,
      [id]
    );

    return NextResponse.json({
      id: updatedDriver!.id,
      supplierId: updatedDriver!.supplier_id,
      userId: updatedDriver!.user_id,
      fullName: updatedDriver!.full_name,
      phone: updatedDriver!.phone,
      email: updatedDriver!.email,
      licenseNumber: updatedDriver!.license_number,
      licenseExpiry: updatedDriver!.license_expiry,
      photoUrl: updatedDriver!.photo_url,
      languages: updatedDriver!.languages ? JSON.parse(updatedDriver!.languages) : [],
      isActive: updatedDriver!.is_active,
      ratingAvg: updatedDriver!.rating_avg,
      ratingCount: updatedDriver!.rating_count,
    });
  } catch (error) {
    console.error('Error updating driver:', error);
    return NextResponse.json({ error: 'Failed to update driver' }, { status: 500 });
  }
}

// DELETE /api/supplier/drivers/[driverId] - Delete driver
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ driverId: string }> }
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
    const { driverId } = await params;
    const id = parseInt(driverId, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid driver ID' }, { status: 400 });
    }

    const existingDriver = await queryOne<{ id: number }>(
      `SELECT id FROM drivers WHERE id = ? AND supplier_id = ?`,
      [id, payload.supplierId]
    );

    if (!existingDriver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    // Check for active rides with this driver
    const activeRides = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM rides WHERE driver_id = ? AND status IN ('ASSIGNED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS')`,
      [id]
    );

    if (activeRides && activeRides.count > 0) {
      return NextResponse.json(
        { error: `Cannot delete driver. They have ${activeRides.count} active ride(s). Deactivate instead.` },
        { status: 400 }
      );
    }

    await query(`DELETE FROM drivers WHERE id = ?`, [id]);

    return NextResponse.json({ success: true, message: 'Driver deleted successfully' });
  } catch (error) {
    console.error('Error deleting driver:', error);
    return NextResponse.json({ error: 'Failed to delete driver' }, { status: 500 });
  }
}
