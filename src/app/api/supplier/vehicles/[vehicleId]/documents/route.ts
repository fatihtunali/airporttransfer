import { NextRequest, NextResponse } from 'next/server';
import { authenticateSupplier, canManageFleet } from '@/lib/supplier-auth';
import { query, queryOne, insert } from '@/lib/db';

interface VehicleDocument {
  id: number;
  vehicle_id: number;
  doc_type: string;
  doc_name: string;
  file_url: string;
  expiry_date: string | null;
  is_verified: boolean;
  created_at: string;
}

interface Vehicle {
  id: number;
  supplier_id: number;
}

// GET /api/supplier/vehicles/[vehicleId]/documents - List vehicle documents
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ vehicleId: string }> }
) {
  const auth = await authenticateSupplier(request);
  if (!auth.success) return auth.response;

  const { supplierId } = auth.payload;
  const { vehicleId } = await params;

  // Verify vehicle belongs to supplier
  const vehicle = await queryOne<Vehicle>(
    'SELECT id, supplier_id FROM vehicles WHERE id = ? AND supplier_id = ?',
    [vehicleId, supplierId]
  );

  if (!vehicle) {
    return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
  }

  const documents = await query<VehicleDocument>(
    `SELECT id, vehicle_id, doc_type, doc_name, file_url, expiry_date, is_verified, created_at
     FROM vehicle_documents
     WHERE vehicle_id = ?
     ORDER BY created_at DESC`,
    [vehicleId]
  );

  return NextResponse.json(documents);
}

// POST /api/supplier/vehicles/[vehicleId]/documents - Upload vehicle document
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ vehicleId: string }> }
) {
  const auth = await authenticateSupplier(request);
  if (!auth.success) return auth.response;

  const { supplierId, role } = auth.payload;
  const { vehicleId } = await params;

  // Only owners and dispatchers can manage fleet
  if (!canManageFleet(role)) {
    return NextResponse.json(
      { error: 'Access denied. Fleet management role required.' },
      { status: 403 }
    );
  }

  // Verify vehicle belongs to supplier
  const vehicle = await queryOne<Vehicle>(
    'SELECT id, supplier_id FROM vehicles WHERE id = ? AND supplier_id = ?',
    [vehicleId, supplierId]
  );

  if (!vehicle) {
    return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { docType, docName, fileUrl, expiryDate } = body;

    // Validate required fields
    if (!docType || !fileUrl) {
      return NextResponse.json(
        { error: 'docType and fileUrl are required' },
        { status: 400 }
      );
    }

    // Valid document types for vehicles
    const validTypes = ['REGISTRATION', 'INSURANCE', 'INSPECTION', 'OTHER'];
    if (!validTypes.includes(docType)) {
      return NextResponse.json(
        { error: `Invalid docType. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const documentId = await insert(
      `INSERT INTO vehicle_documents (vehicle_id, doc_type, doc_name, file_url, expiry_date)
       VALUES (?, ?, ?, ?, ?)`,
      [vehicleId, docType, docName || null, fileUrl, expiryDate || null]
    );

    return NextResponse.json(
      {
        id: documentId,
        vehicleId: parseInt(vehicleId),
        docType,
        docName,
        fileUrl,
        expiryDate,
        isVerified: false,
        message: 'Vehicle document uploaded successfully.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error uploading vehicle document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}
