import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { sendWelcomeEmail } from '@/lib/email';

interface UserRow {
  id: number;
  email: string;
  full_name: string;
  email_verified: boolean;
  email_verification_expires: Date | null;
}

interface SupplierRow {
  id: number;
  name: string;
}

// GET /api/auth/verify-email?token=xxx
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return redirectWithMessage('error', 'Invalid verification link');
    }

    // Find user by token
    const user = await queryOne<UserRow>(
      `SELECT id, email, full_name, email_verified, email_verification_expires
       FROM users WHERE email_verification_token = ?`,
      [token]
    );

    if (!user) {
      return redirectWithMessage('error', 'Invalid or expired verification link');
    }

    // Check if already verified
    if (user.email_verified) {
      return redirectWithMessage('success', 'Email already verified. You can log in.');
    }

    // Check if token expired
    if (user.email_verification_expires && new Date(user.email_verification_expires) < new Date()) {
      return redirectWithMessage('error', 'Verification link has expired. Please register again.');
    }

    // Verify the email
    await execute(
      `UPDATE users
       SET email_verified = TRUE,
           email_verification_token = NULL,
           email_verification_expires = NULL
       WHERE id = ?`,
      [user.id]
    );

    // Get supplier info if exists
    const supplier = await queryOne<SupplierRow>(
      `SELECT s.id, s.name FROM suppliers s
       INNER JOIN supplier_users su ON s.id = su.supplier_id
       WHERE su.user_id = ?`,
      [user.id]
    );

    // Send welcome email
    try {
      await sendWelcomeEmail(
        user.email,
        user.full_name,
        supplier?.name || 'Your Company'
      );
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    return redirectWithMessage('success', 'Email verified successfully! You can now log in.');

  } catch (error) {
    console.error('Error verifying email:', error);
    return redirectWithMessage('error', 'Verification failed. Please try again.');
  }
}

function redirectWithMessage(status: 'success' | 'error', message: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://airporttransferportal.com';
  const url = new URL('/supplier/login', baseUrl);
  url.searchParams.set('verified', status);
  url.searchParams.set('message', message);
  return NextResponse.redirect(url);
}
