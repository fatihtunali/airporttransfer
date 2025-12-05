import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { generateToken, setAuthCookie } from '@/lib/auth';
import { authenticateAdmin } from '@/lib/admin-auth';
import { cookies } from 'next/headers';

interface UserRow {
  id: number;
  email: string;
  full_name: string;
  role: string;
}

interface SupplierUserRow {
  user_id: number;
  supplier_id: number;
}

// POST /api/admin/impersonate - Impersonate a supplier user
export async function POST(request: NextRequest) {
  try {
    // Verify admin is logged in
    const authResult = await authenticateAdmin(request);
    if (!authResult.success) {
      return authResult.response;
    }
    const auth = authResult.payload;

    const { supplierId } = await request.json();

    if (!supplierId) {
      return NextResponse.json({ error: 'Supplier ID required' }, { status: 400 });
    }

    // Find the owner user for this supplier
    const supplierUser = await queryOne<SupplierUserRow>(
      `SELECT user_id, supplier_id FROM supplier_users
       WHERE supplier_id = ? AND role = 'OWNER' AND is_active = 1
       LIMIT 1`,
      [supplierId]
    );

    if (!supplierUser) {
      return NextResponse.json({ error: 'No owner found for this supplier' }, { status: 404 });
    }

    // Get the user details
    const user = await queryOne<UserRow>(
      `SELECT id, email, full_name, role FROM users WHERE id = ? AND is_active = 1`,
      [supplierUser.user_id]
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found or inactive' }, { status: 404 });
    }

    // Store the original admin token in a separate cookie for "stop impersonating"
    const cookieStore = await cookies();
    const originalToken = cookieStore.get('auth-token')?.value;

    if (originalToken) {
      cookieStore.set('admin-original-token', originalToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60, // 1 hour
        path: '/',
      });
    }

    // Generate a new token for the supplier user with impersonation flag
    const token = await generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      impersonatedBy: auth.userId,
    });

    // Set the new auth cookie
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      message: `Now impersonating ${user.full_name}`,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
      },
      redirectTo: '/supplier',
    });
  } catch (error) {
    console.error('Error impersonating:', error);
    return NextResponse.json({ error: 'Failed to impersonate' }, { status: 500 });
  }
}

// DELETE /api/admin/impersonate - Stop impersonating
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const originalToken = cookieStore.get('admin-original-token')?.value;

    if (!originalToken) {
      return NextResponse.json({ error: 'No original session found' }, { status: 400 });
    }

    // Restore the original admin token
    cookieStore.set('auth-token', originalToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    // Clear the backup token
    cookieStore.delete('admin-original-token');

    return NextResponse.json({
      success: true,
      message: 'Stopped impersonating',
      redirectTo: '/admin/suppliers',
    });
  } catch (error) {
    console.error('Error stopping impersonation:', error);
    return NextResponse.json({ error: 'Failed to stop impersonating' }, { status: 500 });
  }
}
