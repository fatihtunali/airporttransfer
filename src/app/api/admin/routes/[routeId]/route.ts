import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { authenticateAdmin } from '@/lib/admin-auth';

type RouteDirection = 'FROM_AIRPORT' | 'TO_AIRPORT' | 'BOTH';

interface RouteRow {
  id: number;
  airport_id: number;
  zone_id: number;
  direction: RouteDirection;
  approx_distance_km: number | null;
  approx_duration_min: number | null;
  is_active: boolean;
  created_at: Date;
  airport_code: string;
  airport_name: string;
  zone_name: string;
  zone_city: string;
}

interface RouteUpdateRequest {
  direction?: RouteDirection;
  approxDistanceKm?: number | null;
  approxDurationMin?: number | null;
  isActive?: boolean;
}

// GET /api/admin/routes/[routeId] - Get single route
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ routeId: string }> }
) {
  const authResult = await authenticateAdmin(request);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const { routeId } = await params;
    const id = parseInt(routeId, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid route ID' }, { status: 400 });
    }

    const route = await queryOne<RouteRow>(
      `SELECT r.id, r.airport_id, r.zone_id, r.direction,
              r.approx_distance_km, r.approx_duration_min, r.is_active, r.created_at,
              a.code as airport_code, a.name as airport_name,
              z.name as zone_name, z.city as zone_city
       FROM routes r
       JOIN airports a ON a.id = r.airport_id
       JOIN zones z ON z.id = r.zone_id
       WHERE r.id = ?`,
      [id]
    );

    if (!route) {
      return NextResponse.json({ error: 'Route not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: route.id,
      airportId: route.airport_id,
      airportCode: route.airport_code,
      airportName: route.airport_name,
      zoneId: route.zone_id,
      zoneName: route.zone_name,
      zoneCity: route.zone_city,
      direction: route.direction,
      approxDistanceKm: route.approx_distance_km,
      approxDurationMin: route.approx_duration_min,
      isActive: route.is_active,
    });
  } catch (error) {
    console.error('Error fetching route:', error);
    return NextResponse.json({ error: 'Failed to fetch route' }, { status: 500 });
  }
}

// PUT /api/admin/routes/[routeId] - Update route (including enable/disable)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ routeId: string }> }
) {
  const authResult = await authenticateAdmin(request);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const { routeId } = await params;
    const id = parseInt(routeId, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid route ID' }, { status: 400 });
    }

    // Check route exists
    const existingRoute = await queryOne<{ id: number }>(
      `SELECT id FROM routes WHERE id = ?`,
      [id]
    );

    if (!existingRoute) {
      return NextResponse.json({ error: 'Route not found' }, { status: 404 });
    }

    const body: RouteUpdateRequest = await request.json();

    // Build update query dynamically
    const updates: string[] = [];
    const values: (string | number | boolean | null)[] = [];

    if (body.direction !== undefined) {
      const validDirections: RouteDirection[] = ['FROM_AIRPORT', 'TO_AIRPORT', 'BOTH'];
      if (!validDirections.includes(body.direction)) {
        return NextResponse.json(
          { error: `Invalid direction. Must be one of: ${validDirections.join(', ')}` },
          { status: 400 }
        );
      }
      updates.push('direction = ?');
      values.push(body.direction);
    }

    if (body.approxDistanceKm !== undefined) {
      updates.push('approx_distance_km = ?');
      values.push(body.approxDistanceKm);
    }

    if (body.approxDurationMin !== undefined) {
      updates.push('approx_duration_min = ?');
      values.push(body.approxDurationMin);
    }

    if (body.isActive !== undefined) {
      updates.push('is_active = ?');
      values.push(body.isActive);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(id);

    await query(
      `UPDATE routes SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Fetch updated route
    const updatedRoute = await queryOne<RouteRow>(
      `SELECT r.id, r.airport_id, r.zone_id, r.direction,
              r.approx_distance_km, r.approx_duration_min, r.is_active, r.created_at,
              a.code as airport_code, a.name as airport_name,
              z.name as zone_name, z.city as zone_city
       FROM routes r
       JOIN airports a ON a.id = r.airport_id
       JOIN zones z ON z.id = r.zone_id
       WHERE r.id = ?`,
      [id]
    );

    return NextResponse.json({
      id: updatedRoute!.id,
      airportId: updatedRoute!.airport_id,
      airportCode: updatedRoute!.airport_code,
      airportName: updatedRoute!.airport_name,
      zoneId: updatedRoute!.zone_id,
      zoneName: updatedRoute!.zone_name,
      zoneCity: updatedRoute!.zone_city,
      direction: updatedRoute!.direction,
      approxDistanceKm: updatedRoute!.approx_distance_km,
      approxDurationMin: updatedRoute!.approx_duration_min,
      isActive: updatedRoute!.is_active,
    });
  } catch (error) {
    console.error('Error updating route:', error);
    return NextResponse.json({ error: 'Failed to update route' }, { status: 500 });
  }
}

// DELETE /api/admin/routes/[routeId] - Delete route
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ routeId: string }> }
) {
  const authResult = await authenticateAdmin(request);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const { routeId } = await params;
    const id = parseInt(routeId, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid route ID' }, { status: 400 });
    }

    // Check route exists
    const existingRoute = await queryOne<{ id: number }>(
      `SELECT id FROM routes WHERE id = ?`,
      [id]
    );

    if (!existingRoute) {
      return NextResponse.json({ error: 'Route not found' }, { status: 404 });
    }

    // Check if route has any tariffs
    const tariffCount = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM tariffs WHERE route_id = ?`,
      [id]
    );

    if (tariffCount && tariffCount.count > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete route. It has ${tariffCount.count} tariff(s) associated. Please delete the tariffs first or deactivate the route instead.`
        },
        { status: 400 }
      );
    }

    // Check if route has any bookings
    const bookingCount = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM bookings b
       JOIN routes r ON r.airport_id = b.airport_id AND r.zone_id = b.zone_id
       WHERE r.id = ?`,
      [id]
    );

    if (bookingCount && bookingCount.count > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete route. It has ${bookingCount.count} booking(s) associated. Please deactivate the route instead.`
        },
        { status: 400 }
      );
    }

    // Delete route
    await query(`DELETE FROM routes WHERE id = ?`, [id]);

    return NextResponse.json({ success: true, message: 'Route deleted successfully' });
  } catch (error) {
    console.error('Error deleting route:', error);
    return NextResponse.json({ error: 'Failed to delete route' }, { status: 500 });
  }
}
