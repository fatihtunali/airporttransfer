import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { authenticateAdmin } from '@/lib/admin-auth';

interface SupplierRow {
  id: number;
  name: string;
  is_verified: boolean;
}

// POST /api/admin/suppliers/[supplierId]/verify - Mark supplier as verified
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ supplierId: string }> }
) {
  // Authenticate admin
  const authResult = await authenticateAdmin(request);
  if (!authResult.success) {
    return authResult.response;
  }

  const { supplierId } = await params;

  try {
    // Get supplier
    const supplier = await queryOne<SupplierRow>(
      `SELECT id, name, is_verified FROM suppliers WHERE id = ?`,
      [supplierId]
    );

    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }

    if (supplier.is_verified) {
      return NextResponse.json(
        { error: 'Supplier is already verified' },
        { status: 400 }
      );
    }

    // Update supplier to verified
    await execute(
      `UPDATE suppliers SET is_verified = TRUE, updated_at = NOW() WHERE id = ?`,
      [supplierId]
    );

    return NextResponse.json({
      id: supplier.id,
      name: supplier.name,
      isVerified: true,
      verifiedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error verifying supplier:', error);
    return NextResponse.json(
      { error: 'Failed to verify supplier' },
      { status: 500 }
    );
  }
}
