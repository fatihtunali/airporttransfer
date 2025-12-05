import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { authenticateSupplier } from '@/lib/supplier-auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// DELETE - Remove a route
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await authenticateSupplier(request);
    if (!authResult.success) {
      return authResult.response;
    }
    const supplierId = authResult.payload.supplierId;

    const { id } = await params;
    const routeId = parseInt(id);

    // Verify ownership
    const existing = await query<{ id: number }>(
      'SELECT id FROM supplier_routes WHERE id = ? AND supplier_id = ?',
      [routeId, supplierId]
    );

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Route not found' }, { status: 404 });
    }

    // Delete associated tariffs first
    await execute('DELETE FROM supplier_tariffs WHERE route_id = ?', [routeId]);

    // Delete the route
    await execute('DELETE FROM supplier_routes WHERE id = ?', [routeId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting supplier route:', error);
    return NextResponse.json(
      { error: 'Failed to delete route' },
      { status: 500 }
    );
  }
}

// PUT - Update a route
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await authenticateSupplier(request);
    if (!authResult.success) {
      return authResult.response;
    }
    const supplierId = authResult.payload.supplierId;

    const { id } = await params;
    const routeId = parseInt(id);
    const body = await request.json();
    const { destinationAddress, distanceKm, durationMin, direction, isActive } = body;

    // Verify ownership
    const existing = await query<{ id: number }>(
      'SELECT id FROM supplier_routes WHERE id = ? AND supplier_id = ?',
      [routeId, supplierId]
    );

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Route not found' }, { status: 404 });
    }

    // Build update query
    const updates: string[] = [];
    const values: (number | string | null)[] = [];

    if (destinationAddress !== undefined) {
      updates.push('destination_address = ?');
      values.push(destinationAddress || null);
    }

    if (distanceKm !== undefined) {
      updates.push('distance_km = ?');
      values.push(distanceKm || null);
    }

    if (durationMin !== undefined) {
      updates.push('duration_min = ?');
      values.push(durationMin || null);
    }

    if (direction !== undefined) {
      updates.push('direction = ?');
      values.push(direction);
    }

    if (isActive !== undefined) {
      updates.push('is_active = ?');
      values.push(isActive ? 1 : 0);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(routeId);

    await execute(
      `UPDATE supplier_routes SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating supplier route:', error);
    return NextResponse.json(
      { error: 'Failed to update route' },
      { status: 500 }
    );
  }
}
