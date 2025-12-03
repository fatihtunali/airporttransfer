import { NextRequest, NextResponse } from 'next/server';
import { queryOne, insert } from '@/lib/db';
import { hashPassword, generateToken, setAuthCookie } from '@/lib/auth';

type Role = 'ADMIN' | 'SUPPLIER_OWNER' | 'DISPATCHER' | 'DRIVER' | 'END_CUSTOMER';

interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: Role;
}

// POST /api/auth/register - Register a new user
export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();

    // Validate required fields
    if (!body.email || !body.password || !body.fullName) {
      return NextResponse.json(
        { error: 'Email, password, and fullName are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password length
    if (body.password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await queryOne<{ id: number }>(
      'SELECT id FROM users WHERE email = ?',
      [body.email.toLowerCase()]
    );

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(body.password);

    // Default role is END_CUSTOMER
    const role: Role = body.role || 'END_CUSTOMER';

    // Only allow certain roles during public registration
    const allowedRoles: Role[] = ['END_CUSTOMER', 'SUPPLIER_OWNER'];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role for public registration' },
        { status: 400 }
      );
    }

    // Insert user
    const userId = await insert(
      `INSERT INTO users (email, password_hash, full_name, phone, role, is_active)
       VALUES (?, ?, ?, ?, ?, TRUE)`,
      [body.email.toLowerCase(), passwordHash, body.fullName, body.phone || null, role]
    );

    // Generate JWT token
    const token = await generateToken({
      userId,
      email: body.email.toLowerCase(),
      role,
    });

    // Set auth cookie
    await setAuthCookie(token);

    // Return user without password
    return NextResponse.json(
      {
        id: userId,
        email: body.email.toLowerCase(),
        fullName: body.fullName,
        phone: body.phone || null,
        role,
        isActive: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}
