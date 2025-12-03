import { NextRequest, NextResponse } from 'next/server';
import { authenticateSupplier, canManageFleet } from '@/lib/supplier-auth';
import { query, queryOne, insert } from '@/lib/db';

interface DriverDocument {
  id: number;
  driver_id: number;
  doc_type: string;
  doc_name: string;
  file_url: string;
  expiry_date: string | null;
  is_verified: boolean;
  created_at: string;
}

interface Driver {
  id: number;
  supplier_id: number;
}

// GET /api/supplier/drivers/[driverId]/documents - List driver documents
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ driverId: string }> }
) {
  const auth = await authenticateSupplier(request);
  if (!auth.success) return auth.response;

  const { supplierId } = auth.payload;
  const { driverId } = await params;

  // Verify driver belongs to supplier
  const driver = await queryOne<Driver>(
    'SELECT id, supplier_id FROM drivers WHERE id = ? AND supplier_id = ?',
    [driverId, supplierId]
  );

  if (!driver) {
    return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
  }

  const documents = await query<DriverDocument>(
    `SELECT id, driver_id, doc_type, doc_name, file_url, expiry_date, is_verified, created_at
     FROM driver_documents
     WHERE driver_id = ?
     ORDER BY created_at DESC`,
    [driverId]
  );

  return NextResponse.json(documents);
}

// POST /api/supplier/drivers/[driverId]/documents - Upload driver document
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ driverId: string }> }
) {
  const auth = await authenticateSupplier(request);
  if (!auth.success) return auth.response;

  const { supplierId, role } = auth.payload;
  const { driverId } = await params;

  // Only owners and dispatchers can manage fleet
  if (!canManageFleet(role)) {
    return NextResponse.json(
      { error: 'Access denied. Fleet management role required.' },
      { status: 403 }
    );
  }

  // Verify driver belongs to supplier
  const driver = await queryOne<Driver>(
    'SELECT id, supplier_id FROM drivers WHERE id = ? AND supplier_id = ?',
    [driverId, supplierId]
  );

  if (!driver) {
    return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
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

    // Valid document types for drivers
    const validTypes = ['ID_CARD', 'LICENSE', 'PHOTO', 'OTHER'];
    if (!validTypes.includes(docType)) {
      return NextResponse.json(
        { error: `Invalid docType. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const documentId = await insert(
      `INSERT INTO driver_documents (driver_id, doc_type, doc_name, file_url, expiry_date)
       VALUES (?, ?, ?, ?, ?)`,
      [driverId, docType, docName || null, fileUrl, expiryDate || null]
    );

    return NextResponse.json(
      {
        id: documentId,
        driverId: parseInt(driverId),
        docType,
        docName,
        fileUrl,
        expiryDate,
        isVerified: false,
        message: 'Driver document uploaded successfully.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error uploading driver document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}
