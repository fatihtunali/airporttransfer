import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authenticateAdmin } from '@/lib/admin-auth';
import bcrypt from 'bcryptjs';

// Valid user roles
const VALID_ROLES = ['ADMIN', 'SUPPLIER_OWNER', 'SUPPLIER_MANAGER', 'DISPATCHER', 'DRIVER', 'END_CUSTOMER', 'AGENCY_OWNER', 'AGENCY_MANAGER', 'AGENCY_BOOKER'];

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  // Authenticate admin
  const authResult = await authenticateAdmin(request);
  if (!authResult.success) {
    return authResult.response;
  }

  const { userId } = await params;

  try {
    const body = await request.json();
    const { email, password, fullName, phone, role, isActive } = body;

    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (fullName !== undefined) {
      updates.push('full_name = ?');
      values.push(fullName);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone || '');
    }
    if (role !== undefined) {
      // Validate role
      if (!VALID_ROLES.includes(role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
      }
      updates.push('role = ?');
      values.push(role);
    }
    if (isActive !== undefined) {
      updates.push('is_active = ?');
      values.push(isActive ? 1 : 0);
    }
    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      updates.push('password_hash = ?');
      values.push(passwordHash);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(userId);
    await query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  // Authenticate admin
  const authResult = await authenticateAdmin(request);
  if (!authResult.success) {
    return authResult.response;
  }

  const { userId } = await params;

  // Prevent admin from deleting themselves
  if (authResult.payload.userId.toString() === userId) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
  }

  try {
    await query('UPDATE users SET is_active = 0 WHERE id = ?', [userId]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
