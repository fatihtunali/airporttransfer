import { NextRequest, NextResponse } from 'next/server';
import { authenticateSupplier, canManageFleet } from '@/lib/supplier-auth';
import { query, queryOne, insert, execute } from '@/lib/db';

interface DriverDocument {
  id: number;
  driver_id: number;
  doc_type: string;
  doc_name: string;
  file_url: string;
  expiry_date: string | null;
  is_verified: boolean;
  verified_at: string | null;
  created_at: string;
}

interface Driver {
  id: number;
  supplier_id: number;
}

// Valid document types for drivers
const validDocTypes = ['ID_CARD', 'LICENSE', 'PHOTO', 'OTHER'];

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
    `SELECT id, driver_id, doc_type, doc_name, file_url, expiry_date, is_verified, verified_at, created_at
     FROM driver_documents
     WHERE driver_id = ?
     ORDER BY created_at DESC`,
    [driverId]
  );

  // Map to camelCase for frontend
  return NextResponse.json(
    documents.map((doc) => ({
      id: doc.id,
      driverId: doc.driver_id,
      docType: doc.doc_type,
      docName: doc.doc_name,
      fileUrl: doc.file_url,
      expiryDate: doc.expiry_date,
      isVerified: doc.is_verified,
      verifiedAt: doc.verified_at,
      createdAt: doc.created_at,
    }))
  );
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

    if (!validDocTypes.includes(docType)) {
      return NextResponse.json(
        { error: `Invalid docType. Must be one of: ${validDocTypes.join(', ')}` },
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

// PUT /api/supplier/drivers/[driverId]/documents - Update a document (by id in body)
export async function PUT(
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
    const { id, docType, docName, fileUrl, expiryDate } = body;

    if (!id) {
      return NextResponse.json({ error: 'Document id is required' }, { status: 400 });
    }

    // Verify document belongs to this driver
    const existing = await queryOne<{ id: number }>(
      `SELECT id FROM driver_documents WHERE id = ? AND driver_id = ?`,
      [id, driverId]
    );

    if (!existing) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Build update query
    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    if (docType !== undefined) {
      if (!validDocTypes.includes(docType)) {
        return NextResponse.json(
          { error: `Invalid docType. Must be one of: ${validDocTypes.join(', ')}` },
          { status: 400 }
        );
      }
      updates.push('doc_type = ?');
      values.push(docType);
    }
    if (docName !== undefined) {
      updates.push('doc_name = ?');
      values.push(docName || null);
    }
    if (fileUrl !== undefined) {
      updates.push('file_url = ?');
      values.push(fileUrl);
    }
    if (expiryDate !== undefined) {
      updates.push('expiry_date = ?');
      values.push(expiryDate || null);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Reset verification when document is updated
    updates.push('is_verified = FALSE');
    updates.push('verified_at = NULL');

    values.push(id);
    await execute(`UPDATE driver_documents SET ${updates.join(', ')} WHERE id = ?`, values);

    return NextResponse.json({ success: true, message: 'Document updated successfully' });
  } catch (error) {
    console.error('Error updating driver document:', error);
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
  }
}

// DELETE /api/supplier/drivers/[driverId]/documents - Delete a document (by id in query param)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ driverId: string }> }
) {
  const auth = await authenticateSupplier(request);
  if (!auth.success) return auth.response;

  const { supplierId, role } = auth.payload;
  const { driverId } = await params;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  // Only owners and dispatchers can manage fleet
  if (!canManageFleet(role)) {
    return NextResponse.json(
      { error: 'Access denied. Fleet management role required.' },
      { status: 403 }
    );
  }

  if (!id) {
    return NextResponse.json({ error: 'Document id is required' }, { status: 400 });
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
    // Verify document belongs to this driver
    const existing = await queryOne<{ id: number }>(
      `SELECT id FROM driver_documents WHERE id = ? AND driver_id = ?`,
      [id, driverId]
    );

    if (!existing) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    await execute(`DELETE FROM driver_documents WHERE id = ?`, [id]);

    return NextResponse.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting driver document:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
