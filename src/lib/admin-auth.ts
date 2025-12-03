import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from './auth';

// Authenticate admin request
export async function authenticateAdmin(
  request: NextRequest
): Promise<{ success: true; payload: JWTPayload } | { success: false; response: NextResponse }> {
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

  // Check role is ADMIN
  if (payload.role !== 'ADMIN') {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Access denied. Admin role required.' },
        { status: 403 }
      ),
    };
  }

  return {
    success: true,
    payload,
  };
}
