import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from './auth';
import { queryOne } from './db';

// Roles that can access agency endpoints
const AGENCY_ROLES = ['AGENCY_OWNER', 'AGENCY_MANAGER', 'AGENCY_BOOKER'];

// Extended payload with agency info
export interface AgencyAuthPayload extends JWTPayload {
  agencyId: number;
  agencyName: string;
  agencyRole: string;
}

interface AgencyRow {
  id: number;
  name: string;
  role: string;
}

// Authenticate agency request and return user + agency info
export async function authenticateAgency(
  request: NextRequest
): Promise<{ success: true; payload: AgencyAuthPayload } | { success: false; response: NextResponse }> {
  // Get token from cookie or Authorization header
  const cookieToken = request.cookies.get('auth-token')?.value;
  const authHeader = request.headers.get('Authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  const token = cookieToken || bearerToken;

  if (!token) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      ),
    };
  }

  // Verify token
  const payload = await verifyToken(token);
  if (!payload) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      ),
    };
  }

  // Check role
  if (!AGENCY_ROLES.includes(payload.role)) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Access denied. Agency role required.' },
        { status: 403 }
      ),
    };
  }

  // Get agency info for the user via agency_users table
  const agency = await queryOne<AgencyRow>(
    `SELECT a.id, a.name, au.role
     FROM agencies a
     JOIN agency_users au ON au.agency_id = a.id
     WHERE au.user_id = ? AND au.is_active = TRUE AND a.is_active = TRUE`,
    [payload.userId]
  );

  if (!agency) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'No active agency associated with this account' },
        { status: 403 }
      ),
    };
  }

  return {
    success: true,
    payload: {
      ...payload,
      agencyId: agency.id,
      agencyName: agency.name,
      agencyRole: agency.role,
    },
  };
}

// API Key authentication for B2B API
export async function authenticateApiKey(
  request: NextRequest
): Promise<{ success: true; agencyId: number; agencyName: string } | { success: false; response: NextResponse }> {
  const apiKey = request.headers.get('X-API-Key');

  if (!apiKey) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'API key required. Set X-API-Key header.' },
        { status: 401 }
      ),
    };
  }

  const agency = await queryOne<{ id: number; name: string }>(
    `SELECT id, name FROM agencies WHERE api_key = ? AND is_active = TRUE AND is_verified = TRUE`,
    [apiKey]
  );

  if (!agency) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Invalid or inactive API key' },
        { status: 401 }
      ),
    };
  }

  return {
    success: true,
    agencyId: agency.id,
    agencyName: agency.name,
  };
}

// Helper to check if user can manage agency settings
// Note: role comes from agency_users table (OWNER, MANAGER, BOOKER)
export function canManageAgency(role: string): boolean {
  // Support both short and full role names for flexibility
  return ['OWNER', 'MANAGER', 'AGENCY_OWNER', 'AGENCY_MANAGER'].includes(role);
}

// Helper to check if user can make bookings
export function canMakeBookings(role: string): boolean {
  return ['OWNER', 'MANAGER', 'BOOKER', 'AGENCY_OWNER', 'AGENCY_MANAGER', 'AGENCY_BOOKER'].includes(role);
}
