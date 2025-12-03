import { NextRequest, NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { authenticateSupplier } from '@/lib/supplier-auth';

// PUT /api/supplier/settings/profile - Update user profile
export async function PUT(request: NextRequest) {
  // Authenticate supplier
  const authResult = await authenticateSupplier(request);
  if (!authResult.success) {
    return authResult.response;
  }

  const { payload } = authResult;

  try {
    const body = await request.json();
    const { fullName, phone } = body;

    if (!fullName || fullName.trim() === '') {
      return NextResponse.json(
        { error: 'Full name is required' },
        { status: 400 }
      );
    }

    // Update user profile
    await execute(
      `UPDATE users SET full_name = ?, phone = ?, updated_at = NOW() WHERE id = ?`,
      [fullName.trim(), phone?.trim() || null, payload.userId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
