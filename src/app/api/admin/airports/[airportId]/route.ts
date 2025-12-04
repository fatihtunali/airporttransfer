import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { authenticateAdmin } from '@/lib/admin-auth';

interface AirportRow {
  id: number;
  code: string;
  name: string;
  city: string;
  country: string;
  timezone: string;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  created_at: Date;
}

interface AirportUpdateRequest {
  code?: string;
  name?: string;
  city?: string;
  country?: string;
  timezone?: string;
  latitude?: number | null;
  longitude?: number | null;
  isActive?: boolean;
}

// GET /api/admin/airports/[airportId] - Get single airport
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ airportId: string }> }
) {
  const authResult = await authenticateAdmin(request);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const { airportId } = await params;
    const id = parseInt(airportId, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid airport ID' }, { status: 400 });
    }

    const airport = await queryOne<AirportRow>(
      `SELECT * FROM airports WHERE id = ?`,
      [id]
    );

    if (!airport) {
      return NextResponse.json({ error: 'Airport not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: airport.id,
      code: airport.code,
      name: airport.name,
      city: airport.city,
      country: airport.country,
      timezone: airport.timezone,
      latitude: airport.latitude,
      longitude: airport.longitude,
      isActive: airport.is_active,
      createdAt: airport.created_at,
    });
  } catch (error) {
    console.error('Error fetching airport:', error);
    return NextResponse.json({ error: 'Failed to fetch airport' }, { status: 500 });
  }
}

// PUT /api/admin/airports/[airportId] - Update airport
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ airportId: string }> }
) {
  const authResult = await authenticateAdmin(request);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const { airportId } = await params;
    const id = parseInt(airportId, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid airport ID' }, { status: 400 });
    }

    const existingAirport = await queryOne<{ id: number }>(
      `SELECT id FROM airports WHERE id = ?`,
      [id]
    );

    if (!existingAirport) {
      return NextResponse.json({ error: 'Airport not found' }, { status: 404 });
    }

    const body: AirportUpdateRequest = await request.json();

    const updates: string[] = [];
    const values: (string | number | boolean | null)[] = [];

    if (body.code !== undefined) {
      updates.push('code = ?');
      values.push(body.code.toUpperCase());
    }
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
    if (body.timezone !== undefined) {
      updates.push('timezone = ?');
      values.push(body.timezone);
    }
    if (body.latitude !== undefined) {
      updates.push('latitude = ?');
      values.push(body.latitude);
    }
    if (body.longitude !== undefined) {
      updates.push('longitude = ?');
      values.push(body.longitude);
    }
    if (body.isActive !== undefined) {
      updates.push('is_active = ?');
      values.push(body.isActive);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(id);

    await query(`UPDATE airports SET ${updates.join(', ')} WHERE id = ?`, values);

    const updatedAirport = await queryOne<AirportRow>(
      `SELECT * FROM airports WHERE id = ?`,
      [id]
    );

    return NextResponse.json({
      id: updatedAirport!.id,
      code: updatedAirport!.code,
      name: updatedAirport!.name,
      city: updatedAirport!.city,
      country: updatedAirport!.country,
      timezone: updatedAirport!.timezone,
      latitude: updatedAirport!.latitude,
      longitude: updatedAirport!.longitude,
      isActive: updatedAirport!.is_active,
    });
  } catch (error) {
    console.error('Error updating airport:', error);
    return NextResponse.json({ error: 'Failed to update airport' }, { status: 500 });
  }
}

// DELETE /api/admin/airports/[airportId] - Delete airport
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ airportId: string }> }
) {
  const authResult = await authenticateAdmin(request);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const { airportId } = await params;
    const id = parseInt(airportId, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid airport ID' }, { status: 400 });
    }

    const existingAirport = await queryOne<{ id: number }>(
      `SELECT id FROM airports WHERE id = ?`,
      [id]
    );

    if (!existingAirport) {
      return NextResponse.json({ error: 'Airport not found' }, { status: 404 });
    }

    // Check for related routes
    const routeCount = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM routes WHERE airport_id = ?`,
      [id]
    );

    if (routeCount && routeCount.count > 0) {
      return NextResponse.json(
        { error: `Cannot delete airport. It has ${routeCount.count} route(s). Delete routes first or deactivate the airport.` },
        { status: 400 }
      );
    }

    // Check for related bookings
    const bookingCount = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM bookings WHERE airport_id = ?`,
      [id]
    );

    if (bookingCount && bookingCount.count > 0) {
      return NextResponse.json(
        { error: `Cannot delete airport. It has ${bookingCount.count} booking(s). Deactivate the airport instead.` },
        { status: 400 }
      );
    }

    await query(`DELETE FROM airports WHERE id = ?`, [id]);

    return NextResponse.json({ success: true, message: 'Airport deleted successfully' });
  } catch (error) {
    console.error('Error deleting airport:', error);
    return NextResponse.json({ error: 'Failed to delete airport' }, { status: 500 });
  }
}
