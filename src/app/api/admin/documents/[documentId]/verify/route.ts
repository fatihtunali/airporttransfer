import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/admin-auth';
import { execute, queryOne } from '@/lib/db';

// POST /api/admin/documents/[documentId]/verify - Verify a document
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const auth = await authenticateAdmin(request);
  if (!auth.success) return auth.response;

  const { userId } = auth.payload;
  const { documentId } = await params;

  try {
    const body = await request.json();
    const { entityType, verified } = body;

    // Validate entity type
    if (!['supplier', 'driver', 'vehicle'].includes(entityType)) {
      return NextResponse.json(
        { error: 'Invalid entityType. Must be supplier, driver, or vehicle.' },
        { status: 400 }
      );
    }

    let tableName: string;
    let idColumn: string;

    switch (entityType) {
      case 'supplier':
        tableName = 'supplier_documents';
        idColumn = 'id';
        break;
      case 'driver':
        tableName = 'driver_documents';
        idColumn = 'id';
        break;
      case 'vehicle':
        tableName = 'vehicle_documents';
        idColumn = 'id';
        break;
      default:
        return NextResponse.json({ error: 'Invalid entity type' }, { status: 400 });
    }

    // Check if document exists
    const doc = await queryOne(
      `SELECT id FROM ${tableName} WHERE id = ?`,
      [documentId]
    );

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Update verification status
    if (entityType === 'supplier') {
      await execute(
        `UPDATE ${tableName}
         SET is_verified = ?, verified_at = ${verified ? 'NOW()' : 'NULL'}, verified_by = ?
         WHERE id = ?`,
        [verified, verified ? userId : null, documentId]
      );
    } else {
      await execute(
        `UPDATE ${tableName}
         SET is_verified = ?
         WHERE id = ?`,
        [verified, documentId]
      );
    }

    return NextResponse.json({
      success: true,
      documentId: parseInt(documentId),
      entityType,
      verified,
      message: verified ? 'Document verified successfully' : 'Document verification revoked',
    });
  } catch (error) {
    console.error('Error verifying document:', error);
    return NextResponse.json(
      { error: 'Failed to verify document' },
      { status: 500 }
    );
  }
}
