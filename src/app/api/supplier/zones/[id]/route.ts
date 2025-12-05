import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { authenticateSupplier } from '@/lib/supplier-auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT - Update a service zone
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await authenticateSupplier(request);
    if (!authResult.success) {
      return authResult.response;
    }
    const supplierId = authResult.payload.supplierId;

    const { id } = await params;
    const zoneId = parseInt(id);
    const body = await request.json();
    const { maxDistanceKm, isActive } = body;

    // Verify ownership
    const existing = await query<{ id: number }>(
      'SELECT id FROM supplier_service_zones WHERE id = ? AND supplier_id = ?',
      [zoneId, supplierId]
    );

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Zone not found' }, { status: 404 });
    }

    // Build update query
    const updates: string[] = [];
    const values: (number | string)[] = [];

    if (maxDistanceKm !== undefined) {
      updates.push('max_distance_km = ?');
      values.push(maxDistanceKm);
    }

    if (isActive !== undefined) {
      updates.push('is_active = ?');
      values.push(isActive ? 1 : 0);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(zoneId);

    await execute(
      `UPDATE supplier_service_zones SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating supplier zone:', error);
    return NextResponse.json(
      { error: 'Failed to update zone' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a service zone
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await authenticateSupplier(request);
    if (!authResult.success) {
      return authResult.response;
    }
    const supplierId = authResult.payload.supplierId;

    const { id } = await params;
    const zoneId = parseInt(id);

    // Verify ownership
    const existing = await query<{ id: number }>(
      'SELECT id FROM supplier_service_zones WHERE id = ? AND supplier_id = ?',
      [zoneId, supplierId]
    );

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Zone not found' }, { status: 404 });
    }

    await execute('DELETE FROM supplier_service_zones WHERE id = ?', [zoneId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting supplier zone:', error);
    return NextResponse.json(
      { error: 'Failed to delete zone' },
      { status: 500 }
    );
  }
}
