import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { verifyPassword, generateToken, setAuthCookie } from '@/lib/auth';

interface LoginRequest {
  email: string;
  password: string;
}

interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  full_name: string;
  phone: string | null;
  role: string;
  is_active: boolean;
  email_verified: boolean;
}

// POST /api/auth/login - Login user
export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();

    // Validate required fields
    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await queryOne<UserRow>(
      `SELECT id, email, password_hash, full_name, phone, role, is_active, email_verified
       FROM users WHERE email = ?`,
      [body.email.toLowerCase()]
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Account is disabled' },
        { status: 401 }
      );
    }

    // Check if email is verified (only for supplier roles)
    if (!user.email_verified && user.role === 'SUPPLIER_OWNER') {
      return NextResponse.json(
        { error: 'Please verify your email before logging in. Check your inbox for the verification link.' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(body.password, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login
    await execute(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    // Generate JWT token
    const token = await generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Set auth cookie
    await setAuthCookie(token);

    // Return user and token
    return NextResponse.json({
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        role: user.role,
        isActive: user.is_active,
      },
    });
  } catch (error) {
    console.error('Error logging in:', error);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}
