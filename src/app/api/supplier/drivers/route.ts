import { NextRequest, NextResponse } from 'next/server';
import { query, insert } from '@/lib/db';
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

interface DriverCreateRequest {
  fullName: string;
  phone?: string;
  email?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  photoUrl?: string;
  languages?: string[];
}

// GET /api/supplier/drivers - List drivers for current supplier
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
    const offset = (page - 1) * pageSize;

    // Get drivers for supplier
    const drivers = await query<DriverRow>(
      `SELECT id, supplier_id, user_id, full_name, phone, email,
              license_number, license_expiry, photo_url, languages,
              is_active, rating_avg, rating_count, created_at
       FROM drivers
       WHERE supplier_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [payload.supplierId, pageSize, offset]
    );

    // Get total count
    const countResult = await query<{ total: number }>(
      `SELECT COUNT(*) as total FROM drivers WHERE supplier_id = ?`,
      [payload.supplierId]
    );

    const total = countResult[0]?.total || 0;

    return NextResponse.json({
      items: drivers.map((d) => ({
        id: d.id,
        supplierId: d.supplier_id,
        userId: d.user_id,
        fullName: d.full_name,
        phone: d.phone,
        email: d.email,
        licenseNumber: d.license_number,
        licenseExpiry: d.license_expiry,
        photoUrl: d.photo_url,
        languages: d.languages ? JSON.parse(d.languages) : [],
        isActive: d.is_active,
        ratingAvg: d.rating_avg,
        ratingCount: d.rating_count,
      })),
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drivers' },
      { status: 500 }
    );
  }
}

// POST /api/supplier/drivers - Create new driver for current supplier
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
    const body: DriverCreateRequest = await request.json();

    // Validate required fields
    if (!body.fullName || !body.phone) {
      return NextResponse.json(
        { error: 'fullName and phone are required' },
        { status: 400 }
      );
    }

    // Insert driver
    const driverId = await insert(
      `INSERT INTO drivers (supplier_id, full_name, phone, email, license_number,
                            license_expiry, photo_url, languages, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        payload.supplierId,
        body.fullName,
        body.phone,
        body.email || null,
        body.licenseNumber || null,
        body.licenseExpiry || null,
        body.photoUrl || null,
        body.languages ? JSON.stringify(body.languages) : null,
      ]
    );

    return NextResponse.json(
      {
        id: driverId,
        supplierId: payload.supplierId,
        userId: null,
        fullName: body.fullName,
        phone: body.phone,
        email: body.email || null,
        licenseNumber: body.licenseNumber || null,
        licenseExpiry: body.licenseExpiry || null,
        photoUrl: body.photoUrl || null,
        languages: body.languages || [],
        isActive: true,
        ratingAvg: 0,
        ratingCount: 0,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating driver:', error);
    return NextResponse.json(
      { error: 'Failed to create driver' },
      { status: 500 }
    );
  }
}
