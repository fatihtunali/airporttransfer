import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'airporttransfer-secret-key-change-in-production'
);

// Define protected routes and their required roles
const protectedRoutes = {
  '/supplier': ['SUPPLIER_OWNER', 'DISPATCHER', 'DRIVER'],
  '/admin': ['ADMIN'],
  '/agency': ['AGENCY_OWNER', 'AGENCY_MEMBER'],
  '/dispatch': ['ADMIN', 'DISPATCHER'],
};

// Public routes that don't need auth (login, register pages)
const publicRoutes = [
  '/supplier/login',
  '/supplier/register',
  '/admin/login',
  '/agency/login',
  '/agency/register',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip public routes
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next();
  }

  // Skip API routes (they have their own auth)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Skip static files and public assets
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/assets/') ||
    pathname.startsWith('/logo/') ||
    pathname.includes('.') // files with extensions
  ) {
    return NextResponse.next();
  }

  // Check if this is a protected route
  const matchedRoute = Object.keys(protectedRoutes).find(
    route => pathname === route || pathname.startsWith(route + '/')
  );

  if (!matchedRoute) {
    return NextResponse.next();
  }

  // Get token from cookie
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    // Redirect to appropriate login page
    const loginUrl = new URL(`${matchedRoute}/login`, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verify token
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userRole = payload.role as string;
    const allowedRoles = protectedRoutes[matchedRoute as keyof typeof protectedRoutes];

    // Check if user has required role
    if (!allowedRoles.includes(userRole)) {
      // Redirect to appropriate login page with error
      const loginUrl = new URL(`${matchedRoute}/login`, request.url);
      loginUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(loginUrl);
    }

    // User is authenticated and authorized
    return NextResponse.next();
  } catch (error) {
    // Token is invalid or expired
    const loginUrl = new URL(`${matchedRoute}/login`, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    loginUrl.searchParams.set('error', 'session_expired');
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (assets, images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
