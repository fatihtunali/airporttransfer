import { NextRequest, NextResponse } from 'next/server';
import { authenticateSupplier } from '@/lib/supplier-auth';
import { query, insert } from '@/lib/db';

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

  return NextResponse.json(documents);
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

    // Valid document types
    const validTypes = ['LICENSE', 'INSURANCE', 'TAX_CERT', 'ID_CARD', 'OTHER'];
    if (!validTypes.includes(docType)) {
      return NextResponse.json(
        { error: `Invalid docType. Must be one of: ${validTypes.join(', ')}` },
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
