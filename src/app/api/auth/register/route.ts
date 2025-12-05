import { NextRequest, NextResponse } from 'next/server';
import { queryOne, insert, execute } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';

type Role = 'ADMIN' | 'SUPPLIER_OWNER' | 'DISPATCHER' | 'DRIVER' | 'END_CUSTOMER';

interface SupplierData {
  name: string;
  legalName?: string;
  taxNumber?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  whatsapp?: string;
  country?: string;
  city?: string;
  address?: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: Role;
  supplier?: SupplierData;
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

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Insert user with verification token
    const userId = await insert(
      `INSERT INTO users (email, password_hash, full_name, phone, role, is_active, email_verified, email_verification_token, email_verification_expires)
       VALUES (?, ?, ?, ?, ?, TRUE, FALSE, ?, ?)`,
      [body.email.toLowerCase(), passwordHash, body.fullName, body.phone || null, role, verificationToken, tokenExpires]
    );

    let supplierId: number | null = null;

    // If registering as SUPPLIER_OWNER and supplier data is provided, create supplier
    if (role === 'SUPPLIER_OWNER' && body.supplier) {
      // Create supplier company
      supplierId = await insert(
        `INSERT INTO suppliers (name, legal_name, tax_number, contact_name, contact_email,
                                contact_phone, whatsapp, country, city, address,
                                commission_rate, is_verified, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 15.00, FALSE, TRUE)`,
        [
          body.supplier.name,
          body.supplier.legalName || null,
          body.supplier.taxNumber || null,
          body.supplier.contactName || body.fullName,
          body.supplier.contactEmail || body.email.toLowerCase(),
          body.supplier.contactPhone || body.phone || null,
          body.supplier.whatsapp || null,
          body.supplier.country || null,
          body.supplier.city || null,
          body.supplier.address || null,
        ]
      );

      // Link user to supplier as OWNER
      await insert(
        `INSERT INTO supplier_users (supplier_id, user_id, role, is_active)
         VALUES (?, ?, 'OWNER', TRUE)`,
        [supplierId, userId]
      );
    }

    // Send verification email
    try {
      await sendVerificationEmail(body.email.toLowerCase(), body.fullName, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue registration even if email fails
    }

    // Return success - user needs to verify email before logging in
    return NextResponse.json(
      {
        id: userId,
        email: body.email.toLowerCase(),
        fullName: body.fullName,
        phone: body.phone || null,
        role,
        isActive: true,
        supplierId,
        message: 'Registration successful. Please check your email to verify your account.',
        requiresVerification: true,
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
