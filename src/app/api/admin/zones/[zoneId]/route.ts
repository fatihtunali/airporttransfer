import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { authenticateAdmin } from '@/lib/admin-auth';

interface ZoneRow {
  id: number;
  name: string;
  city: string;
  country: string;
  zone_type: string;
  parent_zone_id: number | null;
  latitude: number | null;
  longitude: number | null;
  radius_km: number | null;
  is_active: boolean;
  created_at: Date;
}

interface ZoneUpdateRequest {
  name?: string;
  city?: string;
  country?: string;
  zoneType?: string;
  parentZoneId?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  radiusKm?: number | null;
  isActive?: boolean;
}

// GET /api/admin/zones/[zoneId] - Get single zone
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ zoneId: string }> }
) {
  const authResult = await authenticateAdmin(request);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const { zoneId } = await params;
    const id = parseInt(zoneId, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid zone ID' }, { status: 400 });
    }

    const zone = await queryOne<ZoneRow>(
      `SELECT * FROM zones WHERE id = ?`,
      [id]
    );

    if (!zone) {
      return NextResponse.json({ error: 'Zone not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: zone.id,
      name: zone.name,
      city: zone.city,
      country: zone.country,
      zoneType: zone.zone_type,
      parentZoneId: zone.parent_zone_id,
      latitude: zone.latitude,
      longitude: zone.longitude,
      radiusKm: zone.radius_km,
      isActive: zone.is_active,
      createdAt: zone.created_at,
    });
  } catch (error) {
    console.error('Error fetching zone:', error);
    return NextResponse.json({ error: 'Failed to fetch zone' }, { status: 500 });
  }
}

// PUT /api/admin/zones/[zoneId] - Update zone
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ zoneId: string }> }
) {
  const authResult = await authenticateAdmin(request);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const { zoneId } = await params;
    const id = parseInt(zoneId, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid zone ID' }, { status: 400 });
    }

    const existingZone = await queryOne<{ id: number }>(
      `SELECT id FROM zones WHERE id = ?`,
      [id]
    );

    if (!existingZone) {
      return NextResponse.json({ error: 'Zone not found' }, { status: 404 });
    }

    const body: ZoneUpdateRequest = await request.json();

    const updates: string[] = [];
    const values: (string | number | boolean | null)[] = [];

    if (body.name !== undefined) {
      updates.push('name = ?');
      values.push(body.name);
    }
    if (body.city !== undefined) {
      updates.push('city = ?');
      values.push(body.city);
    }
    if (body.country !== undefined) {
      updates.push('country = ?');
      values.push(body.country);
    }
    if (body.zoneType !== undefined) {
      updates.push('zone_type = ?');
      values.push(body.zoneType);
    }
    if (body.parentZoneId !== undefined) {
      updates.push('parent_zone_id = ?');
      values.push(body.parentZoneId);
    }
    if (body.latitude !== undefined) {
      updates.push('latitude = ?');
      values.push(body.latitude);
    }
    if (body.longitude !== undefined) {
      updates.push('longitude = ?');
      values.push(body.longitude);
    }
    if (body.radiusKm !== undefined) {
      updates.push('radius_km = ?');
      values.push(body.radiusKm);
    }
    if (body.isActive !== undefined) {
      updates.push('is_active = ?');
      values.push(body.isActive);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(id);

    await query(`UPDATE zones SET ${updates.join(', ')} WHERE id = ?`, values);

    const updatedZone = await queryOne<ZoneRow>(
      `SELECT * FROM zones WHERE id = ?`,
      [id]
    );

    return NextResponse.json({
      id: updatedZone!.id,
      name: updatedZone!.name,
      city: updatedZone!.city,
      country: updatedZone!.country,
      zoneType: updatedZone!.zone_type,
      parentZoneId: updatedZone!.parent_zone_id,
      latitude: updatedZone!.latitude,
      longitude: updatedZone!.longitude,
      radiusKm: updatedZone!.radius_km,
      isActive: updatedZone!.is_active,
    });
  } catch (error) {
    console.error('Error updating zone:', error);
    return NextResponse.json({ error: 'Failed to update zone' }, { status: 500 });
  }
}

// DELETE /api/admin/zones/[zoneId] - Delete zone
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ zoneId: string }> }
) {
  const authResult = await authenticateAdmin(request);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const { zoneId } = await params;
    const id = parseInt(zoneId, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid zone ID' }, { status: 400 });
    }

    const existingZone = await queryOne<{ id: number }>(
      `SELECT id FROM zones WHERE id = ?`,
      [id]
    );

    if (!existingZone) {
      return NextResponse.json({ error: 'Zone not found' }, { status: 404 });
    }

    // Check for related routes
    const routeCount = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM routes WHERE zone_id = ?`,
      [id]
    );

    if (routeCount && routeCount.count > 0) {
      return NextResponse.json(
        { error: `Cannot delete zone. It has ${routeCount.count} route(s). Delete routes first or deactivate the zone.` },
        { status: 400 }
      );
    }

    // Check for child zones
    const childCount = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM zones WHERE parent_zone_id = ?`,
      [id]
    );

    if (childCount && childCount.count > 0) {
      return NextResponse.json(
        { error: `Cannot delete zone. It has ${childCount.count} child zone(s). Delete or reassign child zones first.` },
        { status: 400 }
      );
    }

    await query(`DELETE FROM zones WHERE id = ?`, [id]);

    return NextResponse.json({ success: true, message: 'Zone deleted successfully' });
  } catch (error) {
    console.error('Error deleting zone:', error);
    return NextResponse.json({ error: 'Failed to delete zone' }, { status: 500 });
  }
}
