import { NextRequest, NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { authenticateSupplier } from '@/lib/supplier-auth';

// PUT /api/supplier/settings/bank - Update bank/payment details
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
      bankName,
      bankAccountName,
      bankIban,
      bankSwift,
      bankCountry,
      paymentEmail,
      preferredPaymentMethod,
    } = body;

    // Validate preferred payment method
    const validMethods = ['BANK_TRANSFER', 'PAYPAL', 'WISE', 'OTHER'];
    if (preferredPaymentMethod && !validMethods.includes(preferredPaymentMethod)) {
      return NextResponse.json(
        { error: `Invalid payment method. Must be one of: ${validMethods.join(', ')}` },
        { status: 400 }
      );
    }

    // Update bank details
    await execute(
      `UPDATE suppliers SET
        bank_name = ?,
        bank_account_name = ?,
        bank_iban = ?,
        bank_swift = ?,
        bank_country = ?,
        payment_email = ?,
        preferred_payment_method = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [
        bankName?.trim() || null,
        bankAccountName?.trim() || null,
        bankIban?.trim()?.toUpperCase() || null,
        bankSwift?.trim()?.toUpperCase() || null,
        bankCountry?.trim() || null,
        paymentEmail?.trim() || null,
        preferredPaymentMethod || 'BANK_TRANSFER',
        payload.supplierId,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating bank details:', error);
    return NextResponse.json(
      { error: 'Failed to update bank details' },
      { status: 500 }
    );
  }
}
