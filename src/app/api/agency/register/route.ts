import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      companyName,
      legalName,
      website,
      country,
      city,
      address,
      vatNumber,
      contactName,
      contactEmail,
      contactPhone,
      billingEmail,
      email,
      password,
    } = body;

    // Validate required fields
    if (!companyName || !country || !contactName || !contactEmail || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await queryOne(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate API key
    const apiKey = `atp_live_${crypto.randomBytes(24).toString('hex')}`;

    // Create user
    const userResult = await query(
      `INSERT INTO users (email, password_hash, full_name, phone, role, is_active)
       VALUES (?, ?, ?, ?, 'AGENCY_OWNER', TRUE)`,
      [email, passwordHash, contactName, contactPhone]
    );

    const userId = (userResult as { insertId: number }).insertId;

    // Create agency
    const agencyResult = await query(
      `INSERT INTO agencies (
        name, legal_name, contact_name, contact_email, contact_phone,
        billing_email, country, city, address, website, vat_number,
        api_key, is_active, is_verified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, FALSE)`,
      [
        companyName,
        legalName || null,
        contactName,
        contactEmail,
        contactPhone || null,
        billingEmail || contactEmail,
        country,
        city || null,
        address || null,
        website || null,
        vatNumber || null,
        apiKey,
      ]
    );

    const agencyId = (agencyResult as { insertId: number }).insertId;

    // Link user to agency
    await query(
      `INSERT INTO agency_users (agency_id, user_id, role, is_active)
       VALUES (?, ?, 'OWNER', TRUE)`,
      [agencyId, userId]
    );

    return NextResponse.json({
      success: true,
      message: 'Agency registered successfully. Pending verification.',
      agencyId,
    });
  } catch (error) {
    console.error('Agency registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
