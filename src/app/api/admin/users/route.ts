import { NextRequest, NextResponse } from 'next/server';
import { query, insert } from '@/lib/db';
import { authenticateAdmin } from '@/lib/admin-auth';
import bcrypt from 'bcryptjs';

interface UserRow {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  is_active: number;
  created_at: string;
  last_login: string | null;
}

export async function GET(request: NextRequest) {
  // Authenticate admin
  const authResult = await authenticateAdmin(request);
  if (!authResult.success) {
    return authResult.response;
  }

  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role');

  try {
    let whereClause = '1=1';
    const params: string[] = [];

    if (role) {
      whereClause += ' AND role = ?';
      params.push(role);
    }

    const users = await query<UserRow>(`
      SELECT
        id,
        email,
        full_name,
        phone,
        role,
        is_active,
        created_at,
        last_login
      FROM users
      WHERE ${whereClause}
      ORDER BY created_at DESC
    `, params);

    return NextResponse.json({
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        role: user.role,
        isActive: user.is_active === 1,
        createdAt: user.created_at,
        lastLogin: user.last_login,
      })),
    });
  } catch (error) {
    console.error('Users error:', error);
    return NextResponse.json({ users: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName, phone, role } = body;

    if (!email || !password || !fullName || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if email exists
    const existing = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const insertId = await insert(
      `INSERT INTO users (email, password_hash, full_name, phone, role, is_active) VALUES (?, ?, ?, ?, ?, ?)`,
      [email, passwordHash, fullName, phone || null, role, 1]
    );

    return NextResponse.json({
      success: true,
      userId: insertId
    }, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
