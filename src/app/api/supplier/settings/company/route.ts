import { NextRequest, NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { authenticateSupplier } from '@/lib/supplier-auth';

// PUT /api/supplier/settings/company - Update company details
export async function PUT(request: NextRequest) {
  // Authenticate supplier
  const authResult = await authenticateSupplier(request);
  if (!authResult.success) {
    return authResult.response;
  }

  const { payload } = authResult;

  try {
    const body = await request.json();
    const {
      name,
      legalName,
      taxNumber,
      contactName,
      contactEmail,
      contactPhone,
      whatsapp,
      country,
      city,
      address,
      description,
    } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    // Update supplier details
    await execute(
      `UPDATE suppliers SET
        name = ?,
        legal_name = ?,
        tax_number = ?,
        contact_name = ?,
        contact_email = ?,
        contact_phone = ?,
        whatsapp = ?,
        country = ?,
        city = ?,
        address = ?,
        description = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [
        name.trim(),
        legalName?.trim() || null,
        taxNumber?.trim() || null,
        contactName?.trim() || null,
        contactEmail?.trim() || null,
        contactPhone?.trim() || null,
        whatsapp?.trim() || null,
        country?.trim() || null,
        city?.trim() || null,
        address?.trim() || null,
        description?.trim() || null,
        payload.supplierId,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating company details:', error);
    return NextResponse.json(
      { error: 'Failed to update company details' },
      { status: 500 }
    );
  }
}
