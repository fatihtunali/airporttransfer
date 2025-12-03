import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from './auth';
import { queryOne } from './db';

// Roles that can access supplier endpoints
const SUPPLIER_ROLES = ['SUPPLIER_OWNER', 'DISPATCHER', 'DRIVER'];

// Extended payload with supplier info
export interface SupplierAuthPayload extends JWTPayload {
  supplierId: number;
  supplierName: string;
}

interface SupplierRow {
  id: number;
  name: string;
}

// Authenticate supplier request and return user + supplier info
export async function authenticateSupplier(
  request: NextRequest
): Promise<{ success: true; payload: SupplierAuthPayload } | { success: false; response: NextResponse }> {
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
  if (!SUPPLIER_ROLES.includes(payload.role)) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Access denied. Supplier role required.' },
        { status: 403 }
      ),
    };
  }

  // Get supplier info for the user via supplier_users table
  const supplier = await queryOne<SupplierRow>(
    `SELECT s.id, s.name
     FROM suppliers s
     JOIN supplier_users su ON su.supplier_id = s.id
     WHERE su.user_id = ? AND su.is_active = TRUE AND s.is_active = TRUE`,
    [payload.userId]
  );

  if (!supplier) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'No active supplier associated with this account' },
        { status: 403 }
      ),
    };
  }

  return {
    success: true,
    payload: {
      ...payload,
      supplierId: supplier.id,
      supplierName: supplier.name,
    },
  };
}

// Helper to restrict certain actions to SUPPLIER_OWNER or DISPATCHER only
export function canManageFleet(role: string): boolean {
  return role === 'SUPPLIER_OWNER' || role === 'DISPATCHER';
}
