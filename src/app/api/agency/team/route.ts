import { NextRequest, NextResponse } from 'next/server';
import { authenticateAgency, canManageAgency } from '@/lib/agency-auth';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

interface TeamMemberRow {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
}

export async function GET(request: NextRequest) {
  const auth = await authenticateAgency(request);
  if (!auth.success) return auth.response;

  const { agencyId } = auth.payload;

  const members = await query<TeamMemberRow[]>(
    `SELECT au.id, au.user_id, u.full_name, u.email, au.role, au.is_active, u.last_login, au.created_at
     FROM agency_users au
     JOIN users u ON u.id = au.user_id
     WHERE au.agency_id = ?
     ORDER BY au.role = 'OWNER' DESC, au.created_at ASC`,
    [agencyId]
  );

  return NextResponse.json(
    members.map((m) => ({
      id: m.id,
      userId: m.user_id,
      fullName: m.full_name,
      email: m.email,
      role: m.role,
      isActive: m.is_active,
      lastLogin: m.last_login,
      createdAt: m.created_at,
    }))
  );
}

export async function POST(request: NextRequest) {
  const auth = await authenticateAgency(request);
  if (!auth.success) return auth.response;

  const { agencyId, agencyRole } = auth.payload;

  if (!canManageAgency(agencyRole)) {
    return NextResponse.json(
      { error: 'Only owners and managers can add team members' },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { email, fullName, password, role } = body;

  if (!email || !fullName || !password || !role) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  // Check if email already exists
  const existing = await query<{ id: number }[]>(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );

  if (existing.length > 0) {
    return NextResponse.json(
      { error: 'Email already registered' },
      { status: 400 }
    );
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Determine user role based on agency role
  const userRole = role === 'OWNER' ? 'AGENCY_OWNER' : role === 'MANAGER' ? 'AGENCY_MANAGER' : 'AGENCY_BOOKER';

  // Create user
  const userResult = await query(
    `INSERT INTO users (email, password_hash, full_name, role, is_active)
     VALUES (?, ?, ?, ?, TRUE)`,
    [email, passwordHash, fullName, userRole]
  );

  const userId = (userResult as { insertId: number }).insertId;

  // Link to agency
  await query(
    `INSERT INTO agency_users (agency_id, user_id, role, is_active)
     VALUES (?, ?, ?, TRUE)`,
    [agencyId, userId, role]
  );

  return NextResponse.json({ success: true, userId });
}
