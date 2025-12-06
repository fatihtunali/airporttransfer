import { NextRequest, NextResponse } from 'next/server';
import { authenticateSupplier } from '@/lib/supplier-auth';
import { query, insert, execute } from '@/lib/db';

interface SupplierDocument {
  id: number;
  supplier_id: number;
  doc_type: string;
  doc_name: string;
  file_url: string;
  expiry_date: string | null;
  is_verified: boolean;
  verified_at: string | null;
  created_at: string;
}

// Valid document types for company documents
const validDocTypes = [
  'BUSINESS_LICENSE',
  'TRANSPORT_LICENSE',
  'LIABILITY_INSURANCE',
  'FLEET_INSURANCE',
  'TAX_CERT',
  'COMPANY_ID',
  'OTHER_COMPANY',
];

// GET /api/supplier/documents - List supplier documents
export async function GET(request: NextRequest) {
  const auth = await authenticateSupplier(request);
  if (!auth.success) return auth.response;

  const { supplierId } = auth.payload;

  const documents = await query<SupplierDocument>(
    `SELECT id, supplier_id, doc_type, doc_name, file_url, expiry_date,
            is_verified, verified_at, created_at
     FROM supplier_documents
     WHERE supplier_id = ?
     ORDER BY created_at DESC`,
    [supplierId]
  );

  // Map to camelCase for frontend
  return NextResponse.json(
    documents.map((doc) => ({
      id: doc.id,
      supplierId: doc.supplier_id,
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

// POST /api/supplier/documents - Upload new document
export async function POST(request: NextRequest) {
  const auth = await authenticateSupplier(request);
  if (!auth.success) return auth.response;

  const { supplierId } = auth.payload;

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
      `INSERT INTO supplier_documents (supplier_id, doc_type, doc_name, file_url, expiry_date)
       VALUES (?, ?, ?, ?, ?)`,
      [supplierId, docType, docName || null, fileUrl, expiryDate || null]
    );

    return NextResponse.json(
      {
        id: documentId,
        supplierId,
        docType,
        docName,
        fileUrl,
        expiryDate,
        isVerified: false,
        message: 'Document uploaded successfully. Awaiting verification.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}

// PUT /api/supplier/documents - Update a document (by id in body)
export async function PUT(request: NextRequest) {
  const auth = await authenticateSupplier(request);
  if (!auth.success) return auth.response;

  const { supplierId } = auth.payload;

  try {
    const body = await request.json();
    const { id, docType, docName, fileUrl, expiryDate } = body;

    if (!id) {
      return NextResponse.json({ error: 'Document id is required' }, { status: 400 });
    }

    // Verify document belongs to supplier
    const existing = await query<{ id: number }>(
      `SELECT id FROM supplier_documents WHERE id = ? AND supplier_id = ?`,
      [id, supplierId]
    );

    if (existing.length === 0) {
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
    await execute(`UPDATE supplier_documents SET ${updates.join(', ')} WHERE id = ?`, values);

    return NextResponse.json({ success: true, message: 'Document updated successfully' });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
  }
}

// DELETE /api/supplier/documents - Delete a document (by id in query param)
export async function DELETE(request: NextRequest) {
  const auth = await authenticateSupplier(request);
  if (!auth.success) return auth.response;

  const { supplierId } = auth.payload;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Document id is required' }, { status: 400 });
  }

  try {
    // Verify document belongs to supplier
    const existing = await query<{ id: number }>(
      `SELECT id FROM supplier_documents WHERE id = ? AND supplier_id = ?`,
      [id, supplierId]
    );

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    await execute(`DELETE FROM supplier_documents WHERE id = ?`, [id]);

    return NextResponse.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
